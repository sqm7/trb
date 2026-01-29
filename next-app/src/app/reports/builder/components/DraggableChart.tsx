"use client";

import React from "react";
import { Rnd } from "react-rnd";
import { cn } from "@/lib/utils";
import { Trash2, Move, Grid3X3, Table2, Info, Activity, Layers, Crop, Move3D, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CanvasItem, ChartType, ScaleMode } from "@/store/useReportBuilderStore";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useReportBuilderStore } from "@/store/useReportBuilderStore";

// Chart Components (we'll render these dynamically)
import { RankingChart } from "@/components/charts/RankingChart";
import { PriceBandChart } from "@/components/charts/PriceBandChart";
import { PriceBandLocationChart } from "@/components/charts/PriceBandLocationChart";
import { BubbleChart } from "@/components/charts/BubbleChart";
import { SalesVelocityChart } from "@/components/charts/SalesVelocityChart";
import { ClientChart } from "@/components/charts/ClientChart";
import { UnitPriceStatsBlock } from "@/components/reports/UnitPriceStatsBlock";
import { PricingHeatmap } from "@/components/charts/PricingHeatmap";
import { AreaHeatmapChart } from "@/components/charts/AreaHeatmapChart";

interface DraggableChartProps {
    item: CanvasItem;
    isSelected: boolean;
    onSelect: (e?: React.MouseEvent) => void;
    onUpdate: (updates: Partial<CanvasItem>) => void;
    onRemove: () => void;
    onMoveToPage?: (pageIndex: number) => void;
    analysisData: any;
}

const CHART_LABELS: Record<ChartType, string> = {
    'ranking-metrics': '核心數據指標',
    'unit-price-stats': '各用途單價統計',
    'ranking-chart': '建案排名',
    'ranking-table': '建案排行列表',
    'price-band-chart': '總價帶分佈',
    'price-band-table': '總價帶詳細數據',
    'price-band-location-table': '區域房型成交分佈',
    'price-band-location-chart': '區域成交佔比',
    'unit-price-bubble': '單價泡泡圖',
    'type-comparison-table': '產品類型單價比較',
    'sales-velocity-chart': '銷售速度',
    'sales-velocity-table': '銷售速度明細',
    'parking-pie': '車位配比',
    'parking-price': '車位類型均價',
    'parking-scatter': '車位坪數分析',
    'parking-floor': '車位樓層分析',
    'heatmap': '銷控熱力圖',
    'heatmap-grid': '建案銷控熱力圖',
    'heatmap-stats': '調價幅度摘要',
    'heatmap-comparison': '戶型溢價貢獻',
    'sales-heatmap': '房型面積熱力圖',
    'sales-heatmap-detail': '熱力詳細交易表',
    'data-list': '交易明細表',
};

export function DraggableChart({ item, isSelected, onSelect, onUpdate, onRemove, onMoveToPage, analysisData }: DraggableChartProps) {
    const selectedIds = useReportBuilderStore(state => state.selectedIds);
    const batchUpdateItems = useReportBuilderStore(state => state.batchUpdateItems);
    const pages = useReportBuilderStore(state => state.pages);
    const currentPageIndex = useReportBuilderStore(state => state.currentPageIndex);
    const setDragging = useReportBuilderStore(state => state.setDragging);
    const allItems = pages[currentPageIndex]?.items || []; // Current page items - fix for batch drag

    // Track initial positions for group dragging
    const dragStartPositions = React.useRef<Record<string, { x: number, y: number }>>({});
    const isDraggingGroup = React.useRef(false);
    const hasDragged = React.useRef(false); // Track if actual drag happened to prevent click after drag

    // Render the appropriate chart based on type
    const renderChart = () => {
        if (!analysisData) {
            return (
                <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
                    無數據
                </div>
            );
        }

        switch (item.type) {
            case 'sales-heatmap': {
                const dist = item.data?.distribution || analysisData.areaDistributionAnalysis;
                if (!dist) return <div className="p-4 text-zinc-500">無熱力圖數據</div>;
                return (
                    <div className="h-full overflow-hidden p-1">
                        <AreaHeatmapChart
                            data={dist}
                            selectedRooms={item.data?.selectedRooms || ['2房', '3房']}
                            minArea={item.data?.min || 15}
                            maxArea={item.data?.max || 65}
                            interval={item.data?.interval || 5}
                        />
                    </div>
                );
            }
            case 'sales-heatmap-detail': {
                // Fallback: Generate aggregation from all transactions if no specific snapshot
                const details = React.useMemo(() => {
                    if (item.data && Array.isArray(item.data) && item.data.length > 0) return item.data;

                    if (!analysisData.transactionDetails) return [];

                    // Simple aggregation logic matching SalesVelocityReport
                    const grouped: Record<string, any[]> = {};
                    analysisData.transactionDetails.forEach((tx: any) => {
                        const pname = tx['建案名稱'] || tx.projectName || '未知';
                        if (!grouped[pname]) grouped[pname] = [];
                        grouped[pname].push(tx);
                    });

                    return Object.entries(grouped).map(([projectName, txs]) => {
                        const totalPrices = txs.map((t: any) => t['產權總價'] || t['交易總價(萬)'] || t.totalPrice || 0).filter(p => p > 0).sort((a, b) => a - b);
                        const unitPrices = txs.map((t: any) => t['房屋單價'] || t['房屋單價(萬)'] || t.unitPrice || 0).filter(p => p > 0);

                        let medianPrice = 0;
                        if (totalPrices.length > 0) {
                            const mid = Math.floor(totalPrices.length / 2);
                            medianPrice = totalPrices.length % 2 !== 0 ? totalPrices[mid] : (totalPrices[mid - 1] + totalPrices[mid]) / 2;
                        }

                        return {
                            projectName,
                            count: txs.length,
                            priceRange: { median: medianPrice },
                            unitPriceRange: {
                                min: unitPrices.length ? Math.min(...unitPrices) : 0,
                                max: unitPrices.length ? Math.max(...unitPrices) : 0
                            }
                        };
                    }).sort((a, b) => b.unitPriceRange.max - a.unitPriceRange.max);
                }, [item.data, analysisData.transactionDetails]);

                if (details.length === 0) return <div className="p-4 text-zinc-500 text-xs text-center">無數據</div>;

                return (
                    <div className="h-full overflow-auto custom-scrollbar p-1">
                        <table className="w-full text-xs border-collapse">
                            <thead className="bg-zinc-800 text-zinc-300 sticky top-0">
                                <tr>
                                    <th className="p-2 text-left">建案名稱</th>
                                    <th className="p-2 text-center">單價範圍(萬/坪)</th>
                                    <th className="p-2 text-center">總價中位數(萬)</th>
                                    <th className="p-2 text-center">交易筆數</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {details.map((d: any, i: number) => (
                                    <tr key={i} className="hover:bg-zinc-800/30">
                                        <td className="p-2 text-white font-medium">{d.projectName}</td>
                                        <td className="p-2 text-center text-cyan-400">
                                            {d.unitPriceRange?.min?.toFixed(1)} ~ {d.unitPriceRange?.max?.toFixed(1)}
                                        </td>
                                        <td className="p-2 text-center text-violet-400">
                                            {Math.round(d.priceRange?.median || 0).toLocaleString()}
                                        </td>
                                        <td className="p-2 text-center text-zinc-300">{d.count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            }
            case 'heatmap':
            case 'heatmap-grid': {
                const heatmapData = item.data?.projectData || (
                    analysisData.priceGridAnalysis?.byProject
                        ? analysisData.priceGridAnalysis.byProject[Object.keys(analysisData.priceGridAnalysis.byProject)[0]]
                        : null
                );
                const premium = item.data?.floorPremium || 0.3;
                return (
                    <div className="h-full overflow-auto custom-scrollbar p-1">
                        {heatmapData ? (
                            <PricingHeatmap
                                data={heatmapData}
                                floorPremium={premium}
                                showGrid={true}
                                showSummary={false}
                                showComparison={false}
                            />
                        ) : (
                            <div className="text-zinc-500 text-sm p-4 text-center">無熱力圖數據 (請先載入建案資料)</div>
                        )}
                    </div>
                );
            }
            case 'heatmap-stats': {
                const heatmapData = item.data?.summary
                    ? { summary: item.data.summary }
                    : (
                        analysisData.priceGridAnalysis?.byProject
                            ? analysisData.priceGridAnalysis.byProject[Object.keys(analysisData.priceGridAnalysis.byProject)[0]]
                            : null
                    );
                return (
                    <div className="h-full overflow-auto custom-scrollbar p-1">
                        {heatmapData?.summary ? (
                            <PricingHeatmap
                                data={heatmapData}
                                showGrid={false}
                                showSummary={true}
                                showComparison={false}
                            />
                        ) : (
                            <div className="text-zinc-500 text-sm p-4 text-center">無統計摘要數據</div>
                        )}
                    </div>
                );
            }
            case 'heatmap-comparison': {
                const heatmapData = item.data?.horizontalComparison
                    ? { horizontalComparison: item.data.horizontalComparison }
                    : (
                        analysisData.priceGridAnalysis?.byProject
                            ? analysisData.priceGridAnalysis.byProject[Object.keys(analysisData.priceGridAnalysis.byProject)[0]]
                            : null
                    );
                return (
                    <div className="h-full overflow-auto custom-scrollbar p-1">
                        {heatmapData?.horizontalComparison ? (
                            <PricingHeatmap
                                data={heatmapData}
                                showGrid={false}
                                showSummary={false}
                                showComparison={true}
                            />
                        ) : (
                            <div className="text-zinc-500 text-sm p-4 text-center">無溢價貢獻數據</div>
                        )}
                    </div>
                );
            }
            case 'unit-price-stats': {
                const stats = item.data || {
                    residentialStats: analysisData.unitPriceAnalysis?.residentialStats,
                    officeStats: analysisData.unitPriceAnalysis?.officeStats,
                    storeStats: analysisData.unitPriceAnalysis?.storeStats,
                    averageType: 'weighted'
                };
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full p-2 overflow-y-auto custom-scrollbar">
                        <UnitPriceStatsBlock
                            title="住宅統計"
                            stats={stats.residentialStats}
                            noDataMessage="無數據"
                            className="bg-zinc-900/40 border-violet-500/20 scale-[0.9] origin-top"
                            averageType={stats.averageType || 'weighted'}
                        />
                        <UnitPriceStatsBlock
                            title="辦公統計"
                            stats={stats.officeStats}
                            noDataMessage="無數據"
                            className="bg-zinc-900/40 border-cyan-500/20 scale-[0.9] origin-top"
                            averageType={stats.averageType || 'weighted'}
                        />
                        <UnitPriceStatsBlock
                            title="店舖統計"
                            stats={stats.storeStats}
                            noDataMessage="無數據"
                            className="bg-zinc-900/40 border-amber-500/20 lg:col-span-2 scale-[0.9] origin-top"
                            averageType={stats.averageType || 'weighted'}
                        />
                    </div>
                );
            }
            case 'ranking-metrics': {
                const rankingProjectList = analysisData.rankingAnalysis?.projectRanking || analysisData.projectRanking || [];
                const metrics = item.data || {
                    coreMetrics: analysisData.rankingAnalysis?.coreMetrics || analysisData.coreMetrics,
                    derivedMetrics: {
                        min: Math.min(...(rankingProjectList.map((p: any) => p.minPrice).filter((v: number) => v > 0) || [0])),
                        max: Math.max(...(rankingProjectList.map((p: any) => p.maxPrice) || [0])),
                        median: rankingProjectList.length ? rankingProjectList.reduce((a: any, b: any) => a + (b.medianPrice || 0), 0) / rankingProjectList.length : 0,
                        parking: rankingProjectList.length ? rankingProjectList.reduce((a: any, b: any) => a + (b.avgParkingPrice || 0), 0) / rankingProjectList.length : 0,
                    }
                };

                const { coreMetrics, derivedMetrics } = metrics;
                if (!coreMetrics) return <div className="p-4 text-zinc-500 text-xs text-center flex items-center justify-center h-full">無指標數據</div>;

                const cards = [
                    { title: "市場去化總銷售金額", value: coreMetrics.totalSaleAmount?.toLocaleString(), unit: "萬" },
                    { title: "總銷去化房屋坪數", value: coreMetrics.totalHouseArea?.toLocaleString(undefined, { maximumFractionDigits: 1 }), unit: "坪" },
                    { title: "總平均單價", value: coreMetrics.overallAveragePrice?.toLocaleString(undefined, { maximumFractionDigits: 1 }), unit: "萬/坪" },
                    { title: "總交易筆數", value: coreMetrics.transactionCount?.toLocaleString(), unit: "筆" },
                    { title: "最低成交單價", value: derivedMetrics.min?.toLocaleString(undefined, { maximumFractionDigits: 1 }), unit: "萬/坪" },
                    { title: "最高成交單價", value: derivedMetrics.max?.toLocaleString(undefined, { maximumFractionDigits: 1 }), unit: "萬/坪" },
                    { title: "平均中位數單價", value: derivedMetrics.median?.toLocaleString(undefined, { maximumFractionDigits: 1 }), unit: "萬/坪" },
                    { title: "平均車位價格", value: derivedMetrics.parking?.toLocaleString(undefined, { maximumFractionDigits: 0 }), unit: "萬" },
                ];

                return (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 h-full p-1 overflow-y-auto custom-scrollbar">
                        {cards.map((card, i) => (
                            <div key={i} className="bg-zinc-800/40 rounded border border-white/5 p-2 flex flex-col items-center justify-center text-center">
                                <div className="text-zinc-500 text-[10px] mb-1 truncate w-full">{card.title}</div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-sm font-bold text-white">{card.value}</span>
                                    <span className="text-[8px] text-zinc-600">{card.unit}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            }
            case 'ranking-chart':
                const rankingData = (item as any).data || analysisData.rankingAnalysis?.projectRanking || analysisData.projectRanking || [];
                return (
                    <RankingChart
                        data={rankingData.slice(0, 10)}
                        sortKey="saleAmountSum"
                        limit={10}
                        chartType="bar"
                        height="100%"
                    />
                );

            case 'price-band-chart':
                const priceBandData = analysisData.priceBandAnalysis?.details || [];
                // If item has filtered data, use it; otherwise use global data
                return <PriceBandChart data={(item as any).data || priceBandData} />;

            case 'price-band-table':
                // Use snapshot data IF available (even if empty array, it's better than raw fallback for merged states)
                const tableData = item.data !== undefined ? item.data : (analysisData.priceBandAnalysis?.details || []);
                return (
                    <div className="h-full overflow-auto custom-scrollbar">
                        <table className="w-full text-[10px] text-left">
                            <thead className="bg-zinc-900 sticky top-0 text-zinc-500">
                                <tr>
                                    <th className="p-1">房型</th>
                                    <th className="p-1">衛浴人</th>
                                    <th className="p-1 text-right">平均總價</th>
                                    <th className="p-1 text-right">中位數</th>
                                    <th className="p-1 text-right">筆數</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {tableData.map((row: any, i: number) => (
                                    <tr key={i} className="text-zinc-300">
                                        <td className="p-1">{row.roomType}</td>
                                        <td className="p-1 text-zinc-500">{row.bathrooms ?? '-'}</td>
                                        <td className="p-1 text-right text-zinc-300">{Math.round(row.avgPrice || 0).toLocaleString()}</td>
                                        <td className="p-1 text-right text-violet-400">{Math.round(row.medianPrice || 0).toLocaleString()}</td>
                                        <td className="p-1 text-right text-zinc-500">{row.count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );

            case 'price-band-location-table':
                // Snapshot might be the full object { locations, rows, locationTotals, grandTotal }
                // or just the flat rows (legacy)
                const snapshot = item.data;
                if (!snapshot) return <div className="flex items-center justify-center h-full text-zinc-500 text-sm">無區域數據</div>;

                const hasRichData = snapshot.locations && snapshot.rows;
                const locKeys = hasRichData ? snapshot.locations : Object.keys(snapshot[0] || {}).filter(k => k !== '房型' && k !== '總計');
                const displayRows = hasRichData ? snapshot.rows : snapshot;

                if (!displayRows || displayRows.length === 0) return <div className="flex items-center justify-center h-full text-zinc-500 text-sm">無區域數據</div>;

                return (
                    <div className="h-full overflow-auto custom-scrollbar">
                        <table className="w-full text-[10px] text-left border-collapse">
                            <thead className="bg-zinc-900 sticky top-0 text-zinc-500">
                                <tr>
                                    <th className="p-1 sticky left-0 bg-zinc-900 z-10 border-r border-white/5">房型</th>
                                    {locKeys.map((loc: string) => (
                                        <th key={loc} className="p-1 text-center min-w-[40px]">{loc}</th>
                                    ))}
                                    <th className="p-1 text-center font-bold text-white border-l border-white/5">總計</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {displayRows.map((row: any, i: number) => (
                                    <tr key={i} className="text-zinc-300 hover:bg-zinc-800/30">
                                        <td className="p-1 sticky left-0 bg-zinc-950/90 border-r border-white/5">{row.roomType || row['房型']}</td>
                                        {locKeys.map((loc: string, lIdx: number) => {
                                            const val = hasRichData ? row.cells[lIdx] : row[loc];
                                            const intensity = typeof val === 'number' && val > 0 ? Math.min(val / 10, 1) : 0;
                                            return (
                                                <td key={loc} className="p-1 text-center text-zinc-400" style={val > 0 ? { backgroundColor: `rgba(6, 182, 212, ${intensity * 0.3})` } : {}}>
                                                    {val > 0 ? val : '-'}
                                                </td>
                                            );
                                        })}
                                        <td className="p-1 text-center text-cyan-400 border-l border-white/5 font-bold">{row.rowTotal || row['總計']}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );

            case 'price-band-location-chart':
                const locSnapshot = item.data;
                if (!locSnapshot) return <div className="flex items-center justify-center h-full text-zinc-500 text-sm">無數據</div>;

                const hasRichLocData = locSnapshot.locations && locSnapshot.rows;
                const locKeysForChart = hasRichLocData ? locSnapshot.locations : Object.keys(locSnapshot[0] || {}).filter(k => k !== '房型' && k !== '總計');
                const categories = hasRichLocData ? locSnapshot.rows.map((r: any) => r.roomType) : locSnapshot.map((d: any) => d['房型']);

                if (categories.length === 0) return <div className="flex items-center justify-center h-full text-zinc-500 text-sm">無數據</div>;

                const series = locKeysForChart.map((loc: string, idx: number) => ({
                    name: loc,
                    data: hasRichLocData
                        ? locSnapshot.rows.map((r: any) => r.cells[idx] || 0)
                        : locSnapshot.map((d: any) => d[loc] || 0)
                }));

                const barOptions: ApexCharts.ApexOptions = {
                    chart: { type: 'bar', stacked: true, background: 'transparent', toolbar: { show: false } },
                    plotOptions: { bar: { horizontal: false, borderRadius: 2 } },
                    dataLabels: { enabled: false },
                    xaxis: { categories: categories, labels: { style: { colors: '#71717a' } } },
                    yaxis: { labels: { style: { colors: '#71717a' } } },
                    grid: { borderColor: '#27272a' },
                    legend: { position: 'bottom', labels: { colors: '#a1a1aa' } },
                    theme: { mode: 'dark' },
                    colors: ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899']
                };

                return (
                    <ClientChart
                        options={barOptions}
                        series={series}
                        type="bar"
                        height="100%"
                    />
                );

            case 'unit-price-bubble':
                const txDetails = analysisData.transactionDetails || [];
                return (
                    <BubbleChart
                        data={txDetails}
                        minPrice={30}
                        maxPrice={150}
                        interval={5}
                        sizeMetric="count"
                        onMinPriceChange={() => { }}
                        onMaxPriceChange={() => { }}
                        onIntervalChange={() => { }}
                        onSizeMetricChange={() => { }}
                    />
                );

            case 'sales-velocity-chart':
                const velocityData = analysisData.salesVelocityAnalysis;
                if (!velocityData?.weekly) return <div className="flex items-center justify-center h-full text-zinc-500 text-sm">無銷售速度數據</div>;
                return (
                    <SalesVelocityChart
                        data={velocityData.weekly}
                        selectedRooms={['1房', '2房', '3房']}
                        metric="count"
                    />
                );

            case 'ranking-table':
                const rankingTableData = (item as any).data || analysisData.rankingAnalysis?.projectRanking || analysisData.projectRanking || [];
                return (
                    <div className="h-full overflow-auto custom-scrollbar">
                        <table className="w-full text-[10px] text-left">
                            <thead className="bg-zinc-900 sticky top-0 text-zinc-500">
                                <tr>
                                    <th className="p-1">建案</th>
                                    <th className="p-1 text-right">交易總價</th>
                                    <th className="p-1 text-right">單價</th>
                                    <th className="p-1 text-right">筆數</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {rankingTableData.slice(0, 50).map((row: any, i: number) => (
                                    <tr key={i} className="text-zinc-300">
                                        <td className="p-1 truncate max-w-[80px]" title={row.projectName}>{row.projectName}</td>
                                        <td className="p-1 text-right font-mono text-zinc-400">{(row.saleAmountSum / 10000).toFixed(0)}億</td>
                                        <td className="p-1 text-right font-mono text-cyan-400">{row.averagePrice?.toFixed(1)}</td>
                                        <td className="p-1 text-right font-mono text-zinc-500">{row.transactionCount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );

            case 'sales-velocity-table':
                const velocityTableData = (item as any).data || [];
                if (!velocityTableData || velocityTableData.length === 0) return <div className="flex items-center justify-center h-full text-zinc-500 text-sm">無數據</div>;
                return (
                    <div className="h-full overflow-auto custom-scrollbar">
                        <table className="w-full text-[10px] text-left">
                            <thead className="bg-zinc-900 sticky top-0 text-zinc-500">
                                <tr>
                                    <th className="p-1">區間</th>
                                    <th className="p-1 text-right">筆數</th>
                                    <th className="p-1 text-right">總銷(億)</th>
                                    <th className="p-1 text-right">坪數</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {velocityTableData.map((row: any, i: number) => (
                                    <tr key={i} className="text-zinc-300">
                                        <td className="p-1 text-zinc-400">{row.period}</td>
                                        <td className="p-1 text-right font-mono text-white">{row.total?.count || 0}</td>
                                        <td className="p-1 text-right font-mono text-cyan-400">{((row.total?.priceSum || 0) / 10000).toFixed(1)}</td>
                                        <td className="p-1 text-right font-mono text-zinc-500">{Math.round(row.total?.areaSum || 0)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );

            case 'type-comparison-table':
                const typeData = (item as any).data || analysisData.unitPriceAnalysis?.typeComparison || [];
                return (
                    <div className="h-full overflow-auto custom-scrollbar">
                        <table className="w-full text-[10px] text-left">
                            <thead className="bg-zinc-900 sticky top-0 text-zinc-500">
                                <tr>
                                    <th className="p-1">建案</th>
                                    <th className="p-1 text-right">住宅</th>
                                    <th className="p-1 text-right">店面</th>
                                    <th className="p-1 text-right">辦公</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {typeData.map((row: any, i: number) => (
                                    <tr key={i} className="text-zinc-300">
                                        <td className="p-1 truncate max-w-[80px]">{row.projectName}</td>
                                        <td className="p-1 text-right font-mono text-cyan-400">{row.residentialAvg ? row.residentialAvg.toFixed(1) : '-'}</td>
                                        <td className="p-1 text-right font-mono text-amber-400">{row.storeAvg ? row.storeAvg.toFixed(1) : '-'}</td>
                                        <td className="p-1 text-right font-mono text-violet-400">{row.officeAvg ? row.officeAvg.toFixed(1) : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );

            case 'parking-pie':
                const parkingRatio = analysisData.parkingAnalysis?.parkingRatio;
                const ratioData = [
                    { name: '有車位', value: parkingRatio?.withParking?.count || 0 },
                    { name: '無車位', value: parkingRatio?.withoutParking?.count || 0 }
                ];
                const COLORS = ['#8b5cf6', '#3f3f46'];
                const pieOptions: ApexCharts.ApexOptions = {
                    chart: { type: 'donut', background: 'transparent' },
                    labels: ratioData.map(d => d.name),
                    colors: COLORS,
                    stroke: { show: false },
                    dataLabels: { enabled: false },
                    legend: { show: true, position: 'bottom', labels: { colors: '#a1a1aa' } },
                    theme: { mode: 'dark' }
                };
                return (
                    <ClientChart
                        options={pieOptions}
                        series={ratioData.map(d => d.value)}
                        type="donut"
                        height="100%"
                    />
                );

            case 'parking-price':
                const priceByType = analysisData.parkingAnalysis?.avgPriceByType || [];
                return (
                    <div className="h-full overflow-auto custom-scrollbar">
                        <table className="w-full text-[10px] text-left">
                            <thead className="bg-zinc-900 sticky top-0 text-zinc-500">
                                <tr>
                                    <th className="p-1">類型</th>
                                    <th className="p-1 text-right">均價</th>
                                    <th className="p-1 text-right">總數</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {priceByType.map((item: any) => (
                                    <tr key={item.type} className="text-zinc-300">
                                        <td className="p-1">{item.type}</td>
                                        <td className="p-1 text-right text-cyan-400">{Math.round(item.avgPrice).toLocaleString()}</td>
                                        <td className="p-1 text-right text-zinc-500">{item.count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );

            case 'heatmap':
                // For simplicity in Report Builder, we'll show a placeholder or a minimized version
                return (
                    <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                        <div className="w-16 h-16 rounded-lg bg-violet-500/10 flex items-center justify-center mb-2">
                            <Grid3X3 className="h-8 w-8 text-violet-500" />
                        </div>
                        <p className="text-xs text-zinc-400">由於熱力圖需要專案選擇，此元件將在匯出時呈現專案銷控狀態。</p>
                        <div className="mt-2 grid grid-cols-4 gap-1 w-full max-w-[200px]">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className={cn("h-3 rounded-sm", i % 3 === 0 ? "bg-red-500/50" : "bg-zinc-700/50")} />
                            ))}
                        </div>
                    </div>
                );

            case 'data-list':
                const txData = analysisData.transactionDetails || [];
                return (
                    <div className="h-full overflow-auto custom-scrollbar">
                        <table className="w-full text-[9px] text-left">
                            <thead className="bg-zinc-900 sticky top-0 text-zinc-500">
                                <tr>
                                    <th className="p-1">建案名稱</th>
                                    <th className="p-1">日期</th>
                                    <th className="p-1 text-right">單價</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {txData.slice(0, 50).map((tx: any, i: number) => (
                                    <tr key={i} className="text-zinc-300">
                                        <td className="p-1 truncate max-w-[80px]">{tx['建案名稱']}</td>
                                        <td className="p-1 text-zinc-500">{tx['交易日']}</td>
                                        <td className="p-1 text-right text-violet-400">{tx['房屋單價(萬)'] || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );

            case 'parking-scatter':
                return (
                    <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mb-2">
                            <Activity className="h-6 w-6 text-cyan-500" />
                        </div>
                        <p className="text-[10px] text-zinc-400">車位坪數散佈分析</p>
                        <div className="mt-2 w-full h-24 bg-zinc-900/50 rounded flex items-end justify-around p-2 gap-1">
                            {Array.from({ length: 15 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-1 bg-cyan-500/40 rounded-full"
                                    style={{ height: `${20 + Math.random() * 60}%` }}
                                />
                            ))}
                        </div>
                    </div>
                );

            case 'parking-floor':
                return (
                    <div className="h-full flex flex-col items-center justify-center p-4 text-center border border-dashed border-white/5 rounded">
                        <div className="w-12 h-12 rounded bg-violet-500/10 flex items-center justify-center mb-2">
                            <Layers className="h-6 w-6 text-violet-500" />
                        </div>
                        <p className="text-[10px] text-zinc-400">樓層價差分析數據</p>
                        <div className="mt-2 space-y-1 w-full">
                            {['B1', 'B2', 'B3'].map(f => (
                                <div key={f} className="flex justify-between text-[8px] bg-zinc-900/50 p-1 rounded">
                                    <span className="text-zinc-500">{f}層</span>
                                    <span className="text-cyan-400">漲幅 +2.4%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            default:
                return <div className="flex items-center justify-center h-full text-zinc-500 text-sm">未知圖表類型</div>;
        }
    };

    // Panning state
    const [isPanning, setIsPanning] = React.useState(false);
    const [lastPanPosition, setLastPanPosition] = React.useState({ x: 0, y: 0 });

    const handlePanStart = (e: React.MouseEvent) => {
        if (item.scaleMode !== 'pan') return;
        e.stopPropagation();
        setIsPanning(true);
        setLastPanPosition({ x: e.clientX, y: e.clientY });
    };

    const handlePanMove = (e: React.MouseEvent) => {
        if (!isPanning || item.scaleMode !== 'pan') return;
        e.stopPropagation();
        const dx = e.clientX - lastPanPosition.x;
        const dy = e.clientY - lastPanPosition.y;

        onUpdate({
            panOffset: {
                x: (item.panOffset?.x || 0) + dx,
                y: (item.panOffset?.y || 0) + dy
            }
        });
        setLastPanPosition({ x: e.clientX, y: e.clientY });
    };

    const handlePanEnd = (e: React.MouseEvent) => {
        if (!isPanning) return;
        e.stopPropagation();
        setIsPanning(false);
    };

    // Calculate fit scale
    // Assuming content base size is roughly 400x300 for calculation reference
    const baseWidth = 400;
    const baseHeight = 300;
    const calculateFitScale = () => {
        const scaleX = item.width / baseWidth;
        const scaleY = item.height / baseHeight;
        return Math.min(scaleX, scaleY);
    };

    // Auto-update content scale when in fit mode and resizing
    React.useEffect(() => {
        if (item.scaleMode === 'fit') {
            onUpdate({ contentScale: calculateFitScale() });
        }
    }, [item.width, item.height, item.scaleMode]);

    return (
        <Rnd
            size={{ width: item.width, height: item.height }}
            position={{ x: item.x, y: item.y }}
            onDragStart={(e) => {
                hasDragged.current = false; // Reset drag flag
                if (isSelected) {
                    isDraggingGroup.current = true;
                    setDragging(true, selectedIds.length);
                    // Record start positions of all selected items
                    const positions: Record<string, { x: number, y: number }> = {};
                    selectedIds.forEach(id => {
                        const it = allItems.find(p => p.id === id);
                        if (it) {
                            positions[id] = { x: it.x, y: it.y };
                        }
                    });
                    dragStartPositions.current = positions;
                    console.log("Group drag start:", positions);
                } else {
                    isDraggingGroup.current = false;
                    setDragging(true, 1);
                }
            }}
            onDrag={(e, d) => {
                hasDragged.current = true; // Mark that dragging happened

                // Detect hover over page tabs
                const clientX = (e as MouseEvent).clientX || (e as TouchEvent).touches?.[0]?.clientX;
                const clientY = (e as MouseEvent).clientY || (e as TouchEvent).touches?.[0]?.clientY;
                if (clientX !== undefined && clientY !== undefined) {
                    const elements = document.elementsFromPoint(clientX, clientY);
                    const hoverTarget = elements.find(el => el.getAttribute('data-page-drop-target') === 'true');
                    const pageIndexStr = hoverTarget?.getAttribute('data-page-index');
                    const pageIndex = pageIndexStr !== null && pageIndexStr !== undefined ? parseInt(pageIndexStr, 10) : null;
                    useReportBuilderStore.getState().setHoveredPageIndex(pageIndex);
                }

                if (isDraggingGroup.current && selectedIds.length > 1) {
                    const deltaX = d.x - (dragStartPositions.current[item.id]?.x || item.x);
                    const deltaY = d.y - (dragStartPositions.current[item.id]?.y || item.y);

                    const updates: Record<string, Partial<CanvasItem>> = {};
                    selectedIds.forEach(id => {
                        if (id !== item.id && dragStartPositions.current[id]) {
                            updates[id] = {
                                x: dragStartPositions.current[id].x + deltaX,
                                y: dragStartPositions.current[id].y + deltaY
                            };
                        }
                    });

                    if (Object.keys(updates).length > 0) {
                        batchUpdateItems(updates);
                    }
                } else {
                    // console.log("Single item drag or not group leader");
                }
            }}
            onDragStop={(e, d) => {
                // Check if dropped on a page tab
                const clientX = (e as MouseEvent).clientX || (e as TouchEvent).changedTouches?.[0]?.clientX;
                const clientY = (e as MouseEvent).clientY || (e as TouchEvent).changedTouches?.[0]?.clientY;

                if (clientX !== undefined && clientY !== undefined) {
                    const elements = document.elementsFromPoint(clientX, clientY);
                    const dropTarget = elements.find(el => el.getAttribute('data-page-drop-target') === 'true');

                    if (dropTarget) {
                        const pageIndex = parseInt(dropTarget.getAttribute('data-page-index') || '-1', 10);
                        if (pageIndex >= 0) {
                            if (isSelected) {
                                // Use store action for batch move
                                useReportBuilderStore.getState().moveSelectedItemsToPage(pageIndex);
                            } else if (onMoveToPage) {
                                onMoveToPage(pageIndex);
                            }
                            // Auto switch to target page
                            useReportBuilderStore.getState().setCurrentPage(pageIndex);

                            isDraggingGroup.current = false;
                            dragStartPositions.current = {};
                            setDragging(false);
                            useReportBuilderStore.getState().setHoveredPageIndex(null);
                            return;
                        }
                    }
                }

                if (isDraggingGroup.current && selectedIds.length > 1) {
                    const deltaX = d.x - (dragStartPositions.current[item.id]?.x || item.x);
                    const deltaY = d.y - (dragStartPositions.current[item.id]?.y || item.y);

                    const updates: Record<string, Partial<CanvasItem>> = {};
                    selectedIds.forEach(id => {
                        const startPos = dragStartPositions.current[id];
                        if (startPos) {
                            updates[id] = {
                                x: id === item.id ? d.x : startPos.x + deltaX,
                                y: id === item.id ? d.y : startPos.y + deltaY
                            };
                        }
                    });
                    batchUpdateItems(updates);
                } else {
                    onUpdate({ x: d.x, y: d.y });
                }

                isDraggingGroup.current = false;
                dragStartPositions.current = {};
                setDragging(false);
                useReportBuilderStore.getState().setHoveredPageIndex(null);
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
                onUpdate({
                    width: parseInt(ref.style.width, 10),
                    height: parseInt(ref.style.height, 10),
                    x: position.x,
                    y: position.y,
                });
            }}
            minWidth={150}
            minHeight={100}
            bounds={undefined}
            onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                // Only trigger selection if not just finished dragging
                if (!hasDragged.current) {
                    onSelect(e);
                }
                hasDragged.current = false;
            }}
            className={cn(
                "bg-zinc-800/80 backdrop-blur-sm rounded-lg border-2 transition-colors overflow-hidden",
                isSelected ? "border-violet-500 shadow-lg shadow-violet-500/20" : "border-transparent hover:border-zinc-600"
            )}
            enableResizing={{
                top: true,
                right: true,
                bottom: true,
                left: true,
                topRight: true,
                bottomRight: true,
                bottomLeft: true,
                topLeft: true,
            }}
            resizeHandleStyles={{
                topRight: { cursor: 'ne-resize' },
                bottomRight: { cursor: 'se-resize' },
                bottomLeft: { cursor: 'sw-resize' },
                topLeft: { cursor: 'nw-resize' },
            }}
        >
            {/* Header */}
            <div className="h-7 bg-zinc-900/90 flex items-center justify-between px-2 cursor-move border-b border-white/5 select-none group/header">
                <div className="flex items-center gap-1.5 overflow-hidden">
                    <Move className="h-3 w-3 text-zinc-500 group-hover/header:text-violet-400" />
                    <span className="text-[10px] text-zinc-400 font-medium truncate">
                        {CHART_LABELS[item.type]}
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    {/* Scale Mode Toggles */}
                    <TooltipProvider delayDuration={0}>
                        <div className="flex items-center bg-zinc-800 rounded p-0.5 gap-0.5">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onUpdate({ scaleMode: 'crop' }); }}
                                        className={cn("p-1 rounded transition-colors", item.scaleMode === 'crop' ? "bg-violet-600 text-white" : "text-zinc-500 hover:text-white")}
                                    >
                                        <Crop className="h-3 w-3" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-xs">裁剪模式</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onUpdate({ scaleMode: 'pan' }); }}
                                        className={cn("p-1 rounded transition-colors", item.scaleMode === 'pan' ? "bg-cyan-600 text-white" : "text-zinc-500 hover:text-white")}
                                    >
                                        <Move3D className="h-3 w-3" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-xs">平移模式</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onUpdate({ scaleMode: 'fit' }); }}
                                        className={cn("p-1 rounded transition-colors", item.scaleMode === 'fit' ? "bg-emerald-600 text-white" : "text-zinc-500 hover:text-white")}
                                    >
                                        <Maximize2 className="h-3 w-3" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-xs">縮放模式</TooltipContent>
                            </Tooltip>
                        </div>
                    </TooltipProvider>

                    <span className="text-[9px] text-zinc-600 font-mono hidden sm:inline ml-1">
                        {item.width}×{item.height}
                    </span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove();
                        }}
                        className="p-1 rounded hover:bg-red-500/20 text-zinc-600 hover:text-red-400 transition-colors"
                    >
                        <Trash2 className="h-3 w-3" />
                    </button>
                </div>
            </div>

            {/* Chart Content */}
            <div
                className={cn(
                    "p-2 relative group/content",
                    item.scaleMode === 'crop' && "overflow-hidden",
                    item.scaleMode === 'pan' && "overflow-hidden cursor-grab active:cursor-grabbing", // Pan needs hidden overflow too
                    item.scaleMode === 'fit' && "overflow-hidden"
                )}
                style={{ height: 'calc(100% - 28px)' }}
                onMouseDown={handlePanStart}
                onMouseMove={handlePanMove}
                onMouseUp={handlePanEnd}
                onMouseLeave={handlePanEnd}
            >
                <div
                    style={{
                        transform: item.scaleMode === 'pan'
                            ? `translate(${item.panOffset?.x || 0}px, ${item.panOffset?.y || 0}px)`
                            : item.scaleMode === 'fit'
                                ? `scale(${item.contentScale || 1})`
                                : undefined,
                        transformOrigin: 'top left', // Scale from top left for fit to fill
                        width: item.scaleMode === 'fit' ? baseWidth : '100%', // Fixed base size for fit mode to scale from
                        height: item.scaleMode === 'fit' ? baseHeight : '100%',
                    }}
                >
                    {renderChart()}
                </div>

                {/* Overlay to catch clicks if not selected */}
                {!isSelected && !isPanning && (
                    <div
                        className="absolute inset-0 z-10 cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(e);
                        }}
                    />
                )}
            </div>
        </Rnd>
    );
}
