const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zxbmbbfrzbtuueysicoc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4Ym1iYmZyemJ0dXVleXNpY29jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY4ODk4OSwiZXhwIjoyMDY2MjY0OTg5fQ.LWr3I8vI0i2dfgF1ozKxe0DoxNerdzabTOoTwTD_UKk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const targetID = 'RPPNMLKKKIKGFDA07CB';
    console.log(`--- GLOBAL SEARCH FOR ID: ${targetID} ---`);

    // Define known county codes
    // A=Taipei, F=New Taipei, H=Taoyuan, B=Taichung, D=Tainan, E=Kaohsiung, C=Keelung, G=Yilan, J=Hsinchu County, K=Miaoli, I=Chiayi City, Q=Chiayi County, M=Nantou, N=Changhua, P=Yunlin, O=Hsinchu City, T=Pingtung, U=Hualien, V=Taitung, X=Penghu, W=Kinmen, Z=Lienchiang
    const countyCodes = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'o', 'p', 'q', 't', 'u', 'v', 'w', 'x', 'z'];

    for (const code of countyCodes) {
        const tableName = `${code}_lvr_land_b_park`; // Presale specific

        // Check if table exists by trying to select 1 record
        const { error: checkErr } = await supabase.from(tableName).select('id').limit(1);

        if (!checkErr) {
            // Table exists! Search for the ID
            process.stdout.write(`Checking table '${tableName}'... `);
            const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .eq('編號', targetID);

            if (data && data.length > 0) {
                console.log(`\n✅ FOUND IT in '${tableName}'!!!`);
                console.log(JSON.stringify(data, null, 2));
                return; // Found it!
            } else {
                console.log(`Not found.`);
            }
        }
    }
    console.log("\nSearch complete. ID not found in any standard presale parking table.");
}

run();
