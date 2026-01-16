"use client";

import React, { useMemo } from "react";
import ChartWrapper from "./ChartWrapper";
import { ApexOptions } from "apexcharts";

interface TransactionDetail {
    "房屋單價(萬)": number;
    "房屋面積(坪)": number;
    [key: string]: any;
}

interface BubbleChartProps {
    data: TransactionDetail[];
    minPrice: number;
    maxPrice: number;
    interval: number;
    sizeMetric: "count" | "area";
}

export function BubbleChart({ data, minPrice, maxPrice, interval, sizeMetric }: BubbleChartProps) {
    const { series, chartData } = useMemo(() => {
        if (!data || data.length === 0) return { series: [], chartData: [] };

        // 1. Initialize Buckets
        const buckets: any[] = [];
        for (let i = minPrice; i < maxPrice; i += interval) {
            buckets.push({
                min: i,
                max: Math.min(i + interval, maxPrice),
                label: `${i}-${Math.min(i + interval, maxPrice)}`,
                count: 0,
                totalArea: 0,
                avgPrice: 0,
                transactions: []
            });
        }

        // 2. Fill Buckets
        data.forEach(tx => {
            const unitPrice = tx["房屋單價(萬)"];
            const area = tx["房屋面積(坪)"] || 0;
            if (typeof unitPrice !== 'number' || unitPrice < minPrice || unitPrice >= maxPrice) return;

            const bucketIndex = Math.floor((unitPrice - minPrice) / interval);
            if (bucketIndex >= 0 && bucketIndex < buckets.length) {
                buckets[bucketIndex].count++;
                buckets[bucketIndex].totalArea += area;
                buckets[bucketIndex].transactions.push(tx);
            }
        });

        // 3. Filter Empty Buckets and Format for Chart
        const validBuckets = buckets.filter(b => b.count > 0);
        const maxCount = Math.max(...validBuckets.map(b => b.count));
        const maxArea = Math.max(...validBuckets.map(b => b.totalArea));

        const formattedSeries = validBuckets.map(b => {
            const midPrice = (b.min + b.max) / 2;
            const sizeValue = sizeMetric === 'count' ? b.count : b.totalArea;
            const maxSizeValue = sizeMetric === 'count' ? maxCount : maxArea;

            // Normalize bubble size (5-50)
            const bubbleSize = maxSizeValue > 0 ? 5 + (sizeValue / maxSizeValue) * 45 : 5;

            return {
                x: b.label,
                y: midPrice,
                z: bubbleSize, // z is the bubble size
                // Custom data for tooltip
                count: b.count,
                totalArea: b.totalArea,
                rangeLabel: b.label
            };
        });

        return {
            series: [{ name: "單價分佈", data: formattedSeries }],
            chartData: validBuckets
        };
    }, [data, minPrice, maxPrice, interval, sizeMetric]);

    const options: ApexOptions = useMemo(() => {
        return {
            chart: {
                type: 'bubble',
                height: 450,
                toolbar: { show: true },
                zoom: { enabled: false }
            },
            dataLabels: {
                enabled: true,
                style: { colors: ['#fff'], fontWeight: 600 },
                formatter: (_val, { seriesIndex, dataPointIndex, w }) => {
                    const d = w.config.series[seriesIndex].data[dataPointIndex];
                    return sizeMetric === 'count' ? d.count : Math.round(d.totalArea);
                }
            },
            fill: {
                opacity: 0.7,
                type: 'gradient',
                gradient: {
                    shade: 'dark',
                    type: 'diagonal1',
                    gradientToColors: ['#8b5cf6'],
                    inverseColors: false,
                    opacityFrom: 0.85,
                    opacityTo: 0.5,
                }
            },
            xaxis: {
                type: 'category',
                title: {
                    text: '單價區間 (萬/坪)',
                    style: { color: '#9ca3af' }
                },
                labels: {
                    rotate: -45,
                    style: { colors: '#9ca3af' }
                }
            },
            yaxis: {
                title: {
                    text: '平均單價點 (萬/坪)',
                    style: { color: '#9ca3af' }
                },
                labels: {
                    style: { colors: '#9ca3af' },
                    formatter: (val) => val.toFixed(0)
                },
                min: minPrice - interval,
                max: maxPrice + interval
            },
            tooltip: {
                theme: 'dark',
                custom: function ({ seriesIndex, dataPointIndex, w }) {
                    const data = w.config.series[seriesIndex].data[dataPointIndex];
                    const metricLabel = sizeMetric === 'count' ? '成交件數' : '總坪數';
                    const metricValue = sizeMetric === 'count'
                        ? data.count.toLocaleString() + ' 筆'
                        : data.totalArea.toFixed(2) + ' 坪';

                    return `
                        <div style="background: #1f2937; border: 1px solid #374151; padding: 10px; border-radius: 8px;">
                            <div style="font-weight: 600; color: #06b6d4; margin-bottom: 6px;">單價區間：${data.x} 萬/坪</div>
                            <div style="color: #e5e7eb;">成交件數：${data.count.toLocaleString()} 筆</div>
                            <div style="color: #e5e7eb;">總坪數：${data.totalArea.toFixed(2)} 坪</div>
                            <div style="color: #a855f7; margin-top: 4px; font-weight: 500;">${metricLabel}影響力：${metricValue}</div>
                        </div>
                    `;
                }
            },
            theme: {
                mode: 'dark'
            },
            grid: {
                borderColor: '#374151'
            }
        };
    }, [minPrice, maxPrice, interval, sizeMetric]);

    if (!data || data.length === 0) {
        return <div className="text-zinc-500 text-center p-8">無交易資料可顯示</div>;
    }

    return (
        <ChartWrapper
            type="bubble"
            series={series}
            options={options}
            height={450}
            className="w-full"
        />
    );
}
