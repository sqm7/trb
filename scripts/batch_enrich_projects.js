const { createClient } = require('@supabase/supabase-js');
const { chromium } = require('playwright');
const fs = require('fs');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEBUG_MODE = true;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const COUNTY_CODES = ['a'];

// --- Parsers ---
async function parseLeju(page) {
    console.log('         🔍 Parsing Leju page...');
    const fullText = await page.textContent('body');
    const result = {};
    const patterns = {
        'public_ratio': /公設比\s*[:：]?\s*([\d\.]+%?)/,
        'total_households': /總戶數\s*[:：]?\s*(\d+戶)/,
        'structure': /構造種類\s*[:：]?\s*([^ \n\r]+)/,
        'total_floors': /總樓高\s*[:：]?\s*([^ \n\r]+)/,
        'site_area': /基地面積\s*[:：]?\s*([\d\.]+坪)/,
        'land_usage_zone': /土地使用分區\s*[:：]?\s*([^ \n\r]+)/,
        'developer': /建設公司\s*[:：]?\s*([^ \n\r]+)/,
        'contractor': /營造公司\s*[:：]?\s*([^ \n\r]+)/,
        'architect': /建築設計\s*[:：]?\s*([^ \n\r]+)/,
        'parking_count': /車位數量\s*[:：]?\s*(\d+個)/,
    };
    for (const [key, regex] of Object.entries(patterns)) {
        const match = fullText.match(regex);
        if (match) result[key] = match[1].trim();
    }
    return result;
}

// --- Search Engines ---
async function searchGoogle(page, query) {
    console.log(`      🔍 [Google] Searching: ${query}`);
    try {
        await page.goto('https://www.google.com/search?q=' + encodeURIComponent(query), {
            waitUntil: 'domcontentloaded', timeout: 15000
        });

        const title = await page.title();
        if (title.includes('Bot') || title.includes('Verify') || title.includes('Captcha')) {
            console.log('         ⚠️ Google CAPTCHA detected.');
            return [];
        }

        // Return all Leju links
        const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a[href*="leju.com.tw"]'))
                .map(a => a.href);
        });
        return links;
    } catch (e) {
        console.log(`         ⚠️ Google Error: ${e.message}`);
        return [];
    }
}

async function searchDDG(page, query) {
    console.log(`      🔍 [DuckDuckGo] Searching: ${query}`);
    try {
        await page.goto('https://duckduckgo.com/?q=' + encodeURIComponent(query), {
            waitUntil: 'domcontentloaded', timeout: 15000
        });
        const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a[href*="leju.com.tw"]'))
                .map(a => a.href);
        });
        return links;
    } catch (e) {
        console.log(`         ⚠️ DDG Error: ${e.message}`);
        return [];
    }
}

async function scrapeProject(page, projectName) {
    const query = `site:leju.com.tw ${projectName}`;

    // 1. Try Google
    let links = await searchGoogle(page, query);

    // 2. Fallback to DDG if empty
    if (links.length === 0) {
        console.log('      ⚠️ Google yields no results. Switching to DuckDuckGo...');
        links = await searchDDG(page, query);
    }

    if (links.length === 0) {
        if (DEBUG_MODE) {
            const path = `debug_fail_${projectName.replace(/\s/g, '_')}.html`;
            fs.writeFileSync(path, await page.content());
            console.log(`      📸 No links. Saved page dump to ${path}`);
        }
        return null;
    }

    // 3. Visit First Link
    // Prioritize 'community' links if possible
    const target = links.find(l => l.includes('/community/')) || links[0];
    console.log(`      🔗 Visiting: ${target}`);

    try {
        await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 10000 });
        const data = await parseLeju(page);
        return Object.keys(data).length > 0 ? data : null;
    } catch (e) {
        console.error(`      ❌ Visit error: ${e.message}`);
        return null;
    }
}

async function main() {
    console.log("🚀 Starting Batch Project Enrichment (Robust)...");

    const browser = await chromium.launch({
        headless: true,
        args: ['--disable-blink-features=AutomationControlled']
    });

    try {
        for (const code of COUNTY_CODES) {
            const tableName = `${code.toLowerCase()}_projects`;
            console.log(`\n📂 Checking County Table: ${tableName}`);

            const BATCH_LIMIT = 5;
            const { data: projects, error } = await supabase
                .from(tableName)
                .select('id, project_name')
                .is('developer', null)
                .limit(BATCH_LIMIT);

            if (error || !projects || projects.length === 0) { console.log(`   ✅ No projects pending.`); continue; }

            console.log(`   Processing ${projects.length} projects...`);

            for (const p of projects) {
                const context = await browser.newContext({
                    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    locale: 'zh-TW', timezoneId: 'Asia/Taipei'
                });
                const page = await context.newPage();
                console.log(`   ▶️ Enriching: [${p.project_name}]`);

                await new Promise(r => setTimeout(r, 2000)); // Delay

                const enrichedData = await scrapeProject(page, p.project_name);
                await context.close();

                if (enrichedData) {
                    console.log(`      💡 Found data! Updating DB...`);
                    const { error: updateError } = await supabase
                        .from(tableName)
                        .update(enrichedData)
                        .eq('id', p.id);
                    if (updateError) console.error(`      ❌ Error: ${updateError.message}`);
                    else console.log(`      ✨ Success.`);
                } else {
                    console.log(`      💨 No data found.`);
                }
            }
        }
    } finally {
        await browser.close();
        console.log("\n🏁 Batch Process Complete.");
    }
}

main().catch(console.error);
