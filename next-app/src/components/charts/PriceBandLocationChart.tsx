"use client";

import React, { useMemo } from "react";
import ChartWrapper from "./ChartWrapper";
import { ApexOptions } from "apexcharts";
import { cn } from "@/lib/utils";

interface PriceBandLocationChartProps {
    roomTypes: string[];
    locations: string[];
    crossTable: Record<string, Record<string, number>>;
    dimension: 'district' | 'county';
}

export function PriceBandLocationChart({ roomTypes, locations, crossTable, dimension }: PriceBandLocationChartProps) {

    const series = useMemo(() => {
        if (!roomTypes || !locations || !crossTable) return [];

        return roomTypes.map(roomType => {
            const data = locations.map(loc => (crossTable[roomType] && crossTable[roomType][loc]) || 0);
            return {
                name: roomType,
                data: data
            };
        });
    }, [roomTypes, locations, crossTable]);

    const options: ApexOptions = useMemo(() => {
        const dimensionLabel = dimension === 'county' ? '縣市' : '行政區';
        const height = Math.max(350, locations.length * 35);

        return {
            chart: {
                type: 'bar',
                height: height,
                stacked: true,
                background: 'transparent',
                toolbar: { show: true },
                foreColor: '#e5e7eb',
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    barHeight: '70%',
                    borderRadius: 4,
                    dataLabels: {
                        total: {
                            enabled: true,
                            offsetX: 5,
                            style: {
                                fontSize: '11px',
                                fontWeight: 600,
                                color: '#e5e7eb'
                            },
                            formatter: function (val: any, opts: any) {
                                // Calculate absolute total for this bar
                                const seriesData = opts.w.config.series;
                                const dataPointIndex = opts.dataPointIndex;
                                let total = 0;
                                seriesData.forEach((s: any) => {
                                    total += s.data[dataPointIndex] || 0;
                                });
                                return total > 0 ? total.toString() : '';
                            }
                        }
                    }
                }
            },
            // Consistent colors with other charts
            colors: ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#84cc16', '#6366f1', '#14b8a6'],
            dataLabels: {
                enabled: false
            },
            xaxis: {
                categories: locations,
                title: {
                    text: '成交筆數',
                    style: { color: '#9ca3af' }
                },
                labels: {
                    style: { colors: '#9ca3af' }
                }
            },
            yaxis: {
                title: {
                    text: dimensionLabel,
                    style: { color: '#9ca3af' }
                },
                labels: {
                    style: { colors: '#e5e7eb' },
                    maxWidth: 150
                }
            },
            legend: {
                position: 'top',
                horizontalAlign: 'center',
                labels: {
                    colors: '#e5e7eb'
                }
            },
            tooltip: {
                theme: 'dark',
                y: {
                    formatter: function (val) {
                        return val + ' 筆';
                    }
                }
            },
            grid: {
                borderColor: '#374151'
            },
            title: {
                text: `各${dimensionLabel}房型成交筆數分佈`,
                align: 'center',
                style: { fontSize: '16px', color: '#e5e7eb' }
            }
        };
    }, [locations, dimension]);

    if (!series || series.length === 0) {
        return <div className="text-zinc-500 text-center p-8">無區域分佈資料</div>;
    }

    return (
        <ChartWrapper
            type="bar"
            series={series}
            options={options}
            height={options.chart?.height || 350}
            className="w-full"
        />
    );
}
