/**
 * PPT Report Generator
 * 使用 PptxGenJS 在瀏覽器端生成專業的房市分析報告
 * 
 * 設計風格：Dark Mode + Data-Dense Dashboard
 * 採用 /pptx 和 /ui-ux-pro-max skills 指導
 */

import PptxGenJS from 'pptxgenjs';
import { REPORT_THEME } from './report-design-system';
import { AnalysisData, GenerateOptions } from './types';

// ============================================================================
// 色彩配置 (Mapping from REPORT_THEME)
// ============================================================================
// PptxGenJS expects hex strings without hash for some inputs, or with hash.
// Safe to use hex strings.
const THEME = {
    bg: REPORT_THEME.colors.background,
    card: REPORT_THEME.colors.cardBg,
    header: REPORT_THEME.colors.headerBg,
    text: REPORT_THEME.colors.textPrimary,
    textSec: REPORT_THEME.colors.textSecondary,
    textMuted: REPORT_THEME.colors.textMuted,
    accent: REPORT_THEME.colors.primary,
    secondary: REPORT_THEME.colors.secondary,
    border: REPORT_THEME.colors.border,
};

const CHART_COLORS = REPORT_THEME.chartColors;

// Types moved to ./types.ts

// ============================================================================
// 輔助函式
// ============================================================================
const formatNumber = (num: number, decimals = 0): string => {
    return num.toLocaleString('zh-TW', { maximumFractionDigits: decimals });
};

const formatPrice = (num: number): string => {
    if (num >= 10000) {
        return `${(num / 10000).toFixed(2)}億`;
    }
    return `${formatNumber(num)}萬`;
};

// ============================================================================
// 幻燈片生成函式
// ============================================================================

/**
 * Slide 1: 封面頁
 */
function addCoverSlide(pptx: PptxGenJS, options: GenerateOptions): void {
    const slide = pptx.addSlide();
    slide.background = { color: THEME.bg };

    // 裝飾元素 - 漸層區塊（左側）
    slide.addShape('rect', {
        x: 0, y: 0, w: 0.15, h: '100%',
        fill: { color: THEME.accent }
    });

    // 主標題
    slide.addText('房市分析報告', {
        x: 0.8, y: 2, w: 8.4, h: 1,
        fontSize: 44,
        fontFace: REPORT_THEME.fonts.heading,
        color: THEME.text,
        bold: true
    });

    // 副標題 - 篩選條件
    const subtitleParts: string[] = [];
    if (options.counties?.length) {
        subtitleParts.push(options.counties.join('、'));
    }
    if (options.districts?.length) {
        subtitleParts.push(options.districts.slice(0, 3).join('、') + (options.districts.length > 3 ? '...' : ''));
    }
    if (options.startDate && options.endDate) {
        subtitleParts.push(`${options.startDate} ~ ${options.endDate}`);
    }

    slide.addText(subtitleParts.join(' | ') || '完整區域分析', {
        x: 0.8, y: 3.1, w: 8.4, h: 0.5,
        fontSize: 18,
        fontFace: REPORT_THEME.fonts.body,
        color: THEME.textSec
    });

    // 生成日期
    const now = new Date();
    const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
    slide.addText(`報告生成日期：${dateStr}`, {
        x: 0.8, y: 4.8, w: 4, h: 0.3,
        fontSize: 12,
        fontFace: REPORT_THEME.fonts.body,
        color: THEME.textMuted
    });

    // 品牌標識
    slide.addText('平米內參', {
        x: 7.5, y: 4.8, w: 2, h: 0.3,
        fontSize: 14,
        fontFace: REPORT_THEME.fonts.body,
        color: THEME.accent,
        bold: true,
        align: 'right'
    });
}

/**
 * Slide 2: 核心指標摘要
 */
function addMetricsSlide(pptx: PptxGenJS, data: AnalysisData): void {
    const slide = pptx.addSlide();
    slide.background = { color: THEME.bg };

    // 標題
    slide.addText('核心指標摘要', {
        x: 0.5, y: 0.3, w: 9, h: 0.6,
        fontSize: 28,
        fontFace: REPORT_THEME.fonts.heading,
        color: THEME.text,
        bold: true
    });

    // 計算衍生指標
    const rankings = data.projectRanking || [];
    const allPrices = rankings.map(p => p.averagePrice).filter(p => p > 0);
    const sortedPrices = [...allPrices].sort((a, b) => a - b);
    const minPrice = sortedPrices[0] || 0;
    const maxPrice = sortedPrices[sortedPrices.length - 1] || 0;
    const medianPrice = sortedPrices[Math.floor(sortedPrices.length / 2)] || 0;

    // 指標卡片配置
    const metrics = [
        { label: '總銷售金額', value: formatPrice(data.coreMetrics.totalSaleAmount), color: THEME.accent },
        { label: '總銷坪數', value: `${formatNumber(data.coreMetrics.totalHouseArea, 1)} 坪`, color: THEME.secondary },
        { label: '平均單價', value: `${formatNumber(data.coreMetrics.overallAveragePrice, 1)} 萬/坪`, color: REPORT_THEME.colors.success },
        { label: '交易筆數', value: `${formatNumber(data.coreMetrics.transactionCount)} 筆`, color: REPORT_THEME.colors.accent },
        { label: '最低單價', value: `${formatNumber(minPrice, 1)} 萬/坪`, color: THEME.textSec },
        { label: '最高單價', value: `${formatNumber(maxPrice, 1)} 萬/坪`, color: THEME.textSec },
        { label: '中位數單價', value: `${formatNumber(medianPrice, 1)} 萬/坪`, color: THEME.textMuted }, // Keeping it subtle
        { label: '建案數量', value: `${rankings.length} 個`, color: THEME.textSec },
    ];

    // 4x2 網格佈局
    const cardW = 2.2;
    const cardH = 1.2;
    const startX = 0.5;
    const startY = 1.2;
    const gapX = 0.15;
    const gapY = 0.2;

    metrics.forEach((metric, idx) => {
        const col = idx % 4;
        const row = Math.floor(idx / 4);
        const x = startX + col * (cardW + gapX);
        const y = startY + row * (cardH + gapY);

        // 卡片背景
        slide.addShape('roundRect', {
            x, y, w: cardW, h: cardH,
            fill: { color: THEME.card },
            line: { color: THEME.border, width: 0.5 },
            rectRadius: 0.08
        });

        // 標籤
        slide.addText(metric.label, {
            x, y: y + 0.15, w: cardW, h: 0.3,
            fontSize: 11,
            fontFace: REPORT_THEME.fonts.body,
            color: THEME.textMuted,
            align: 'center'
        });

        // 數值
        slide.addText(metric.value, {
            x, y: y + 0.5, w: cardW, h: 0.5,
            fontSize: 20,
            fontFace: REPORT_THEME.fonts.body,
            color: metric.color,
            bold: true,
            align: 'center'
        });
    });

    // 頁碼
    slide.addText('02', {
        x: 9.2, y: 5.1, w: 0.5, h: 0.3,
        fontSize: 10,
        color: THEME.textMuted,
        align: 'right'
    });
}

/**
 * Slide 3: 建案排名圖表 (長條圖)
 */
function addRankingChartSlide(pptx: PptxGenJS, data: AnalysisData): void {
    const slide = pptx.addSlide();
    slide.background = { color: THEME.bg };

    // 標題
    slide.addText('Top 10 建案銷售金額排名', {
        x: 0.5, y: 0.3, w: 9, h: 0.6,
        fontSize: 24,
        fontFace: REPORT_THEME.fonts.heading,
        color: THEME.text,
        bold: true
    });

    // 準備圖表資料
    const top10 = (data.projectRanking || [])
        .slice(0, 10)
        .sort((a, b) => b.saleAmountSum - a.saleAmountSum);

    if (top10.length === 0) {
        slide.addText('無資料', {
            x: 3, y: 2.5, w: 4, h: 1,
            fontSize: 18,
            color: THEME.textMuted,
            align: 'center'
        });
        return;
    }

    const chartData = [{
        name: '銷售金額',
        labels: top10.map(p => p.projectName.substring(0, 10)),
        values: top10.map(p => p.saleAmountSum)
    }];

    slide.addChart(pptx.ChartType.bar, chartData, {
        x: 0.5, y: 1, w: 9, h: 4,
        barDir: 'bar',
        showTitle: false,
        showLegend: false,
        chartColors: [THEME.accent],
        catAxisLabelColor: THEME.textSec,
        catAxisLabelFontSize: 10,
        valAxisLabelColor: THEME.textSec,
        valAxisLabelFontSize: 9,
        valAxisTitle: '銷售金額 (萬)',
        valAxisTitleColor: THEME.textMuted,
        valAxisTitleFontSize: 10,
        showValAxisTitle: true,
        catGridLine: { style: 'none' },
        valGridLine: { color: THEME.border, style: 'dash' },
        plotArea: { fill: { color: THEME.bg } }
    });

    // 頁碼
    slide.addText('03', {
        x: 9.2, y: 5.1, w: 0.5, h: 0.3,
        fontSize: 10,
        color: THEME.textMuted,
        align: 'right'
    });
}

/**
 * Slide 4: 建案排名表格
 */
function addRakingTableSlide(pptx: PptxGenJS, data: AnalysisData): void {
    const slide = pptx.addSlide();
    slide.background = { color: THEME.bg };

    // 標題
    slide.addText('建案排名詳細資料', {
        x: 0.5, y: 0.3, w: 9, h: 0.5,
        fontSize: 24,
        fontFace: REPORT_THEME.fonts.heading,
        color: THEME.text,
        bold: true
    });

    // 準備表格資料
    const top15 = (data.projectRanking || []).slice(0, 15);

    const headerRow = [
        { text: '排名', options: { fill: { color: THEME.header }, color: THEME.textSec, bold: true, align: 'center' as const } },
        { text: '建案名稱', options: { fill: { color: THEME.header }, color: THEME.textSec, bold: true } },
        { text: '總銷金額', options: { fill: { color: THEME.header }, color: THEME.textSec, bold: true, align: 'right' as const } },
        { text: '平均單價', options: { fill: { color: THEME.header }, color: THEME.textSec, bold: true, align: 'right' as const } },
        { text: '坪數', options: { fill: { color: THEME.header }, color: THEME.textSec, bold: true, align: 'right' as const } },
        { text: '筆數', options: { fill: { color: THEME.header }, color: THEME.textSec, bold: true, align: 'center' as const } },
    ];

    const dataRows = top15.map((p, idx) => [
        { text: String(idx + 1), options: { color: THEME.textMuted, align: 'center' as const } },
        { text: p.projectName.substring(0, 15), options: { color: THEME.text } },
        { text: formatNumber(p.saleAmountSum), options: { color: THEME.accent, align: 'right' as const } },
        { text: formatNumber(p.averagePrice, 1), options: { color: THEME.secondary, align: 'right' as const } },
        { text: formatNumber(p.houseAreaSum, 0), options: { color: THEME.textSec, align: 'right' as const } },
        { text: String(p.transactionCount), options: { color: THEME.textSec, align: 'center' as const } },
    ]);

    slide.addTable([headerRow, ...dataRows], {
        x: 0.3, y: 0.9, w: 9.4, h: 4.3,
        colW: [0.6, 3.2, 1.5, 1.4, 1.3, 0.8],
        fontSize: 10,
        fontFace: REPORT_THEME.fonts.body,
        color: THEME.text,
        fill: { color: THEME.card },
        border: { type: 'solid', pt: 0.5, color: THEME.border },
        valign: 'middle'
    });

    // 頁碼
    slide.addText('04', {
        x: 9.2, y: 5.1, w: 0.5, h: 0.3,
        fontSize: 10,
        color: THEME.textMuted,
        align: 'right'
    });
}

/**
 * Slide 5: 總價帶分佈
 */
function addPriceBandSlide(pptx: PptxGenJS, data: AnalysisData): void {
    const slide = pptx.addSlide();
    slide.background = { color: THEME.bg };

    // 標題
    slide.addText('各房型總價帶分析', {
        x: 0.5, y: 0.3, w: 9, h: 0.5,
        fontSize: 24,
        fontFace: REPORT_THEME.fonts.heading,
        color: THEME.text,
        bold: true
    });

    const priceBandData = data.priceBandAnalysis?.details || [];

    if (priceBandData.length === 0) {
        slide.addText('無總價帶資料', {
            x: 3, y: 2.5, w: 4, h: 1,
            fontSize: 18,
            color: THEME.textMuted,
            align: 'center'
        });
        return;
    }

    // 房型分佈長條圖
    const chartData = [{
        name: '平均總價',
        labels: priceBandData.slice(0, 8).map(d => d.roomType),
        values: priceBandData.slice(0, 8).map(d => d.avgPrice)
    }];

    slide.addChart(pptx.ChartType.bar, chartData, {
        x: 0.5, y: 1, w: 4.5, h: 3.5,
        barDir: 'col',
        showTitle: false,
        showLegend: false,
        chartColors: CHART_COLORS,
        catAxisLabelColor: THEME.textSec,
        catAxisLabelFontSize: 10,
        valAxisLabelColor: THEME.textSec,
        valAxisLabelFontSize: 9,
        valAxisTitle: '平均總價 (萬)',
        showValAxisTitle: true,
        valAxisTitleColor: THEME.textMuted,
        catGridLine: { style: 'none' },
        valGridLine: { color: THEME.border, style: 'dash' },
        plotArea: { fill: { color: THEME.bg } }
    });

    // 右側統計表格
    const tableData = priceBandData.slice(0, 6).map(d => [
        { text: d.roomType, options: { color: THEME.text } },
        { text: formatNumber(d.count), options: { color: THEME.textSec, align: 'center' as const } },
        { text: formatNumber(d.avgPrice, 0), options: { color: THEME.secondary, align: 'right' as const } },
    ]);

    const header = [
        { text: '房型', options: { fill: { color: THEME.header }, color: THEME.textSec, bold: true } },
        { text: '筆數', options: { fill: { color: THEME.header }, color: THEME.textSec, bold: true, align: 'center' as const } },
        { text: '均價', options: { fill: { color: THEME.header }, color: THEME.textSec, bold: true, align: 'right' as const } },
    ];

    slide.addTable([header, ...tableData], {
        x: 5.2, y: 1, w: 4.3, h: 2.5,
        colW: [1.5, 1.2, 1.4],
        fontSize: 11,
        fontFace: REPORT_THEME.fonts.body,
        color: THEME.text,
        fill: { color: THEME.card },
        border: { type: 'solid', pt: 0.5, color: THEME.border },
        valign: 'middle'
    });

    // 頁碼
    slide.addText('05', {
        x: 9.2, y: 5.1, w: 0.5, h: 0.3,
        fontSize: 10,
        color: THEME.textMuted,
        align: 'right'
    });
}

/**
 * Slide 6: 區域分佈圓餅圖
 */
function addDistrictDistributionSlide(pptx: PptxGenJS, data: AnalysisData): void {
    const slide = pptx.addSlide();
    slide.background = { color: THEME.bg };

    // 標題
    slide.addText('各行政區成交佔比', {
        x: 0.5, y: 0.3, w: 9, h: 0.5,
        fontSize: 24,
        fontFace: REPORT_THEME.fonts.heading,
        color: THEME.text,
        bold: true
    });

    // 從交易明細計算行政區分佈
    const transactions = data.transactionDetails || [];
    const districtCounts: Record<string, number> = {};

    transactions.forEach((tx: any) => {
        const district = tx['行政區'] || tx.district || '未知';
        districtCounts[district] = (districtCounts[district] || 0) + 1;
    });

    const sortedDistricts = Object.entries(districtCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

    if (sortedDistricts.length === 0) {
        slide.addText('無區域分佈資料', {
            x: 3, y: 2.5, w: 4, h: 1,
            fontSize: 18,
            color: THEME.textMuted,
            align: 'center'
        });
        return;
    }

    const chartData = [{
        name: '成交筆數',
        labels: sortedDistricts.map(([name]) => name),
        values: sortedDistricts.map(([, count]) => count)
    }];

    slide.addChart(pptx.ChartType.pie, chartData, {
        x: 0.5, y: 1, w: 5, h: 4,
        showTitle: false,
        showLegend: true,
        legendPos: 'r',
        legendColor: THEME.textSec,
        legendFontSize: 10,
        chartColors: CHART_COLORS,
        showPercent: true,
        showValue: false
    });

    // 頁碼
    slide.addText('06', {
        x: 9.2, y: 5.1, w: 0.5, h: 0.3,
        fontSize: 10,
        color: THEME.textMuted,
        align: 'right'
    });
}

/**
 * Slide 7: 銷售趨勢折線圖
 */
function addSalesTrendSlide(pptx: PptxGenJS, data: AnalysisData): void {
    const slide = pptx.addSlide();
    slide.background = { color: THEME.bg };

    // 標題
    slide.addText('月度銷售趨勢', {
        x: 0.5, y: 0.3, w: 9, h: 0.5,
        fontSize: 24,
        fontFace: REPORT_THEME.fonts.heading,
        color: THEME.text,
        bold: true
    });

    // 從交易明細計算月度趨勢
    const transactions = data.transactionDetails || [];
    const monthlyData: Record<string, number> = {};

    transactions.forEach((tx: any) => {
        const date = tx['登記日期'] || tx.registrationDate || '';
        if (date) {
            const month = date.substring(0, 7); // YYYY-MM
            monthlyData[month] = (monthlyData[month] || 0) + 1;
        }
    });

    const sortedMonths = Object.entries(monthlyData)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-12); // 最近12個月

    if (sortedMonths.length < 2) {
        slide.addText('資料不足以顯示趨勢', {
            x: 3, y: 2.5, w: 4, h: 1,
            fontSize: 18,
            color: THEME.textMuted,
            align: 'center'
        });
        return;
    }

    const chartData = [{
        name: '成交筆數',
        labels: sortedMonths.map(([month]) => month.substring(5)), // MM
        values: sortedMonths.map(([, count]) => count)
    }];

    slide.addChart(pptx.ChartType.line, chartData, {
        x: 0.5, y: 1, w: 9, h: 4,
        showTitle: false,
        showLegend: false,
        chartColors: [THEME.secondary],
        lineSize: 3,
        lineSmooth: true,
        catAxisLabelColor: THEME.textSec,
        catAxisLabelFontSize: 10,
        catAxisTitle: '月份',
        showCatAxisTitle: true,
        catAxisTitleColor: THEME.textMuted,
        valAxisLabelColor: THEME.textSec,
        valAxisLabelFontSize: 9,
        valAxisTitle: '成交筆數',
        showValAxisTitle: true,
        valAxisTitleColor: THEME.textMuted,
        catGridLine: { style: 'none' },
        valGridLine: { color: THEME.border, style: 'dash' },
        plotArea: { fill: { color: THEME.bg } }
    });

    // 頁碼
    slide.addText('07', {
        x: 9.2, y: 5.1, w: 0.5, h: 0.3,
        fontSize: 10,
        color: THEME.textMuted,
        align: 'right'
    });
}

// ============================================================================
// 主要生成函式
// ============================================================================

/**
 * 生成房市分析 PPTX 報告
 */
export async function generateReportPPTX(
    analysisData: AnalysisData,
    options: GenerateOptions = {}
): Promise<Blob> {
    const pptx = new PptxGenJS();

    // 設定簡報屬性
    pptx.layout = 'LAYOUT_16x9';
    pptx.title = options.title || '房市分析報告';
    pptx.author = '平米內參';
    pptx.company = 'SQM Talk';
    pptx.subject = '房地產市場分析';

    // 生成各幻燈片
    addCoverSlide(pptx, options);
    addMetricsSlide(pptx, analysisData);
    addRankingChartSlide(pptx, analysisData);
    addRakingTableSlide(pptx, analysisData);
    addPriceBandSlide(pptx, analysisData);
    addDistrictDistributionSlide(pptx, analysisData);
    addSalesTrendSlide(pptx, analysisData);

    // 生成 Blob
    const blob = await pptx.write({ outputType: 'blob' }) as Blob;
    return blob;
}

/**
 * 下載 PPTX 報告
 */
export async function downloadReportPPTX(
    analysisData: AnalysisData,
    options: GenerateOptions = {}
): Promise<void> {
    const { saveAs } = await import('file-saver');

    const blob = await generateReportPPTX(analysisData, options);

    // 生成檔名
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const fileName = `房市分析報告_${options.counties?.join('_') || '完整區域'}_${dateStr}.pptx`;

    saveAs(blob, fileName);
}
