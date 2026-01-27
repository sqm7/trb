"use client"; // Should be client component for ApexCharts

import React from "react";
import { ClientChart } from "@/components/charts/ClientChart"; // Using ClientChart wrapper if available or typical dynamic import

interface ParkingSlideProps {
    data: {
        parkingAnalysis?: {
            typeDistribution: Array<{ name: string; value: number }>;
            priceStats: Array<{
                type: string;
                avgPrice: number;
                minPrice: number;
                maxPrice: number;
                count: number;
            }>;
        };
    } | null;
}

const COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981'];

export function ParkingSlide({ data }: ParkingSlideProps) {
    if (!data?.parkingAnalysis) return null;

    const { typeDistribution, priceStats } = data.parkingAnalysis;

    // ApexChart Options
    const chartOptions: ApexCharts.ApexOptions = {
        chart: { type: 'donut', background: 'transparent' },
        labels: (typeDistribution || []).map(d => d.name),
        colors: COLORS,
        stroke: { show: false },
        dataLabels: { enabled: false },
        legend: { position: 'bottom', labels: { colors: '#a1a1aa' } },
        plotOptions: {
            pie: {
                donut: {
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: '總車位',
                            color: '#e4e4e7'
                        }
                    }
                }
            }
        },
        theme: { mode: 'dark' }
    };

    const chartSeries = (typeDistribution || []).map(d => d.value);

    return (
        <div className="flex gap-4 h-full p-2">

            {/* Left: Distribution Pie (40%) */}
            <div className="w-[40%] bg-zinc-900/30 rounded-xl border border-white/5 p-4 flex flex-col items-center justify-center">
                <h3 className="text-sm font-semibold text-zinc-300 mb-4 w-full text-left border-l-4 border-violet-500 pl-2">車位類型分佈</h3>
                <div className="w-full h-[300px] relative">
                    <ClientChart
                        options={chartOptions}
                        series={chartSeries}
                        type="donut"
                        height="100%"
                    />
                </div>
            </div>

            {/* Right: Price Stats Table (60%) */}
            <div className="flex-1 bg-zinc-900/30 rounded-xl border border-white/5 p-4 flex flex-col">
                <h3 className="text-sm font-semibold text-zinc-300 mb-4 border-l-4 border-cyan-500 pl-2">各類型車位行情</h3>
                <div className="flex-1 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-900 text-zinc-400 text-xs font-semibold">
                            <tr>
                                <th className="px-4 py-3">車位類型</th>
                                <th className="px-4 py-3 text-right">樣本數</th>
                                <th className="px-4 py-3 text-right text-cyan-300">平均價格</th>
                                <th className="px-4 py-3 text-right text-zinc-500">價格區間</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {(priceStats || []).map((item, idx) => (
                                <tr key={idx} className="hover:bg-zinc-800/30">
                                    <td className="px-4 py-4 font-medium text-white flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                                        {item.type}
                                    </td>
                                    <td className="px-4 py-4 text-right font-mono text-zinc-400">{item.count}</td>
                                    <td className="px-4 py-4 text-right font-mono text-white text-lg font-bold">{item.avgPrice.toLocaleString()} <span className="text-xs text-zinc-600 font-normal">萬</span></td>
                                    <td className="px-4 py-4 text-right font-mono text-zinc-500 text-xs">
                                        {item.minPrice.toLocaleString()} - {item.maxPrice.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
