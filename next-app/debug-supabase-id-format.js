const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zxbmbbfrzbtuueysicoc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4Ym1iYmZyemJ0dXVleXNpY29jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY4ODk4OSwiZXhwIjoyMDY2MjY0OTg5fQ.LWr3I8vI0i2dfgF1ozKxe0DoxNerdzabTOoTwTD_UKk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const targetID = 'RPPNMLKKKIKGFDA07CB';
    console.log(`--- Advanced ID Search for: ${targetID} ---`);

    // 1. Substring Search (Middle chunks)
    // Sometimes prefixes/suffixes vary. Let's try matching the randomness in the middle.
    // "RPPNMLKKKI" KGFDA "07CB" -> Try matching "KIKGFDA"
    const middleChunk = "KIKGFDA";
    console.log(`Searching for IDs containing middle chunk: '${middleChunk}'`);

    const { data: middleMatches, error: midError } = await supabase
        .from('a_lvr_land_b_park')
        .select('編號, 車位類別, 車位價格')
        .ilike('編號', `%${middleChunk}%`);

    if (midError) console.error("Middle Error:", midError);
    if (middleMatches && middleMatches.length > 0) {
        console.log("✅ Found matches by middle chunk:", middleMatches);
    } else {
        console.log("No matches for middle chunk.");
    }

    // 2. Loose search (First 15 chars)
    const loosePrefix = targetID.substring(0, 15);
    console.log(`Searching for prefix: '${loosePrefix}'`);
    const { data: prefixMatches } = await supabase
        .from('a_lvr_land_b_park')
        .select('編號')
        .ilike('編號', `%${loosePrefix}%`);

    if (prefixMatches && prefixMatches.length > 0) {
        console.log("✅ Found matches by prefix:", prefixMatches);
    } else {
        console.log("No matches for prefix.");
    }

    // 3. Main table cross-reference
    // Let's see if we can find ANY parking record that looks related to the project "國美榕遇" (from user screenshot)
    console.log("Searching for project '國美榕遇' in main table to get ALL IDs...");
    const { data: projectRecords } = await supabase
        .from('a_lvr_land_b')
        .select('編號, 建案名稱, 車位數')
        .eq('建案名稱', '國美榕遇')
        .limit(5); // Just get a few to see the pattern

    if (projectRecords && projectRecords.length > 0) {
        console.log("Sample Project IDs:", projectRecords.map(r => r['編號']));

        // Take one unrelated ID from this project that HAS parking and check if IT exists in the park table
        const idWithParking = projectRecords.find(r => r['車位數'] > 0);
        if (idWithParking) {
            console.log(`Testing valid sibling ID ${idWithParking['編號']} in park table...`);
            const { data: siblingPark } = await supabase
                .from('a_lvr_land_b_park')
                .select('*')
                .eq('編號', idWithParking['編號']);

            console.log(`Sibling result:`, siblingPark.length > 0 ? "Found" : "NOT Found");
        }
    }
}
run();
