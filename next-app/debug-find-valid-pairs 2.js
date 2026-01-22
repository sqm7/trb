const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zxbmbbfrzbtuueysicoc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4Ym1iYmZyemJ0dXVleXNpY29jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY4ODk4OSwiZXhwIjoyMDY2MjY0OTg5fQ.LWr3I8vI0i2dfgF1ozKxe0DoxNerdzabTOoTwTD_UKk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log("--- Finding Valid Main+Sub Table Pairs ---");

    // 1. Get some IDs from the PARK table first (since that's the one that was missing data before)
    const { data: parkRecords, error: parkError } = await supabase
        .from('a_lvr_land_b_park')
        .select('*')
        .limit(20);

    if (parkError) {
        console.error("Park Error:", parkError);
        return;
    }

    // 2. Cross-reference with Main Table
    let matchCount = 0;
    for (const parkRecord of parkRecords) {
        if (matchCount >= 2) break; // We only need 2 examples

        const id = parkRecord['編號'];
        const { data: mainRecord, error: mainError } = await supabase
            .from('a_lvr_land_b')
            .select('編號, 建案名稱, 車位數, 車位總價, 車位總面積')
            .eq('編號', id)
            .single();

        if (mainRecord) {
            matchCount++;
            console.log(`\n✅ Match #${matchCount}: ${id}`);
            console.log(`   [Project]: ${mainRecord['建案名稱']}`);
            console.log(`   [Main Table] Car Count: ${mainRecord['車位數']}, Total Price: ${mainRecord['車位總價']}`);
            console.log(`   [Sub  Table] Floor: ${parkRecord['車位樓層']}, Price: ${parkRecord['車位價格']}, Type: ${parkRecord['車位類別']}`);
        }
    }
}

run();
