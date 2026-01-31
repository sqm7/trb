
// scripts/verify-heatmap.ts
import { generateHeatmapData } from '../src/lib/heatmap-utils';

// Mock Transactions
const mockTransactions = [
    {
        '樓層': '4',
        '戶別': 'A',
        '房屋單價(萬)': 50,
        '交易總價(萬)': 1000,
        '房屋總價(萬)': 800,
        '車位總價(萬)': 200,
        '房屋面積(坪)': 20,
        '房數': 2,
        '主要用途': '住家用',
        '建物型態': '住宅大樓'
    },
    {
        '樓層': '5',
        '戶別': 'A',
        '房屋單價(萬)': 50.15, // Should be roughly +0.3% if baseline is 50
        '交易總價(萬)': 1003,
        '房屋總價(萬)': 803,
        '車位總價(萬)': 200,
        '房屋面積(坪)': 20,
        '房數': 2,
        '主要用途': '住家用',
        '建物型態': '住宅大樓'
    },
    { // Anchor candidate (lowest price)
        '樓層': '3',
        '戶別': 'A',
        '房屋單價(萬)': 49.85,
        '交易總價(萬)': 997,
        '房屋總價(萬)': 797,
        '車位總價(萬)': 200,
        '房屋面積(坪)': 20,
        '房數': 2,
        '主要用途': '住家用',
        '建物型態': '住宅大樓'
    },
    { // Storefront (should be marked)
        '樓層': '1',
        '戶別': 'S1',
        '房屋單價(萬)': 100,
        '交易總價(萬)': 3000,
        '房屋總價(萬)': 3000,
        '車位總價(萬)': 0,
        '房屋面積(坪)': 30,
        '房數': 0,
        '主要用途': '商業用',
        '建物型態': '店舖'
    }
];

console.log("Starting Heatmap Logic Verification...");

const result = generateHeatmapData(mockTransactions, 0.3);

console.log("Generated Floors:", result.sortedFloors);
console.log("Generated Units:", result.sortedUnits);

// Check Sort Order (numeric descending)
if (result.sortedFloors[0] === '5' && result.sortedFloors[result.sortedFloors.length - 1] === '1') {
    console.log("✅ Floor Sorting Correct");
} else {
    console.error("❌ Floor Sorting Incorrect:", result.sortedFloors);
}

// Check Grid Content
const cell5A = result.horizontalGrid['5']['A'][0];
if (cell5A && cell5A.unitPrice === 50.15) {
    console.log("✅ Cell Data Correct");
} else {
    console.error("❌ Cell Data Incorrect");
}

// Check Storefront identification
const store = result.horizontalGrid['1']['S1'][0];
if (store && store.isStorefront) {
    console.log("✅ Storefront Identification Correct");
} else {
    console.error("❌ Storefront Identification Incorrect");
}

// Check Anchor Logic (The lowest price unit should be close to 0 premium if baseline logic works perfect, 
// OR it depends on which one is picked as anchor. 
// My logic picks lowest price non-special as anchor. So 3F (49.85) should be anchor for itself.)
// Let's check 3F A
const cell3A = result.horizontalGrid['3']['A'][0];
// theoretical for 3F based on 3F anchor = 49.85. 
// premium should be 0.
if (Math.abs(cell3A.premium) < 0.01) {
    console.log("✅ Anchor Premium Correct (0%)");
} else {
    console.warn(`⚠️ Anchor Premium Warning: Got ${cell3A.premium}, Expected ~0`);
}

// Check 4F A vs 3F A (Anchor)
// diff = 1 floor. premium setting = 0.3%.
// Theoretical 4F = 49.85 * (1 + 0.003) = 49.99955
// Actual 4F = 50.0
// Premium = (50 - 49.99955) / 49.99955 = 0.000009... ~ 0% (It's almost exactly on the curve)
// Wait, my mock data:
// 3F: 49.85
// 4F: 50.0
// Diff = 0.15. 
// % increase = 0.15 / 49.85 = 0.003009 => 0.3%
// So it matches perfectly. Premium should be 0 (meaning 'on par with standard price adjustment').
// Wait, "Premium" in heatmap usually means "Overpriced vs Standard".
// If Actual matches Theoretical, Premium should be 0.
// If Actual > Theoretical, Premium > 0.
// Let's see what the code does.
const cell4A = result.horizontalGrid['4']['A'][0];
console.log(`4F Premium: ${cell4A.premium}`);

if (Math.abs(cell4A.premium) < 0.1) {
    console.log("✅ Floor Price Increase Matches Standard (Premium ~0)");
} else {
    console.log(`ℹ️ 4F shows deviation: ${cell4A.premium}%`);
}
