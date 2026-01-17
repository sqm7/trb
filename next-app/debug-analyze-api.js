
const { createClient } = require('@supabase/supabase-js');

// Load environment variables (you might need to set these manually if strictly running with node)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zxbmbbfrzbtuueysicoc.supabase.co';
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4Ym1iYmZyemJ0dXVleXNpY29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODg5ODksImV4cCI6MjA2NjI2NDk4OX0.1IUynv5eK1xF_3pb-oasqaTrPvbeAOC4Sc1oykPBy4M';

async function testAnalyze() {
    console.log("Testing analyze-project-ranking for 'J PARK-A'...");

    const payload = {
        filters: {
            countyCode: "A",
            townCode: "A01", // Assuming Taipei/Songshan or similar match
            projectNames: ["東方大境"],
            type: "預售交易",
            period: "2020Q1", // Adjust as needed to catch data
            startYear: 2020,
            endYear: 2025 // Wide range to ensure hits
        }
    };

    // Use fetch directly to bypass Supabase client complexity in this simple script
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze-project-ranking`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ANON_KEY}`,
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error("API Error:", response.status, await response.text());
            return;
        }

        const data = await response.json();
        console.log("API Success.");

        if (data.transactionDetails && data.transactionDetails.length > 0) {
            console.log("First Transaction Keys:", Object.keys(data.transactionDetails[0]));
            console.log("First Transaction Sample:", JSON.stringify(data.transactionDetails[0], null, 2));
        } else {
            console.log("No transactions found.");
            // Try fetching from a known file if API fails to find specifically for this ad-hoc query
        }

        if (data.projectRanking?.length > 0) {
            console.log("First Project:", data.projectRanking[0]);
        }

    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

testAnalyze();
