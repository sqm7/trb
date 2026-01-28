"use client";

import React from "react";
import { Rnd } from "react-rnd";
import { cn } from "@/lib/utils";
import { Trash2, Move, Grid3X3, Table2, Info, Activity, Layers, Crop, Move3D, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CanvasItem, ChartType } from "../page";
import type { ScaleMode } from "@/store/useReportBuilderStore";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

// Chart Components (we'll render these dynamically)
import { RankingChart } from "@/components/charts/RankingChart";
import { PriceBandChart } from "@/components/charts/PriceBandChart";
import { BubbleChart } from "@/components/charts/BubbleChart";
import { SalesVelocityChart } from "@/components/charts/SalesVelocityChart";
import { ClientChart } from "@/components/charts/ClientChart";

interface DraggableChartProps {
    item: CanvasItem;
    isSelected: boolean;
    onSelect: () => void;
    onUpdate: (updates: Partial<CanvasItem>) => void;
    onRemove: () => void;
    analysisData: any;
}

const CHART_LABELS: Record<ChartType, string> = {
    'ranking-chart': '建案排名',
    'price-band-chart': '總價帶分析',
    'unit-price-bubble': '單價泡泡圖',
    'sales-velocity-chart': '銷售速度',
    'parking-pie': '車位配比',
    'parking-price': '車位類型均價',
    'parking-scatter': '車位坪數分析',
    'parking-floor': '車位樓層分析',
    'heatmap': '銷控熱力圖',
    'data-list': '交易明細表',
};

export function DraggableChart({ item, isSelected, onSelect, onUpdate, onRemove, analysisData }: DraggableChartProps) {
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
            case 'ranking-chart':
                const rankingData = analysisData.rankingAnalysis?.projectRanking || [];
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
                return <PriceBandChart data={priceBandData} />;

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

    return (
        <Rnd
            size={{ width: item.width, height: item.height }}
            position={{ x: item.x, y: item.y }}
            onDragStop={(e, d) => {
                onUpdate({ x: d.x, y: d.y });
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
            bounds="parent"
            onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onSelect();
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
                    item.scaleMode === 'pan' && "overflow-auto cursor-grab active:cursor-grabbing",
                    item.scaleMode === 'fit' && "overflow-hidden"
                )}
                style={{ height: 'calc(100% - 28px)' }}
            >
                <div
                    style={{
                        transform: item.scaleMode === 'pan'
                            ? `translate(${item.panOffset?.x || 0}px, ${item.panOffset?.y || 0}px)`
                            : item.scaleMode === 'fit'
                                ? `scale(${item.contentScale || 1})`
                                : undefined,
                        transformOrigin: 'center center',
                        height: '100%',
                        width: '100%',
                    }}
                >
                    {renderChart()}
                </div>

                {/* Overlay to catch clicks if not selected */}
                {!isSelected && (
                    <div
                        className="absolute inset-0 z-10 cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect();
                        }}
                    />
                )}
            </div>
        </Rnd>
    );
}
