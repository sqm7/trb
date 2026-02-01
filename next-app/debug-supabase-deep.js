const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zxbmbbfrzbtuueysicoc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4Ym1iYmZyemJ0dXVleXNpY29jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY4ODk4OSwiZXhwIjoyMDY2MjY0OTg5fQ.LWr3I8vI0i2dfgF1ozKxe0DoxNerdzabTOoTwTD_UKk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const id = 'RPUNMLMJKIKGFAA37CB';
    console.log(`Deep search for ID: ${id} in County A (Taipei)...`);

    const tables = [
        'a_lvr_land_b_park',
        'a_lvr_land_b_build',
        'a_lvr_land_b_land',
        'a_lvr_land_a_park',
        'a_lvr_land_a_build',
    ];

    for (const table of tables) {
        console.log(`Checking ${table}...`);
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .eq('編號', id);

        if (error) {
            console.log(`Error ${table}: ${error.message}`);
        } else if (data && data.length > 0) {
            console.log(`✅ FOUND in ${table}:`, data);
        } else {
            console.log(`Empty ${table}`);
        }
    }
}
run();
