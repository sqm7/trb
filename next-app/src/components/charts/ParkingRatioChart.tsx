"use client";

import React, { useMemo } from "react";
import ChartWrapper from "./ChartWrapper";
import { ApexOptions } from "apexcharts";

interface ParkingData {
    withParking: { count: number; percentage: number };
    withoutParking: { count: number; percentage: number };
}

interface ParkingRatioChartProps {
    data: ParkingData;
}

export function ParkingRatioChart({ data }: ParkingRatioChartProps) {
    const series = useMemo(() => {
        if (!data) return [];
        return [data.withParking.count, data.withoutParking.count];
    }, [data]);

    const options: ApexOptions = useMemo(() => {
        return {
            chart: {
                type: 'donut',
                background: 'transparent',
                foreColor: '#e5e7eb'
            },
            labels: ['含車位', '無車位'],
            colors: ['#a5b4fc', '#4b5563'], // indigo-300, gray-600
            plotOptions: {
                pie: {
                    donut: {
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: '總交易',
                                color: '#e5e7eb',
                                formatter: (w) => {
                                    return w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toLocaleString() + ' 筆';
                                }
                            }
                        }
                    }
                }
            },
            dataLabels: {
                enabled: true,
                formatter: (val: number) => `${val.toFixed(1)}%`
            },
            legend: {
                show: false
            },
            tooltip: {
                theme: 'dark',
                y: {
                    formatter: (val: number) => `${val} 筆`
                }
            },
            stroke: { show: false },
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: {
                        width: 300
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }]
        };
    }, []);

    if (!data || (data.withParking.count === 0 && data.withoutParking.count === 0)) {
        return <div className="text-zinc-500 text-center p-8">無車位配比資料</div>;
    }

    return (
        <ChartWrapper
            type="donut"
            series={series}
            options={options}
            height={350}
            className="w-full"
        />
    );
}
