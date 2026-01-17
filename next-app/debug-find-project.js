const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zxbmbbfrzbtuueysicoc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4Ym1iYmZyemJ0dXVleXNpY29jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY4ODk4OSwiZXhwIjoyMDY2MjY0OTg5fQ.LWr3I8vI0i2dfgF1ozKxe0DoxNerdzabTOoTwTD_UKk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log("Searching for a valid project name...");

    // Query from Taipei City (A) pre-sale (b) or resale (a)
    const { data, error } = await supabase
        .from('a_lvr_land_b')
        .select('建案名稱')
        .not('建案名稱', 'is', null)
        .limit(5);

    if (error) {
        console.error("Error:", error);
    } else {
        if (data && data.length > 0) {
            console.log("Found Project:", data[0]['建案名稱']);
        } else {
            console.log("No projects found in a_lvr_land_b");
        }
    }
}
run();
