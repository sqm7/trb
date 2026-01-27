import React, { useMemo } from "react";
import { RankingChart } from "@/components/charts/RankingChart";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectRankingItem {
    projectName: string;
    county: string;
    district: string;
    saleAmountSum: number;
    houseAreaSum: number;
    transactionCount: number;
    marketShare: number;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    medianPrice: number;
    avgParkingPrice: number;
    [key: string]: any;
}

interface CoreMetrics {
    totalSaleAmount: number;
    totalHouseArea: number;
    overallAveragePrice: number;
    transactionCount: number;
}

interface RankingSlideProps {
    data: {
        coreMetrics: CoreMetrics;
        projectRanking: ProjectRankingItem[];
    } | null;
}

export function RankingSlide({ data }: RankingSlideProps) {
    if (!data) return null;

    const { coreMetrics, projectRanking } = data;

    // Fixed Top 15 for Chart
    const sortKey = 'saleAmountSum';
    const sortedData = useMemo(() => {
        if (!projectRanking) return [];
        return [...projectRanking].sort((a, b) => b[sortKey] - a[sortKey]);
    }, [projectRanking]);

    const topChartData = sortedData.slice(0, 15);
    const topTableData = sortedData.slice(0, 8); // Top 8 for table to fit

    const MetricCard = ({ title, value, unit }: { title: string, value: string, unit: string }) => (
        <div className="bg-zinc-800/50 rounded-lg p-3 border border-white/10 flex flex-col items-center justify-center text-center">
            <div className="text-zinc-400 text-xs mb-1">{title}</div>
            <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-white font-mono">{value}</span>
                <span className="text-[10px] text-zinc-500">{unit}</span>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full gap-4 p-2">

            {/* Top Section: Metrics & Chart */}
            <div className="flex gap-4 h-[60%]">
                {/* Left: Metrics Grid (30%) */}
                <div className="w-[28%] grid grid-cols-2 grid-rows-4 gap-2 h-full">
                    {/* Core Market Stats */}
                    <div className="col-span-2 bg-zinc-900/50 rounded-lg border border-violet-500/20 p-3 flex flex-col justify-center items-center">
                        <span className="text-violet-300 text-xs font-semibold mb-1">總銷金額</span>
                        <span className="text-3xl font-bold text-white font-mono">{coreMetrics.totalSaleAmount.toLocaleString()} <span className="text-sm font-normal text-zinc-500">萬</span></span>
                    </div>

                    <MetricCard title="交易筆數" value={coreMetrics.transactionCount.toLocaleString()} unit="筆" />
                    <MetricCard title="總均價" value={(coreMetrics?.overallAveragePrice || 0).toFixed(1)} unit="萬/坪" />

                    <MetricCard title="最高單價" value={(Math.max(...(projectRanking || []).map(p => p.maxPrice)) || 0).toFixed(1)} unit="萬/坪" />
                    <MetricCard title="中位單價" value={((projectRanking || []).length > 0 ? ((projectRanking || []).reduce((acc, p) => acc + p.medianPrice, 0) / projectRanking.length) : 0).toFixed(1)} unit="萬/坪" />

                    {/* Placeholder for visual balance or branding */}
                    <div className="col-span-2 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg flex items-center justify-center border border-white/5">
                        <span className="text-zinc-600 text-xs italic">Market Overview</span>
                    </div>
                </div>

                {/* Right: Chart (72%) */}
                <div className="flex-1 bg-zinc-900/30 rounded-xl border border-white/5 p-4 relative overflow-hidden">
                    <h3 className="absolute top-4 left-4 text-sm font-semibold text-zinc-300 flex items-center gap-2">
                        <div className="w-1 h-4 bg-violet-500 rounded-full"></div>
                        建案總銷金額排名 (Top 15)
                    </h3>
                    <div className="mt-6 h-full w-full">
                        {/* Force bar chart, non-interactive */}
                        <RankingChart data={topChartData} sortKey="saleAmountSum" limit={15} chartType="bar" />
                    </div>
                </div>
            </div>

            {/* Bottom Section: Table */}
            <div className="flex-1 bg-zinc-900/30 rounded-xl border border-white/5 p-0 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-900 text-zinc-400 text-xs font-semibold">
                        <tr>
                            <th className="px-4 py-2">排名</th>
                            <th className="px-4 py-2">建案名稱</th>
                            <th className="px-4 py-2">行政區</th>
                            <th className="px-4 py-2 text-right">總銷(萬)</th>
                            <th className="px-4 py-2 text-right">均價(萬/坪)</th>
                            <th className="px-4 py-2 text-right">筆數</th>
                            <th className="px-4 py-2 text-right">最低</th>
                            <th className="px-4 py-2 text-right">中位</th>
                            <th className="px-4 py-2 text-right">最高</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {topTableData.map((proj, idx) => (
                            <tr key={idx} className="hover:bg-zinc-800/30">
                                <td className="px-4 py-1.5 text-zinc-500 font-mono text-xs">{idx + 1}</td>
                                <td className="px-4 py-1.5 font-medium text-white text-xs">{proj.projectName}</td>
                                <td className="px-4 py-1.5 text-zinc-400 text-xs">{proj.county} {proj.district}</td>
                                <td className="px-4 py-1.5 text-right font-mono text-zinc-300 text-xs">{proj.saleAmountSum.toLocaleString()}</td>
                                <td className="px-4 py-1.5 text-right font-mono text-cyan-400 text-xs">{(proj.averagePrice || 0).toFixed(1)}</td>
                                <td className="px-4 py-1.5 text-right font-mono text-zinc-300 text-xs">{proj.transactionCount}</td>
                                <td className="px-4 py-1.5 text-right font-mono text-zinc-500 text-xs">{(proj.minPrice || 0).toFixed(1)}</td>
                                <td className="px-4 py-1.5 text-right font-mono text-zinc-400 text-xs">{(proj.medianPrice || 0).toFixed(1)}</td>
                                <td className="px-4 py-1.5 text-right font-mono text-zinc-500 text-xs">{(proj.maxPrice || 0).toFixed(1)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="px-4 py-2 text-center text-[10px] text-zinc-600 border-t border-white/5">
                    僅顯示前 8 筆重點建案，完整數據請參閱詳細報表
                </div>
            </div>
        </div>
    );
}
