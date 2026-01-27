import React from "react";
import { BubbleChart } from "@/components/charts/BubbleChart";
import { cn } from "@/lib/utils";

interface UnitPriceStats {
    count: number;
    averagePrice: number; // weighted
    arithmeticMean: number;
    medianPrice: number;
    minPrice: number;
    maxPrice: number;
    stdDev: number;
    [key: string]: any;
}

interface UnitPriceSlideProps {
    data: {
        transactionDetails?: any[];
        unitPriceAnalysis?: {
            residentialStats?: UnitPriceStats;
            officeStats?: UnitPriceStats;
            storeStats?: UnitPriceStats;
            typeComparison?: any[];
        };
    } | null;
}

const StatCard = ({ title, stats, colorClass }: { title: string, stats?: UnitPriceStats, colorClass: string }) => {
    if (!stats || stats.count === 0) return null;

    return (
        <div className={cn("bg-zinc-900/40 rounded-xl border p-4 flex flex-col gap-3", colorClass)}>
            <h4 className="text-sm font-semibold text-zinc-300">{title}</h4>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <div className="text-xs text-zinc-500 mb-0.5">平均單價</div>
                    <div className="text-2xl font-bold text-white font-mono">{(stats?.averagePrice || 0).toFixed(1)} <span className="text-xs text-zinc-500">萬/坪</span></div>
                </div>
                <div>
                    <div className="text-xs text-zinc-500 mb-0.5">交易筆數</div>
                    <div className="text-xl font-medium text-zinc-200 font-mono">{stats.count}</div>
                </div>
                <div>
                    <div className="text-xs text-zinc-500 mb-0.5">價格區間</div>
                    <div className="text-sm text-zinc-300 font-mono">{(stats?.minPrice || 0).toFixed(1)} ~ {(stats?.maxPrice || 0).toFixed(1)}</div>
                </div>
                <div>
                    <div className="text-xs text-zinc-500 mb-0.5">中位數</div>
                    <div className="text-sm text-zinc-300 font-mono">{(stats?.medianPrice || 0).toFixed(1)}</div>
                </div>
            </div>
        </div>
    );
};

export function UnitPriceSlide({ data }: UnitPriceSlideProps) {
    if (!data || !data.unitPriceAnalysis) return null;

    const { residentialStats, officeStats, storeStats, typeComparison } = data.unitPriceAnalysis;
    const { transactionDetails } = data;

    return (
        <div className="flex gap-4 h-full p-2">

            {/* Left Column: Stats & Table (50%) */}
            <div className="flex flex-col gap-4 w-[50%]">
                {/* Stats */}
                <div className="flex flex-col gap-2">
                    {residentialStats && <StatCard title="住宅建案" stats={residentialStats} colorClass="border-violet-500/20" />}
                    <div className="grid grid-cols-2 gap-2">
                        {officeStats && <StatCard title="一般事務所" stats={officeStats} colorClass="border-cyan-500/20" />}
                        {storeStats && <StatCard title="店舖" stats={storeStats} colorClass="border-amber-500/20" />}
                    </div>
                </div>

                {/* Comparison Table */}
                <div className="bg-zinc-900/30 rounded-xl border border-white/5 p-4 flex-1 overflow-hidden flex flex-col">
                    <h3 className="text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-2">
                        <div className="w-1 h-4 bg-violet-500 rounded-full"></div>
                        產品類型單價比較 (Top 6)
                    </h3>
                    <table className="w-full text-xs text-left">
                        <thead className="bg-zinc-900 text-zinc-400 font-semibold border-b border-white/10">
                            <tr>
                                <th className="px-2 py-2">建案名稱</th>
                                <th className="px-2 py-2 text-right">住宅</th>
                                <th className="px-2 py-2 text-right">辦公</th>
                                <th className="px-2 py-2 text-right">價差倍數</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {(typeComparison || []).slice(0, 6).map((item, idx) => (
                                <tr key={idx} className="hover:bg-zinc-800/30">
                                    <td className="px-2 py-2 font-medium text-white truncate max-w-[100px]">{item.projectName}</td>
                                    <td className="px-2 py-2 text-right font-mono text-zinc-300">{item.residentialAvg ? item.residentialAvg.toFixed(1) : '-'}</td>
                                    <td className="px-2 py-2 text-right font-mono text-cyan-400">{item.officeAvg ? item.officeAvg.toFixed(1) : '-'}</td>
                                    <td className="px-2 py-2 text-right font-mono text-zinc-500">{item.officeRatio ? item.officeRatio.toFixed(2) + 'x' : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Right Column: Chart (50%) */}
            <div className="flex-1 bg-zinc-900/30 rounded-xl border border-white/5 p-4 flex flex-col">
                <h3 className="text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-2">
                    <div className="w-1 h-4 bg-violet-500 rounded-full"></div>
                    單價分佈泡泡圖
                </h3>
                <div className="flex-1 w-full min-h-0 relative">
                    {/* Static Chart: Fixed Range/Interval for Consistency */}
                    {transactionDetails && transactionDetails.length > 0 && (
                        <BubbleChart
                            data={transactionDetails}
                            minPrice={30}
                            maxPrice={150}
                            interval={5}
                            sizeMetric="count"
                            onMinPriceChange={() => { }}
                            onMaxPriceChange={() => { }}
                            onIntervalChange={() => { }}
                            onSizeMetricChange={() => { }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
