// js/modules/eventHandlers.js

import { state, getFilters } from './state.js';
import { dom } from './dom.js';
import * as api from './api.js';
import * as ui from './ui.js';
import { districtData, countyCodeMap } from './config.js';
import { aggregateAnalysisData } from './aggregator.js'; // Import aggregator

// 引入所有渲染模組
import * as reportRenderer from './renderers/reports.js';
import * as tableRenderer from './renderers/tables.js';
import * as chartRenderer from './renderers/charts.js';
import * as heatmapRenderer from './renderers/heatmap.js';
import * as componentRenderer from './renderers/uiComponents.js';

/**
 * 處理資料列表中「明細」按鈕的點擊事件
 * @param {HTMLElement} btn - 被點擊的按鈕元素
 */
function handleDataDetailsToggle(btn) {
    const summaryRow = btn.closest('.summary-row');
    if (!summaryRow) return;

    const detailsRowSelector = summaryRow.dataset.detailsTarget;
    const detailsRow = document.querySelector(detailsRowSelector);
    if (!detailsRow) return;

    const isVisible = detailsRow.style.display === 'table-row';
    detailsRow.style.display = isVisible ? 'none' : 'table-row';
    btn.textContent = isVisible ? '明細' : '收合';
}


// Main data fetching and analysis functions
export async function mainFetchData() {
    ui.showLoading('查詢中，請稍候...');
    try {
        // [Multi-City Support for Data List]
        // 目前資料列表 API 若僅支援單一縣市，我們暫時取第一個選取的縣市
        // 若完全未選，則無法查詢
        const filters = getFilters();
        if (state.selectedCounties.length > 0) {
            filters.countyCode = countyCodeMap[state.selectedCounties[0]];
        }

        const pagination = { page: state.currentPage, limit: state.pageSize };
        const result = await api.fetchData(filters, pagination);

        state.totalRecords = result.count || 0;
        if (!result.data || result.data.length === 0) {
            ui.showMessage('找不到符合條件的資料。');
            componentRenderer.renderPagination();
            return;
        }
        tableRenderer.renderTable(result.data);
        componentRenderer.renderPagination();
        dom.messageArea.classList.add('hidden');
        dom.tabsContainer.classList.remove('hidden');
        ui.switchTab('data-list');
    } catch (error) {
        console.error('查詢錯誤:', error);
        ui.showMessage(`查詢錯誤: ${error.message}`, true);
        state.totalRecords = 0;
        componentRenderer.renderPagination();
    }
}

export async function mainAnalyzeData() {
    if (state.selectedCounties.length === 0) return ui.showMessage('請至少選擇一個縣市再進行分析。');

    ui.showLoading('準備分析中...');
    dom.messageArea.classList.add('hidden');

    try {
        let aggregatedData = null;
        const totalCounties = state.selectedCounties.length;

        // --- Sequential Loading Loop ---
        for (let i = 0; i < totalCounties; i++) {
            const countyName = state.selectedCounties[i];
            const countyCode = countyCodeMap[countyName];

            // 更新 UI 顯示進度
            ui.showLoading(`正在載入 ${countyName} 資料 (${i + 1}/${totalCounties})...`);

            // 建構該縣市的專屬 Filter
            const currentFilter = getFilters();
            currentFilter.countyCode = countyCode;

            // 處理行政區篩選：只保留屬於當前縣市的行政區
            // 如果使用者選了 [台北市-大安, 新北市-板橋]，查台北市時應該只送大安，查新北時只送板橋
            if (state.selectedDistricts.length > 0) {
                const validDistricts = districtData[countyName] || [];
                const targetDistricts = state.selectedDistricts.filter(d => validDistricts.includes(d));

                // 如果該縣市有選行政區，就用選的；如果沒選 (代表使用者只想篩別的縣市的區，或者想看該縣市全區？)
                // 邏輯判斷：如果 user 在任何縣市都沒選區 -> 全區
                // 如果 user 在 A 縣市選了區，但 B 縣市沒選 -> B 縣市應該是全區還是不查？通常是全區。
                if (targetDistricts.length > 0) {
                    currentFilter.districts = targetDistricts;
                } else {
                    // 檢查使用者是否在其他縣市有選區？如果有，那這個縣市是否應該全選？
                    // 簡單邏輯：只要該縣市沒被選區，就查該縣市全區
                    // 所以這裡不需要特別處理，只要不傳 districts 參數就是全區
                    delete currentFilter.districts;
                }
            }

            const cityResult = await api.analyzeData(currentFilter);

            // 聚合數據
            aggregatedData = aggregateAnalysisData(aggregatedData, cityResult);
        }

        state.analysisDataCache = aggregatedData;

        if (!state.analysisDataCache || !state.analysisDataCache.coreMetrics || state.analysisDataCache.projectRanking.length === 0) {
            const msg = state.analysisDataCache?.message || '找不到符合條件的分析資料。';
            ui.showMessage(msg);
            return;
        }

        dom.tabsContainer.classList.remove('hidden');
        document.querySelectorAll('.report-header').forEach(el => { el.style.display = 'block'; });

        // --- [前端資料補全] ---
        // 針對所有選取的縣市，獲取建案 Metadata 並補全 District
        // 為了效能，我們可以並行請求所有縣市的 Suggestions (Metadata)
        try {
            const metaPromises = state.selectedCounties.map(cName => {
                const cCode = countyCodeMap[cName];
                // 這裡只取該縣市的所有建案 (query='%')
                return api.fetchProjectNameSuggestions(cCode, '%', []).then(list => ({ county: cName, list }));
            });

            const results = await Promise.all(metaPromises);
            const projectMetaMap = {}; // 改名為 projectMetaMap，儲存 { district, county }

            const normalizeName = (name) => {
                if (!name) return '';
                // Normalize Unicode, convert to uppercase, remove all whitespace and punctuation
                return String(name)
                    .normalize('NFKC')
                    .toUpperCase()
                    .replace(/[\s\.\-\·\．\、\,\，\!\！\?\？\(\)\（\）\[\]\【\】\:\：\;\；\'\"\'\"\"]/g, '');
            };

            results.forEach(({ county, list }) => {
                if (Array.isArray(list)) {
                    list.forEach(item => {
                        if (typeof item === 'object' && item.name) {
                            const normalizedKey = normalizeName(item.name);
                            // 儲存縣市與行政區
                            projectMetaMap[normalizedKey] = {
                                district: item.district || '',
                                county: county
                            };
                        }
                    });
                }
            });

            // 合併回 projectRanking
            state.analysisDataCache.projectRanking.forEach(proj => {
                const lookupKey = normalizeName(proj.projectName);
                if (projectMetaMap[lookupKey]) {
                    proj.district = projectMetaMap[lookupKey].district;
                    proj.county = projectMetaMap[lookupKey].county;
                }
            });

        } catch (err) {
            console.warn('行政區/縣市資料補全失敗:', err);
        }
        // --- [前端資料補全結束] ---

        state.currentSort = { key: 'saleAmountSum', order: 'desc' };
        state.rankingCurrentPage = 1;

        // 渲染報告
        reportRenderer.renderRankingReport();
        reportRenderer.renderPriceBandReport();
        chartRenderer.renderPriceBandChart();
        reportRenderer.renderUnitPriceReport();
        reportRenderer.renderParkingAnalysisReport();
        reportRenderer.renderSalesVelocityReport();
        reportRenderer.renderPriceGridAnalysis();

        ui.switchTab('ranking-report');
        dom.exportPdfBtn.classList.remove('hidden');
        dom.messageArea.classList.add('hidden');

    } catch (error) {
        console.error("數據分析失敗:", error);
        ui.showMessage(`數據分析失敗: ${error.message}`, true);
        state.analysisDataCache = null;
        dom.exportPdfBtn.classList.add('hidden');
    }
}

/**
 * 處理「排除商辦店面」開關的變更事件
 */
export function handleExcludeCommercialToggle() {
    state.excludeCommercialInRanking = dom.excludeCommercialToggle.checked;
    if (state.analysisDataCache) {
        mainAnalyzeData();
    }
}

export async function mainShowSubTableDetails(btn) {
    const { id, type, county } = btn.dataset;
    dom.modalTitle.textContent = `附表詳細資料 (編號: ${id})`;
    dom.modalContent.innerHTML = '<div class="loader mx-auto"></div>';
    dom.modal.classList.remove('hidden');
    try {
        const result = await api.fetchSubData(id, type, county);
        let contentHTML = '<div class="space-y-6">';
        if (type !== '預售交易' && result.build) contentHTML += tableRenderer.renderSubTable('建物資料', result.build);
        if (result.land) contentHTML += tableRenderer.renderSubTable('土地資料', result.land);
        if (result.park) contentHTML += tableRenderer.renderSubTable('車位資料', result.park);
        contentHTML = (contentHTML === '<div class="space-y-6">') ? '<p>此筆紀錄沒有對應的附表資料。</p>' : contentHTML + '</div>';
        dom.modalContent.innerHTML = contentHTML;
    } catch (error) {
        dom.modalContent.innerHTML = `<p class="text-red-400 font-semibold">查詢失敗:</p><p class="mt-2 text-sm text-gray-400">${error.message}</p>`;
    }
}

// 將此函式設為 async 以便在內部使用 await
export async function onResultsTableClick(e) {
    const detailsBtn = e.target.closest('.details-btn');
    if (detailsBtn) {
        mainShowSubTableDetails(detailsBtn);
        return;
    }
    const toggleBtn = e.target.closest('.details-toggle-btn');
    if (toggleBtn) {
        handleDataDetailsToggle(toggleBtn);
        return;
    }
}


export async function mainFetchProjectNameSuggestions(query) {
    // 聚合所有選取縣市的建議
    // 這裡如果選了多個縣市，同時發送多個請求可能會略慢，但為了完整性需要

    if (state.selectedCounties.length === 0) {
        dom.projectNameSuggestions.classList.add('hidden');
        dom.filterCard.classList.remove('z-elevate-filters');
        return;
    }

    try {
        dom.filterCard.classList.add('z-elevate-filters');
        const processedQuery = query.trim().split(/\s+/).join('%');

        // 限制：如果選太多縣市，打字建議可能會很卡。
        // 優化：只取前 3 個選取縣市的建議，或者所有
        const promises = state.selectedCounties.map(cName => {
            const cCode = countyCodeMap[cName];
            // 同樣要做行政區篩選
            let districtFilter = [];
            if (state.selectedDistricts.length > 0) {
                const valid = districtData[cName] || [];
                districtFilter = state.selectedDistricts.filter(d => valid.includes(d));
            }
            return api.fetchProjectNameSuggestions(cCode, processedQuery, districtFilter);
        });

        const results = await Promise.all(promises);

        // 合併與去重, 並注入縣市資訊
        let allNames = [];
        const seenNames = new Set();

        results.forEach((list, index) => {
            const countyName = state.selectedCounties[index]; // 對應的縣市名稱
            if (Array.isArray(list)) {
                list.forEach(item => {
                    // item 可以是 string 或 object
                    const name = typeof item === 'string' ? item : item.name;
                    if (!seenNames.has(name)) {
                        seenNames.add(name);
                        // 注入縣市資訊
                        const enrichedItem = typeof item === 'string'
                            ? { name: item, county: countyName }
                            : { ...item, county: countyName };
                        allNames.push(enrichedItem);
                    }
                });
            }
        });

        componentRenderer.renderSuggestions(allNames);
    } catch (error) {
        console.error("獲取建案建議失敗:", error);
        dom.projectNameSuggestions.innerHTML = `<div class="p-2 text-red-400">讀取建議失敗。</div>`;
        dom.projectNameSuggestions.classList.remove('hidden');
    }
}

export function handleDateRangeChange() {
    const value = dom.dateRangeSelect.value;
    if (value === 'custom') return;
    const endDate = new Date();
    let startDate = new Date();
    switch (value) {
        case '1q': startDate.setMonth(endDate.getMonth() - 3); break;
        case '2q': startDate.setMonth(endDate.getMonth() - 6); break;
        case '3q': startDate.setMonth(endDate.getMonth() - 9); break;
        case '1y': startDate.setFullYear(endDate.getFullYear() - 1); break;
        case 'this_year': startDate = new Date(endDate.getFullYear(), 0, 1); break;
        case 'last_2_years': startDate = new Date(endDate.getFullYear() - 1, 0, 1); break;
        case 'last_3_years': startDate = new Date(endDate.getFullYear() - 2, 0, 1); break;
    }
    dom.dateStartInput.value = ui.formatDate(startDate);
    dom.dateEndInput.value = ui.formatDate(endDate);
}

// --- County Selection Handlers ---

export function onCountyContainerClick(e) {
    if (e.target.classList.contains('multi-tag-remove')) {
        e.stopPropagation();
        removeCounty(e.target.dataset.name);
        return;
    }
    // Toggle suggestions
    const isHidden = dom.countySuggestions.classList.toggle('hidden');

    // Elevate filter card z-index when suggestion is open
    dom.filterCard.classList.toggle('z-elevate-filters', !isHidden);

    // 如果打開，渲染選項
    if (!isHidden) {
        renderCountyOptions();
    }
}

function renderCountyOptions() {
    // 渲染所有可用縣市，標記已選
    const allCounties = Object.keys(countyCodeMap); // 假設 config 裡的 Key 就是縣市名
    // 或者從 config.js 導出 countyList 因為 map 可能有別的用途
    // 這裡我們直接用 districtData 的 keys 因為通常 districtData 有所有縣市
    const availableCounties = Object.keys(districtData);

    // 如果 config.js 裡的 districtData 只有部分，那就要用 countyCodeMap 的 keys
    // 但 countyCodeMap key 也是縣市名

    const html = availableCounties.map(name => {
        const isSelected = state.selectedCounties.includes(name);
        const isDisabled = !isSelected && state.selectedCounties.length >= 6;

        return `
            <label class="suggestion-item flex items-center p-2 hover:bg-gray-700 cursor-pointer ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}" data-name="${name}">
                <input type="checkbox" class="mr-2" ${isSelected ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}>
                <span class="flex-grow text-gray-200">${name}</span>
            </label>
        `;
    }).join('');

    dom.countySuggestions.innerHTML = html;
}

export function onCountySuggestionClick(e) {
    const target = e.target.closest('.suggestion-item');
    if (!target) return;

    const checkbox = target.querySelector('input');
    if (checkbox.disabled) return;

    const name = target.dataset.name;
    const isChecked = checkbox.checked; // 這是點擊後的狀態？
    // 注意：如果是點 label，browser 會自動 toggle checkbox，但我們可能要在這裡攔截
    // 為了簡單，我們延遲一下讀取狀態

    setTimeout(() => {
        const currentlyChecked = checkbox.checked;
        if (currentlyChecked) {
            if (!state.selectedCounties.includes(name)) {
                if (state.selectedCounties.length >= 6) {
                    checkbox.checked = false; // Revert
                    ui.showMessage("最多只能選擇 6 個縣市", true);
                    return;
                }
                state.selectedCounties.push(name);
            }
        } else {
            state.selectedCounties = state.selectedCounties.filter(c => c !== name);
        }

        componentRenderer.renderCountyTags();
        updateDistrictOptions(); // Update districts based on new county selection

        // 重新渲染選項以更新 disabled 狀態 (如果滿了)
        renderCountyOptions();
    }, 0);
}

export function removeCounty(name) {
    state.selectedCounties = state.selectedCounties.filter(c => c !== name);
    componentRenderer.renderCountyTags();
    updateDistrictOptions();
}

export function clearSelectedCounties() {
    state.selectedCounties = [];
    componentRenderer.renderCountyTags();
    updateDistrictOptions();
    renderCountyOptions(); // Re-render options to clear checks
}

// ---------------------------------

export function updateDistrictOptions() {
    // 聚合所有已選縣市的行政區
    clearSelectedDistricts();
    dom.districtSuggestions.innerHTML = '';

    if (state.selectedCounties.length === 0) {
        dom.districtContainer.classList.add('disabled');
        dom.districtInputArea.textContent = "請先選縣市";
        dom.projectNameInput.disabled = true;
        dom.projectNameInput.placeholder = "請先選縣市...";
        toggleAnalyzeButtonState();
        return;
    }

    dom.districtContainer.classList.remove('disabled');
    dom.districtInputArea.textContent = "點擊選擇行政區";
    dom.projectNameInput.disabled = false;
    dom.projectNameInput.placeholder = "輸入建案名稱搜尋...";

    let allDistricts = [];
    state.selectedCounties.forEach(countyName => {
        const districts = districtData[countyName] || [];
        // 為了區分不同縣市的同名行政區 (如：中區)，我們顯示時加上縣市名前綴?
        // 但目前 UITag 只有名字。如果多個縣市有同名區，怎麼辦？
        // 原有邏輯是直接用名稱。若不同縣市有同名區，目前的架構可能無法區分。
        // 但使用者在選的時候通常知道上下文。
        // 我們可以在列表中分組顯示。

        allDistricts.push({ county: countyName, districts });
    });

    // Render grouped suggestions
    let html = `<label class="suggestion-item font-bold text-cyan-400" data-name="all"><input type="checkbox" id="district-select-all"><span class="flex-grow">全選/全不選</span></label><hr class="border-gray-600 mx-2">`;

    allDistricts.forEach(group => {
        html += `<div class="px-2 py-1 text-xs text-gray-500 font-bold bg-gray-800">${group.county}</div>`;
        group.districts.forEach(dName => {
            const isChecked = state.selectedDistricts.includes(dName);
            html += `<label class="suggestion-item" data-name="${dName}"><input type="checkbox" ${isChecked ? 'checked' : ''}><span class="flex-grow">${dName}</span></label>`;
        });
    });

    dom.districtSuggestions.innerHTML = html;

    toggleAnalyzeButtonState();
    clearSelectedProjects();
}

export function clearSelectedDistricts() {
    state.selectedDistricts = [];
    componentRenderer.renderDistrictTags();
    dom.districtSuggestions.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
}

export function onDistrictContainerClick(e) {
    if (e.target.classList.contains('multi-tag-remove')) {
        e.stopPropagation();
        removeDistrict(e.target.dataset.name);
        return;
    }
    if (dom.districtContainer.classList.contains('disabled')) return;
    const isHidden = dom.districtSuggestions.classList.toggle('hidden');
    dom.filterCard.classList.toggle('z-elevate-filters', !isHidden);
}


export function onDistrictSuggestionClick(e) {
    const target = e.target.closest('.suggestion-item'); if (!target) return;
    const name = target.dataset.name;
    const checkbox = target.querySelector('input[type="checkbox"]'); if (!name || !checkbox) return;

    // 如果是縣市分組標題，忽略
    if (!checkbox) return;

    const selectAllCheckbox = document.getElementById('district-select-all');
    setTimeout(() => {
        const isChecked = checkbox.checked;
        if (name === 'all') {
            // 全選邏輯：把所有縣市的所有區都選上
            let allD = [];
            state.selectedCounties.forEach(c => {
                if (districtData[c]) allD = [...allD, ...districtData[c]];
            });

            state.selectedDistricts = isChecked ? [...allD] : [];
            dom.districtSuggestions.querySelectorAll('label:not([data-name="all"]) input[type="checkbox"]').forEach(cb => { cb.checked = isChecked; });
        } else {
            if (isChecked) {
                if (!state.selectedDistricts.includes(name)) state.selectedDistricts.push(name);
            } else {
                state.selectedDistricts = state.selectedDistricts.filter(d => d !== name);
            }
        }

        // Update Select All state check
        // ... (省略複雜的全選檢查邏輯，或是簡單設為 false)
        if (selectAllCheckbox) selectAllCheckbox.checked = false;

        componentRenderer.renderDistrictTags();
    }, 0);
}

export function removeDistrict(name) {
    state.selectedDistricts = state.selectedDistricts.filter(d => d !== name);
    componentRenderer.renderDistrictTags();
    // Uncheck in dropdown if visible
    const checkbox = dom.districtSuggestions.querySelector(`label[data-name="${name}"] input`);
    if (checkbox) checkbox.checked = false;
}

export function onProjectInputFocus() {
    if (!dom.projectNameInput.value.trim() && state.selectedCounties.length > 0) {
        mainFetchProjectNameSuggestions('');
    }
}

export function onProjectInput() {
    clearTimeout(state.suggestionDebounceTimer);
    state.suggestionDebounceTimer = setTimeout(() => {
        mainFetchProjectNameSuggestions(dom.projectNameInput.value);
    }, 300);
}

export function onSuggestionClick(e) {
    const target = e.target.closest('.suggestion-item'); if (!target) return;
    const name = target.dataset.name;
    const checkbox = target.querySelector('input[type="checkbox"]'); if (!name || !checkbox) return;
    setTimeout(() => {
        if (checkbox.checked) {
            if (!state.selectedProjects.includes(name)) { state.selectedProjects.push(name); }
        } else {
            state.selectedProjects = state.selectedProjects.filter(p => p !== name);
        }
        componentRenderer.renderProjectTags();
    }, 0);
}

export function removeProject(name) {
    state.selectedProjects = state.selectedProjects.filter(p => p !== name);
    componentRenderer.renderProjectTags();
    const openSuggestionCheckbox = dom.projectNameSuggestions.querySelector(`label[data-name="${name}"] input`);
    if (openSuggestionCheckbox) openSuggestionCheckbox.checked = false;
}

export function clearSelectedProjects() {
    state.selectedProjects = [];
    componentRenderer.renderProjectTags();
    const suggestionCheckboxes = dom.projectNameSuggestions.querySelectorAll('input[type="checkbox"]');
    suggestionCheckboxes.forEach(cb => cb.checked = false);
}

export function toggleAnalyzeButtonState() {
    const isCountySelected = state.selectedCounties.length > 0;
    const isValidType = dom.typeSelect.value === '預售交易';
    dom.analyzeBtn.disabled = !(isCountySelected && isValidType);
    dom.analyzeHeatmapBtn.disabled = !(isCountySelected && isValidType);
}

export function switchAverageType(type) {
    if (state.currentAverageType === type || !type) return;
    state.currentAverageType = type;
    dom.avgTypeToggle.querySelector('.avg-type-btn.active').classList.remove('active');
    dom.avgTypeToggle.querySelector(`.avg-type-btn[data-type="${type}"]`).classList.add('active');
    if (state.analysisDataCache) { reportRenderer.renderUnitPriceReport(); }
}

export function handlePriceBandRoomFilterClick(e) {
    const button = e.target.closest('.capsule-btn');
    if (!button) return;

    // Check if it's a project list button
    if (button.classList.contains('project-list-btn')) {
        handleProjectListBtnClick(button);
        return;
    }

    const roomType = button.dataset.roomType;
    if (!roomType) return;

    button.classList.toggle('active');

    if (button.classList.contains('active')) {
        if (!state.selectedPriceBandRoomTypes.includes(roomType)) {
            state.selectedPriceBandRoomTypes.push(roomType);
        }
    } else {
        state.selectedPriceBandRoomTypes = state.selectedPriceBandRoomTypes.filter(r => r !== roomType);
    }

    reportRenderer.renderPriceBandReport();
}

/**
 * 處理總價帶分析表格中的「建案組成」按鈕點擊事件
 * @param {HTMLElement} button - 被點擊的按鈕元素
 */
function handleProjectListBtnClick(button) {
    const projectsData = button.dataset.projects;
    if (!projectsData) return;

    const projects = projectsData.split('|||');
    const projectListHtml = projects.map(name => `<li class="py-1 border-b border-gray-700 last:border-b-0">${name}</li>`).join('');

    dom.modalTitle.textContent = `建案組成 (${projects.length} 個)`;
    dom.modalContent.innerHTML = `<ul class="text-gray-300 max-h-96 overflow-y-auto">${projectListHtml}</ul>`;
    dom.modal.classList.remove('hidden');
}

export function handleParkingFloorFilterChange(e) {
    const target = e.target;
    if (target.type !== 'checkbox') return;

    const floorCheckboxes = dom.rampPlanePriceByFloorTableContainer.querySelectorAll('.floor-checkbox');
    const selectAllCheckbox = document.getElementById('select-all-floors');

    if (target === selectAllCheckbox) {
        floorCheckboxes.forEach(cb => {
            cb.checked = selectAllCheckbox.checked;
        });
    } else {
        const allChecked = Array.from(floorCheckboxes).every(cb => cb.checked);
        selectAllCheckbox.checked = allChecked;
    }

    reportRenderer.updateRampParkingStats();
}


export function handleVelocityRoomFilterClick(e) {
    const button = e.target.closest('.capsule-btn'); if (!button) return;
    const roomType = button.dataset.roomType;
    button.classList.toggle('active');
    if (button.classList.contains('active')) {
        if (!state.selectedVelocityRooms.includes(roomType)) state.selectedVelocityRooms.push(roomType);
    } else {
        state.selectedVelocityRooms = state.selectedVelocityRooms.filter(r => r !== roomType);
    }
    const { allRoomTypes } = state.analysisDataCache.salesVelocityAnalysis;
    state.selectedVelocityRooms.sort((a, b) => allRoomTypes.indexOf(a) - allRoomTypes.indexOf(b));
    tableRenderer.renderVelocityTable();
    chartRenderer.renderSalesVelocityChart();
    chartRenderer.renderAreaHeatmap();
}

export function handleVelocitySubTabClick(e) {
    const button = e.target.closest('.sub-tab-btn');
    if (!button) return;
    state.currentVelocityView = button.dataset.view;
    dom.velocitySubTabsContainer.querySelector('.active').classList.remove('active');
    button.classList.add('active');
    tableRenderer.renderVelocityTable();
    chartRenderer.renderSalesVelocityChart();
    chartRenderer.renderAreaHeatmap();
}

export function handleVelocityMetricClick(e) {
    const button = e.target.closest('.avg-type-btn');
    if (!button || button.classList.contains('active')) return;

    const metric = button.dataset.metric;
    state.currentVelocityMetric = metric;

    dom.velocityMetricToggle.querySelector('.active').classList.remove('active');
    button.classList.add('active');

    chartRenderer.renderSalesVelocityChart();
}

export function handleHeatmapMetricToggle(e) {
    const button = e.target.closest('.avg-type-btn');
    if (!button || button.classList.contains('active')) return;

    const metricType = button.dataset.type;
    state.currentHeatmapDetailMetric = metricType;

    dom.heatmapMetricToggle.querySelector('.active').classList.remove('active');
    button.classList.add('active');

    if (state.lastHeatmapDetails) {
        tableRenderer.renderHeatmapDetailsTable();
    }
}

export function handleHeatmapDetailsInteraction(e) {
    const target = e.target;
    if (target.id === 'select-all-projects') {
        const isChecked = target.checked;
        dom.heatmapDetailsContent.querySelectorAll('.project-checkbox').forEach(cb => {
            cb.checked = isChecked;
        });
        tableRenderer.updateHeatmapDetailsSummary();
    }

    if (target.classList.contains('project-checkbox')) {
        const allCheckboxes = dom.heatmapDetailsContent.querySelectorAll('.project-checkbox');
        const allChecked = Array.from(allCheckboxes).every(cb => cb.checked);
        document.getElementById('select-all-projects').checked = allChecked;
        tableRenderer.updateHeatmapDetailsSummary();
    }
}

export function handlePriceGridProjectFilterClick(e) {
    const button = e.target.closest('.capsule-btn');
    if (!button) return;

    if (button.classList.contains('active')) {
        return;
    }

    state.selectedPriceGridProject = button.dataset.project;
    syncMainProjectFilter(state.selectedPriceGridProject);

    if (dom.priceGridProjectFilterContainer.querySelector('.active')) {
        dom.priceGridProjectFilterContainer.querySelector('.active').classList.remove('active');
    }
    button.classList.add('active');

    state.isHeatmapActive = false;
    dom.analyzeHeatmapBtn.innerHTML = `<i class="fas fa-fire mr-2"></i>開始分析`;
    dom.backToGridBtn.classList.add('hidden');
    dom.heatmapInfoContainer.classList.add('hidden');
    dom.heatmapSummaryTableContainer.classList.add('hidden');
    dom.heatmapHorizontalComparisonTableContainer.classList.add('hidden');
    heatmapRenderer.displayCurrentPriceGrid();
}

export function syncMainProjectFilter(projectName) {
    if (!projectName) {
        state.selectedProjects = [];
    } else {
        state.selectedProjects = [projectName];
    }
    componentRenderer.renderProjectTags();
    dom.projectNameSuggestions.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        const itemName = cb.closest('.suggestion-item').dataset.name;
        cb.checked = (itemName === projectName);
    });
}

export async function analyzeHeatmap() {
    state.isHeatmapActive = true;
    const btn = dom.analyzeHeatmapBtn;
    btn.disabled = true;
    btn.innerHTML = `<div class="loader-sm"></div><span class="ml-2">分析中...</span>`;
    btn.classList.add('btn-loading');
    try {
        if (!state.analysisDataCache || !state.analysisDataCache.priceGridAnalysis) {
            console.log("No analysis cache found. Fetching new data for heatmap...");
            await mainAnalyzeData();
            if (!state.analysisDataCache) {
                throw new Error("無法獲取基礎分析資料，請先執行標準分析。");
            }
        }

        heatmapRenderer.renderPriceGapHeatmap();

        dom.heatmapInfoContainer.classList.remove('hidden');
        btn.innerHTML = `<i class="fas fa-sync-alt mr-2"></i>重新分析`;
        dom.backToGridBtn.classList.remove('hidden');
    } catch (error) {
        console.error("熱力圖分析失敗:", error);
        ui.showMessage(`熱力圖分析失敗: ${error.message}`, true);
        state.isHeatmapActive = false;
        dom.heatmapInfoContainer.classList.add('hidden');
        dom.heatmapSummaryTableContainer.classList.add('hidden');
        dom.heatmapHorizontalComparisonTableContainer.classList.add('hidden');
        btn.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i>分析失敗`;
    } finally {
        btn.disabled = false;
        btn.classList.remove('btn-loading');
    }
}

export function handleBackToGrid() {
    state.isHeatmapActive = false;
    heatmapRenderer.displayCurrentPriceGrid();
    dom.backToGridBtn.classList.add('hidden');
    dom.heatmapInfoContainer.classList.add('hidden');
    dom.heatmapSummaryTableContainer.classList.add('hidden');
    dom.heatmapHorizontalComparisonTableContainer.classList.add('hidden');
    dom.analyzeHeatmapBtn.innerHTML = `<i class="fas fa-fire mr-2"></i>開始分析`;
}

export function handleSuggestFloorPremium() {
    if (!state.analysisDataCache?.priceGridAnalysis) {
        ui.showMessage('請先執行分析以取得資料。');
        return;
    }

    const projectData = state.analysisDataCache.priceGridAnalysis.byProject[state.selectedPriceGridProject];
    if (!projectData) {
        ui.showMessage('請先選擇建案。');
        return;
    }

    const transactions = [];
    Object.entries(projectData.horizontalGrid).forEach(([floorStr, units]) => {
        const floor = parseInt(floorStr, 10);
        if (isNaN(floor)) return;
        Object.values(units).forEach(txArray => {
            txArray.forEach(tx => {
                transactions.push({
                    floor,
                    unitPrice: tx.unitPrice,
                    isStorefront: tx.isStorefront || false,
                    isOffice: tx.isOffice || false
                });
            });
        });
    });

    const result = reportRenderer.calculateFloorPremiumSuggestion(transactions);

    if (!result) {
        ui.showMessage('資料筆數不足，無法推算建議值。至少需要 5 筆住宅交易。');
        return;
    }

    dom.floorPremiumInput.value = result.suggestedPremium;

    const r2Percent = (result.r2 * 100).toFixed(1);
    alert(`建議樓層價差: ${result.suggestedPremium} 萬/層\n\n統計資訊:\n• 樣本數: ${result.sampleSize} 筆\n• R²: ${r2Percent}% (模型解釋力)\n\n此值已自動填入輸入框。`);
}

export async function handleShareClick(reportType) {
    const btnIdMapping = { 'price_grid': 'sharePriceGridBtn' };
    const btnId = btnIdMapping[reportType];
    const btn = dom[btnId];
    if (!btn) { console.error(`分享按鈕 "${btnId}" 未在 dom 物件中定義。`); return; }
    btn.disabled = true;
    btn.innerHTML = `<div class="loader-sm"></div>`;
    try {
        const filters = getFilters();
        const viewOptions = {};
        if (state.isHeatmapActive) {
            const floorPremium = parseFloat(dom.floorPremiumInput.value);
            if (typeof floorPremium === 'number' && !isNaN(floorPremium)) { viewOptions.floorPremium = floorPremium; }
        }
        const payload = {
            report_type: reportType,
            filters: filters,
            date_config: {},
            view_mode: state.isHeatmapActive ? 'heatmap' : 'standard',
            view_options: viewOptions
        };
        const dateRangeValue = dom.dateRangeSelect.value;
        if (dateRangeValue === 'custom') {
            payload.date_config = { type: 'absolute', start: dom.dateStartInput.value, end: dom.dateEndInput.value };
        } else {
            payload.date_config = { type: 'relative', value: dateRangeValue };
        }

        const result = await api.generateShareLink(payload);

        dom.shareUrlInput.value = result.publicUrl;
        dom.shareModal.classList.remove('hidden');
        dom.copyFeedback.classList.add('hidden');
    } catch (error) {
        console.error("分享失敗:", error);
        alert(`產生分享連結失敗: ${error.message}`);
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-share-alt mr-2"></i>分享/內嵌`;
    }
}

export function copyShareUrl() {
    dom.shareUrlInput.select();
    document.execCommand('copy');
    dom.copyFeedback.classList.remove('hidden');
    setTimeout(() => { dom.copyFeedback.classList.add('hidden'); }, 2000);
}

export function handleLegendClick(e) {
    const legendItem = e.target.closest('.legend-item');
    if (!legendItem) return;
    const { filterType, filterValue } = legendItem.dataset;
    if (legendItem.classList.contains('active')) {
        legendItem.classList.remove('active');
        state.currentLegendFilter = { type: null, value: null };
    } else {
        dom.heatmapLegendContainer.querySelectorAll('.legend-item.active').forEach(item => item.classList.remove('active'));
        legendItem.classList.add('active');
        state.currentLegendFilter = { type: filterType, value: filterValue };
    }
    heatmapRenderer.applyHeatmapGridFilter();
}

export function handleGlobalClick(e) {
    const isClickInsideProject = dom.projectFilterWrapper.contains(e.target);
    if (!isClickInsideProject) {
        dom.projectNameSuggestions.classList.add('hidden');
        dom.projectNameInput.value = '';
    }

    // Updated District Click - check both new and old? No just check if inside wrapper
    const isClickInsideDistrict = dom.districtFilterWrapper.contains(e.target);
    if (!isClickInsideDistrict) dom.districtSuggestions.classList.add('hidden');

    // County Click
    const isClickInsideCounty = dom.countyFilterWrapper ? dom.countyFilterWrapper.contains(e.target) : false;
    if (!isClickInsideCounty) dom.countySuggestions.classList.add('hidden');

    if (!isClickInsideDistrict && !isClickInsideProject && !isClickInsideCounty) dom.filterCard.classList.remove('z-elevate-filters');

    const isClickInsideHeatmap = dom.horizontalPriceGridContainer.contains(e.target) || dom.heatmapLegendContainer.contains(e.target);
    if (state.currentLegendFilter.type && !isClickInsideHeatmap) {
        dom.heatmapLegendContainer.querySelectorAll('.legend-item.active').forEach(item => item.classList.remove('active'));
        state.currentLegendFilter = { type: null, value: null };
        heatmapRenderer.applyHeatmapGridFilter();
    }
}

let priceGridPlaceholder = null;

export function togglePriceGridFullScreen() {
    const container = dom.priceGridVisualContainer;
    const btn = dom.fullscreenPriceGridBtn;

    if (!container || !btn) return;

    const icon = btn.querySelector('i');
    const isFullscreen = container.classList.contains('fullscreen-modal-view');

    if (!isFullscreen) {
        priceGridPlaceholder = document.createComment("price-grid-placeholder");
        container.parentNode.insertBefore(priceGridPlaceholder, container);
        document.body.appendChild(container);

        const backdrop = document.createElement('div');
        backdrop.className = 'custom-backdrop';
        backdrop.id = 'price-grid-backdrop';
        backdrop.addEventListener('click', togglePriceGridFullScreen);
        document.body.appendChild(backdrop);

        container.classList.add('fullscreen-modal-view');
        icon.classList.remove('fa-expand');
        icon.classList.add('fa-compress');
        btn.title = "退出全螢幕";

        document.addEventListener('keydown', handleEscKey);

    } else {
        const backdrop = document.getElementById('price-grid-backdrop');
        if (backdrop) backdrop.remove();

        container.classList.remove('fullscreen-modal-view');

        if (priceGridPlaceholder && priceGridPlaceholder.parentNode) {
            priceGridPlaceholder.parentNode.insertBefore(container, priceGridPlaceholder);
            priceGridPlaceholder.remove();
            priceGridPlaceholder = null;
        } else {
            dom.priceGridReportContent.appendChild(container);
        }

        icon.classList.remove('fa-compress');
        icon.classList.add('fa-expand');
        btn.title = "全螢幕檢視";

        document.removeEventListener('keydown', handleEscKey);
    }
}

function handleEscKey(e) {
    if (e.key === 'Escape') {
        togglePriceGridFullScreen();
    }
}

