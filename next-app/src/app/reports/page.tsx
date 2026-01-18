"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAnalysisData } from "@/hooks/useAnalysisData";
import { useFilterStore } from "@/store/useFilterStore";
import { Button } from "@/components/ui/button";
import { Loader2, FileDown, CheckSquare, Square, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Report Components
import { RankingReport } from "@/components/reports/RankingReport";
import { PriceBandReport } from "@/components/reports/PriceBandReport";
import { UnitPriceAnalysisReport } from "@/components/reports/UnitPriceAnalysisReport";
import { HeatmapReport } from "@/components/reports/HeatmapReport";
import { SalesVelocityReport } from "@/components/reports/SalesVelocityReport";
import { ParkingAnalysisReport } from "@/components/reports/ParkingAnalysisReport";
import PolicyTimelineReport from "@/components/reports/PolicyTimelineReport";

// PDF Lib (Dynamic import would be better but let's try direct first, ensuring client-side check)
// import html2pdf from "html2pdf.js"; 

const REPORT_CONFIG = [
    {
        id: 'ranking',
        label: '核心指標與排名',
        component: RankingReport,
        modules: [
            { id: 'metrics', label: '核心指標看板' },
            { id: 'chart', label: '建案分析圖表' },
            { id: 'table', label: '區域建案排行列表' }
        ]
    },
    {
        id: 'price-band',
        label: '總價帶分析',
        component: PriceBandReport,
        modules: [
            { id: 'chart', label: '總價帶分佈圖' },
            { id: 'table', label: '總價帶詳細數據' },
            { id: 'location-table', label: '區域房型成交分佈表' },
            { id: 'location-chart', label: '區域成交佔比圖表' }
        ]
    },
    {
        id: 'unit-price',
        label: '單價分析',
        component: UnitPriceAnalysisReport,
        modules: [
            { id: 'stats', label: '各用途單價統計' },
            { id: 'comparison', label: '建案產品類型比較' },
            { id: 'chart', label: '單價分佈泡泡圖' }
        ]
    },
    {
        id: 'heatmap',
        label: '調價熱力圖',
        component: HeatmapReport,
        modules: [
            { id: 'all', label: '完整熱力圖報告' }
        ]
    },
    {
        id: 'velocity',
        label: '銷售速度與房型',
        component: SalesVelocityReport,
        modules: [
            { id: 'all', label: '完整銷售速度報告' }
        ]
    },
    {
        id: 'parking',
        label: '車位分析',
        component: ParkingAnalysisReport,
        modules: [
            { id: 'all', label: '完整車位分析報告' }
        ]
    },
    {
        id: 'timeline',
        label: '政策時光機',
        component: PolicyTimelineReport,
        modules: [
            { id: 'all', label: '完整政策影響分析' }
        ]
    }
];

export default function ReportsPage() {
    const { loading, error, analysisData, handleAnalyze } = useAnalysisData();
    const filters = useFilterStore();

    // State for selections: Record<ReportId, ModuleId[]>
    const [selections, setSelections] = useState<Record<string, string[]>>({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [expandedSections, setExpandedSections] = useState<string[]>(['ranking', 'price-band']);

    // Initialize selections (Select All by default?)
    useEffect(() => {
        const initialSelections: Record<string, string[]> = {};
        REPORT_CONFIG.forEach(section => {
            initialSelections[section.id] = section.modules.map(m => m.id);
        });
        setSelections(initialSelections);

        // Trigger data fetch if we have filters but no data
        if (!analysisData && filters.counties.length > 0) {
            handleAnalyze();
        }
    }, []); // Run once on mount

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev =>
            prev.includes(sectionId) ? prev.filter(id => id !== sectionId) : [...prev, sectionId]
        );
    };

    const toggleModule = (sectionId: string, moduleId: string) => {
        setSelections(prev => {
            const currentSection = prev[sectionId] || [];
            const newSection = currentSection.includes(moduleId)
                ? currentSection.filter(id => id !== moduleId)
                : [...currentSection, moduleId];
            return { ...prev, [sectionId]: newSection };
        });
    };

    const toggleSectionSelection = (sectionId: string) => {
        const config = REPORT_CONFIG.find(c => c.id === sectionId);
        if (!config) return;

        setSelections(prev => {
            const currentSection = prev[sectionId] || [];
            if (currentSection.length === config.modules.length) {
                // Deselect all
                return { ...prev, [sectionId]: [] };
            } else {
                // Select all
                return { ...prev, [sectionId]: config.modules.map(m => m.id) };
            }
        });
    };

    const getReportProps = (sectionId: string) => {
        if (!analysisData) return null;

        const selectedModules = selections[sectionId] || [];
        if (selectedModules.length === 0) return null; // Don't render if nothing selected

        switch (sectionId) {
            case 'ranking':
                return { data: analysisData, visibleSections: selectedModules };
            case 'price-band':
                return {
                    data: {
                        ...analysisData.priceBandAnalysis,
                        transactionDetails: analysisData.transactionDetails
                    },
                    visibleSections: selectedModules
                };
            case 'unit-price':
                return { data: analysisData }; // Pass through (todo: refactor for granularity)
            case 'heatmap':
                return { data: analysisData };
            case 'velocity':
                return { data: analysisData };
            case 'parking':
                return { data: analysisData };
            case 'timeline':
                return { data: analysisData.transactionDetails };
            default:
                return null;
        }
    };

    const handleDownloadPDF = async () => {
        setIsGenerating(true);
        try {
            console.log("Starting PDF generation...");

            // Dynamically import html2pdf
            const html2pdfModule = await import('html2pdf.js');
            const html2pdf = html2pdfModule.default || html2pdfModule;

            console.log("html2pdf loaded:", html2pdf);

            const element = document.getElementById('report-preview-container');
            if (!element) {
                console.error("Element #report-preview-container not found!");
                alert("錯誤：找不到報表內容元素 (report-preview-container)");
                return;
            }

            const opt = {
                margin: [10, 10] as [number, number],
                filename: `VibeReport_${new Date().toISOString().slice(0, 10)}.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: true }, // Enable logging
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            await html2pdf().set(opt).from(element).save();
            console.log("PDF generated successfully");
        } catch (err: any) {
            console.error("PDF Generation failed:", err);
            alert(`PDF 生成失敗: ${err.message || err}`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <AppLayout>
            <div className="flex h-[calc(100vh-theme(spacing.20))] gap-6">

                {/* Sidebar: Configuration */}
                <aside className="w-80 flex-shrink-0 bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-white/5 bg-zinc-900">
                        <h2 className="font-semibold text-white flex items-center gap-2">
                            <FileDown className="h-5 w-5 text-violet-400" />
                            報表內容設定
                        </h2>
                        <p className="text-xs text-zinc-500 mt-1">勾選欲輸出的分析模塊</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        {REPORT_CONFIG.map(section => {
                            const selectedCount = (selections[section.id] || []).length;
                            const totalCount = section.modules.length;
                            const isAllSelected = selectedCount === totalCount;
                            const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;
                            const isExpanded = expandedSections.includes(section.id);

                            return (
                                <div key={section.id} className="bg-zinc-950/50 rounded-lg border border-white/5 overflow-hidden">
                                    {/* Section Header */}
                                    <div className="flex items-center gap-2 p-3 hover:bg-zinc-800/50 transition-colors">
                                        <button onClick={() => toggleSection(section.id)} className="p-1 hover:bg-zinc-700 rounded text-zinc-400">
                                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                        </button>

                                        <div className="flex-1 font-medium text-sm text-zinc-200 cursor-pointer" onClick={() => toggleSection(section.id)}>
                                            {section.label}
                                        </div>

                                        <button onClick={() => toggleSectionSelection(section.id)} className="text-zinc-400 hover:text-white">
                                            {isAllSelected ? (
                                                <CheckSquare size={16} className="text-violet-500" />
                                            ) : isIndeterminate ? (
                                                <div className="relative">
                                                    <Square size={16} />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-violet-500 rounded-sm" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <Square size={16} />
                                            )}
                                        </button>
                                    </div>

                                    {/* Modules List */}
                                    {isExpanded && (
                                        <div className="pl-9 pr-3 pb-3 space-y-1">
                                            {section.modules.map(module => {
                                                const isSelected = (selections[section.id] || []).includes(module.id);
                                                return (
                                                    <div
                                                        key={module.id}
                                                        className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-zinc-800/30 cursor-pointer group"
                                                        onClick={() => toggleModule(section.id, module.id)}
                                                    >
                                                        <div className={cn("text-zinc-500 group-hover:text-zinc-300 transition-colors", isSelected && "text-violet-400")}>
                                                            {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                                                        </div>
                                                        <span className={cn("text-xs text-zinc-400 group-hover:text-zinc-200", isSelected && "text-zinc-200")}>
                                                            {module.label}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-4 border-t border-white/5 bg-zinc-900 text-center">
                        <Button
                            onClick={handleDownloadPDF}
                            disabled={loading || !analysisData || isGenerating}
                            className="w-full bg-violet-600 hover:bg-violet-700"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    生成中...
                                </>
                            ) : (
                                <>
                                    <FileDown className="mr-2 h-4 w-4" />
                                    下載 PDF 報表
                                </>
                            )}
                        </Button>
                    </div>
                </aside>

                {/* Main: Preview */}
                <main className="flex-1 bg-zinc-900/30 border border-white/5 rounded-xl overflow-hidden flex flex-col relative">
                    {/* Toolbar / Status */}
                    <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-zinc-900/80">
                        <span className="text-sm font-medium text-zinc-400">
                            預覽模式 (Preview)
                        </span>
                        {(!analysisData && !loading) && (
                            <span className="text-xs text-amber-500">
                                請先至儀表板進行分析，或確認篩選條件
                            </span>
                        )}
                    </div>

                    {/* Preview Content */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative bg-zinc-950">
                        {loading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 z-20">
                                <Loader2 className="h-10 w-10 animate-spin text-violet-500 mb-4" />
                                <p className="text-zinc-400">正在生成報表數據...</p>
                            </div>
                        )}

                        {!analysisData && !loading && (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                                <p>無分析數據</p>
                                <Button variant="link" className="text-violet-400" onClick={handleAnalyze}>
                                    嘗試重新載入
                                </Button>
                            </div>
                        )}

                        {/* This container is what html2pdf captures */}
                        <div id="report-preview-container" className="space-y-10 min-h-[1000px] max-w-4xl mx-auto bg-zinc-950 p-8 text-zinc-100">

                            {/* PDF Header */}
                            <div className="border-b-2 border-violet-500 pb-4 mb-8">
                                <h1 className="text-3xl font-bold flex items-center gap-2">
                                    <span className="bg-violet-600 w-8 h-8 flex items-center justify-center rounded text-white text-lg">P</span>
                                    平米內參 - 房市分析報告
                                </h1>
                                <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-400">
                                    <div className="flex items-center gap-1">
                                        <span className="font-semibold text-zinc-300">區域:</span>
                                        {filters.counties.join('、')} {filters.districts.length > 0 ? `(${filters.districts.join('、')})` : '(全區)'}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="font-semibold text-zinc-300">日期:</span>
                                        {filters.startDate || '不限'} ~ {filters.endDate || '不限'}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="font-semibold text-zinc-300">類型:</span>
                                        {filters.transactionType === 'preload' ? '預售屋' : '成屋'}
                                    </div>
                                </div>
                            </div>

                            {/* Report Sections */}
                            {analysisData && REPORT_CONFIG.map(section => {
                                const selectedModules = selections[section.id] || [];
                                if (selectedModules.length === 0) return null;

                                const ReportComponent = section.component;
                                const props = getReportProps(section.id);

                                if (!props) return null;

                                return (
                                    <section key={section.id} className="break-inside-avoid mb-12">
                                        <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-violet-500 pl-4">
                                            {section.label}
                                        </h2>

                                        {/* @ts-ignore dynamic props */}
                                        <ReportComponent {...props} />
                                    </section>
                                );
                            })}

                            {/* PDF Footer */}
                            <div className="mt-20 pt-8 border-t border-zinc-800 text-center text-zinc-600 text-xs">
                                <p>本報告由 平米內參 自動生成。數據來源：內政部實價登錄。</p>
                                <p>© {new Date().getFullYear()} Vibe Coding. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </AppLayout>
    );
}


