const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) { console.error('Missing ENV'); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    console.log('🔍 Debugging View Data...');

    // 1. Check count
    const { count, error: countError } = await supabase
        .from('all_transactions_view')
        .select('*', { count: 'exact', head: true });

    if (countError) console.error('Count Error:', countError);
    else console.log(`Total Rows in View: ${count}`);

    // 2. Sample Data
    const { data, error } = await supabase
        .from('all_transactions_view')
        .select('縣市代碼, 建案名稱')
        .limit(5);

    if (error) console.error('Select Error:', error);
    else console.log('Sample Rows:', data);

    // 3. Check underlying table A
    const { count: countA, error: errA } = await supabase
        .from('a_lvr_land_b') // Taipei Presale
        .select('*', { count: 'exact', head: true });

    if (errA) console.error('Table A Error:', errA.message);
    else console.log(`Rows in a_lvr_land_b: ${countA}`);
}

main();
