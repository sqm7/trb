"use client";

import React, { useState, useEffect } from "react";
import { ReportWrapper } from "./ReportWrapper";
import { PricingHeatmap } from "@/components/charts/PricingHeatmap";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Share2, Code } from "lucide-react";

import { generateHeatmapData } from "@/lib/heatmap-utils";
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
        <div className="flex flex-wrap items-center gap-4 bg-zinc-900/30 p-4 rounded-lg border border-white/5">
            <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400 font-semibold">區間均價試算:</span>
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
    const [showShareModal, setShowShareModal] = useState(false);

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
                    return generateHeatmapData(projectTx, floorPremium);
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
    }, [selectedProject, byProject, data.transactionDetails, floorPremium]);

    const handleReanalyze = () => {
        // Since we are using client-side generation now (in memo), changing floorPremium automatically "re-analyzes".
        // We can just log or perhaps trigger a refresh animation.
        console.log(`Re-analyzing ${selectedProject} with floor premium: ${floorPremium}%`);
    };

    const handleShare = () => {
        setShowShareModal(true);
        // Copy share link logic
        const shareUrl = `${window.location.origin}?project=${encodeURIComponent(selectedProject)}&floorPremium=${floorPremium}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            setTimeout(() => setShowShareModal(false), 2000);
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Controls Panel */}
            <div className="flex flex-wrap items-center gap-4 bg-zinc-900/30 p-4 rounded-lg border border-white/5">
                {/* Project Selector */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-400">選擇建案:</span>
                    <Select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="w-[280px] bg-zinc-950/50"
                    >
                        {projectNames.map(name => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </Select>
                </div>

                {/* Floor Premium Slider */}
                <div className="flex items-center gap-3">
                    <span className="text-sm text-zinc-400">樓層價差:</span>
                    <input
                        type="range"
                        min={0}
                        max={2}
                        step={0.05}
                        value={floorPremium}
                        onChange={(e) => setFloorPremium(Number(e.target.value))}
                        className="w-28 accent-violet-500"
                    />
                    <span className="text-sm font-mono text-violet-400 w-16">{floorPremium.toFixed(2)} 萬/坪</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 ml-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReanalyze}
                        className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
                    >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        重新分析
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShare}
                        className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                    >
                        <Share2 className="mr-2 h-4 w-4" />
                        {showShareModal ? '已複製!' : '分享連結'}
                    </Button>
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
