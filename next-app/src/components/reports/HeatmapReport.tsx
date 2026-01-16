"use client";

import React, { useState, useEffect } from "react";
import { ReportWrapper } from "./ReportWrapper";
import { PricingHeatmap } from "@/components/charts/PricingHeatmap";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Share2, Code } from "lucide-react";

import { generateHeatmapData } from "@/lib/heatmap-utils";

interface HeatmapReportProps {
    data: {
        priceGridAnalysis: {
            projectNames: string[];
            byProject: Record<string, any>;
        };
        transactionDetails?: any[];
    } | null;
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

        // 1. Try existing analysis data
        if (byProject[selectedProject] && byProject[selectedProject].horizontalGrid) {
            return byProject[selectedProject];
        }

        // 2. Fallback: Generate on the fly from transaction details
        if (data.transactionDetails) {
            const projectTx = data.transactionDetails.filter((tx: any) => tx['建案名稱'] === selectedProject);
            if (projectTx.length > 0) {
                try {
                    return generateHeatmapData(projectTx, floorPremium);
                } catch (err) {
                    console.error("Heatmap generation error:", err);
                    return null;
                }
            }
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
                        step={0.1}
                        value={floorPremium}
                        onChange={(e) => setFloorPremium(Number(e.target.value))}
                        className="w-28 accent-violet-500"
                    />
                    <span className="text-sm font-mono text-violet-400 w-12">{floorPremium.toFixed(1)}%</span>
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
