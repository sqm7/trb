"use client";

import React, { useMemo } from "react";
import ChartWrapper from "./ChartWrapper";
import { ApexOptions } from "apexcharts";

interface PriceBandItem {
    roomType: string;
    bathrooms: number | null;
    minPrice: number;
    q1Price: number;
    medianPrice: number;
    q3Price: number;
    maxPrice: number;
    count: number;
}

interface PriceBandChartProps {
    data: PriceBandItem[];
}

export function PriceBandChart({ data }: PriceBandChartProps) {

    const series = useMemo(() => {
        if (!data || data.length === 0) return [];

        const seriesData = data.map(item => {
            const values = [item.minPrice, item.q1Price, item.medianPrice, item.q3Price, item.maxPrice];
            // Ensure values are numbers
            if (values.some(v => typeof v !== 'number' || isNaN(v))) return null;

            return {
                x: item.bathrooms !== null ? `${item.roomType}-${item.bathrooms}衛` : item.roomType,
                y: values.map(v => Math.round(v))
            };
        }).filter(Boolean) as { x: string; y: number[] }[];

        return [{
            name: '總價分佈',
            type: 'boxPlot',
            data: seriesData
        }];
    }, [data]);

    const options: ApexOptions = useMemo(() => {
        if (series.length === 0 || series[0].data.length === 0) return {};

        const allPrices = series[0].data.flatMap((d: any) => d.y);
        const overallMin = Math.min(...allPrices);
        const overallMax = Math.max(...allPrices);
        const range = overallMax - overallMin;
        const padding = range === 0 ? Math.max(overallMin * 0.1, 100) : range * 0.1;

        return {
            chart: {
                type: 'boxPlot',
                height: 450,
                background: 'transparent',
                toolbar: { show: true },
                foreColor: '#e5e7eb'
            },
            // Removed title since ReportWrapper already provides it
            plotOptions: {
                boxPlot: {
                    colors: {
                        upper: '#06b6d4', // cyan-500
                        lower: '#8b5cf6'  // violet-500
                    },
                    stroke: {
                        colors: ['#e5e7eb'] // light gray for contrast
                    }
                }
            },
            xaxis: {
                type: 'category',
                labels: {
                    style: { colors: '#9ca3af' },
                    rotate: -45,
                    offsetY: 5
                }
            },
            yaxis: {
                min: Math.max(0, overallMin - padding),
                max: overallMax + padding,
                title: { text: '房屋總價 (萬)', style: { color: '#9ca3af' } },
                labels: {
                    formatter: (val: number) => `${Math.round(val).toLocaleString()} 萬`,
                    style: { colors: '#9ca3af' }
                }
            },
            tooltip: {
                custom: function ({ seriesIndex, dataPointIndex, w }) {
                    const yData = w.globals.initialSeries[seriesIndex].data[dataPointIndex].y;
                    if (Array.isArray(yData) && yData.length === 5) {
                        const [min, q1, median, q3, max] = yData;
                        return `
                    <div class="apexcharts-tooltip-box" style="background: #18181b; border: 1px solid #27272a; padding: 8px 12px; border-radius: 8px; color: #fff;">
                        <div><strong>最高總價:</strong> ${max.toLocaleString()} 萬</div>
                        <div><strong>3/4位總價:</strong> ${q3.toLocaleString()} 萬</div>
                        <div><strong>中位數總價:</strong> ${median.toLocaleString()} 萬</div>
                        <div><strong>1/4位總價:</strong> ${q1.toLocaleString()} 萬</div>
                        <div><strong>最低總價:</strong> ${min.toLocaleString()} 萬</div>
                    </div>
                `;
                    }
                    return '';
                }
            }
        };
    }, [series]);

    if (!data || data.length === 0 || series.length === 0) {
        return <div className="text-zinc-500 text-center p-8">無總價帶資料可顯示</div>;
    }

    return (
        <ChartWrapper
            type="boxPlot"
            series={series}
            options={options}
            height={450}
            className="w-full"
        />
    );
}
