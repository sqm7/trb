const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zxbmbbfrzbtuueysicoc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4Ym1iYmZyemJ0dXVleXNpY29jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY4ODk4OSwiZXhwIjoyMDY2MjY0OTg5fQ.LWr3I8vI0i2dfgF1ozKxe0DoxNerdzabTOoTwTD_UKk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const targetID = 'RPPNMLKKKIKGFDA07CB';
    const targetPrice = 4000000;

    console.log(`--- GHOST HUNT DETAILS ---`);
    console.log(`Target ID: ${targetID}`);
    console.log(`Target Price: ${targetPrice}`);

    // 1. Column Checks - Are there any hidden columns?
    console.log(`\n[Checking Columns]`);
    const { data: colsB, error: errColB } = await supabase.from('a_lvr_land_b_park').select('*').limit(1);
    if (colsB && colsB.length > 0) {
        console.log(`Columns in a_lvr_land_b_park:`, Object.keys(colsB[0]));
    }

    // 2. Cross-Table Search - Checking 'a' tables (Pre-owned) just in case
    console.log(`\n[Checking Misclassification in a_lvr_land_a_park]`);
    const { data: dataA, error: errA } = await supabase
        .from('a_lvr_land_a_park')
        .select('編號, 車位價格')
        .eq('編號', targetID);

    console.log(`Found in 'a' table?`, dataA && dataA.length > 0 ? "YES" : "NO");

    // 3. Price-Based Search in b_park
    // Find ALL car spaces with price = 4,000,000 (Might be many, but let's check IDs)
    console.log(`\n[Checking by Price match in a_lvr_land_b_park]`);
    const { data: dataPrice, error: errPrice } = await supabase
        .from('a_lvr_land_b_park')
        .select('編號, 車位類別')
        .eq('車位價格', targetPrice)
        .limit(20); // Just peek at first 20

    if (dataPrice && dataPrice.length > 0) {
        console.log(`Found ${dataPrice.length} records with price ${targetPrice}.`);
        console.log(`Sample IDs:`, dataPrice.map(d => d['編號']));

        // Do any look similar?
        const similar = dataPrice.filter(d => d['編號'].includes('RPPN') || d['編號'].includes('07CB'));
        if (similar.length > 0) {
            console.log(`⚠️ POTENTIAL MATCHES (Similar ID + Same Price):`, similar);
        } else {
            console.log(`No IDs looked distinctively similar to ${targetID}`);
        }
    } else {
        console.log(`No records found with exactly price matching.`);
    }

    // 4. Neighbor ID Check
    // Let's query main table for IDs that are VERY close to target (lexicographically)
    // Maybe the parking is attached to a "Virtual ID"?
    console.log(`\n[Checking Neighbors in Main Table]`);
    const { data: neighbors } = await supabase
        .from('a_lvr_land_b')
        .select('編號, 車位數, 建案名稱')
        .gte('編號', 'RPPNMLKKKIKGFDA00CB') // Start of range
        .lte('編號', 'RPPNMLKKKIKGFDA99CB') // End of range
        .order('編號');

    if (neighbors) {
        console.log(`Found ${neighbors.length} neighbors.`);
        // Check if THESE neighbors have parking records
        for (const n of neighbors) {
            if (n['編號'] === targetID) {
                console.log(`-> Target ${n['編號']} (Parking: ${n['車位數']})`);
            } else {
                // Quick check if this neighbor has parking record
                const { count } = await supabase.from('a_lvr_land_b_park').select('*', { count: 'exact', head: true }).eq('編號', n['編號']);
                console.log(`   Neighbor ${n['編號']} (Parking: ${n['車位數']}) -> Has Subtable: ${count > 0 ? 'YES' : 'NO'}`);
            }
        }
    }
}
run();
