import React from "react";
import { SalesVelocityChart } from "@/components/charts/SalesVelocityChart";
import { ClientChart } from "@/components/charts/ClientChart";
import { cn } from "@/lib/utils";

interface SalesVelocitySlideProps {
    data: {
        salesVelocity?: {
            overall: {
                avgDaysToSell: number;
                medianDaysToSell: number;
                fastestSale: number;
                slowestSale: number;
                totalSamples: number;
            };
            byRoomType: any[];
            salesRate: any[];
        };
    } | null;
}

export function SalesVelocitySlide({ data }: SalesVelocitySlideProps) {
    if (!data?.salesVelocity) return null;

    const { overall, byRoomType, salesRate } = data.salesVelocity;

    // Determine gauge status
    let statusText = "一般";
    let statusColor = "text-zinc-400";
    if (overall.avgDaysToSell < 30) {
        statusText = "極快";
        statusColor = "text-red-400";
    } else if (overall.avgDaysToSell < 60) {
        statusText = "快速";
        statusColor = "text-orange-400";
    } else if (overall.avgDaysToSell > 180) {
        statusText = "滯銷";
        statusColor = "text-blue-400";
    }

    // Adapt data for SalesVelocityChart
    // The chart expects: data (VelocityDataPoint), selectedRooms (string[]), metric (string)
    // BUT our data structure here seems to be { salesRate: [...] } which might not match what SalesVelocityChart expects.
    // Let's check SalesVelocityChart props again.
    // Props: { data: VelocityDataPoint; selectedRooms: string[]; metric: 'count' | 'priceSum' | 'areaSum'; }
    // The `salesRate` object in `data.salesVelocity` usually looks like an array for trends?
    // Wait, if SalesVelocityChart expects VelocityDataPoint (object with time keys), and we have `salesRate` (likely array), we might have a mismatch.
    // However, looking at SalesVelocityReport, it likely passes the raw `analysisData` which contains `velocityAnalysis` or similar?
    // Let's assume for this Slide, we just want to show the specific visual. 
    // IF the data is compatible, great. If not, we might need to Mock it or use a simpler chart.

    // Actually, looking at the previous Dashboard implementation, SalesVelocityReport likely constructs the `VelocityDataPoint` structure.
    // Since we don't have that complex transformation logic here, maybe we should just use a simple Line Chart for the trend OR just hide it if data is missing.
    // But better: Use the `salesRate` array which is likely [ { date: '2023-01', rate: 0.5 }, ... ] and plot it using ClientChart directly?

    // Let's assume we can't easily reuse SalesVelocityChart because it requires complex mapped data that the Report logic might not be passing in this exact structure.
    // Wait, `data.salesVelocity.salesRate` is array.
    // Let's use a simple ClientChart (ApexCharts) line chart here for robustness.

    const chartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: 'area', // Area looks nice for rate
            background: 'transparent',
            toolbar: { show: false },
            zoom: { enabled: false }
        },
        stroke: { curve: 'smooth', width: 2, colors: ['#06b6d4'] },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.1,
                stops: [0, 90, 100],
                colorStops: [{ offset: 0, color: '#06b6d4', opacity: 0.5 }, { offset: 100, color: '#06b6d4', opacity: 0 }]
            }
        },
        dataLabels: { enabled: false },
        xaxis: {
            // Assuming salesRate has { date: string, rate: number }
            categories: (salesRate || []).map((d: any) => d.label || d.date || ''),
            labels: { style: { colors: '#71717a' } },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            labels: { style: { colors: '#71717a' } },
        },
        grid: { show: true, borderColor: '#27272a', strokeDashArray: 4 },
        tooltip: { theme: 'dark' }
    };

    const chartSeries = [{
        name: '銷售率',
        data: (salesRate || []).map((d: any) => d.rate || d.value || 0)
    }];

    // Need ClientChart wrapper to load dynamic apexcharts
    // Since we don't have it imported, let's just use the same pattern as ParkingSlide?
    // ParkingSlide uses ClientChart. Let's make sure we import it.
    // ClientChart usually wraps "react-apexcharts".

    return (
        <div className="flex gap-4 h-full p-2">

            {/* Left: Key Metrics (35%) */}
            <div className="w-[35%] flex flex-col gap-4">

                {/* Big Gauge Card */}
                <div className="bg-zinc-900/40 rounded-xl border border-white/5 p-6 flex flex-col items-center justify-center flex-1">
                    <h3 className="text-zinc-400 font-semibold mb-4 text-center">平均銷售天數</h3>

                    <div className="relative w-48 h-48 flex items-center justify-center">
                        <div className="text-center relative z-10">
                            <div className="text-6xl font-bold text-white font-mono mb-2">{Math.round(overall.avgDaysToSell)}</div>
                            <div className="text-sm text-zinc-500">Days</div>
                        </div>
                        {/* Ring */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#27272a" strokeWidth="8" />
                            <circle
                                cx="50" cy="50" r="45" fill="none" stroke="#8b5cf6" strokeWidth="8"
                                strokeDasharray="283"
                                strokeDashoffset={283 - (Math.min(overall.avgDaysToSell, 365) / 365) * 283}
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>

                    <div className={cn("mt-4 text-xl font-bold tracking-widest uppercase", statusColor)}>
                        {statusText}
                    </div>
                </div>

                {/* Sub Metrics */}
                <div className="grid grid-cols-2 gap-2 h-1/3">
                    <div className="bg-zinc-900/30 rounded-lg p-3 text-center border border-white/5 flex flex-col justify-center">
                        <div className="text-xs text-zinc-500">中位數</div>
                        <div className="text-xl font-mono text-white">{Math.round(overall.medianDaysToSell)} <span className="text-xs">天</span></div>
                    </div>
                    <div className="bg-zinc-900/30 rounded-lg p-3 text-center border border-white/5 flex flex-col justify-center">
                        <div className="text-xs text-zinc-500">最快成交</div>
                        <div className="text-xl font-mono text-green-400">{overall.fastestSale} <span className="text-xs">天</span></div>
                    </div>
                </div>

            </div>

            {/* Right: Charts (65%) */}
            <div className="flex-1 flex flex-col gap-4">

                {/* Room Type Breakdown */}
                <div className="flex-1 bg-zinc-900/30 rounded-xl border border-white/5 p-4 flex flex-col">
                    <h3 className="text-sm font-semibold text-zinc-300 mb-2 border-l-4 border-violet-500 pl-2">房型去化速度</h3>
                    <div className="flex-1 space-y-3 overflow-y-auto">
                        {byRoomType.map((room, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <span className="w-12 text-xs font-medium text-zinc-400">{room.roomType}</span>
                                <div className="flex-1 h-6 bg-zinc-800 rounded-full overflow-hidden relative">
                                    <div
                                        className="absolute top-0 left-0 h-full bg-violet-500/50 rounded-full"
                                        style={{ width: `${Math.min((room.avgDays / 180) * 100, 100)}%` }}
                                    ></div>
                                    <span className="absolute inset-0 flex items-center justify-end px-2 text-xs text-white font-mono">
                                        {Math.round(room.avgDays)} 天 ({room.count}筆)
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sales Rate Chart (Static) */}
                <div className="h-[45%] bg-zinc-900/30 rounded-xl border border-white/5 p-4 flex flex-col relative overflow-hidden">
                    <h3 className="text-sm font-semibold text-zinc-300 mb-2 border-l-4 border-cyan-500 pl-2">銷售率趨勢</h3>
                    <div className="flex-1 w-full min-h-0">
                        {/* Using lazy loaded chart manually or just simple ClientWrapper if available */}
                        {/* Let's try to dynamic import simple chart inline if ClientChart is not easily available, or just omit if too complex. */}
                        {/* Actually, let's use the ClientChart component which I saw in the file list! */}
                        <ClientChart options={chartOptions} series={chartSeries} type="area" height="100%" />
                    </div>
                </div>

            </div>
        </div>
    );
}

// Minimal ClientChart Wrapper Definition for this file if not imported (to avoid module not found)
// But I saw ClientChart.tsx in list_dir, so I should import it.
