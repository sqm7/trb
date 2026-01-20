"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useFilterStore } from "@/store/useFilterStore";
import { MultiSelect, MultiSelectOption } from "@/components/ui/MultiSelect";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCcw, Search, LineChart, FileDown, Filter, X } from "lucide-react";
import { DISTRICT_DATA, COUNTY_CODE_MAP } from "@/lib/config";
import { api } from "@/lib/api";
import { getDateRangeDates } from "@/lib/date-utils";

interface FilterBarProps {
    onAnalyze?: () => void;
    isLoading?: boolean;
}

export function FilterBar({ onAnalyze, isLoading }: FilterBarProps) {
    // Store
    const {
        counties,
        districts,
        transactionType,
        buildingType,
        projectNames,
        dateRange,
        startDate,
        endDate,
        excludeCommercial,
        setCounties,
        setDistricts,
        setTransactionType,
        setBuildingType,
        setProjectNames,
        setDateRange,
        setCustomDate,
        setExcludeCommercial,
        resetFilters
    } = useFilterStore();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Local State for Project Suggestions
    const [projectOptions, setProjectOptions] = useState<MultiSelectOption[]>([]);
    const [isSearchingProjects, setIsSearchingProjects] = useState(false);

    // Options Data
    const countyOptions: MultiSelectOption[] = Object.keys(COUNTY_CODE_MAP).map(key => ({
        label: key,
        value: key
    }));

    const districtOptions: MultiSelectOption[] = React.useMemo(() => {
        if (counties.length === 0) return [];
        return counties.flatMap(county => {
            const dists = DISTRICT_DATA[county] || [];
            return dists.map(d => ({
                label: d,
                value: d,
                group: county
            }));
        });
    }, [counties]);

    // Handlers
    const handleCountyChange = (newCounties: string[]) => {
        if (newCounties.length > 6) return; // Limit 6
        setCounties(newCounties);
    };

    const handleDistrictChange = (newDistricts: string[]) => {
        setDistricts(newDistricts);
    };

    const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === 'custom') {
            setDateRange('custom', startDate, endDate);
        } else {
            // Calculate dates logic using shared utility
            const { startDate: start, endDate: end } = getDateRangeDates(val);
            if (start && end) {
                setDateRange(val, start, end);
            }
        }
    };

    // Project Search with debounce
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [searchError, setSearchError] = useState<string | null>(null);

    const fetchProjects = useCallback(async (query: string) => {
        // [Modified] Allow empty query (length 0) to fetch popular projects
        if (counties.length === 0) {
            setProjectOptions([]);
            return;
        }
        setIsSearchingProjects(true);
        setSearchError(null);
        try {
            const promises = counties.map(async c => {
                const code = COUNTY_CODE_MAP[c];
                const relevantDistricts = districts.filter(d => DISTRICT_DATA[c]?.includes(d));
                return api.fetchProjectNameSuggestions(code, query, relevantDistricts)
                    .then(res => {
                        // Handle different response formats
                        let list: any[] = [];
                        if (Array.isArray(res)) {
                            list = res;
                        } else if (res && res.data && Array.isArray(res.data)) {
                            list = res.data;
                        } else if (res && res.names && Array.isArray(res.names)) {
                            list = res.names;
                        }
                        return list.map((item: any) => {
                            const isString = typeof item === 'string';
                            const name = isString ? item : (item.name || item.建案名稱 || String(item));
                            return {
                                label: name,
                                value: name,
                                group: c,
                                details: isString ? undefined : {
                                    county: c,
                                    district: item.district || item.行政區,
                                    date: item.earliestDate || item.交易日
                                }
                            };
                        });
                    })
                    .catch(err => {
                        console.error(`Failed to fetch projects for ${c}:`, err);
                        return [];
                    });
            });

            const results = await Promise.all(promises);
            const aggregated = results.flat();

            const unique = Array.from(new Map(aggregated.map(item => [item.value, item])).values());
            setProjectOptions(unique);

            if (unique.length === 0 && query.length >= 2) {
                console.log(`No projects found for query "${query}" in counties: ${counties.join(', ')}`);
            }

        } catch (err) {
            console.error('Project search error:', err);
            setSearchError('搜尋失敗，請稍後再試');
        } finally {
            setIsSearchingProjects(false);
        }
    }, [counties, districts]);

    // Debounced search handler
    const handleProjectSearch = useCallback((query: string) => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
            fetchProjects(query);
        }, 300); // 300ms debounce
    }, [fetchProjects]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="p-4 md:p-6 glass-card rounded-xl shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Mobile Header & Toggle */}
            <div className="flex md:hidden items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Filter className="h-5 w-5 text-violet-500" />
                    篩選條件
                </h2>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="border-zinc-700 text-zinc-300"
                    >
                        {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
                        {isMobileMenuOpen ? '收起' : '展開'}
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        className="bg-violet-600 text-white"
                        disabled={counties.length === 0 || isLoading}
                        onClick={onAnalyze}
                    >
                        {isLoading ? '...' : '分析'}
                    </Button>
                </div>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 items-end ${isMobileMenuOpen ? 'block' : 'hidden md:grid'}`}>

                {/* County */}
                <div className="xl:col-span-1">
                    <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-zinc-300">縣市</label>
                            {counties.length > 3 && (
                                <span className="text-xs text-amber-500 font-normal animate-in fade-in">
                                    (已選 {counties.length}/6)
                                </span>
                            )}
                        </div>
                        {counties.length > 0 && (
                            <button onClick={() => setCounties([])} className="text-xs text-cyan-400 hover:text-cyan-300">清除</button>
                        )}
                    </div>
                    <MultiSelect
                        options={countyOptions}
                        value={counties}
                        onChange={handleCountyChange}
                        placeholder="請選擇縣市..."
                        maxItems={6}
                    />
                </div>

                {/* District */}
                <div className="xl:col-span-1">
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-medium text-zinc-300">行政區</label>
                        {districts.length > 0 && (
                            <button onClick={() => setDistricts([])} className="text-xs text-cyan-400 hover:text-cyan-300">清除</button>
                        )}
                    </div>
                    <MultiSelect
                        options={districtOptions}
                        value={districts}
                        onChange={handleDistrictChange}
                        placeholder={counties.length > 0 ? "請選擇行政區..." : "請先選縣市"}
                        disabled={counties.length === 0}
                    />
                </div>

                {/* Transaction Type */}
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">交易類型</label>
                    <Select value={transactionType} onChange={(e) => setTransactionType(e.target.value)}>
                        <option value="預售交易">預售交易</option>
                        <option value="中古交易" disabled>中古交易 (開發中)</option>
                    </Select>
                </div>

                {/* Building Type */}
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">建物型態</label>
                    <Select value={buildingType} onChange={(e) => setBuildingType(e.target.value)}>
                        <option value="">全部</option>
                        <option value="住宅大樓(11層含以上有電梯)">住宅大樓</option>
                        <option value="華廈(10層含以下有電梯)">華廈</option>
                        <option value="公寓(5層含以下無電梯)">公寓</option>
                        <option value="套房(1房(1廳)1衛)">套房</option>
                        <option value="透天厝">透天厝</option>
                        <option value="店面(店鋪)">店面</option>
                        <option value="辦公商業大樓">辦公商業大樓</option>
                        <option value="工廠">工廠/廠辦</option>
                        <option value="其他">其他</option>
                    </Select>
                </div>

                {/* Project Name */}
                <div className="xl:col-span-3">
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-medium text-zinc-300">建案名稱</label>
                        {projectNames.length > 0 && (
                            <button onClick={() => setProjectNames([])} className="text-xs text-cyan-400 hover:text-cyan-300">清除</button>
                        )}
                    </div>
                    <MultiSelect
                        options={projectOptions}
                        value={projectNames}
                        onChange={setProjectNames}
                        placeholder={counties.length > 0 ? "輸入建案名稱搜尋..." : "請先選縣市"}
                        disabled={counties.length === 0}
                        onSearch={handleProjectSearch}
                        loading={isSearchingProjects}
                        onFocus={() => {
                            if (projectNames.length === 0 && projectOptions.length === 0) {
                                fetchProjects('');
                            }
                        }}
                    />
                    {searchError && <span className="text-xs text-red-400 mt-1">{searchError}</span>}
                </div>

                {/* Date Range Group */}
                <div className="xl:col-span-3 sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">快捷時間</label>
                        <Select value={dateRange} onChange={handleDateRangeChange}>
                            <option value="custom">自訂範圍</option>
                            <option value="1q">近一季 (3個月)</option>
                            <option value="2q">近兩季 (6個月)</option>
                            <option value="3q">近三季 (9個月)</option>
                            <option value="1y">近一年 (12個月)</option>
                            <option value="this_year">今年以來</option>
                            <option value="last_2_years">去年＋今年</option>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">起始日期</label>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setCustomDate(e.target.value, endDate)}
                            className="bg-zinc-950/50 border-input text-zinc-100"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-zinc-300">結束日期</label>
                            <button
                                onClick={() => {
                                    const today = new Date().toISOString().split('T')[0];
                                    setCustomDate(startDate, today);
                                }}
                                className="text-xs text-cyan-400 hover:text-cyan-300"
                            >
                                抓取今日
                            </button>
                        </div>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setCustomDate(startDate, e.target.value)}
                            className="bg-zinc-950/50 border-input text-zinc-100"
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="xl:col-span-4 sm:col-span-2 flex items-end gap-4 justify-end mt-4 md:mt-0">
                    <div className="flex items-center gap-4 mr-auto">
                        <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={excludeCommercial}
                                onChange={(e) => setExcludeCommercial(e.target.checked)}
                                className="rounded border-zinc-600 bg-zinc-800 text-violet-500 focus:ring-violet-500 accent-violet-500"
                            />
                            <span>排除商辦/店面</span>
                        </label>
                    </div>

                    <Button
                        variant="default"
                        className="bg-violet-600 hover:bg-violet-500 text-white min-w-[120px] hidden md:flex"
                        disabled={counties.length === 0 || isLoading}
                        onClick={() => {
                            // Set flag to show NEW badge on sidebar
                            localStorage.setItem('reportReady', 'true');
                            // Dispatch custom event for sidebar to react
                            window.dispatchEvent(new Event('reportReady'));
                            onAnalyze?.();
                        }}
                    >
                        {isLoading ? <span className="animate-spin mr-2">⟳</span> : <LineChart className="mr-2 h-4 w-4" />}
                        {isLoading ? '分析中...' : '分析報表'}
                    </Button>


                </div>

            </div>
        </div>
    );
}
