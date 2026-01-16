"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ReportWrapper } from "./ReportWrapper";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ArrowUpDown, Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFilterStore } from "@/store/useFilterStore";
import { api } from "@/lib/api";
import { COUNTY_CODE_MAP, DISTRICT_DATA } from "@/lib/config";
import { getDateRangeDates } from "@/lib/date-utils";

interface TransactionRecord {
    編號?: string;
    縣市代碼?: string;
    行政區?: string;
    建案名稱?: string;
    交易日?: string;
    交易筆棟數?: string;
    主要用途?: string;
    建物型態?: string;
    戶型?: string;
    戶別?: string;
    樓層?: string | number;
    總樓層?: string | number;
    房數?: number;
    廳數?: number;
    衛浴數?: number;
    '房屋面積(坪)'?: number;
    '房屋單價(萬)'?: number;
    '房屋總價(萬)'?: number;
    '車位總價(萬)'?: number;
    '交易總價(萬)'?: number;
    地址?: string;
    備註?: string;
    解約情形?: string;
    交易類型?: string;
    '車位類別'?: string;
    '車位價格'?: number;
    '車位面積'?: number;
    '主建物面積'?: number;
    '附屬建物面積'?: number;
    '陽台面積'?: number;
    [key: string]: any;
}

interface DataListReportProps {
    data?: any; // Kept for compatibility/trigger, though we fetch our own data
}

type SortDirection = 'asc' | 'desc' | null;
type SortConfig = { key: string; direction: SortDirection };

export function DataListReport({ data: _triggerData }: DataListReportProps) {
    const filters = useFilterStore();
    const [dataList, setDataList] = useState<TransactionRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: null });
    const [searchQuery, setSearchQuery] = useState('');
    const [filterField, setFilterField] = useState<string>('建案名稱');
    const pageSize = 20;

    // Fetch data logic
    const fetchByType = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setDataList([]);

        try {
            const { counties, districts, transactionType, dateRange, startDate, endDate, projectNames, buildingType } = filters;

            if (counties.length === 0) {
                setIsLoading(false);
                return;
            }

            // Calculate dates if needed
            let finalStart = startDate;
            let finalEnd = endDate;
            if (dateRange !== 'custom') {
                const dates = getDateRangeDates(dateRange);
                if (dates.startDate) finalStart = dates.startDate;
                if (dates.endDate) finalEnd = dates.endDate;
            }

            // Prepare promises for each county
            const promises = counties.map(async (countyName) => {
                const countyCode = COUNTY_CODE_MAP[countyName];

                // Logic to filter districts for this county
                // Only send districts belonging to this county
                const countyDistricts = DISTRICT_DATA[countyName] || [];
                const targetDistricts = districts.filter(d => countyDistricts.includes(d));

                // If user selected districts in OTHER counties but NOT this one, 
                // and didn't explicitly select 'all' (conceptually), we assume full county query?
                // Legacy logic: if districts has content, we check validity. 
                // If validDistricts has content `targetDistricts`, use it.
                // If `districts` (global) has value but `targetDistricts` is empty => 
                // it means user selected districts in other counties.
                // Should we filter this county?
                // Legacy: "If targetDistricts.length > 0 ... else delete localFilters.districts"
                // This implies if no districts match this county, we query ALL districts of this county.

                const payload = {
                    countyCode,
                    districts: targetDistricts.length > 0 ? targetDistricts : undefined,
                    type: transactionType,
                    dateStart: finalStart,
                    dateEnd: finalEnd,
                    projectNames,
                    buildingType
                };

                try {
                    // Fetch page 1 with a large limit? 
                    // Legacy fetched current page but merged. 
                    // Since we want ALL data for client-side sorting/filtering (as this component does),
                    // we might need a larger limit or handle server-side pagination properly.
                    // Legacy: "每頁顯示的筆數 = pageSize * selectedCounties.length"
                    // It fetched page `state.currentPage`. 
                    // BUT here in React, we are doing client-side pagination on the `dataList`.
                    // To do client-side pagination correctly, we need ALL data or handle server-side pagination actions.
                    // Given the discrepancy task, the user wants "Missing Data".
                    // The safest way is to fetch a reasonable amount of "Top N" rows or handle true server paging.
                    // Let's stick to a larger limit per county to ensure we get enough data, 
                    // OR implement server-side paging properly.
                    // For now, let's try to fetch a generous amount (e.g. 1000 per county) to populate the list,
                    // as true global server-side paging with multi-source is hard without a backend aggregator.
                    // This matches Legacy's "simplified strategy" but we'll fetch more to avoid "missing" feel.

                    // Backend expects 'limit', but PaginationState type has 'pageSize'. 
                    // We cast to any to pass 'limit' correctly.
                    const pagination = { page: 1, limit: 1000 } as any;
                    return await api.fetchData(payload, pagination);
                } catch (e) {
                    console.warn(`Fetch failed for ${countyName}`, e);
                    return { data: [], count: 0 };
                }
            });

            const results = await Promise.all(promises);

            let merged: TransactionRecord[] = [];
            results.forEach(res => {
                if (res && Array.isArray(res.data)) {
                    merged = [...merged, ...res.data];
                }
            });

            // Default sort by Date desc
            merged.sort((a, b) => {
                const da = a['交易日'] || '';
                const db = b['交易日'] || '';
                return db.localeCompare(da);
            });

            setDataList(merged);

        } catch (err: any) {
            console.error("Data List fetch failed:", err);
            setError(err.message || "讀取交易資料失敗");
        } finally {
            setIsLoading(false);
        }
    }, [filters]); // Re-create fetch function when filters change

    // Trigger fetch on mount or when _triggerData (analysis completion) changes
    useEffect(() => {
        fetchByType();
    }, [fetchByType, _triggerData]);


    // Summary fields - first level display (sortable)
    const summaryFields = [
        { key: '行政區', label: '行政區', sortable: true },
        { key: '建案名稱', label: '建案名稱', sortable: true },
        { key: '交易日', label: '交易日', sortable: true },
        { key: '交易筆棟數', label: '交易筆棟數', sortable: false }, // Added missing field
        { key: '主要用途', label: '主要用途', sortable: false },
        { key: '建物型態', label: '建物型態', sortable: false },
        { key: '戶型', label: '戶型', sortable: true },
        { key: '樓層', label: '樓層', sortable: true },
        { key: '房屋面積(坪)', label: '坪數', sortable: true },
        { key: '房屋單價(萬)', label: '單價', sortable: true },
    ];

    // Detail fields - second level display
    const detailFields = [
        '編號', '地址', '總樓層', '交易總價(萬)',
        '房屋總價(萬)', '車位總價(萬)',
        '房數', '廳數', '衛浴數', '備註', '解約情形',
        '戶別', '主要用途', '建物型態', '車位類別', '車位價格', '車位面積',
        '主建物面積', '附屬建物面積', '陽台面積'
    ];

    const toggleRowExpand = (index: number) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const formatValue = (value: any): string => {
        if (value === null || value === undefined || value === '') return '-';
        if (typeof value === 'number') {
            return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(2);
        }
        return String(value);
    };

    // Sorting logic
    const handleSort = (key: string) => {
        setSortConfig(prev => {
            if (prev.key === key) {
                // Cycle: asc -> desc -> null
                if (prev.direction === 'asc') return { key, direction: 'desc' };
                if (prev.direction === 'desc') return { key: '', direction: null };
            }
            return { key, direction: 'asc' };
        });
        setCurrentPage(1);
    };

    // Filter and sort data
    const processedData = useMemo(() => {
        let result = [...dataList];

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(record => {
                const fieldValue = record[filterField];
                if (fieldValue === null || fieldValue === undefined) return false;
                return String(fieldValue).toLowerCase().includes(query);
            });
        }

        // Sort
        if (sortConfig.key && sortConfig.direction) {
            result.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];

                // Handle nulls
                if (aVal == null && bVal == null) return 0;
                if (aVal == null) return 1;
                if (bVal == null) return -1;

                // Numeric comparison
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
                }

                // String comparison
                const aStr = String(aVal);
                const bStr = String(bVal);
                return sortConfig.direction === 'asc'
                    ? aStr.localeCompare(bStr, 'zh-TW')
                    : bStr.localeCompare(aStr, 'zh-TW');
            });
        }

        return result;
    }, [dataList, searchQuery, filterField, sortConfig]);

    const totalPages = Math.ceil(processedData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentRecords = processedData.slice(startIndex, endIndex);

    // Render sort icon
    const renderSortIcon = (key: string) => {
        if (sortConfig.key !== key) {
            return <ArrowUpDown size={12} className="opacity-30 group-hover:opacity-70" />;
        }
        if (sortConfig.direction === 'asc') {
            return <ChevronUp size={12} className="text-violet-400" />;
        }
        return <ChevronDown size={12} className="text-violet-400" />;
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500 mb-2" />
                <p className="text-zinc-500 text-sm">正在載入交易資料相關明細...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-12 text-red-400">
                <p>載入失敗: {error}</p>
                <button onClick={() => fetchByType()} className="mt-4 px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700">重試</button>
            </div>
        );
    }

    if (!dataList || dataList.length === 0) {
        return (
            <div className="text-center p-12 text-zinc-500">
                無交易資料可顯示
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Search and Filter Bar */}
            <div className="flex flex-wrap gap-3 items-center p-3 bg-zinc-900/50 rounded-lg border border-white/5">
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <Search size={16} className="text-zinc-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        placeholder={`搜尋 ${filterField}...`}
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder-zinc-500 text-sm"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="text-zinc-500 hover:text-white">
                            <X size={14} />
                        </button>
                    )}
                </div>
                <select
                    value={filterField}
                    onChange={(e) => setFilterField(e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-300"
                >
                    <option value="建案名稱">建案名稱</option>
                    <option value="行政區">行政區</option>
                    <option value="戶型">戶型</option>
                    <option value="主要用途">主要用途</option>
                </select>
            </div>

            {/* Summary Bar */}
            <div className="flex justify-between items-center text-sm text-zinc-400">
                <span>共 <span className="text-white font-semibold">{processedData.length.toLocaleString()}</span> 筆資料 {searchQuery && <span className="text-zinc-500">(已篩選)</span>}</span>
                <span>第 {currentPage} / {totalPages || 1} 頁</span>
            </div>

            {/* Data Table */}
            <ReportWrapper title="交易資料明細" description="點擊表頭可排序，點擊「明細」可展開詳細資訊">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-900/80 text-zinc-400 uppercase text-xs font-semibold sticky top-0">
                            <tr>
                                <th className="px-3 py-3 w-20">操作</th>
                                {summaryFields.map(field => (
                                    <th
                                        key={field.key}
                                        className={cn(
                                            "px-3 py-3 whitespace-nowrap",
                                            field.sortable && "cursor-pointer select-none group hover:text-white transition-colors"
                                        )}
                                        onClick={() => field.sortable && handleSort(field.key)}
                                    >
                                        <div className="flex items-center gap-1">
                                            {field.label}
                                            {field.sortable && renderSortIcon(field.key)}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {currentRecords.map((record, idx) => {
                                const globalIndex = startIndex + idx;
                                const isExpanded = expandedRows.has(globalIndex);

                                return (
                                    <React.Fragment key={globalIndex}>
                                        {/* Summary Row */}
                                        <tr className={cn(
                                            "hover:bg-zinc-800/50 transition-colors",
                                            isExpanded && "bg-zinc-800/30"
                                        )}>
                                            <td className="px-3 py-2">
                                                <button
                                                    onClick={() => toggleRowExpand(globalIndex)}
                                                    className={cn(
                                                        "flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors",
                                                        isExpanded
                                                            ? "bg-violet-500/20 text-violet-300"
                                                            : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                                                    )}
                                                >
                                                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                                    明細
                                                </button>
                                            </td>
                                            {summaryFields.map(field => (
                                                <td key={field.key} className="px-3 py-2 whitespace-nowrap">
                                                    {field.key === '戶型' ? (
                                                        <span
                                                            className="cursor-help border-b border-dotted border-zinc-600"
                                                            title={`原始戶別: ${record['戶別'] || '無資料'}`}
                                                        >
                                                            {formatValue(record[field.key])}
                                                        </span>
                                                    ) : (
                                                        <span className={cn(
                                                            field.key === '房屋單價(萬)' && "font-mono text-violet-400",
                                                            field.key === '建案名稱' && "font-medium text-white"
                                                        )}>
                                                            {formatValue(record[field.key])}
                                                        </span>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>

                                        {/* Detail Row (Expandable) */}
                                        {isExpanded && (
                                            <tr className="bg-zinc-900/50">
                                                <td colSpan={summaryFields.length + 1} className="px-4 py-4">
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                                        {detailFields.map(field => {
                                                            if (!(field in record)) return null;
                                                            return (
                                                                <div key={field} className="bg-zinc-800/50 rounded p-2">
                                                                    <div className="text-xs text-zinc-500 mb-1">{field}</div>
                                                                    <div className="text-sm text-zinc-200 font-mono">
                                                                        {formatValue(record[field])}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                            {currentRecords.length === 0 && (
                                <tr>
                                    <td colSpan={summaryFields.length + 1} className="text-center py-8 text-zinc-500">
                                        無符合條件的資料
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </ReportWrapper>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <div className="text-sm text-zinc-500">
                    顯示第 {processedData.length > 0 ? startIndex + 1 : 0} - {Math.min(endIndex, processedData.length)} 筆
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    {/* Page numbers */}
                    <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, totalPages || 1) }, (_, i) => {
                            let pageNum: number;
                            const pages = totalPages || 1;
                            if (pages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= pages - 2) {
                                pageNum = pages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }

                            if (pageNum < 1 || pageNum > pages) return null;

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={cn(
                                        "w-8 h-8 rounded text-sm font-medium transition-colors",
                                        currentPage === pageNum
                                            ? "bg-violet-500 text-white"
                                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                    )}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages || 1, p + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-2 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

