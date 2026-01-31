const { createClient } = require('@supabase/supabase-js');

// Config
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const COUNTY_CODES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'o', 'p', 'q', 't', 'u', 'v', 'w', 'x', 'z'];

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    console.log("🚀 Starting FULL Per-County Project Sync (with Retroactive Mapping Cleanup)...");

    // 1. Fetch Mappings
    console.log("1. Fetching Mappings...");
    const { data: mappingsData, error: mapError } = await supabase
        .from('project_name_mappings')
        .select('old_name, new_name, county_code');

    const mappingRules = new Map();
    const globalRules = new Map();

    mappingsData?.forEach((m) => {
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
            const upperCode = code.toUpperCase();
            const targetTable = `${code.toLowerCase()}_projects`;
            const sourceTable = `${code.toLowerCase()}_lvr_land_b`;

            console.log(`\n📦 Processing County ${upperCode}...`);

            // --- PHASE A: Retroactive Cleanup ---
            // Check if any existing projects in targetTable are now in Mappings (as old_name)
            const { data: existingProjects, error: existError } = await supabase
                .from(targetTable)
                .select('project_name');

            if (!existError && existingProjects?.length > 0) {
                const staleNames = existingProjects
                    .map(p => p.project_name)
                    .filter(name => {
                        return mappingRules.has(`${code.toLowerCase()}_${name}`) || globalRules.has(name);
                    });

                if (staleNames.length > 0) {
                    console.log(`   🧹 Cleaning up ${staleNames.length} stale names that now have mappings...`);
                    const { error: delError } = await supabase
                        .from(targetTable)
                        .delete()
                        .in('project_name', staleNames);

                    if (!delError) totalCleanedUp += staleNames.length;
                }
            }

            // --- PHASE B: Full Scan & Discovery ---
            const upsertMap = new Map();
            let offset = 0;
            const PAGE_SIZE = 1000;
            let hasMore = true;
            let countyProcessed = 0;

            while (hasMore) {
                const { data: rawProjects, error: fetchError } = await supabase
                    .from(sourceTable)
                    .select('建案名稱')
                    .neq('建案名稱', '')
                    .not('建案名稱', 'is', null)
                    .range(offset, offset + PAGE_SIZE - 1);

                if (fetchError) {
                    hasMore = false;
                    continue;
                }

                if (!rawProjects || rawProjects.length === 0) {
                    hasMore = false;
                    continue;
                }

                for (const record of rawProjects) {
                    const rawName = record['建案名稱'];
                    let finalName = rawName;

                    const specificRule = mappingRules.get(`${code.toLowerCase()}_${rawName}`);
                    if (specificRule) {
                        finalName = specificRule;
                    } else if (globalRules.has(rawName)) {
                        finalName = globalRules.get(rawName);
                    }

                    if (!upsertMap.has(finalName)) {
                        upsertMap.set(finalName, {
                            project_name: finalName,
                            raw_project_name: rawName,
                            last_seen_at: now
                        });
                    }
                }

                countyProcessed += rawProjects.length;
                if (rawProjects.length < PAGE_SIZE) {
                    hasMore = false;
                } else {
                    offset += PAGE_SIZE;
                    process.stdout.write(`...scanned ${offset} rows    \r`);
                }
            }

            // Upsert Results
            if (upsertMap.size > 0) {
                const payload = Array.from(upsertMap.values());
                const UPSERT_BATCH = 1000;
                let batchSuccess = 0;

                for (let i = 0; i < payload.length; i += UPSERT_BATCH) {
                    const chunk = payload.slice(i, i + UPSERT_BATCH);
                    const { error: batchError } = await supabase
                        .from(targetTable)
                        .upsert(chunk, { onConflict: 'project_name' });

                    if (batchError) console.error(`   ❌ Error Upserting ${targetTable}:`, batchError.message);
                    else batchSuccess += chunk.length;
                }
                totalUpsertedProjects += batchSuccess;
                totalProcessedTxns += countyProcessed;
                console.log(`✅ ${upperCode}: Done. (Scanned ${countyProcessed}, Current Unique Projects: ${upsertMap.size})`);
            }

        } catch (err) {
            console.error(`Critical logic error for ${code}:`, err);
        }
    }

    console.log(`\n🎉 Sync Complete!`);
    console.log(`   - Total Cleaned Up (Stale Mappings): ${totalCleanedUp}`);
    console.log(`   - Total Unique Projects Indexed: ${totalUpsertedProjects}`);
}

main().catch(console.error);
