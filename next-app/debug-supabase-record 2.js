const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zxbmbbfrzbtuueysicoc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4Ym1iYmZyemJ0dXVleXNpY29jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY4ODk4OSwiZXhwIjoyMDY2MjY0OTg5fQ.LWr3I8vI0i2dfgF1ozKxe0DoxNerdzabTOoTwTD_UKk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log("Dumping transaction RPUNMLMJKIKGFAA37CB from a_lvr_land_b...");

    const { data, error } = await supabase
        .from('a_lvr_land_b')
        .select('*')
        .eq('編號', 'RPUNMLMJKIKGFAA37CB');

    if (data && data.length > 0) {
        console.log(JSON.stringify(data[0], null, 2));
    } else {
        console.log("Not found.");
    }
}
run();
