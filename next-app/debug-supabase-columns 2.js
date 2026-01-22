const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zxbmbbfrzbtuueysicoc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4Ym1iYmZyemJ0dXVleXNpY29jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY4ODk4OSwiZXhwIjoyMDY2MjY0OTg5fQ.LWr3I8vI0i2dfgF1ozKxe0DoxNerdzabTOoTwTD_UKk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log("--- Inspecting a_lvr_land_b Columns ---");

    // Fetch one record to see all keys
    const { data, error } = await supabase
        .from('a_lvr_land_b')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error:", error);
        return;
    }

    if (data && data.length > 0) {
        console.log("Available columns in a_lvr_land_b:");
        console.log(Object.keys(data[0]));

        if ('車位樓層' in data[0]) {
            console.log("✅ '車位樓層' found in main table!");
        } else {
            console.log("❌ '車位樓層' NOT found in main table.");
        }
    } else {
        console.log("Table is empty.");
    }
}
run();
