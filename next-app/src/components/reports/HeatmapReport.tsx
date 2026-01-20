"use client";

import React, { useState, useEffect } from "react";
import { ReportWrapper } from "./ReportWrapper";
import { PricingHeatmap } from "@/components/charts/PricingHeatmap";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Code, Wand2 } from "lucide-react";

import { generateHeatmapData, calculateSuggestedFloorPremium } from "@/lib/heatmap-utils";
import { useFilterStore } from "@/store/useFilterStore";

interface HeatmapReportProps {
    data: {
        priceGridAnalysis: {
            projectNames: string[];
            byProject: Record<string, any>;
        };
        transactionDetails?: any[];
    } | null;
}



function FloorRangeCalculator({ transactions, project }: { transactions: any[], project: string }) {
    const [startFloor, setStartFloor] = useState<string>("");
    const [endFloor, setEndFloor] = useState<string>("");
    const [result, setResult] = useState<{ avg: number, count: number } | null>(null);

    const handleCalculate = () => {
        if (!project || !transactions) return;

        const start = parseInt(startFloor);
        const end = parseInt(endFloor);

        if (isNaN(start) || isNaN(end) || start > end) {
            setResult(null);
            return;
        }

        // Filter transactions for this project and floor range
        const targetTxs = transactions.filter(tx => {
            if (tx['建案名稱'] !== project) return false;
            // Floor parsing logic: '12' -> 12, 'B1' -> -1 (Exclude B floors for range calc usually? Or handle them?)
            // Assuming user inputs standard floor numbers (e.g. 3 to 10)
            const floorStr = String(tx['樓層']);
            // Skip non-numeric start chars so "10F" becomes 10. Simple parseInt handles "10"
            const floorVal = parseInt(floorStr);
            if (isNaN(floorVal)) return false; // Skip basements or weird floors for now

            return floorVal >= start && floorVal <= end;
        });

        if (targetTxs.length === 0) {
            setResult({ avg: 0, count: 0 });
            return;
        }

        const totalHousePrice = targetTxs.reduce((sum, tx) => sum + (tx['房屋總價(萬)'] || 0), 0);
        const totalHouseArea = targetTxs.reduce((sum, tx) => sum + (tx['房屋面積(坪)'] || 0), 0);

        const avg = totalHouseArea > 0 ? totalHousePrice / totalHouseArea : 0;
        setResult({ avg, count: targetTxs.length });
    };

    return (
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4 bg-zinc-900/30 p-4 rounded-lg border border-white/5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                <span className="text-sm text-zinc-400 font-semibold whitespace-nowrap">區間均價試算:</span>
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        placeholder="起樓"
                        className="w-20 h-8 bg-zinc-950/50"
                        value={startFloor}
                        onChange={e => setStartFloor(e.target.value)}
                    />
                    <span className="text-zinc-500">~</span>
                    <Input
                        type="number"
                        placeholder="迄樓"
                        className="w-20 h-8 bg-zinc-950/50"
                        value={endFloor}
                        onChange={e => setEndFloor(e.target.value)}
                    />
                </div>
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleCalculate}
                    className="h-8 ml-2"
                >
                    計算
                </Button>
            </div>

            {result && (
                <div className="flex items-center gap-4 ml-4 animate-in fade-in">
                    <div className="flex flex-col">
                        <span className="text-xs text-zinc-500">平均單價 (加權)</span>
                        <span className="text-lg font-bold text-violet-400">{result.avg.toFixed(2)} 萬/坪</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-zinc-500">參考筆數</span>
                        <span className="text-sm text-zinc-300">{result.count} 筆</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export function HeatmapReport({ data }: HeatmapReportProps) {
    const [selectedProject, setSelectedProject] = useState<string>("");
    const [floorPremium, setFloorPremium] = useState<number>(0.3);
    const [initialWindowDays, setInitialWindowDays] = useState<number>(14);

    // Initialize selection
    useEffect(() => {
        if (data?.priceGridAnalysis?.projectNames?.length && !selectedProject) {
            setSelectedProject(data.priceGridAnalysis.projectNames[0]);
        }
    }, [data, selectedProject]);

    if (!data?.priceGridAnalysis) return null;

    const { projectNames, byProject } = data.priceGridAnalysis;

    // Attempt to get pre-calculated data or generate it on the fly
    const projectData = React.useMemo(() => {
        if (!selectedProject) return null;

        // 1. Prefer generating on the fly to support dynamic floorPremium
        if (data.transactionDetails) {
            const { excludeCommercial } = useFilterStore.getState(); // Access flattened state directly 
            // Better to use hook if we want reactivity, but useMemo dep array handles re-runs if we include it.
            // Let's add hook usage at top level.

            let projectTx = data.transactionDetails.filter((tx: any) => tx['建案名稱'] === selectedProject);

            if (excludeCommercial) {
                projectTx = projectTx.filter((tx: any) => {
                    const mainPurpose = tx['主要用途'] || '';
                    const buildingType = tx['建物型態'] || '';
                    const note = tx['備註'] || '';
                    // Simple exclude logic matching backend/spec
                    if (mainPurpose.includes('商業') || buildingType.includes('店') || note.includes('店')) return false;
                    if (mainPurpose.includes('辦公') || buildingType.includes('辦公') || buildingType.includes('事務所')) return false;
                    return true;
                });
            }

            if (projectTx.length > 0) {
                try {
                    return generateHeatmapData(projectTx, floorPremium, initialWindowDays);
                } catch (err) {
                    console.error("Heatmap generation error:", err);
                    // Fallback to pre-calculated if generation fails
                }
            }
        }

        // 2. Fallback: Use existing analysis data (backend static)
        if (byProject[selectedProject] && byProject[selectedProject].horizontalGrid) {
            return byProject[selectedProject];
        }

        return null;
    }, [selectedProject, byProject, data.transactionDetails, floorPremium, initialWindowDays]);

    const handleAutoSuggest = () => {
        if (!data.transactionDetails || !selectedProject) return;

        let projectTx = data.transactionDetails.filter((tx: any) => tx['建案名稱'] === selectedProject);
        // Apply logic to suggest
        const suggested = calculateSuggestedFloorPremium(projectTx);
        setFloorPremium(suggested);
        console.log("Auto suggested premium:", suggested);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Controls Panel */}
            <div className="flex flex-col lg:flex-row flex-wrap items-start lg:items-center gap-4 bg-zinc-900/30 p-4 rounded-lg border border-white/5">
                {/* Project Selector */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full lg:w-auto">
                    <span className="text-sm text-zinc-400 whitespace-nowrap">選擇建案:</span>
                    <Select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="w-full sm:w-[280px] bg-zinc-950/50"
                    >
                        {projectNames.map(name => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </Select>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
                    <span className="text-sm text-zinc-400 whitespace-nowrap">樓層價差:</span>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input
                            type="range"
                            min={0}
                            max={10}
                            step={0.05}
                            value={floorPremium}
                            onChange={(e) => setFloorPremium(Number(e.target.value))}
                            className="flex-1 sm:w-32 h-2 accent-violet-500 cursor-pointer"
                            style={{ minHeight: '24px' }}
                        />
                        <Input
                            type="number"
                            min={0}
                            max={10}
                            step={0.01}
                            value={floorPremium}
                            onChange={(e) => setFloorPremium(Math.max(0, Number(e.target.value)))}
                            className="w-20 h-8 bg-zinc-950/50 text-right pr-2"
                        />
                        <span className="text-sm font-mono text-violet-400 whitespace-nowrap">萬/坪</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleAutoSuggest}
                            className="h-8 w-8 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 ml-1"
                            title="自動試算建議價差"
                        >
                            <Wand2 className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-zinc-400">基準天數:</span>
                        <Input
                            type="number"
                            min="1"
                            max="365"
                            value={initialWindowDays}
                            onChange={(e) => setInitialWindowDays(Number(e.target.value) || 14)}
                            className="w-16 h-8 bg-zinc-950/50 text-right pr-2"
                        />
                        <span className="text-sm font-mono text-violet-400 whitespace-nowrap">天</span>
                    </div>
                </div>

            </div>

            {/* Floor Range Calculator */}
            {selectedProject && data.transactionDetails && (
                <FloorRangeCalculator
                    transactions={data.transactionDetails}
                    project={selectedProject}
                />
            )}



            {/* Legend Section */}
            <div className="flex flex-wrap gap-4 p-4 bg-zinc-900/20 rounded-lg border border-white/5">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">溢價圖例:</span>
                    <span className="flex items-center gap-1">
                        <span className="w-4 h-4 rounded bg-red-500/80"></span>
                        <span className="text-xs text-zinc-400">&gt; 5%</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-4 h-4 rounded bg-orange-500/80"></span>
                        <span className="text-xs text-zinc-400">2-5%</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-4 h-4 rounded bg-yellow-500/80"></span>
                        <span className="text-xs text-zinc-400">0-2%</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-4 h-4 rounded bg-green-500/80"></span>
                        <span className="text-xs text-zinc-400">&lt; 0%</span>
                    </span>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs text-zinc-500">特殊交易:</span>
                    <span className="flex items-center gap-1">
                        <span className="w-4 h-4 rounded bg-amber-600"></span>
                        <span className="text-xs text-zinc-400">店舖</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-4 h-4 rounded bg-blue-600"></span>
                        <span className="text-xs text-zinc-400">辦公室</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-4 h-4 rounded bg-purple-600"></span>
                        <span className="text-xs text-zinc-400">廠辦</span>
                    </span>
                </div>
            </div>

            {/* Heatmap */}
            <ReportWrapper title="建案銷控表與調價熱力圖" description="可視化建案各戶別的銷售狀況與價格調整幅度">
                {projectData ? (
                    <PricingHeatmap data={projectData} floorPremium={floorPremium} />
                ) : (
                    <div className="text-zinc-500 text-center p-12">請選擇建案以查看銷控表</div>
                )}
            </ReportWrapper>
        </div>
    );
}
