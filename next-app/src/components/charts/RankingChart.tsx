"use client";

import React, { useMemo } from "react";
import ChartWrapper from "./ChartWrapper";
import { ApexOptions } from "apexcharts";

interface ProjectRankingItem {
    projectName: string;
    [key: string]: any;
}

interface RankingChartProps {
    data: ProjectRankingItem[];
    sortKey: string;
    limit?: number;
    chartType?: 'auto' | 'bar' | 'treemap';
    height?: number | string;
}

export function RankingChart({ data, sortKey, limit = 30, chartType = 'auto', height }: RankingChartProps) {
    const activeChartType = useMemo(() => {
        if (chartType && chartType !== 'auto') return chartType;

        const barChartKeys = [
            "averagePrice",
            "minPrice",
            "maxPrice",
            "medianPrice",
            "avgParkingPrice",
        ];
        return barChartKeys.includes(sortKey) ? "bar" : "treemap";
    }, [sortKey, chartType]);

    const chartConfig = useMemo(() => {
        const keyDetails: Record<string, { title: string; unit: string; yLabel?: string }> = {
            averagePrice: { title: "建案平均單價排行", unit: "萬/坪" },
            minPrice: { title: "建案最低單價排行", unit: "萬/坪" },
            maxPrice: { title: "建案最高單價排行", unit: "萬/坪" },
            medianPrice: { title: "建案單價中位數排行", unit: "萬/坪" },
            avgParkingPrice: { title: "車位平均單價排行", unit: "萬" },
            saleAmountSum: { title: "建案銷售總額佔比", unit: "萬", yLabel: "銷售總額" },
            houseAreaSum: { title: "建案房屋面積佔比", unit: "坪", yLabel: "房屋面積" },
            transactionCount: { title: "建案交易筆數佔比", unit: "筆", yLabel: "資料筆數" },
        };
        return (
            keyDetails[sortKey] || {
                title: "建案分析圖表",
                unit: "",
                yLabel: "數值",
            }
        );
    }, [sortKey]);

    const series = useMemo(() => {
        if (!data || data.length === 0) return [];

        if (activeChartType === "bar") {
            // Filter and sort for Bar Chart
            // Sync with Table: Sort Descending (Largest First) and take Top N
            const sortedData = [...data]
                .filter(p => p[sortKey] > 0)
                .sort((a, b) => b[sortKey] - a[sortKey]) // Descending
                .slice(0, limit);

            return [{
                name: chartConfig.unit,
                data: sortedData.map(p => parseFloat((p[sortKey] || 0).toFixed(2)))
            }];
        } else {
            // Treemap
            const totalValue = data.reduce((sum, p) => sum + (p[sortKey] || 0), 0);
            return [{
                name: chartConfig.yLabel || chartConfig.unit,
                data: data.map(p => ({
                    x: p.projectName,
                    y: parseFloat((p[sortKey] || 0).toFixed(2))
                }))
            }];
        }
    }, [data, sortKey, activeChartType, chartConfig, limit]);

    const options: ApexOptions = useMemo(() => {
        // Shared options
        const baseOptions: ApexOptions = {
            title: {
                text: chartConfig.title,
                align: "center",
                style: { fontSize: "16px", fontWeight: 600, color: "#e5e7eb" },
            },
            // Tooltip will be defined per chart type to ensure access to correct categories
        };

        if (activeChartType === "bar") {
            const sortedData = [...data]
                .filter(p => p[sortKey] > 0)
                .sort((a, b) => b[sortKey] - a[sortKey]) // Descending
                .slice(0, limit);

            const categories = sortedData.map(p => p.projectName);

            return {
                ...baseOptions,
                chart: {
                    type: 'bar',
                    toolbar: { show: true },
                    animations: { enabled: false }
                },
                tooltip: {
                    theme: "dark",
                    y: {
                        formatter: (val: number) => `${val.toLocaleString()} ${chartConfig.unit}`,
                        title: {
                            formatter: (seriesName: string, opts?: any) => {
                                const label = categories[opts?.dataPointIndex];
                                return label ? `${label}:` : `${seriesName}:`;
                            }
                        }
                    },
                    x: {
                        show: true,
                        formatter: (val: any, opts?: any) => {
                            // Use dataPointIndex to lookup category to guarantee correct name
                            // val might be index if ApexCharts decides so in some modes
                            const label = categories[opts?.dataPointIndex];
                            return label || val;
                        }
                    }
                },
                plotOptions: {
                    bar: {
                        horizontal: false, // Vertical Column Chart
                        columnWidth: "60%",
                        borderRadius: 4,
                        distributed: false,
                    },
                },
                colors: ["#8b5cf6"], // Single premium violet
                fill: {
                    type: "gradient",
                    gradient: {
                        shade: 'dark',
                        type: "vertical", // Vertical gradient for columns
                        shadeIntensity: 0.5,
                        gradientToColors: ["#a78bfa"],
                        inverseColors: true,
                        opacityFrom: 1,
                        opacityTo: 1,
                        stops: [0, 100]
                    }
                },
                dataLabels: {
                    enabled: false, // Hide data labels for cleaner look in dense column charts
                },
                xaxis: {
                    categories: categories,
                    labels: {
                        style: { colors: "#9ca3af" },
                        rotate: -45, // Rotate labels for better readability
                        trim: true,
                        maxHeight: 100
                    }
                },
                yaxis: {
                    title: {
                        text: chartConfig.unit,
                        style: { color: "#6b7280" }
                    },
                    labels: {
                        style: { colors: "#e5e7eb", fontSize: "12px", fontWeight: 500 }
                    }
                },
                legend: { show: false }
            };
        } else {
            // Treemap options (Unchanged logic, just ensure fits return type)
            const totalValue = data.reduce((sum, p) => sum + (p[sortKey] || 0), 0);

            return {
                ...baseOptions,
                tooltip: {
                    theme: "dark",
                    y: {
                        formatter: (val: number) => `${val.toLocaleString()} ${chartConfig.unit}`
                    }
                },
                chart: {
                    type: 'treemap',
                    height: 450,
                    toolbar: { show: true }
                },
                plotOptions: {
                    treemap: {
                        distributed: true,
                        enableShades: false,
                        colorScale: {
                            ranges: [
                                { from: 0, to: totalValue * 0.1, color: '#06b6d4' },
                                { from: totalValue * 0.1, to: totalValue * 0.3, color: '#3b82f6' },
                                { from: totalValue * 0.3, to: totalValue * 0.6, color: '#8b5cf6' },
                                { from: totalValue * 0.6, to: Infinity, color: '#d946ef' }
                            ]
                        }
                    }
                },
                dataLabels: {
                    enabled: true,
                    style: { fontSize: '11px', fontWeight: 500, colors: ['#fff'] },
                    formatter: (text: string) => text,
                    offsetY: -2
                },
            };
        }
    }, [activeChartType, series, chartConfig, data, sortKey, limit]);

    if (!data || data.length === 0) {
        return <div className="text-zinc-500 text-center p-8">無排名資料可顯示</div>;
    }

    // Dynamic Width Calculation for Scrolling
    const dataCount = (activeChartType === 'bar' && series[0]?.data) ? series[0].data.length : 0;

    // Logic: 
    // If dataCount is small (e.g. < 20), use 100% width to fill the container naturally.
    // If dataCount is large, ensure each bar has at least minWidthPerBar (e.g. 40px) to prevent squeezing, enabling scroll.
    const minWidthPerBar = 45;
    const calculatedMinTotalWidth = dataCount * minWidthPerBar;

    // We use a style that sets width to 100%, but min-width to the calculated value.
    // This allows it to expand to 100% if the container is larger (Top 10), but force scroll if container is smaller than content.
    const containerStyle = activeChartType === 'bar'
        ? { width: '100%', minWidth: `${calculatedMinTotalWidth}px` }
        : { width: '100%' };

    return (
        <div className={`w-full ${activeChartType === 'bar' ? 'overflow-x-auto pb-4' : ''}`}>
            <div style={containerStyle}>
                <ChartWrapper
                    type={activeChartType === 'bar' ? 'bar' : 'treemap'}
                    series={series}
                    options={options}
                    height={height || 450}
                    className="w-full"
                />
            </div>
        </div>
    );
}
