
// scripts/verify-aggregator.ts
import { aggregateAnalysisData } from '../src/lib/aggregator';

// Mock AnalysisResult parts
const mockDataA = {
    unitPriceAnalysis: {
        residentialStats: {
            count: 10,
            avgPrice: 50, // Old format: simple number (arithmetic mean)
            minPrice: 40,
            maxPrice: 60
        }
    }
};

const mockDataB = {
    unitPriceAnalysis: {
        residentialStats: {
            count: 20,
            avgPrice: { arithmetic: 60, weighted: 62 }, // New format: object
            minPrice: 55,
            maxPrice: 65,
            weightedAvgPrice: 62 // Fallback check
        }
    }
};

// Test Case 1: Merge Number + Object
// Expected: 
// Count = 10 + 20 = 30
// Arithmetic Mean = (50*10 + 60*20) / 30 = (500 + 1200) / 30 = 1700 / 30 = 56.66...
// Weighted Mean = (50*10 + 62*20) / 30 = (500 + 1240) / 30 = 1740 / 30 = 58 (Assuming A's weighted fallback is same as arithmetic)

console.log("Starting Aggregator Verification...");

try {
    // We need to access the internal logic, but since we export the main function, let's use that.
    // We'll mimic the structure required by aggregateAnalysisData
    const result = aggregateAnalysisData(mockDataA as any, mockDataB as any);
    const stats = result.unitPriceAnalysis.residentialStats;

    console.log("Result Stats:", JSON.stringify(stats, null, 2));

    const expectedArith = 56.67;
    const expectedWeighted = 58;

    const actualArith = stats.avgPrice.arithmetic;
    const actualWeighted = stats.avgPrice.weighted;

    if (Math.abs(actualArith - expectedArith) < 0.1) {
        console.log("✅ Arithmetic Mean Correct");
    } else {
        console.error(`❌ Arithmetic Mean Incorrect: Got ${actualArith}, Expected ~${expectedArith}`);
    }

    if (Math.abs(actualWeighted - expectedWeighted) < 0.1) {
        console.log("✅ Weighted Mean Correct");
    } else {
        console.error(`❌ Weighted Mean Incorrect: Got ${actualWeighted}, Expected ~${expectedWeighted}`);
    }

} catch (e) {
    console.error("❌ Execution Failed:", e);
}
