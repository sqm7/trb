const { createClient } = require('@supabase/supabase-js');
const { program } = require('commander');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

program
    .name('manual_enrich')
    .description('Manually update project details in the database')
    .argument('<projectName>', 'Name of the project to update')
    .option('-c, --county <code>', 'County code (default: iterate all)', null)
    .option('--developer <value>', '投資建設')
    .option('--site_area <value>', '基地面積')
    .option('--public_ratio <value>', '公設比')
    .option('--total_floors <value>', '總樓層')
    .option('--basement_floors <value>', '地下層')
    .option('--total_households <value>', '總戶數')
    .option('--structure <value>', '結構')
    .option('--land_use_zoning <value>', '土地使用分區')
    .option('--construction_license <value>', '建照號碼')
    .option('--sales_agent <value>', '代銷公司')
    .option('--parking_type <value>', '車位類型')
    .option('--parking_count <value>', '車位數量')
    .option('--contractor <value>', '營造廠')
    .option('--architect <value>', '建築師')
    .action(async (projectName, options) => {
        console.log(`🚀 Updating project: ${projectName}...`);

        // 1. Build update object
        const updates = {};
        const fields = [
            'developer', 'site_area', 'public_ratio', 'total_floors',
            'basement_floors', 'total_households', 'structure',
            'land_use_zoning', 'construction_license', 'sales_agent',
            'parking_type', 'parking_count', 'contractor', 'architect'
        ];

        fields.forEach(f => {
            if (options[f]) updates[f] = options[f];
        });

        if (Object.keys(updates).length === 0) {
            console.log('⚠️ No fields to update. Use flags like --developer "Name"');
            return;
        }

        // Always set enrichment_status to done if we are manually updating (unless specified otherwise logic?)
        // For now, let's assume manual updates imply we found data.
        // If not all fields are present, it might strictly be 'pending', but usually manual input is 'done'.
        // Let's safe-guard: if keys > 5, mark done.
        if (Object.keys(updates).length > 5) {
            updates.enrichment_status = 'done';
            updates.last_enriched_at = new Date().toISOString();
        } else {
            updates.enrichment_status = 'pending'; // Partial update
            updates.last_enriched_at = new Date().toISOString();
        }

        // 2. Find and Update
        const codes = options.county ? [options.county] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'o', 'p', 'q', 't', 'u', 'v', 'w', 'x', 'z'];

        let found = false;
        for (const code of codes) {
            const table = `${code.toLowerCase()}_projects`;
            // Check if table column exists (by trying select) or just try update
            // We'll try to find first
            const { data, error } = await supabase
                .from(table)
                .select('id')
                .eq('project_name', projectName)
                .limit(1);

            if (data && data.length > 0) {
                console.log(`   Found in table: ${table}`);
                const { error: updateError } = await supabase
                    .from(table)
                    .update(updates)
                    .eq('id', data[0].id);

                if (updateError) console.error(`   ❌ Update failed: ${updateError.message}`);
                else {
                    console.log(`   ✅ Success! Updated ${Object.keys(updates).length} fields.`);
                    console.log(`   Status set to: ${updates.enrichment_status}`);
                }
                found = true;
                break;
            }
        }

        if (!found) console.log(`❌ Project "${projectName}" not found in any checked tables.`);
    });

program.parse();
