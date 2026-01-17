
const { createClient } = require('@supabase/supabase-js');

// Load environment variables (you might need to set these manually if strictly running with node)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zxbmbbfrzbtuueysicoc.supabase.co';
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4Ym1iYmZyemJ0dXVleXNpY29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODg5ODksImV4cCI6MjA2NjI2NDk4OX0.1IUynv5eK1xF_3pb-oasqaTrPvbeAOC4Sc1oykPBy4M';

async function testAnalyze() {
    console.log("Testing analyze-project-ranking for 'J PARK-A'...");

    const payload = {
        filters: { // Matches api.ts structure
            countyCode: "A",
            counties: ["A"],
            projectNames: ["NON_EXISTENT_PROJECT_999"],
            type: "預售交易", // Matches backend check
            dateRange: "year",
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
        console.log("Core Metrics:", data.coreMetrics);
        console.log("Project Ranking Length:", data.projectRanking?.length);
        console.log("Transaction Details Length:", data.transactionDetails?.length);

        if (data.projectRanking?.length > 0) {
            console.log("First Project:", data.projectRanking[0]);
        }

    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

testAnalyze();
