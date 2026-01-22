// Native fetch used


const URL = 'https://zxbmbbfrzbtuueysicoc.supabase.co/functions/v1/query-names';
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4Ym1iYmZyemJ0dXVleXNpY29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODg5ODksImV4cCI6MjA2NjI2NDk4OX0.u436PniqvX-jQzVw72f_gO5J55Xy8HwO56x8cT4zJ98'; // Fallback from config if env not set for node

async function run() {
    console.log("Testing query-names API...");

    const payload = {
        countyCode: 'A', // Taipei
        query: '中山',
        detailed: true
    };

    try {
        const response = await fetch(URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ANON_KEY}`,
                'apikey': ANON_KEY
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error("API Error:", response.status, response.statusText);
            const text = await response.text();
            console.error("Body:", text);
        } else {
            const data = await response.json();
            console.log("API Success. Count:", Array.isArray(data) ? data.length : (data.names?.length || 0));
            console.log("Data Sample:", JSON.stringify(data).substring(0, 200));
        }
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

run();
