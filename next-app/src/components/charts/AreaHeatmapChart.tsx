"use client";

import React, { useMemo } from "react";
import ChartWrapper from "./ChartWrapper";
import { ApexOptions } from "apexcharts";

interface AreaHeatmapChartProps {
    data: Record<string, number[]>; // roomType -> array of areas
    selectedRooms: string[];
    minArea: number;
    maxArea: number;
    interval: number;
    onDataPointClick?: (roomType: string, areaRange: string) => void;
}

export function AreaHeatmapChart({ data, selectedRooms, minArea, maxArea, interval, onDataPointClick }: AreaHeatmapChartProps) {

    // Helper to generate color ranges
    const colorRanges = useMemo(() => {
        // Calculate max value first (need series to know counts) but for color scale we can approximate or do 2-pass
        // Logic from legacy chart.js
        const palette = ['#fef9c3', '#fef08a', '#fde047', '#facc15', '#fbbf24', '#f97316', '#ea580c', '#dc2626', '#b91c1c'];
        // Hardcoded ranges or dynamic? Legacy was dynamic based on maxValue.
        // For simplicity allow ApexCharts handle heatmap colors natively? 
        // Or re-implement dynamic logic. Let's use simpler ranges for now or copy logic.
        return [
            { from: 0, to: 0, color: '#27272a', name: '0 戶' }, // zinc-800 for 0
            { from: 1, to: 5, color: '#facc15', name: '1-5 戶' },
            { from: 6, to: 20, color: '#fbbf24', name: '6-20 戶' },
            { from: 21, to: 50, color: '#f97316', name: '21-50 戶' },
            { from: 51, to: 10000, color: '#dc2626', name: '> 50 戶' }
        ];
    }, []);

    const { series, maxValue } = useMemo(() => {
        if (!data || selectedRooms.length === 0) return { series: [], maxValue: 0 };

        const yCategories: string[] = [];
        for (let i = minArea; i < maxArea; i += interval) {
            yCategories.push(`${i.toFixed(1)}-${(i + interval).toFixed(1)}`);
        }

        let max = 0;
        const seriesData = yCategories.map(category => {
            const [lower, upper] = category.split('-').map(parseFloat);
            const dataPoints = selectedRooms.map(roomType => {
                const areas = data[roomType] || [];
                const count = areas.filter(a => a >= lower && a < upper && a >= minArea && a <= maxArea).length;
                if (count > max) max = count;
                return count;
            });
            return {
                name: category,
                data: dataPoints
            };
        });

        return { series: seriesData, maxValue: max };
    }, [data, selectedRooms, minArea, maxArea, interval]);

    const options: ApexOptions = useMemo(() => {
        // Dynamic height
        const height = Math.max(400, series.length * 22);

        return {
            chart: {
                type: 'heatmap',
                height: height,
                background: 'transparent',
                toolbar: { show: true },
                foreColor: '#e5e7eb',
                events: {
                    dataPointSelection: (event, chartContext, config) => {
                        if (onDataPointClick) {
                            const { seriesIndex, dataPointIndex } = config;
                            const areaRange = config.w.globals.seriesNames[seriesIndex];
                            const roomType = selectedRooms[dataPointIndex];
                            onDataPointClick(roomType, areaRange);
                        }
                    }
                }
            },
            plotOptions: {
                heatmap: {
                    radius: 0,
                    useFillColorAsStroke: true,
                    enableShades: false,
                    colorScale: {
                        ranges: colorRanges
                    }
                }
            },
            dataLabels: {
                enabled: true,
                style: {
                    colors: [({ value }: any) => value === 0 ? 'transparent' : '#e5e7eb']
                }
            },
            xaxis: {
                type: 'category',
                categories: selectedRooms,
            },
            title: {
                text: '房型面積分佈熱力圖',
                align: 'center',
                style: { color: '#e5e7eb', fontSize: '16px' }
            },
            grid: { borderColor: '#374151' },
            tooltip: {
                theme: 'dark',
                y: {
                    formatter: (val: number) => val === 0 ? '無成交紀錄' : `${val} 戶`
                }
            }
        };
    }, [series, selectedRooms, colorRanges, onDataPointClick]);

    if (!data || series.length === 0) {
        return <div className="text-zinc-500 text-center p-8">無面積分佈資料</div>;
    }

    return (
        <ChartWrapper
            type="heatmap"
            series={series}
            options={options}
            height={options.chart?.height || 400}
            className="w-full"
        />
    );
}
