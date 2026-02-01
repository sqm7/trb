"use client";

import React, { useMemo } from "react";
import ChartWrapper from "./ChartWrapper";
import { ApexOptions } from "apexcharts";

interface VelocityDataPoint {
    [timeKey: string]: {
        [roomType: string]: {
            count: number;
            priceSum: number;
            areaSum: number;
        }
    }
}

interface SalesVelocityChartProps {
    data: VelocityDataPoint;
    selectedRooms: string[];
    metric: 'count' | 'priceSum' | 'areaSum';
}

export function SalesVelocityChart({ data, selectedRooms, metric }: SalesVelocityChartProps) {

    const metricDetails = useMemo(() => ({
        count: { label: '交易筆數', unit: '筆', decimals: 0 },
        priceSum: { label: '產權總價', unit: '萬', decimals: 0 },
        areaSum: { label: '房屋坪數', unit: '坪', decimals: 2 }
    })[metric], [metric]);

    const series = useMemo(() => {
        if (!data || selectedRooms.length === 0) return [];

        // Sort time keys
        const timeKeys = Object.keys(data).sort();
        if (timeKeys.length === 0) return [];

        return selectedRooms.map(roomType => ({
            name: roomType,
            data: timeKeys.map(timeKey => {
                const val = data[timeKey]?.[roomType]?.[metric] || 0;
                return val;
            })
        }));
    }, [data, selectedRooms, metric]);

    const options: ApexOptions = useMemo(() => {
        const timeKeys = data ? Object.keys(data).sort() : [];

        return {
            chart: {
                type: 'line',
                height: 350,
                background: 'transparent',
                toolbar: { show: true },
                zoom: { enabled: false },
                foreColor: '#e5e7eb'
            },
            stroke: {
                curve: 'smooth',
                width: 2
            },
            dataLabels: { enabled: false },
            xaxis: {
                categories: timeKeys,
                labels: { style: { colors: '#9ca3af' } }
            },
            yaxis: {
                title: {
                    text: metricDetails.label,
                    style: { color: '#9ca3af' }
                },
                labels: {
                    style: { colors: '#9ca3af' },
                    formatter: (val: number) => val.toLocaleString('zh-TW', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    })
                }
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right'
            },
            tooltip: {
                theme: 'dark',
                y: {
                    formatter: (val: number) => `${val.toLocaleString('zh-TW', {
                        minimumFractionDigits: metricDetails.decimals,
                        maximumFractionDigits: metricDetails.decimals
                    })} ${metricDetails.unit}`
                }
            },
            grid: { borderColor: '#374151' }
        };
    }, [data, metricDetails]);

    if (!data || Object.keys(data).length === 0 || selectedRooms.length === 0) {
        return <div className="text-zinc-500 text-center p-8">請選擇房型以顯示銷售趨勢</div>;
    }

    return (
        <ChartWrapper
            type="line"
            series={series}
            options={options}
            height={350}
            className="w-full"
        />
    );
}
