const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zxbmbbfrzbtuueysicoc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4Ym1iYmZyemJ0dXVleXNpY29jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY4ODk4OSwiZXhwIjoyMDY2MjY0OTg5fQ.LWr3I8vI0i2dfgF1ozKxe0DoxNerdzabTOoTwTD_UKk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log("--- Checking a_lvr_land_b_park ---");

    // 1. Check if table exists and has data
    const { count, error } = await supabase
        .from('a_lvr_land_b_park')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error("Table Error:", error.message);
    } else {
        console.log(`Table 'a_lvr_land_b_park' exists.`);
        console.log(`Total records: ${count}`);
    }

    // 2. Check for the specific ID again
    const targetID = 'RPPNMLKKKIKGFDA07CB';
    const { data, error: idError } = await supabase
        .from('a_lvr_land_b_park')
        .select('*')
        .eq('編號', targetID);

    if (idError) console.error("ID Search Error:", idError.message);
    console.log(`Record for ID ${targetID}:`, data && data.length > 0 ? "FOUND" : "NOT FOUND");
}

run();
