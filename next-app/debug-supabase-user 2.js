const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zxbmbbfrzbtuueysicoc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4Ym1iYmZyemJ0dXVleXNpY29jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY4ODk4OSwiZXhwIjoyMDY2MjY0OTg5fQ.LWr3I8vI0i2dfgF1ozKxe0DoxNerdzabTOoTwTD_UKk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const id = 'RPPNMLKKKIKGFDA07CB';
    console.log(`Checking ID: ${id}...`);

    // Check main table
    const { data: main, error: mainError } = await supabase.from('a_lvr_land_b').select('*').eq('編號', id);
    if (mainError) console.error("Main Error:", mainError);
    console.log("Main Record:", main?.length ? "Found" : "Not Found");
    if (main?.length) console.log("Car entries:", main[0]['車位數'], "Car Price:", main[0]['車位總價']);

    // Check sub tables
    const tables = ['a_lvr_land_b_park', 'a_lvr_land_b_build'];
    for (const t of tables) {
        const { data, error } = await supabase.from(t).select('*').eq('編號', id);
        console.log(`${t}: ${data?.length} records found`);
        if (data?.length) console.log(data);
    }
}
run();
