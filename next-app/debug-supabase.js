const { createClient } = require('@supabase/supabase-js');

// User provided credentials
const SUPABASE_URL = 'https://zxbmbbfrzbtuueysicoc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4Ym1iYmZyemJ0dXVleXNpY29jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY4ODk4OSwiZXhwIjoyMDY2MjY0OTg5fQ.LWr3I8vI0i2dfgF1ozKxe0DoxNerdzabTOoTwTD_UKk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log("--- Supabase Debugger ---");
    console.log("Target ID: RPUNMLMJKIKGFAA37CB");

    try {
        // 1. List potentially relevant tables using ID prefix 'R'
        // Only if R is a valid prefix.
        const idPrefix = 'R';
        console.log(`Checking table for prefix ${idPrefix}...`);

        const tablesToCheck = [
            `${idPrefix.toLowerCase()}_lvr_land_a`,
            `${idPrefix.toLowerCase()}_lvr_land_b`
        ];

        for (const table of tablesToCheck) {
            console.log(`Querying ${table}...`);
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .eq('編號', 'RPUNMLMJKIKGFAA37CB')
                .limit(1);

            if (error) {
                console.log(`Error on ${table}: ${error.message} (Table might not exist)`);
            } else if (data && data.length > 0) {
                console.log(`✅ FOUND in ${table}!`);
                console.log("Record:", JSON.stringify(data[0], null, 2));

                const parkTable = `${table}_park`;
                console.log(`Checking park table: ${parkTable}...`);
                const { data: parkData, error: parkError } = await supabase
                    .from(parkTable)
                    .select('*')
                    .eq('編號', 'RPUNMLMJKIKGFAA37CB');

                if (parkError) console.error("Park Error:", parkError.message);
                console.log("Park Data:", parkData);
                return;
            } else {
                console.log(`Not found in ${table}`);
            }
        }

        console.log("Not found in R tables. Trying ALL known county codes...");
        const codes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'M', 'N', 'O', 'P', 'Q', 'T', 'U', 'V', 'W', 'X', 'Z'];
        for (const code of codes) {
            const table = `${code.toLowerCase()}_lvr_land_b`; // try presale first
            const { data, error } = await supabase
                .from(table)
                .select('編號, 建案名稱')
                .eq('編號', 'RPUNMLMJKIKGFAA37CB')
                .limit(1);

            if (data && data.length > 0) {
                console.log(`✅ FOUND in ${table} (County ${code})`);
                return;
            }
        }

    } catch (e) {
        console.error("Script error:", e);
    }
}

run();
