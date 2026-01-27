import React, { useMemo } from "react";
import { PricingHeatmap } from "@/components/charts/PricingHeatmap";
import { generateHeatmapData } from "@/lib/heatmap-utils";

interface HeatmapSlideProps {
    data: {
        priceGridAnalysis: {
            projectNames: string[];
            byProject: Record<string, any>;
        };
        transactionDetails?: any[];
    } | null;
}

export function HeatmapSlide({ data }: HeatmapSlideProps) {
    if (!data?.priceGridAnalysis?.projectNames || data.priceGridAnalysis.projectNames.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-zinc-500">
                無建案數據
            </div>
        );
    }

    const { projectNames, byProject } = data.priceGridAnalysis;
    const { transactionDetails } = data;

    // Logic: Select the project with the MOST transactions to display as the representative
    const selectedProjectInfo = useMemo(() => {
        if (!transactionDetails) return { name: projectNames[0], count: 0 };

        const counts: Record<string, number> = {};
        transactionDetails.forEach(tx => {
            const name = tx['建案名稱'];
            if (name) counts[name] = (counts[name] || 0) + 1;
        });

        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        if (sorted.length > 0) {
            console.log("Auto-selected project for slide:", sorted[0][0], "with", sorted[0][1], "txs");
            return { name: sorted[0][0], count: sorted[0][1] };
        }
        return { name: projectNames[0], count: 0 };
    }, [transactionDetails, projectNames]);

    const selectedProject = selectedProjectInfo.name;

    // Generate Data
    const projectData = useMemo(() => {
        if (!selectedProject) return null;

        // Try dynamic generation first for consistency
        const projectTx = transactionDetails?.filter(tx => tx['建案名稱'] === selectedProject);
        if (projectTx && projectTx.length > 0) {
            return generateHeatmapData(projectTx, 0.3, 14); // Default 0.3 premium, 14 window days
        }

        // Fallback to static
        if (byProject[selectedProject]) {
            return byProject[selectedProject];
        }
        return null;
    }, [selectedProject, transactionDetails, byProject]);


    return (
        <div className="flex flex-col h-full gap-4 p-2">
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 rounded-lg border border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-violet-500 rounded-full"></div>
                    <div>
                        <h3 className="text-lg font-bold text-white">{selectedProject}</h3>
                        <span className="text-xs text-zinc-400">成交最熱絡建案 (樣本數: {selectedProjectInfo.count})</span>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500">調價幅度:</span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded bg-red-500/80"></span>
                        <span className="text-xs text-zinc-400">&gt; 5%</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded bg-orange-500/80"></span>
                        <span className="text-xs text-zinc-400">2-5%</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded bg-yellow-500/80"></span>
                        <span className="text-xs text-zinc-400">0-2%</span>
                    </span>
                </div>
            </div>

            <div className="flex-1 bg-zinc-900/30 rounded-xl border border-white/5 p-4 overflow-hidden relative">
                {projectData ? (
                    <div className="absolute inset-0 p-4">
                        <PricingHeatmap data={projectData} floorPremium={0.3} />
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-zinc-500">
                        無法產生熱力圖數據
                    </div>
                )}
            </div>
        </div>
    );
}
