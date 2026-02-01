import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Interfaces
interface Mapping {
    old_name: string;
    new_name: string;
    county_code: string | null;
}

interface ProjectRecord {
    project_name: string;
    raw_project_name: string;
    is_new_case?: boolean;
    last_seen_at: string;
}

const COUNTY_CODES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'o', 'p', 'q', 't', 'u', 'v', 'w', 'x', 'z'];

serve(async (req) => {
    try {
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        console.log("🚀 Starting Per-County Project Sync (Cleanup Mode)...");

        // 1. Fetch Mappings
        const { data: mappingsData, error: mapError } = await supabaseAdmin
            .from('project_name_mappings')
            .select('old_name, new_name, county_code')

        if (mapError) throw new Error(`Mapping Fetch Error: ${mapError.message}`)

        const mappingRules = new Map<string, string>();
        const globalRules = new Map<string, string>();

        mappingsData?.forEach((m: Mapping) => {
            if (m.county_code) {
                mappingRules.set(`${m.county_code.toLowerCase()}_${m.old_name}`, m.new_name);
            } else {
                globalRules.set(m.old_name, m.new_name);
            }
        });

        const now = new Date().toISOString();
        let totalProcessedTxns = 0;
        let totalUpsertedProjects = 0;
        let totalCleanedUp = 0;

        // 2. Iterate Configured Counties
        for (const code of COUNTY_CODES) {
            try {
                const targetTable = `${code.toLowerCase()}_projects`;
                const sourceTable = `${code.toLowerCase()}_lvr_land_b`;

                // --- Phase A: Retroactive Cleanup ---
                const { data: existingProjects } = await supabaseAdmin
                    .from(targetTable)
                    .select('project_name');

                if (existingProjects && existingProjects.length > 0) {
                    const staleNames = existingProjects
                        .map(p => p.project_name)
                        .filter(name => {
                            return mappingRules.has(`${code.toLowerCase()}_${name}`) || globalRules.has(name);
                        });

                    if (staleNames.length > 0) {
                        const { error: delError } = await supabaseAdmin
                            .from(targetTable)
                            .delete()
                            .in('project_name', staleNames);
                        if (!delError) totalCleanedUp += staleNames.length;
                    }
                }

                // --- Phase B: Discovery ---
                const upsertMap = new Map<string, ProjectRecord>();
                let offset = 0;
                const PAGE_SIZE = 1000;
                let hasMore = true;

                while (hasMore) {
                    const { data: rawProjects, error: fetchError } = await supabaseAdmin
                        .from(sourceTable)
                        .select('建案名稱')
                        .neq('建案名稱', '')
                        .not('建案名稱', 'is', null)
                        .range(offset, offset + PAGE_SIZE - 1);

                    if (fetchError || !rawProjects || rawProjects.length === 0) {
                        hasMore = false;
                        continue;
                    }

                    for (const record of rawProjects) {
                        const rawName = record['建案名稱'];
                        let finalName = rawName;

                        const specificRule = mappingRules.get(`${code.toLowerCase()}_${rawName}`);
                        if (specificRule) finalName = specificRule;
                        else if (globalRules.has(rawName)) finalName = globalRules.get(rawName)!;

                        if (!upsertMap.has(finalName)) {
                            upsertMap.set(finalName, {
                                project_name: finalName,
                                raw_project_name: rawName,
                                last_seen_at: now
                            });
                        }
                    }

                    totalProcessedTxns += rawProjects.length;
                    if (rawProjects.length < PAGE_SIZE) hasMore = false;
                    else offset += PAGE_SIZE;
                }

                if (upsertMap.size > 0) {
                    const payload = Array.from(upsertMap.values());
                    const UPSERT_BATCH = 1000;
                    for (let i = 0; i < payload.length; i += UPSERT_BATCH) {
                        const chunk = payload.slice(i, i + UPSERT_BATCH);
                        await supabaseAdmin.from(targetTable).upsert(chunk, { onConflict: 'project_name' });
                        totalUpsertedProjects += chunk.length;
                    }
                }
            } catch (err) {
                console.error(`Logic error for ${code}:`, err);
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                cleaned: totalCleanedUp,
                indexed: totalUpsertedProjects
            }),
            { headers: { "Content-Type": "application/json" } },
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        )
    }
})
