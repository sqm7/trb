"use client";

import React from "react";
import { Rnd } from "react-rnd";
import { cn } from "@/lib/utils";
import { Trash2, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CanvasItem, ChartType } from "../page";

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
    'parking-pie': '車位分析',
    'heatmap': '熱力圖',
    'data-list': '數據列表',
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
                const parkingData = analysisData.parkingAnalysis?.typeDistribution || [];
                const COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981'];
                const chartOptions: ApexCharts.ApexOptions = {
                    chart: { type: 'donut', background: 'transparent' },
                    labels: parkingData.map((d: any) => d.name),
                    colors: COLORS,
                    stroke: { show: false },
                    dataLabels: { enabled: false },
                    legend: { show: false },
                    theme: { mode: 'dark' }
                };
                return (
                    <ClientChart
                        options={chartOptions}
                        series={parkingData.map((d: any) => d.value)}
                        type="donut"
                        height="100%"
                    />
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

                <div className="flex items-center gap-2">
                    <span className="text-[9px] text-zinc-600 font-mono hidden sm:inline">
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
            <div className="p-2 relative group/content" style={{ height: 'calc(100% - 28px)' }}>
                {renderChart()}

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
