// js/modules/pdfExport.js
// PDF 報表輸出模組 - 從資料重建 PDF 專用版面

import { dom } from './dom.js';
import { state } from './state.js';
import * as ui from './ui.js';

// PDF 專用樣式 - A4 尺寸優化
const pdfStyles = `
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; }
    body { 
        font-family: 'Noto Sans TC', 'Inter', sans-serif; 
        background-color: #1a1d29; 
        color: #e5e7eb; 
        margin: 0; 
        padding: 0;
        line-height: 1.5;
        font-size: 10px;
    }
    .pdf-page { 
        width: 210mm;
        min-height: 297mm;
        padding: 15mm 12mm;
        background-color: #1a1d29;
        page-break-after: always;
        position: relative;
    }
    .pdf-page:last-child { page-break-after: avoid; }
    .page-title { 
        font-size: 18px; 
        font-weight: 700; 
        color: #06b6d4; 
        border-bottom: 2px solid #06b6d4; 
        padding-bottom: 8px; 
        margin-bottom: 15px;
    }
    .section-title { 
        font-size: 13px; 
        font-weight: 600; 
        color: #9ca3af; 
        margin: 15px 0 8px 0;
        border-bottom: 1px solid #374151;
        padding-bottom: 4px;
    }
    .metric-grid { 
        display: grid; 
        grid-template-columns: repeat(4, 1fr); 
        gap: 10px; 
        margin-bottom: 15px;
    }
    .metric-box { 
        background: linear-gradient(135deg, rgba(37, 40, 54, 0.9) 0%, rgba(30, 30, 40, 0.9) 100%);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px; 
        padding: 10px; 
        text-align: center;
    }
    .metric-label { font-size: 9px; color: #9ca3af; margin-bottom: 3px; }
    .metric-value { font-size: 16px; font-weight: 700; color: #e5e7eb; }
    .metric-unit { font-size: 10px; color: #6b7280; margin-left: 2px; }
    table { 
        width: 100%; 
        border-collapse: collapse; 
        font-size: 9px;
        margin-bottom: 12px;
    }
    th { 
        background-color: #252836; 
        color: #9ca3af; 
        padding: 6px 4px; 
        text-align: left;
        border-bottom: 1px solid #374151;
        font-weight: 600;
        white-space: nowrap;
    }
    td { 
        padding: 5px 4px; 
        border-bottom: 1px solid #374151; 
        color: #e5e7eb;
    }
    tr:nth-child(even) { background-color: rgba(255,255,255,0.02); }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .cover-page {
        min-height: 297mm;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
    }
    .cover-title { font-size: 32px; font-weight: 800; color: #06b6d4; margin-bottom: 8px; }
    .cover-subtitle { font-size: 20px; font-weight: 600; color: #e5e7eb; margin-bottom: 30px; }
    .filter-box {
        background: rgba(37, 40, 54, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 16px 24px;
        text-align: left;
        max-width: 350px;
    }
    .filter-title { font-size: 12px; color: #9ca3af; margin-bottom: 12px; border-bottom: 1px solid #374151; padding-bottom: 6px; }
    .filter-item { font-size: 11px; color: #e5e7eb; margin: 6px 0; }
    .filter-label { color: #9ca3af; }
    .footer-info { margin-top: 30px; font-size: 10px; color: #6b7280; }
    .page-number { position: absolute; bottom: 8mm; right: 12mm; font-size: 9px; color: #6b7280; }
    .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
`;

/**
 * 生成 PDF 報表
 */
export async function generatePDFReport() {
    console.log('[pdfExport] 開始生成 PDF（從資料重建版面）...');

    const exportBtn = dom.exportPdfBtn;
    const originalText = exportBtn.innerHTML;
    exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>生成中...';
    exportBtn.disabled = true;

    try {
        // 檢查資料
        if (!state.analysisDataCache) {
            throw new Error('沒有分析資料，請先執行分析');
        }

        const pdfContainer = document.createElement('div');
        pdfContainer.id = 'pdf-export-container';
        pdfContainer.style.cssText = `
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            background-color: #1a1d29;
            color: #e5e7eb;
            z-index: 9999;
        `;

        // 加入樣式
        const styleTag = document.createElement('style');
        styleTag.textContent = pdfStyles;
        pdfContainer.appendChild(styleTag);

        // 取得篩選條件
        const filterInfo = getFilterInfo();

        // 1. 封面頁
        pdfContainer.appendChild(createCoverPage(filterInfo));

        // 2. 核心指標與排名
        pdfContainer.appendChild(createRankingPage());

        // 3. 總價帶分析
        pdfContainer.appendChild(createPriceBandPage());

        // 4. 房屋單價分析
        pdfContainer.appendChild(createUnitPricePage());

        // 4. 車位分析
        pdfContainer.appendChild(createParkingPage());

        // 5. 房型去化分析
        pdfContainer.appendChild(createVelocityPage());

        // 6. 垂直水平分析（銷控表）
        pdfContainer.appendChild(createPriceGridPage());

        document.body.appendChild(pdfContainer);

        // 等待瀏覽器計算佈局（關鍵！）
        await new Promise(resolve => setTimeout(resolve, 500));

        // 確保滾動到頂部，避免截圖偏移
        window.scrollTo(0, 0);

        const contentHeight = pdfContainer.offsetHeight;
        console.log('[pdfExport] 容器高度:', contentHeight);

        // 生成 PDF
        const county = dom.countySelect.value || '全區';
        const today = new Date().toISOString().split('T')[0];
        const filename = `分析報表_${county}_${today}.pdf`;

        console.log('[pdfExport] 呼叫 html2pdf...');

        const opt = {
            margin: [10, 10, 10, 10],
            filename: filename,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: true,
                backgroundColor: '#1a1d29',
                width: 800,
                height: contentHeight, // 強制指定高度
                scrollY: 0,
                x: 0,
                y: 0,
                windowWidth: 800
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait'
            },
            pagebreak: { mode: ['css', 'legacy'] }
        };

        await html2pdf().set(opt).from(pdfContainer).save();

        console.log('[pdfExport] PDF 生成完成');
        document.body.removeChild(pdfContainer);

    } catch (error) {
        console.error('[pdfExport] PDF 生成失敗:', error);
        alert('PDF 生成失敗：' + error.message);
    } finally {
        exportBtn.innerHTML = originalText;
        exportBtn.disabled = false;
    }
}

/**
 * 取得篩選條件資訊
 */
function getFilterInfo() {
    const county = dom.countySelect.options[dom.countySelect.selectedIndex]?.text || '未選擇';
    const type = dom.typeSelect.value || '預售交易';
    const buildingType = dom.buildingTypeSelect.value || '全部';
    const dateStart = dom.dateStartInput.value || '';
    const dateEnd = dom.dateEndInput.value || '';
    const districtTags = dom.districtContainer.querySelectorAll('.tag-item');
    const districts = Array.from(districtTags).map(tag => tag.textContent.replace('×', '').trim());
    const projectTags = dom.projectNameContainer.querySelectorAll('.tag-item');
    const projects = Array.from(projectTags).map(tag => tag.textContent.replace('×', '').trim());

    return {
        county,
        type,
        buildingType,
        dateStart,
        dateEnd,
        districts: districts.length > 0 ? districts.join('、') : '全部',
        projects: projects.length > 0 ? projects.join('、') : '全部'
    };
}

/**
 * 封面頁
 */
function createCoverPage(filterInfo) {
    const page = document.createElement('div');
    page.className = 'pdf-page cover-page';

    const today = new Date().toLocaleDateString('zh-TW', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    page.innerHTML = `
        <div class="cover-title">平米內參</div>
        <div class="cover-subtitle">分析報表</div>
        <div class="filter-box">
            <div class="filter-title">篩選條件</div>
            <div class="filter-item"><span class="filter-label">縣市：</span>${filterInfo.county}</div>
            <div class="filter-item"><span class="filter-label">行政區：</span>${filterInfo.districts}</div>
            <div class="filter-item"><span class="filter-label">交易類型：</span>${filterInfo.type}</div>
            <div class="filter-item"><span class="filter-label">建物型態：</span>${filterInfo.buildingType}</div>
            <div class="filter-item"><span class="filter-label">分析期間：</span>${filterInfo.dateStart} ~ ${filterInfo.dateEnd}</div>
            ${filterInfo.projects !== '全部' ? `<div class="filter-item"><span class="filter-label">建案：</span>${filterInfo.projects}</div>` : ''}
        </div>
        <div class="footer-info">
            <div>報表生成日期：${today}</div>
            <div>資料來源：內政部實價登錄</div>
        </div>
    `;
    return page;
}

/**
 * 核心指標與排名頁
 */
function createRankingPage() {
    const page = document.createElement('div');
    page.className = 'pdf-page';

    const data = state.analysisDataCache;
    if (!data?.coreMetrics || !data?.projectRanking) {
        page.innerHTML = '<div class="page-title">1. 核心指標與排名</div><p>無資料</p>';
        return page;
    }

    const { coreMetrics, projectRanking } = data;

    // 核心指標
    let html = `
        <div class="page-title">1. 核心指標與排名</div>
        <div class="metric-grid">
            <div class="metric-box">
                <div class="metric-label">市場去化總銷售金額</div>
                <div class="metric-value">${ui.formatNumber(coreMetrics.totalSaleAmount, 0)}<span class="metric-unit">萬</span></div>
            </div>
            <div class="metric-box">
                <div class="metric-label">總銷去化房屋坪數</div>
                <div class="metric-value">${ui.formatNumber(coreMetrics.totalHouseArea, 2)}<span class="metric-unit">坪</span></div>
            </div>
            <div class="metric-box">
                <div class="metric-label">總平均單價</div>
                <div class="metric-value">${ui.formatNumber(coreMetrics.overallAveragePrice, 2)}<span class="metric-unit">萬/坪</span></div>
            </div>
            <div class="metric-box">
                <div class="metric-label">總交易筆數</div>
                <div class="metric-value">${coreMetrics.transactionCount.toLocaleString()}<span class="metric-unit">筆</span></div>
            </div>
        </div>
    `;

    // 排名表格（顯示前 15 名）
    const topProjects = projectRanking.slice(0, 15);
    html += `
        <div class="section-title">建案排名（前 15 名）</div>
        <table>
            <thead>
                <tr>
                    <th>排名</th>
                    <th>建案名稱</th>
                    <th class="text-right">交易總價(萬)</th>
                    <th class="text-right">筆數</th>
                    <th class="text-right">市佔(%)</th>
                    <th class="text-right">均價(萬)</th>
                </tr>
            </thead>
            <tbody>
                ${topProjects.map((p, i) => `
                    <tr>
                        <td>${i + 1}</td>
                        <td>${p.projectName}</td>
                        <td class="text-right">${ui.formatNumber(p.saleAmountSum, 0)}</td>
                        <td class="text-right">${p.transactionCount}</td>
                        <td class="text-right">${ui.formatNumber(p.marketShare)}%</td>
                        <td class="text-right">${ui.formatNumber(p.averagePrice)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    page.innerHTML = html;
    return page;
}

/**
 * 總價帶分析頁
 */
function createPriceBandPage() {
    const page = document.createElement('div');
    page.className = 'pdf-page';

    const data = state.analysisDataCache;
    if (!data?.priceBandAnalysis || data.priceBandAnalysis.length === 0) {
        page.innerHTML = '<div class="page-title">2. 總價帶分析</div><p>無資料</p>';
        return page;
    }

    const { priceBandAnalysis } = data;

    // API 回傳格式: { roomType, bathrooms, count, avgPrice, minPrice, maxPrice, medianPrice, ... }
    // 按房型排序
    const sortOrder = ['套房', '1房', '2房', '3房', '4房', '5房以上', '毛胚', '店舖', '辦公/事務所', '廠辦/工廠', '其他'];
    const sortedData = [...priceBandAnalysis].sort((a, b) => {
        const indexA = sortOrder.indexOf(a.roomType);
        const indexB = sortOrder.indexOf(b.roomType);
        if (indexA !== indexB) return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
        return (a.bathrooms || 0) - (b.bathrooms || 0);
    });

    let html = `
        <div class="page-title">2. 總價帶分析</div>
        <div class="section-title">房型總價統計</div>
        <table>
            <thead>
                <tr>
                    <th>房型</th>
                    <th>衛浴</th>
                    <th class="text-right">筆數</th>
                    <th class="text-right">平均總價(萬)</th>
                    <th class="text-right">最低(萬)</th>
                    <th class="text-right">中位數(萬)</th>
                    <th class="text-right">最高(萬)</th>
                </tr>
            </thead>
            <tbody>
                ${sortedData.slice(0, 25).map(item => `
                    <tr>
                        <td>${item.roomType}</td>
                        <td class="text-center">${item.bathrooms !== null ? item.bathrooms : '-'}</td>
                        <td class="text-right">${item.count}</td>
                        <td class="text-right">${ui.formatNumber(item.avgPrice, 0)}</td>
                        <td class="text-right">${ui.formatNumber(item.minPrice, 0)}</td>
                        <td class="text-right">${ui.formatNumber(item.medianPrice, 0)}</td>
                        <td class="text-right">${ui.formatNumber(item.maxPrice, 0)}</td>
                    </tr>
                `).join('')}
                ${sortedData.length > 25 ? `<tr><td colspan="7" class="text-center">...及其他 ${sortedData.length - 25} 種房型組合</td></tr>` : ''}
            </tbody>
        </table>
    `;

    page.innerHTML = html;
    return page;
}

/**
 * 房屋單價分析頁
 */
function createUnitPricePage() {
    const page = document.createElement('div');
    page.className = 'pdf-page';

    const data = state.analysisDataCache;
    if (!data?.unitPriceAnalysis) {
        page.innerHTML = '<div class="page-title">3. 房屋單價分析</div><p>無資料</p>';
        return page;
    }

    const { residentialStats, officeStats, storeStats } = data.unitPriceAnalysis;

    const renderStatsTable = (title, stats) => {
        if (!stats) return `<div class="section-title">${title}</div><p>無資料</p>`;
        return `
            <div class="section-title">${title}</div>
            <table>
                <tr><th>指標</th><th class="text-right">數值</th></tr>
                <tr><td>平均單價</td><td class="text-right">${ui.formatNumber(stats.mean || stats.arithmeticMean)} 萬/坪</td></tr>
                <tr><td>中位數</td><td class="text-right">${ui.formatNumber(stats.median)} 萬/坪</td></tr>
                <tr><td>最高</td><td class="text-right">${ui.formatNumber(stats.max)} 萬/坪</td></tr>
                <tr><td>最低</td><td class="text-right">${ui.formatNumber(stats.min)} 萬/坪</td></tr>
                <tr><td>筆數</td><td class="text-right">${stats.count || stats.transactionCount} 筆</td></tr>
            </table>
        `;
    };

    page.innerHTML = `
        <div class="page-title">3. 房屋單價分析</div>
        ${renderStatsTable('住宅單價統計', residentialStats)}
        ${renderStatsTable('事務所/辦公室單價統計', officeStats)}
        ${renderStatsTable('店鋪單價統計', storeStats)}
    `;
    return page;
}

/**
 * 車位分析頁
 */
function createParkingPage() {
    const page = document.createElement('div');
    page.className = 'pdf-page';

    const data = state.analysisDataCache;
    if (!data?.parkingAnalysis) {
        page.innerHTML = '<div class="page-title">4. 車位分析</div><p>無車位資料</p>';
        return page;
    }

    const { parkingRatio, avgPriceByType, rampPlanePriceByFloor } = data.parkingAnalysis;

    let html = `<div class="page-title">4. 車位分析</div>`;

    // 房車配比
    if (parkingRatio) {
        html += `
            <div class="section-title">房車配比</div>
            <div class="two-column">
                <table>
                    <thead><tr><th>配置類型</th><th class="text-right">筆數</th><th class="text-right">佔比</th></tr></thead>
                    <tbody>
                        <tr><td>有搭車位</td><td class="text-right">${parkingRatio.withParking.count.toLocaleString()}</td><td class="text-right">${ui.formatNumber(parkingRatio.withParking.percentage, 1)}%</td></tr>
                        <tr><td>沒搭車位</td><td class="text-right">${parkingRatio.withoutParking.count.toLocaleString()}</td><td class="text-right">${ui.formatNumber(parkingRatio.withoutParking.percentage, 1)}%</td></tr>
                    </tbody>
                </table>
                <div></div>
            </div>
        `;
    }

    // 各類型車位均價
    if (avgPriceByType && avgPriceByType.length > 0) {
        html += `
            <div class="section-title">各類型車位平均單價</div>
            <table>
                <thead>
                    <tr>
                        <th>車位類型</th>
                        <th class="text-right">交易筆數</th>
                        <th class="text-right">車位總數</th>
                        <th class="text-right">平均單價(萬)</th>
                        <th class="text-right">中位數(萬)</th>
                        <th class="text-right">3/4位數(萬)</th>
                    </tr>
                </thead>
                <tbody>
                    ${avgPriceByType.map(item => `
                        <tr>
                            <td>${item.type}</td>
                            <td class="text-right">${item.transactionCount.toLocaleString()}</td>
                            <td class="text-right">${item.count.toLocaleString()}</td>
                            <td class="text-right">${ui.formatNumber(item.avgPrice, 0)}</td>
                            <td class="text-right">${ui.formatNumber(item.medianPrice, 0)}</td>
                            <td class="text-right">${ui.formatNumber(item.q3Price, 0)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // 坡道平面分層價格
    if (rampPlanePriceByFloor && rampPlanePriceByFloor.some(f => f.count > 0)) {
        const floorsWithData = rampPlanePriceByFloor.filter(f => f.count > 0);
        html += `
            <div class="section-title">坡道平面車位分層價格</div>
            <table>
                <thead>
                    <tr>
                        <th>樓層</th>
                        <th class="text-right">車位數</th>
                        <th class="text-right">均價(萬)</th>
                        <th class="text-right">中位數(萬)</th>
                        <th class="text-right">最高價(萬)</th>
                        <th class="text-right">最低價(萬)</th>
                    </tr>
                </thead>
                <tbody>
                    ${floorsWithData.map(item => `
                        <tr>
                            <td>${item.floor}</td>
                            <td class="text-right">${item.count.toLocaleString()}</td>
                            <td class="text-right">${ui.formatNumber(item.avgPrice, 0)}</td>
                            <td class="text-right">${ui.formatNumber(item.medianPrice, 0)}</td>
                            <td class="text-right">${ui.formatNumber(item.maxPrice, 0)}</td>
                            <td class="text-right">${ui.formatNumber(item.minPrice, 0)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    page.innerHTML = html;
    return page;
}

/**
 * 房型去化分析頁
 */
function createVelocityPage() {
    const page = document.createElement('div');
    page.className = 'pdf-page';

    const data = state.analysisDataCache;
    if (!data?.salesVelocityAnalysis) {
        page.innerHTML = '<div class="page-title">5. 房型去化分析</div><p>無資料</p>';
        return page;
    }

    const { allRoomTypes, monthly } = data.salesVelocityAnalysis;

    let html = `<div class="page-title">5. 房型去化分析</div>`;

    // 房型統計
    if (allRoomTypes && allRoomTypes.length > 0) {
        html += `
            <div class="section-title">房型分佈</div>
            <table>
                <thead><tr><th>房型</th><th class="text-right">筆數</th></tr></thead>
                <tbody>
        `;

        // 計算各房型總數
        const roomCounts = {};
        if (monthly) {
            Object.values(monthly).forEach(periodData => {
                allRoomTypes.forEach(roomType => {
                    if (periodData[roomType]) {
                        roomCounts[roomType] = (roomCounts[roomType] || 0) + periodData[roomType].count;
                    }
                });
            });
        }

        allRoomTypes.forEach(roomType => {
            html += `<tr><td>${roomType}</td><td class="text-right">${roomCounts[roomType] || 0}</td></tr>`;
        });

        html += '</tbody></table>';
    }

    page.innerHTML = html;
    return page;
}

/**
 * 垂直水平分析頁（銷控表簡易版）
 */
function createPriceGridPage() {
    const page = document.createElement('div');
    page.className = 'pdf-page';

    const data = state.analysisDataCache;
    if (!data?.priceGridAnalysis?.projectNames || data.priceGridAnalysis.projectNames.length === 0) {
        page.innerHTML = '<div class="page-title">6. 垂直水平分析</div><p>無資料</p>';
        return page;
    }

    const { projectNames, allProjects } = data.priceGridAnalysis;

    let html = `
        <div class="page-title">6. 垂直水平分析</div>
        <div class="section-title">建案列表（共 ${projectNames.length} 個）</div>
        <table>
            <thead><tr><th>建案名稱</th></tr></thead>
            <tbody>
                ${projectNames.slice(0, 20).map(name => `<tr><td>${name}</td></tr>`).join('')}
                ${projectNames.length > 20 ? `<tr><td>...及其他 ${projectNames.length - 20} 個建案</td></tr>` : ''}
            </tbody>
        </table>
    `;

    // 如果有整體統計
    if (allProjects?.summary) {
        const s = allProjects.summary;
        html += `
            <div class="section-title">整體統計</div>
            <table>
                <tr><td>交易筆數</td><td class="text-right">${s.transactionCount || 0} 筆</td></tr>
            </table>
        `;
    }

    page.innerHTML = html;
    return page;
}

/**
 * 顯示匯出按鈕
 */
export function showExportButton() {
    if (dom.exportPdfBtn) {
        dom.exportPdfBtn.classList.remove('hidden');
    }
}

/**
 * 隱藏匯出按鈕
 */
export function hideExportButton() {
    if (dom.exportPdfBtn) {
        dom.exportPdfBtn.classList.add('hidden');
    }
}
