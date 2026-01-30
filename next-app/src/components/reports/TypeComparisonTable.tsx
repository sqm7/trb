"use client";

import React from "react";
import { formatNumber } from "@/lib/utils";

interface TypeComparisonItem {
    projectName: string;
    county?: string;
    district?: string;
    residentialAvg: number;
    shopAvg: number;
    officeAvg: number;
    shopMultiple: number;
    officeMultiple: number;
}

interface TypeComparisonTableProps {
    data: TypeComparisonItem[];
}

export function TypeComparisonTable({ data }: TypeComparisonTableProps) {
    if (!data || data.length === 0) {
        return <div className="text-zinc-500 text-center p-8">無符合條件的建案可進行類型比較</div>;
    }

    // Calculate max values for progress bars
    const maxShopMultiple = Math.max(...data.map(d => d.shopMultiple), 1);
    const maxOfficeMultiple = Math.max(...data.map(d => d.officeMultiple), 1);

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-zinc-900/80 text-zinc-400 font-semibold uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3 whitespace-nowrap">建案名稱</th>
                        <th className="px-4 py-3 text-right">住宅均價</th>
                        <th className="px-4 py-3 text-right">店舖均價 <span className="text-[10px] text-zinc-500 font-normal ml-1">/ 倍數</span></th>
                        <th className="px-4 py-3 text-right">事務所均價 <span className="text-[10px] text-zinc-500 font-normal ml-1">/ 倍數</span></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {data.map((item, idx) => (
                        <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap">
                                <div className="font-medium text-white">{item.projectName}</div>
                                <div className="text-xs text-zinc-500 flex gap-1 mt-0.5">
                                    {item.county && <span className="bg-zinc-800 px-1 rounded">{item.county}</span>}
                                    {item.district && <span className="bg-zinc-800 px-1 rounded">{item.district}</span>}
                                </div>
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-zinc-300">
                                {item.residentialAvg > 0 ? formatNumber(item.residentialAvg) : '-'}
                            </td>
                            <td className="px-4 py-3 text-right">
                                <div className="font-mono text-zinc-300">
                                    {item.shopAvg > 0 ? formatNumber(item.shopAvg) : '-'}
                                </div>
                                {item.shopMultiple > 0 && (
                                    <div className="flex flex-col gap-1 mt-1.5 w-[80px] ml-auto">
                                        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden w-full">
                                            <div
                                                className="h-full bg-violet-600 rounded-full"
                                                style={{ width: `${Math.min((item.shopMultiple / maxShopMultiple) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <div className="text-[10px] text-right text-violet-400 font-medium">
                                            {item.shopMultiple.toFixed(2)}x
                                        </div>
                                    </div>
                                )}
                            </td>
                            <td className="px-4 py-3 text-right">
                                <div className="font-mono text-zinc-300">
                                    {item.officeAvg > 0 ? formatNumber(item.officeAvg) : '-'}
                                </div>
                                {item.officeMultiple > 0 && (
                                    <div className="flex flex-col gap-1 mt-1.5 w-[80px] ml-auto">
                                        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden w-full">
                                            <div
                                                className="h-full bg-cyan-600 rounded-full"
                                                style={{ width: `${Math.min((item.officeMultiple / maxOfficeMultiple) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <div className="text-[10px] text-right text-cyan-400 font-medium">
                                            {item.officeMultiple.toFixed(2)}x
                                        </div>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
