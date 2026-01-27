import React, { useMemo } from "react";
import { PriceBandChart } from "@/components/charts/PriceBandChart";
import { cn } from "@/lib/utils";

interface PriceBandItem {
    roomType: string;
    bathrooms: number | null;
    minPrice: number;
    q1Price: number;
    medianPrice: number;
    q3Price: number;
    maxPrice: number;
    avgPrice: number;
    count: number;
    projectNames?: string[];
    [key: string]: any;
}

interface PriceBandSlideProps {
    data: {
        details: PriceBandItem[];
    } | null;
}

export function PriceBandSlide({ data }: PriceBandSlideProps) {
    if (!data || !data.details) return null;

    const { details } = data;

    // Default room types logic (same as report default)
    const defaultTypes = ['套房', '1房', '2房', '3房', '4房', '毛胚'];

    // Always merge by room type for the slide view to keep it clean
    const mergedData = useMemo(() => {
        const filtered = details.filter(d => defaultTypes.includes(d.roomType));
        const grouped = new Map<string, PriceBandItem>();

        filtered.forEach(item => {
            const key = item.roomType;
            if (!grouped.has(key)) {
                grouped.set(key, { ...item, bathrooms: null, count: 0, avgPrice: 0 });
            }
            const group = grouped.get(key)!;

            // Weighted aggregation
            const weightA = group.count;
            const weightB = item.count;
            const newCount = weightA + weightB;

            if (newCount > 0) {
                group.avgPrice = ((group.avgPrice * weightA) + (item.avgPrice * weightB)) / newCount;
                group.medianPrice = ((group.medianPrice * weightA) + (item.medianPrice * weightB)) / newCount;
                group.q1Price = ((group.q1Price * weightA) + (item.q1Price * weightB)) / newCount;
                group.q3Price = ((group.q3Price * weightA) + (item.q3Price * weightB)) / newCount;
            }
            group.count = newCount;
            group.minPrice = weightA === 0 ? item.minPrice : Math.min(group.minPrice, item.minPrice);
            group.maxPrice = Math.max(group.maxPrice, item.maxPrice);
        });

        return Array.from(grouped.values()).sort((a, b) => defaultTypes.indexOf(a.roomType) - defaultTypes.indexOf(b.roomType));
    }, [details]);

    return (
        <div className="flex flex-col h-full gap-4 p-2">

            {/* Top Section: Box Plot Analysis */}
            <div className="h-[55%] flex flex-col bg-zinc-900/30 rounded-xl border border-white/5 p-4 relative">
                <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-violet-500 rounded-full"></div>
                    總價帶分佈箱型圖 (合併房型)
                </h3>
                <div className="flex-1 min-h-0 w-full">
                    <PriceBandChart data={mergedData} />
                </div>
            </div>

            {/* Bottom Section: Summary Table */}
            <div className="flex-1 bg-zinc-900/30 rounded-xl border border-white/5 p-0 overflow-hidden flex flex-col">
                <h3 className="px-4 py-3 text-sm font-semibold text-zinc-300 bg-zinc-900/50 border-b border-white/5">
                    房型價格統計摘要
                </h3>
                <div className="flex-1 overflow-visible">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-900 text-zinc-400 text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-2">房型</th>
                                <th className="px-6 py-2 text-right">樣本數</th>
                                <th className="px-6 py-2 text-right">平均總價</th>
                                <th className="px-6 py-2 text-right text-zinc-500">最低</th>
                                <th className="px-6 py-2 text-right text-violet-300">中位數</th>
                                <th className="px-6 py-2 text-right text-zinc-500">最高</th>
                                <th className="px-6 py-2 text-right">價格區間 (Q1 - Q3)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {mergedData.map((item, idx) => (
                                <tr key={idx} className="hover:bg-zinc-800/30">
                                    <td className="px-6 py-2.5 font-medium text-white text-sm">
                                        <span className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">{item.roomType}</span>
                                    </td>
                                    <td className="px-6 py-2.5 text-right text-zinc-400 font-mono">{item.count.toLocaleString()}</td>
                                    <td className="px-6 py-2.5 text-right font-mono text-zinc-200">{item.avgPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-[10px] text-zinc-600">萬</span></td>
                                    <td className="px-6 py-2.5 text-right font-mono text-zinc-600 text-xs">{item.minPrice.toLocaleString()}</td>
                                    <td className="px-6 py-2.5 text-right font-mono text-violet-400 font-bold">{item.medianPrice.toLocaleString()}</td>
                                    <td className="px-6 py-2.5 text-right font-mono text-zinc-600 text-xs">{item.maxPrice.toLocaleString()}</td>

                                    {/* Visual Range Indicator */}
                                    <td className="px-6 py-2.5 text-right">
                                        <div className="flex items-center justify-end gap-2 text-xs font-mono text-zinc-400">
                                            <span>{item.q1Price.toLocaleString()}</span>
                                            <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden relative">
                                                <div className="absolute inset-y-0 bg-zinc-600" style={{ left: '25%', right: '25%' }}></div>
                                            </div>
                                            <span>{item.q3Price.toLocaleString()}</span>
                                        </div>
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
