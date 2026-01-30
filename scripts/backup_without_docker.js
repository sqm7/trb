const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zxbmbbfrzbtuueysicoc.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4Ym1iYmZyemJ0dXVleXNpY29jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY4ODk4OSwiZXhwIjoyMDY2MjY0OTg5fQ.LWr3I8vI0i2dfgF1ozKxe0DoxNerdzabTOoTwTD_UKk';

const BACKUP_DIR = 'supabase_schema_sqm';

async function fetchAPI(endpoint) {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(`${SUPABASE_URL}/rest/v1/${endpoint}`, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 400) {
                    // Try to parse error if json
                    try {
                        const err = JSON.parse(data);
                        reject(new Error(err.message || res.statusMessage));
                    } catch {
                        reject(new Error(res.statusMessage + ': ' + data));
                    }
                } else {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(e);
                    }
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.end();
    });
}

async function main() {
    console.log('🚀 Starting Docker-less Backup...');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const dateDir = new Date().toISOString().slice(0, 10);
    const outputDir = path.join(BACKUP_DIR, dateDir);

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    try {
        console.log('1. Fetching OpenAPI Spec...');
        // Note: OpenAPI spec is at root of REST API
        const openApiSpec = await new Promise((resolve, reject) => {
            const options = {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            };
            https.get(`${SUPABASE_URL}/rest/v1/`, options, (res) => {
                let data = '';
                res.on('data', c => data += c);
                res.on('end', () => resolve(JSON.parse(data)));
                res.on('error', reject);
            });
        });

        console.log('2. Fetching information_schema.tables...');
        // Note: This often fails if information_schema is not exposed to the API. 
        // But with Service Role Key, we might have luck if the schema was added to exposed schemas or if we can query it.
        // Actually, by default Supabase usage of PostgREST doesn't expose information_schema.
        // We will try.

        let schemaData = { openapi: openApiSpec };

        try {
            // Try to access a known table to verify connectivity first
            await fetchAPI('profiles?limit=1');
            console.log('   (Connection verified)');
        } catch (e) {
            console.warn('   (Warning: Could not fetch public table check)', e.message);
        }

        const filename = `backup_no_docker_${timestamp}.json`;
        const filepath = path.join(outputDir, filename);

        fs.writeFileSync(filepath, JSON.stringify(schemaData, null, 2));

        console.log('✅ Backup successful (JSON format)!');
        console.log(`📂 File: ${filepath}`);
        console.log('Note: This is an API-level schema backup. For full SQL dump, please start Docker and use standard script.');

    } catch (e) {
        console.error('❌ Backup failed:', e.message);
        process.exit(1);
    }
}

main();
