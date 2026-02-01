'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { ApexOptions } from 'apexcharts';

// Dynamically import ReactApexChart to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ChartWrapperProps {
    type: 'line' | 'area' | 'bar' | 'pie' | 'donut' | 'radar' | 'scatter' | 'bubble' | 'heatmap' | 'candlestick' | 'boxPlot' | 'treemap' | 'polarArea' | 'rangeBar' | 'rangeArea' | 'radialBar';
    series: ApexAxisChartSeries | ApexNonAxisChartSeries;
    options: ApexOptions;
    height?: number | string;
    title?: string;
    description?: string;
    className?: string;
    loading?: boolean;
}

export default function ChartWrapper({ type, series, options, height = 350, title, description, className, loading }: ChartWrapperProps) {

    // Default Dark Theme Options
    const defaultOptions: ApexOptions = {
        chart: {
            background: 'transparent',
            toolbar: {
                show: false
            }
        },
        theme: {
            mode: 'dark',
            palette: 'palette1'
        },
        dataLabels: {
            enabled: false
        },
        grid: {
            borderColor: '#374151', // border-default
            strokeDashArray: 4,
        },
        xaxis: {
            labels: {
                style: {
                    colors: '#9ca3af' // text-dark
                }
            },
            axisBorder: {
                color: '#4b5563'
            },
            axisTicks: {
                color: '#4b5563'
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#9ca3af'
                }
            }
        },
        tooltip: {
            theme: 'dark',
            style: {
                fontSize: '12px'
            },
            x: {
                show: true
            }
        }
    };

    // Deep merge logic would be better, but basic spread is fine for now
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        chart: {
            ...defaultOptions.chart,
            ...options.chart
        }
    };

    return (
        <Card className={`p-4 ${className}`}>
            {(title || description) && (
                <div className="mb-4">
                    {title && <h3 className="text-lg font-bold text-white mb-1">{title}</h3>}
                    {description && <p className="text-sm text-gray-400">{description}</p>}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center" style={{ height }}>
                    <div className="loader"></div>
                </div>
            ) : (
                <Chart options={mergedOptions} series={series} type={type} height={height} width="100%" />
            )}
        </Card>
    );
}
