"use client";

import React, { useState, useMemo } from "react";
import { ReportWrapper } from "./ReportWrapper";
import { PriceBandChart } from "@/components/charts/PriceBandChart";
import { PriceBandLocationChart } from "@/components/charts/PriceBandLocationChart";
import { ProjectListModal } from "@/components/ui/ProjectListModal";
import { cn } from "@/lib/utils";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PriceBandItem {
    roomType: string;
    bathrooms: number | null;
    minPrice: number;
    q1Price: number;
    medianPrice: number;
    q3Price: number;
    maxPrice: number;
    avgPrice: number;
    count: number;
    projectNames?: string[];
    [key: string]: any;
}

interface PriceBandReportProps {
    data: {
        details: PriceBandItem[];
        locationCrossTable?: Record<string, Record<string, number>>;
        allDistricts?: string[];
        allRoomTypes?: string[];
        transactionDetails?: any[];
    } | null;
    visibleSections?: string[];
}

export function PriceBandReport({ data, visibleSections = ['chart', 'table', 'location-table', 'location-chart'] }: PriceBandReportProps) {
    // Local filter for room types visibility in this report
    const defaultTypes = ['套房', '1房', '2房', '3房', '4房', '毛胚'];
    const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>(defaultTypes);
    const [locationDimension, setLocationDimension] = useState<'district' | 'county'>('district');
    // Modal state for project list
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalProjects, setModalProjects] = useState<string[]>([]);

    // Multi-city handling
    const [activeViewCounty, setActiveViewCounty] = useState<string | null>(null);

    // Dervive distinct counties present in the data
    const participatingCounties = useMemo(() => {
        if (!data?.transactionDetails) return [];
        const set = new Set<string>();
        data.transactionDetails.forEach(tx => {
            if (tx['縣市']) set.add(tx['縣市']);
        });
        return Array.from(set).sort();
    }, [data?.transactionDetails]);

    // Initialize active view county to the first one if not set
    // Initialize active view county to the first one if not set
    React.useEffect(() => {
        if (!activeViewCounty && participatingCounties.length > 0) {
            setActiveViewCounty(participatingCounties[0]);
        }
    }, [participatingCounties, activeViewCounty]);

    const openProjectModal = (roomType: string, bathrooms: number | null, projects: string[]) => {
        setModalTitle(`${roomType}${bathrooms !== null ? ` / ${bathrooms}衛` : ''} 建案組成`);
        setModalProjects(projects);
        setModalOpen(true);
    };

    if (!data || !data.details) return null;

    const { details, locationCrossTable, allDistricts, transactionDetails } = data;

    // All available room types in data (for filters)
    const allAvailableTypes = useMemo(() => Array.from(new Set(details.map(d => d.roomType))), [details]);

    // Filter main table data for Chart (keep independent or synced?)
    // Chart usually renders what is visible. If we merge bathrooms, Chart might want merged data too?
    // Let's keep filteredData as BASE for now, and tableData for Table.
    const filteredData = useMemo(() => {
        return details.filter(d => selectedRoomTypes.includes(d.roomType));
    }, [details, selectedRoomTypes]);

    const [mergeBathrooms, setMergeBathrooms] = useState(true);

    const toggleRoomType = (type: string) => {
        setSelectedRoomTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    // Calculate detailed table data, optionally merging bathrooms
    const tableData = useMemo(() => {
        const baseData = details.filter(d => selectedRoomTypes.includes(d.roomType));

        if (!mergeBathrooms) {
            return baseData;
        }

        // Group by roomType
        const grouped = new Map<string, PriceBandItem>();

        baseData.forEach(item => {
            const key = item.roomType;
            if (!grouped.has(key)) {
                // Clone basic structure, but reset specific stats
                grouped.set(key, {
                    ...item,
                    bathrooms: null, // Indicate merged
                    projectNames: item.projectNames ? [...item.projectNames] : [],
                    count: 0,
                    avgPrice: 0 // Will recalculate
                });
            }

            const group = grouped.get(key)!;
            const currentTotalVal = group.avgPrice * group.count;
            const itemTotalVal = item.avgPrice * item.count;

            const newCount = group.count + item.count;
            const newTotalVal = currentTotalVal + itemTotalVal;

            group.count = newCount;
            group.avgPrice = newCount > 0 ? newTotalVal / newCount : 0;
            group.minPrice = Math.min(group.minPrice, item.minPrice);
            group.maxPrice = Math.max(group.maxPrice, item.maxPrice);

            // Weighted Average of Medians/Quartiles (Approximate)
            // This is a trade-off for client-side aggregation without raw data
            const weightA = group.count - item.count;
            const weightB = item.count;
            group.medianPrice = (group.medianPrice * weightA + item.medianPrice * weightB) / newCount;
            group.q1Price = (group.q1Price * weightA + item.q1Price * weightB) / newCount;
            group.q3Price = (group.q3Price * weightA + item.q3Price * weightB) / newCount;

            if (item.projectNames) {
                const newSet = new Set([...(group.projectNames || []), ...item.projectNames]);
                group.projectNames = Array.from(newSet);
            }
        });

        return Array.from(grouped.values()).sort((a, b) => {
            return defaultTypes.indexOf(a.roomType) - defaultTypes.indexOf(b.roomType);
        });

    }, [details, selectedRoomTypes, mergeBathrooms, defaultTypes]);

    // Prepare data for Location Cross Table & Chart
    const crossTableData = useMemo(() => {
        // If we switched to 'county' and have raw transaction details, we aggregate on the fly
        if (locationDimension === 'county' && transactionDetails) {
            const tempTable: Record<string, Record<string, number>> = {};
            const counties = new Set<string>();

            transactionDetails.forEach((tx) => {
                let rawRoom = tx['房型'] || tx.roomType || tx['戶型'];

                // If direct room type is missing, try to derive from '房數'
                if (!rawRoom || rawRoom === '其他') {
                    const roomCount = tx['房數'];
                    const countVal = Number(roomCount);
                    if (!isNaN(countVal) && countVal > 0) {
                        rawRoom = `${countVal}房`;
                    } else {
                        rawRoom = '其他';
                    }
                }

                let room = typeof rawRoom === 'string' ? rawRoom.replace(/\s+/g, '') : rawRoom;
                // Normalize number-only room types (e.g. "3" -> "3房")
                if (typeof room === 'number' || (typeof room === 'string' && /^\d+$/.test(room))) {
                    room = `${room}房`;
                }
                const county = tx['縣市'] || '未知';

                if (!tempTable[room]) tempTable[room] = {};
                tempTable[room][county] = (tempTable[room][county] || 0) + 1;
                counties.add(county);
            });

            const sortedCounties = Array.from(counties).sort();

            // Calculate totals
            const locationTotals: Record<string, number> = {};
            let grandTotal = 0;
            sortedCounties.forEach(c => locationTotals[c] = 0);

            const rows = selectedRoomTypes.map(roomType => {
                const locData = tempTable[roomType] || {};
                let rowTotal = 0;
                const cells = sortedCounties.map(c => {
                    const val = locData[c] || 0;
                    rowTotal += val;
                    locationTotals[c] += val;
                    return val;
                });
                grandTotal += rowTotal;
                return { roomType, cells, rowTotal };
            });

            return { locations: sortedCounties, rows, locationTotals, grandTotal };
        }

        // Default or Fallback: District Mode
        if (locationDimension === 'district') {
            const tempTable: Record<string, Record<string, number>> = {};
            const districts = new Set<string>();

            // If we have raw transaction details, we can aggregate accurately
            if (transactionDetails) {
                transactionDetails.forEach((tx) => {
                    let rawRoom = tx['房型'] || tx.roomType || tx['戶型'];

                    // If direct room type is missing, try to derive from '房數'
                    if (!rawRoom || rawRoom === '其他') {
                        const roomCount = tx['房數'];
                        const countVal = Number(roomCount);
                        if (!isNaN(countVal) && countVal > 0) {
                            rawRoom = `${countVal}房`;
                        } else {
                            rawRoom = '其他';
                        }
                    }

                    let room = typeof rawRoom === 'string' ? rawRoom.replace(/\s+/g, '') : rawRoom;
                    if (typeof room === 'number' || (typeof room === 'string' && /^\d+$/.test(room))) {
                        room = `${room}房`;
                    }
                    const district = tx['行政區'] || '未知';
                    const county = tx['縣市'] || '未知';

                    // If a specific county is selected for viewing (in multi-county mode), filter others out
                    if (activeViewCounty && county !== activeViewCounty) return;

                    if (!tempTable[room]) tempTable[room] = {};
                    tempTable[room][district] = (tempTable[room][district] || 0) + 1;
                    districts.add(district);
                });
            } else if (locationCrossTable) {
                // Legacy / fallback if no raw details
                const relevantLocations = new Set<string>();
                selectedRoomTypes.forEach(roomType => {
                    const locs = locationCrossTable[roomType];
                    if (locs) {
                        Object.keys(locs).forEach(l => relevantLocations.add(l));
                    }
                });
                relevantLocations.forEach(l => districts.add(l));

                // Re-map to tempTable structure
                selectedRoomTypes.forEach(roomType => {
                    const locs = locationCrossTable[roomType];
                    if (locs) {
                        tempTable[roomType] = locs;
                    }
                });
            }

            const sortedDistricts = Array.from(districts).sort();

            // Calculate totals
            const locationTotals: Record<string, number> = {};
            let grandTotal = 0;
            sortedDistricts.forEach(d => locationTotals[d] = 0);

            const rows = selectedRoomTypes.map(roomType => {
                const locData = tempTable[roomType] || {};
                let rowTotal = 0;
                const cells = sortedDistricts.map(d => {
                    const val = locData[d] || 0;
                    rowTotal += val;
                    locationTotals[d] += val;
                    return val;
                });
                grandTotal += rowTotal;
                return { roomType, cells, rowTotal };
            });

            return { locations: sortedDistricts, rows, locationTotals, grandTotal };
        }

        return null; // No data available
    }, [locationCrossTable, transactionDetails, selectedRoomTypes, locationDimension, activeViewCounty]);

    const [expandedRoomTypes, setExpandedRoomTypes] = useState<Set<string>>(new Set());

    const toggleExpand = (roomType: string) => {
        setExpandedRoomTypes(prev => {
            const next = new Set(prev);
            if (next.has(roomType)) {
                next.delete(roomType);
            } else {
                next.add(roomType);
            }
            return next;
        });
    };

    // Helper to get sub-items for a merged row
    const getSubItems = (roomType: string) => {
        return details.filter(d => d.roomType === roomType).sort((a, b) => {
            // Sort by bathrooms amount?
            const bathsA = Number(a.bathrooms) || 0;
            const bathsB = Number(b.bathrooms) || 0;
            return bathsA - bathsB;
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* 1. Filter Toggles */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                    {allAvailableTypes.map(type => (
                        <button
                            key={type}
                            onClick={() => toggleRoomType(type)}
                            className={cn(
                                "px-3 py-1 rounded-full text-xs font-medium transition-colors border",
                                selectedRoomTypes.includes(type)
                                    ? "bg-violet-500/20 border-violet-500 text-violet-200"
                                    : "bg-zinc-800/50 border-zinc-700 text-zinc-500 hover:bg-zinc-800"
                            )}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 bg-zinc-800/50 p-1 rounded-lg border border-white/5">
                    <span className="text-xs text-zinc-400 pl-2">表格顯示:</span>
                    <button
                        onClick={() => setMergeBathrooms(!mergeBathrooms)}
                        className={cn(
                            "px-3 py-1 text-xs font-medium rounded-md transition-all",
                            mergeBathrooms
                                ? "bg-violet-500 text-white shadow-sm"
                                : "text-zinc-400 hover:text-white hover:bg-zinc-700"
                        )}
                    >
                        {mergeBathrooms ? "依房型合併" : "顯示衛浴細節"}
                    </button>
                </div>
            </div>

            {/* 2. Chart */}
            {visibleSections.includes('chart') && (
                <ReportWrapper title="各房型總價帶分佈箱型圖" description="顯示各房型總價的中位數與四分位距">
                    <PriceBandChart data={tableData} />
                </ReportWrapper>
            )}


            {/* 3. Detailed Table */}
            {visibleSections.includes('table') && (
                <ReportWrapper title="總價帶詳細數據" description={mergeBathrooms ? "各房型合併統計 (點擊「全部」可展開細節)" : "各房型詳細價格統計"}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-900/80 text-zinc-400 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="px-4 py-3">房型</th>
                                    <th className="px-4 py-3">衛浴</th>
                                    <th className="px-4 py-3">建案數</th>
                                    <th className="px-4 py-3">筆數</th>
                                    <th className="px-4 py-3">平均總價</th>
                                    <th className="px-4 py-3">最低總價</th>
                                    <th className="px-4 py-3">1/4位總價</th>
                                    <th className="px-4 py-3 text-violet-400">中位數總價</th>
                                    <th className="px-4 py-3">3/4位總價</th>
                                    <th className="px-4 py-3">最高總價</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {tableData.map((item, idx) => {
                                    const isMergedRow = mergeBathrooms && item.bathrooms === null;
                                    const isExpanded = expandedRoomTypes.has(item.roomType);
                                    const subItems = (isMergedRow && isExpanded) ? getSubItems(item.roomType) : [];

                                    return (
                                        <React.Fragment key={idx}>
                                            <tr className={cn("hover:bg-zinc-800/50 transition-colors", isExpanded && "bg-zinc-800/30")}>
                                                <td className="px-4 py-3 font-medium text-white">{item.roomType}</td>
                                                <td className="px-4 py-3 text-zinc-400">
                                                    {isMergedRow ? (
                                                        <button
                                                            onClick={() => toggleExpand(item.roomType)}
                                                            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-zinc-700/50 hover:bg-zinc-600 hover:text-white transition-colors cursor-pointer"
                                                        >
                                                            <span>全部</span>
                                                            <span className={cn("transform transition-transform text-[10px]", isExpanded ? "rotate-180" : "")}>
                                                                ▼
                                                            </span>
                                                        </button>
                                                    ) : (
                                                        item.bathrooms ?? '-'
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item.projectNames && item.projectNames.length > 0 ? (
                                                        <button
                                                            onClick={() => openProjectModal(item.roomType, item.bathrooms, item.projectNames || [])}
                                                            className="px-2 py-1 text-xs font-medium rounded-full bg-violet-500/20 border border-violet-500/50 text-violet-300 hover:bg-violet-500/30 transition-colors cursor-pointer"
                                                        >
                                                            {item.projectNames.length} 個建案
                                                        </button>
                                                    ) : (
                                                        <span className="text-zinc-500">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-zinc-300">{item.count.toLocaleString()}</td>
                                                <td className="px-4 py-3 font-mono text-zinc-300">{item.avgPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                <td className="px-4 py-3 font-mono text-zinc-500">{item.minPrice.toLocaleString()}</td>
                                                <td className="px-4 py-3 font-mono text-zinc-500">{item.q1Price.toLocaleString()}</td>
                                                <td className="px-4 py-3 font-mono text-violet-400 font-bold">{item.medianPrice.toLocaleString()}</td>
                                                <td className="px-4 py-3 font-mono text-zinc-500">{item.q3Price.toLocaleString()}</td>
                                                <td className="px-4 py-3 font-mono text-zinc-500">{item.maxPrice.toLocaleString()}</td>
                                            </tr>
                                            {/* Render Sub-rows if expanded */}
                                            {subItems.map((sub, sIdx) => (
                                                <tr key={`${idx}-sub-${sIdx}`} className="bg-zinc-900/50 hover:bg-zinc-900 border-l-2 border-l-violet-500/30">
                                                    <td className="px-4 py-2 font-medium text-zinc-500 text-xs pl-8">↳ {sub.roomType}</td>
                                                    <td className="px-4 py-2 text-zinc-400 text-xs">{sub.bathrooms} 衛</td>
                                                    <td className="px-4 py-2">
                                                        {sub.projectNames && sub.projectNames.length > 0 ? (
                                                            <button
                                                                onClick={() => openProjectModal(sub.roomType, sub.bathrooms, sub.projectNames || [])}
                                                                className="text-xs text-zinc-500 hover:text-zinc-300 underline decoration-zinc-700"
                                                            >
                                                                {sub.projectNames.length} 建案
                                                            </button>
                                                        ) : '-'}
                                                    </td>
                                                    <td className="px-4 py-2 text-zinc-500 text-xs">{sub.count.toLocaleString()}</td>
                                                    <td className="px-4 py-2 font-mono text-zinc-500 text-xs">{sub.avgPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                    <td className="px-4 py-2 font-mono text-zinc-600 text-xs">{sub.minPrice.toLocaleString()}</td>
                                                    <td className="px-4 py-2 font-mono text-zinc-600 text-xs">{sub.q1Price.toLocaleString()}</td>
                                                    <td className="px-4 py-2 font-mono text-zinc-500 text-xs font-medium">{sub.medianPrice.toLocaleString()}</td>
                                                    <td className="px-4 py-2 font-mono text-zinc-600 text-xs">{sub.q3Price.toLocaleString()}</td>
                                                    <td className="px-4 py-2 font-mono text-zinc-600 text-xs">{sub.maxPrice.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    );
                                })}
                                {filteredData.length === 0 && (
                                    <tr><td colSpan={10} className="p-8 text-center text-zinc-500">請選擇房型顯示數據</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </ReportWrapper>
            )}


            {/* 4. Location Analysis Section */}
            {(crossTableData || transactionDetails) && (
                <div className="space-y-6 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">區域分組交叉分析</h3>
                        <div className="flex bg-zinc-800 rounded-md p-0.5">
                            <button
                                onClick={() => setLocationDimension('district')}
                                className={cn(
                                    "px-2 py-1 text-xs rounded transition-colors",
                                    locationDimension === 'district' ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white"
                                )}
                            >
                                行政區
                            </button>
                            <button
                                onClick={() => setLocationDimension('county')}
                                className={cn(
                                    "px-2 py-1 text-xs rounded transition-colors",
                                    locationDimension === 'county' ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white"
                                )}
                            >
                                縣市
                            </button>
                        </div>
                    </div>

                    {/* Multi-County Switcher (Only visible in District Mode with multiple counties) */}
                    {locationDimension === 'district' && participatingCounties.length > 1 && (
                        <div className="flex items-center gap-2 pb-2">
                            <span className="text-sm text-zinc-500">顯示縣市:</span>
                            <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg">
                                {participatingCounties.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setActiveViewCounty(c)}
                                        className={cn(
                                            "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                            activeViewCounty === c
                                                ? "bg-violet-500/20 text-violet-300 shadow-sm border border-violet-500/50"
                                                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                                        )}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {visibleSections.includes('location-table') && (
                        <ReportWrapper title="區域房型成交分佈" description="各區域不同房型的成交數量熱力分佈">
                            <div className="overflow-x-auto">
                                {crossTableData ? (
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead className="bg-zinc-900/80 text-zinc-400 font-semibold">
                                            <tr>
                                                <th className="px-3 py-2 sticky left-0 bg-zinc-900 z-10 border-r border-white/5">房型</th>
                                                {crossTableData.locations.map(loc => (
                                                    <th key={loc} className="px-3 py-2 text-center min-w-[80px]">{loc}</th>
                                                ))}
                                                <th className="px-3 py-2 text-center border-l border-white/5 bg-zinc-900 font-bold text-white">總計</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {crossTableData.rows.map((row, rIdx) => (
                                                <tr key={rIdx} className="hover:bg-zinc-800/30">
                                                    <td className="px-3 py-2 font-medium text-zinc-300 sticky left-0 bg-zinc-950/90 border-r border-white/5">{row.roomType}</td>
                                                    {row.cells.map((cellVal, cIdx) => {
                                                        // Heatmap coloring logic
                                                        const intensity = cellVal > 0 ? Math.min(cellVal / 20, 1) : 0;
                                                        const bgStyle = cellVal > 0 ? { backgroundColor: `rgba(6, 182, 212, ${intensity * 0.3})` } : {};
                                                        return (
                                                            <td key={cIdx} className="px-3 py-2 text-center text-zinc-400" style={bgStyle}>
                                                                {cellVal > 0 ? cellVal : '-'}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="px-3 py-2 text-center font-bold text-white border-l border-white/5 bg-zinc-900/50">
                                                        {row.rowTotal}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-zinc-900 font-bold border-t-2 border-zinc-700">
                                            <tr>
                                                <td className="px-3 py-2 sticky left-0 bg-zinc-900 border-r border-white/5 text-white">總計</td>
                                                {crossTableData.locations.map(loc => (
                                                    <td key={loc} className="px-3 py-2 text-center text-white">
                                                        {crossTableData.locationTotals[loc]}
                                                    </td>
                                                ))}
                                                <td className="px-3 py-2 text-center text-cyan-400 border-l border-white/5 bg-zinc-900">
                                                    {crossTableData.grandTotal}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                ) : (
                                    <div className="p-8 text-center text-zinc-500">無區域分佈數據</div>
                                )}
                            </div>
                        </ReportWrapper>
                    )}


                    {visibleSections.includes('location-chart') && (
                        <ReportWrapper
                            title="區域成交佔比圖表"
                        >
                            {crossTableData && (
                                <PriceBandLocationChart
                                    roomTypes={selectedRoomTypes}
                                    locations={crossTableData.locations}
                                    crossTable={crossTableData.rows.reduce((acc, row) => {
                                        const roomMap: Record<string, number> = {};
                                        crossTableData.locations.forEach((loc, idx) => {
                                            roomMap[loc] = row.cells[idx];
                                        });
                                        acc[row.roomType] = roomMap;
                                        return acc;
                                    }, {} as Record<string, Record<string, number>>)}
                                    dimension={locationDimension}
                                />
                            )}
                        </ReportWrapper>
                    )}

                </div>
            )}

            {/* Project List Modal */}
            <ProjectListModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalTitle}
                projects={modalProjects}
            />
        </div>
    );
}
