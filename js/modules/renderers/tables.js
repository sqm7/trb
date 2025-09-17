// js/modules/renderers/tables.js

import { dom } from '../dom.js';
import * as ui from '../ui.js';
import { state } from '../state.js';

export function renderHeatmapDetailsTable() {
    const { details, roomType, areaRange } = state.lastHeatmapDetails || {};
    const metricType = state.currentHeatmapDetailMetric;
    const contentContainer = dom.heatmapDetailsContent;

    if (!details || details.length === 0) {
        contentContainer.innerHTML = `<p class="text-gray-500 text-center">在 ${roomType || ''} / ${areaRange || ''} 坪的範圍內沒有找到詳細交易資料。</p>`;
        dom.heatmapDetailsControls.classList.add('hidden');
        return;
    }
    
    dom.heatmapDetailsControls.classList.remove('hidden');

    const unitPriceMetricLabel = {
        median: '中位數(萬)',
        weighted: '加權平均(萬)',
        arithmetic: '算術平均(萬)'
    }[metricType];
    
    const totalPriceMetricLabel = metricType === 'median' ? '中位數(萬)' : '算術平均(萬)';

    let tableHtml = `
        <h4 class="text-md font-semibold text-cyan-400 mb-2">詳細數據</h4>
        <p class="text-sm text-gray-400 mb-4">房型: <span class="font-bold">${roomType}</span> | 面積區間: <span class="font-bold">${areaRange} 坪</span></p>
        <div class="overflow-y-auto" style="max-height: 550px;">
            <table class="min-w-full text-sm">
                <thead class="bg-gray-800">
                    <tr>
                        <th class="p-2 align-bottom" rowspan="2">建案名稱 (戶數)</th>
                        <th class="p-2 text-center" colspan="2">總價(萬)</th>
                        <th class="p-2 text-center" colspan="2">房屋單價(萬)</th>
                    </tr>
                    <tr>
                        <th class="p-2 text-center font-normal">區間(萬)</th>
                        <th class="p-2 text-center font-normal">${totalPriceMetricLabel}</th>
                        <th class="p-2 text-center font-normal">區間(萬)</th>
                        <th class="p-2 text-center font-normal">${unitPriceMetricLabel}</th>
                    </tr>
                </thead>
                <tbody>
    `;

    details.forEach(item => {
        const totalPriceToShow = metricType === 'median' ? item.metrics.median.totalPrice : item.metrics.arithmetic.totalPrice;
        const unitPriceToShow = item.metrics[metricType].unitPrice;

        tableHtml += `
            <tr class="border-b border-gray-700 hover:bg-dark-card">
                <td class="p-2">${item.projectName} (${item.count}戶)</td>
                <td class="p-2 text-center">${ui.formatNumber(item.priceRange.min, 0)} - ${ui.formatNumber(item.priceRange.max, 0)}</td>
                <td class="p-2 text-center font-bold">${ui.formatNumber(totalPriceToShow, 0)}</td>
                <td class="p-2 text-center">${ui.formatNumber(item.unitPriceRange.min, 2)} - ${ui.formatNumber(item.unitPriceRange.max, 2)}</td>
                <td class="p-2 text-center font-bold">${ui.formatNumber(unitPriceToShow, 2)}</td>
            </tr>
        `;
    });

    tableHtml += `
                </tbody>
            </table>
        </div>
    `;
    
    contentContainer.innerHTML = tableHtml;
}

// =================================================================
// 【【【 本次最終修正的函式 】】】
// =================================================================
export function renderTable(data) {
    if (!data || data.length === 0) {
        dom.resultsTable.innerHTML = '<tbody><tr><td colspan="99" class="text-center p-4">無資料</td></tr></tbody>';
        return;
    }

    const isPresale = data[0]['交易類型'] === '預售交易';
    const originalHeaders = Object.keys(data[0]);

    // 【第1步】建立一個基礎的、要顯示的欄位列表。這個變數在整個函式中都可存取。
    let headersToShow = originalHeaders.filter(header => 
        !['編號', '縣市代碼', '交易類型', '戶別', '戶型'].includes(header)
    );

    // 【第2步】如果是預售屋，才修改這個列表，將 '戶型' 插入到正確的位置
    if (isPresale) {
        const insertAfter = '交易筆棟數';
        const insertIndex = headersToShow.indexOf(insertAfter);
        if (insertIndex > -1) {
            headersToShow.splice(insertIndex + 1, 0, '戶型');
        } else {
            headersToShow.push('戶型'); // 備用方案
        }
    }

    // --- 建立表頭 (<thead>) ---
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    let headerHtml = '<th>操作</th>';
    
    headersToShow.forEach(header => {
        headerHtml += `<th>${header}</th>`;
    });
    
    headerRow.innerHTML = headerHtml;
    thead.appendChild(headerRow);

    // --- 建立表格內容 (<tbody>) ---
    const tbody = document.createElement('tbody');
    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-dark-card transition-colors';
        const remark = row['備註'] || '';
        if (remark.includes('露台') || remark.includes('親友') || remark.includes('員工')) {
            tr.classList.add('special-remark-row');
        }

        const actionTd = document.createElement('td');
        const detailsBtn = document.createElement('button');
        detailsBtn.className = 'details-btn bg-purple-600 hover:bg-purple-500 text-white text-xs px-3 py-1 rounded-md';
        detailsBtn.textContent = '附表';
        detailsBtn.dataset.id = row['編號'];
        detailsBtn.dataset.type = row['交易類型'];
        detailsBtn.dataset.county = row['縣市代碼'];
        actionTd.appendChild(detailsBtn);
        tr.appendChild(actionTd);

        // 【第3步】根據最終排好序的 'headersToShow' 列表來產生每一格的內容
        headersToShow.forEach(header => {
            const td = document.createElement('td');
            if (header === '戶型') { // 如果輪到 '戶型'，就產生帶 tooltip 的儲存格
                td.className = 'has-tooltip';
                td.dataset.tooltip = `原始戶別: ${row['戶別'] || '無資料'}`;
                td.textContent = row['戶型'] || '-';
            } else { // 否則，就產生一般的儲存格
                const value = row[header];
                if (header === '地址' || header === '備註') {
                    td.innerHTML = `<div class="scrollable-cell">${value ?? "-"}</div>`;
                } else {
                    td.textContent = (typeof value === 'number' && !Number.isInteger(value)) ? ui.formatNumber(value) : (value ?? "-");
                }
            }
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
    });

    // 最後，將新產生的表頭和內容一次性更新到 DOM
    dom.resultsTable.innerHTML = '';
    dom.resultsTable.append(thead, tbody);
}


export function renderSubTable(title, records) {
    if (!records || !Array.isArray(records) || records.length === 0) {
        return `<div class="mb-4"><h3 class="text-lg font-semibold text-cyan-400 mb-2">${title}</h3><p class="text-sm text-gray-500">無資料</p></div>`;
    }
    const headers = Object.keys(records[0]).filter(h => 
        h !== 'id' && 
        h !== '編號' && 
        h !== '土地持分面積' && 
        h !== '車位價格' && 
        h !== '車位面積'
    );
    let html = `<div><h3 class="text-lg font-semibold text-cyan-400 mb-2">${title}</h3><div class="overflow-x-auto"><table class="w-full text-sm text-left"><thead><tr class="border-b border-gray-600">`;
    headers.forEach(header => { html += `<th class="py-2 pr-2 font-medium text-gray-400">${header}</th>` });
    html += '</tr></thead><tbody>';
    records.forEach(record => {
        html += '<tr class="border-b border-gray-700 last:border-b-0">';
        headers.forEach(header => { html += `<td class="py-2 pr-2">${record[header] ?? "-"}</td>` });
        html += '</tr>'
    });
    html += '</tbody></table></div></div>';
    return html;
}

// ▼▼▼ 【最終修正版】 ▼▼▼
export function renderVelocityTable() {
    if (!state.analysisDataCache || !state.analysisDataCache.salesVelocityAnalysis) return;

    // 輔助函式：將週標籤轉換為日期區間
    const getWeekDates = (weekLabel) => {
        const [year, week] = weekLabel.split('-W').map(Number);
        const date = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
        const day = date.getUTCDay() || 7;
        if (day !== 1) {
            date.setUTCDate(date.getUTCDate() - (day - 1));
        }
        const startDate = new Date(date);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);

        const formatDate = (d) => d.toISOString().split('T')[0];
        return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
    };

    const dataForView = state.analysisDataCache.salesVelocityAnalysis[state.currentVelocityView] || {};
    const timeKeys = Object.keys(dataForView).sort().reverse();
    let headerHtml = '<thead><tr class="velocity-header-group"><th rowspan="2" class="sticky left-0 bg-dark-card z-10">時間</th>';
    state.selectedVelocityRooms.forEach(roomType => { headerHtml += `<th colspan="3" class="text-center">${roomType}</th>`; });
    headerHtml += `<th colspan="3" class="text-center total-col">總計</th></tr><tr class="velocity-header-sub">`;
    const subHeaders = ['資料筆數', '產權總價(萬)', '房屋坪數(坪)'];
    state.selectedVelocityRooms.forEach(() => { subHeaders.forEach(sub => headerHtml += `<th>${sub}</th>`); });
    subHeaders.forEach(sub => headerHtml += `<th class="total-col">${sub}</th>`);
    headerHtml += '</tr></thead>';
    let bodyHtml = '<tbody>';
    timeKeys.forEach(timeKey => {
        const periodData = dataForView[timeKey];
        let rowTotal = { count: 0, priceSum: 0, areaSum: 0 };
        
        // --- 核心修正點 ---
        // 將 tooltip 屬性與 class 放在同一個 <span> 元素上
        let timeCellHtml;
        const isWeeklyView = state.currentVelocityView === 'weekly';
        if (isWeeklyView) {
            timeCellHtml = `<span class="has-tooltip" data-tooltip="${getWeekDates(timeKey)}">${timeKey}</span>`;
        } else {
            timeCellHtml = timeKey;
        }

        let rowHtml = `<tr class="hover:bg-dark-card"><td class="sticky left-0 bg-dark-card hover:bg-gray-800 z-10 font-mono">${timeCellHtml}</td>`;
        // --- 修正結束 ---
        
        state.selectedVelocityRooms.forEach(roomType => {
            const stats = periodData[roomType];
            if (stats) {
                   rowHtml += `<td>${stats.count.toLocaleString()}</td><td>${ui.formatNumber(stats.priceSum, 0)}</td><td>${ui.formatNumber(stats.areaSum, 2)}</td>`;
                rowTotal.count += stats.count;
                rowTotal.priceSum += stats.priceSum;
                rowTotal.areaSum += stats.areaSum;
            } else {
                 rowHtml += `<td>-</td><td>-</td><td>-</td>`;
            }
        });
        rowHtml += `<td class="font-semibold total-col">${rowTotal.count.toLocaleString()}</td><td class="font-semibold total-col">${ui.formatNumber(rowTotal.priceSum, 0)}</td><td class="font-semibold total-col">${ui.formatNumber(rowTotal.areaSum, 2)}</td></tr>`;
        bodyHtml += rowHtml;
    });
    bodyHtml += '</tbody>';
    dom.velocityTableContainer.innerHTML = timeKeys.length > 0 ? `<table class="min-w-full velocity-table">${headerHtml}${bodyHtml}</table>` : '<p class="text-gray-500 p-4 text-center">在此條件下無資料。</p>';
}
