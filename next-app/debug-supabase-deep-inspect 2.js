const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zxbmbbfrzbtuueysicoc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4Ym1iYmZyemJ0dXVleXNpY29jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY4ODk4OSwiZXhwIjoyMDY2MjY0OTg5fQ.LWr3I8vI0i2dfgF1ozKxe0DoxNerdzabTOoTwTD_UKk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log("--- Deep Dive: a_lvr_land_b_park ---");

    // 1. Count records
    const { count, error: countError } = await supabase
        .from('a_lvr_land_b_park')
        .select('*', { count: 'exact', head: true });

    if (countError) console.error("Count Error:", countError);
    console.log(`Total records in a_lvr_land_b_park: ${count}`);

    if (count === 0) {
        console.log("Table is empty! This explains why no data is found.");
        return;
    }

    // 2. Fetch a sample of records
    const { data: sample, error: sampleError } = await supabase
        .from('a_lvr_land_b_park')
        .select('*')
        .limit(5);

    if (sampleError) console.error("Sample Error:", sampleError);
    console.log("Sample records:", JSON.stringify(sample, null, 2));

    // 3. Try to find partial matches for the target ID
    const targetID = 'RPPNMLKKKIKGFDA07CB';
    console.log(`Searching for ID like ${targetID}...`);
    // Try first part of ID
    const prefix = targetID.substring(0, 10);
    const { data: partial, error: partialError } = await supabase
        .from('a_lvr_land_b_park')
        .select('*')
        .ilike('編號', `%${prefix}%`)
        .limit(5);

    if (partialError) console.error("Partial Search Error:", partialError);
    console.log(`Partial matches for prefix ${prefix}:`, partial);

}
run();
