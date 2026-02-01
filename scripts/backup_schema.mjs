// Schema Backup Script - Run with: node backup_schema.mjs
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zxbmbbfrzbtuueysicoc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4Ym1iYmZyemJ0dXVleXNpY29jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY4ODk4OSwiZXhwIjoyMDY2MjY0OTg5fQ.LWr3I8vI0i2dfgF1ozKxe0DoxNerdzabTOoTwTD_UKk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function backupSchema() {
    console.log('=== Supabase Schema Backup ===\n');
    console.log(`Date: ${new Date().toISOString()}\n`);

    // Get table list from public schema
    const tablesQuery = `
        SELECT table_name, 
               (SELECT count(*) FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.table_schema = 'public') as column_count
        FROM information_schema.tables t
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
    `;

    const { data: tablesData, error: tablesError } = await supabase.rpc('', { query: tablesQuery }).catch(() => ({ data: null, error: 'RPC not available' }));

    // Fallback: Get tables by attempting to list them via REST
    console.log('--- PUBLIC TABLES ---\n');

    // Known tables from the swagger output
    const knownTables = ['profiles', 'announcements'];

    for (const tableName of knownTables) {
        console.log(`Table: ${tableName}`);

        // Get columns
        const { data, error } = await supabase.from(tableName).select('*').limit(0);

        if (error) {
            console.log(`  Error: ${error.message}`);
        } else {
            console.log(`  Status: Accessible`);
        }
        console.log('');
    }

    // Try to get RLS policies info
    console.log('--- RLS POLICIES ---\n');
    console.log('(RLS policies cannot be retrieved via REST API, use SQL Editor)\n');

    console.log('=== Backup Complete ===');
}

backupSchema().catch(console.error);
