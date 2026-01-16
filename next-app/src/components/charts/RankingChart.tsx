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
}

export function RankingChart({ data, sortKey }: RankingChartProps) {
    const chartType = useMemo(() => {
        const barChartKeys = [
            "averagePrice",
            "minPrice",
            "maxPrice",
            "medianPrice",
            "avgParkingPrice",
        ];
        return barChartKeys.includes(sortKey) ? "bar" : "treemap";
    }, [sortKey]);

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

        if (chartType === "bar") {
            // Filter and sort for Bar Chart
            const sortedData = [...data]
                .filter(p => p[sortKey] > 0)
                .sort((a, b) => a[sortKey] - b[sortKey])
                .slice(-30);

            return [{
                name: chartConfig.unit,
                data: sortedData.map(p => ({
                    x: p.projectName,
                    y: parseFloat((p[sortKey] || 0).toFixed(2))
                }))
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
    }, [data, sortKey, chartType, chartConfig]);

    const options: ApexOptions = useMemo(() => {
        const baseOptions: ApexOptions = {
            title: {
                text: chartConfig.title,
                align: "center",
                style: { fontSize: "16px", fontWeight: 600, color: "#e5e7eb" },
            },
            tooltip: {
                theme: "dark",
                y: {
                    formatter: (val: number) => `${val.toLocaleString()} ${chartConfig.unit}`
                }
            }
        };

        if (chartType === "bar") {
            const dataLength = series[0]?.data.length || 0;
            const calculatedHeight = Math.max(400, dataLength * 32);

            return {
                ...baseOptions,
                chart: {
                    type: 'bar',
                    height: calculatedHeight,
                    toolbar: { show: true },
                    animations: { enabled: false }
                },
                plotOptions: {
                    bar: {
                        horizontal: true,
                        barHeight: "70%",
                        borderRadius: 6,
                        distributed: true,
                    },
                },
                dataLabels: {
                    enabled: true,
                    textAnchor: "start",
                    offsetX: 0,
                    formatter: (val: number) => val.toLocaleString(),
                    style: { colors: ["#fff"] }
                },
                xaxis: {
                    // categories handles by x in series data
                    labels: { style: { colors: "#9ca3af" } }
                },
                yaxis: {
                    labels: {
                        maxWidth: 200,
                        style: { colors: "#e5e7eb", fontSize: "12px", fontWeight: 500 }
                    }
                },
                legend: { show: false }
            };
        } else {
            // Treemap options
            const totalValue = data.reduce((sum, p) => sum + (p[sortKey] || 0), 0);

            return {
                ...baseOptions,
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
                                { from: 0, to: totalValue * 0.1, color: '#06b6d4' }, // cyan
                                { from: totalValue * 0.1, to: totalValue * 0.3, color: '#3b82f6' }, // blue
                                { from: totalValue * 0.3, to: totalValue * 0.6, color: '#8b5cf6' }, // violet
                                { from: totalValue * 0.6, to: Infinity, color: '#d946ef' } // fuchsia
                            ]
                        }
                    }
                },
                dataLabels: {
                    enabled: true,
                    style: {
                        fontSize: '11px',
                        fontWeight: 500,
                        colors: ['#fff']
                    },
                    formatter: function (text: string, op: any) {
                        // Show project name in each treemap cell
                        return text;
                    },
                    offsetY: -2
                },
                tooltip: {
                    ...baseOptions.tooltip,
                    y: {
                        formatter: (value: number) => {
                            const percentage = totalValue > 0 ? ((value / totalValue) * 100).toFixed(2) : 0;
                            return `${value.toLocaleString()} ${chartConfig.unit} (${percentage}%)`;
                        }
                    }
                }
            };
        }
    }, [chartType, series, chartConfig, data, sortKey]);

    if (!data || data.length === 0) {
        return <div className="text-zinc-500 text-center p-8">無排名資料可顯示</div>;
    }

    return (
        <ChartWrapper
            type={chartType === 'bar' ? 'bar' : 'treemap'}
            series={series}
            options={options}
            height={chartType === 'bar' ? (options.chart?.height || 400) : 450}
            className="w-full"
        />
    );
}
