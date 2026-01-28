"use client";

import React, { useState, useEffect } from "react";
import Script from 'next/script';
import { createRoot } from 'react-dom/client';
import { AppLayout } from "@/components/layout/AppLayout";
import { useAnalysisData } from "@/hooks/useAnalysisData";
import { useFilterStore } from "@/store/useFilterStore";
import { Button } from "@/components/ui/button";
import { Loader2, FileDown, FileType, CheckSquare, Square, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadReportPPTX } from "@/lib/pptx-generator";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { PrintableReport } from "@/components/reports/templates/PrintableReport";

// Report Components (REMOVED - These are interactive dashboard components)
// import { RankingReport } from "@/components/reports/RankingReport";
// import { PriceBandReport } from "@/components/reports/PriceBandReport";
// ... etc.

import { SlideContainer } from "@/components/reports/SlideContainer";

// Slide Components (PURE STATIC - No interactive elements)
import { RankingSlide } from "@/components/reports/slides/RankingSlide";
import { PriceBandSlide } from "@/components/reports/slides/PriceBandSlide";
import { UnitPriceSlide } from "@/components/reports/slides/UnitPriceSlide";
import { HeatmapSlide } from "@/components/reports/slides/HeatmapSlide";
import { SalesVelocitySlide } from "@/components/reports/slides/SalesVelocitySlide";
import { ParkingSlide } from "@/components/reports/slides/ParkingSlide";
import { PolicyTimelineSlide } from "@/components/reports/slides/PolicyTimelineSlide";

/**
 * REPORT_CONFIG - Design-First Slide Templates
 * 
 * Each entry maps to a STATIC slide component with no interactive elements.
 * The `slideComponent` is the ONLY render target for the preview.
 */
const REPORT_CONFIG = [
    {
        id: 'ranking',
        label: '核心指標與排名',
        slideComponent: RankingSlide,
        modules: [
            { id: 'metrics', label: '核心指標看板' },
            { id: 'chart', label: '建案分析圖表' },
            { id: 'table', label: '區域建案排行列表' }
        ]
    },
    {
        id: 'price-band',
        label: '總價帶分析',
        slideComponent: PriceBandSlide,
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
        slideComponent: UnitPriceSlide,
        modules: [
            { id: 'stats', label: '各用途單價統計' },
            { id: 'comparison', label: '建案產品類型比較' },
            { id: 'chart', label: '單價分佈泡泡圖' }
        ]
    },
    {
        id: 'heatmap',
        label: '調價熱力圖',
        slideComponent: HeatmapSlide,
        modules: [
            { id: 'all', label: '完整熱力圖報告' }
        ]
    },
    {
        id: 'velocity',
        label: '銷售速度與房型',
        slideComponent: SalesVelocitySlide,
        modules: [
            { id: 'all', label: '完整銷售速度報告' }
        ]
    },
    {
        id: 'parking',
        label: '車位分析',
        slideComponent: ParkingSlide,
        modules: [
            { id: 'all', label: '完整車位分析報告' }
        ]
    },
    {
        id: 'timeline',
        label: '政策時光機',
        slideComponent: PolicyTimelineSlide,
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
    const [isGeneratingPPTX, setIsGeneratingPPTX] = useState(false);
    const [expandedSections, setExpandedSections] = useState<string[]>(['ranking', 'price-band']);
    const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);

    // Initialize selections (Select All by default?)
    useEffect(() => {
        const initialSelections: Record<string, string[]> = {};
        REPORT_CONFIG.forEach(section => {
            initialSelections[section.id] = section.modules.map(m => m.id);
        });
        setSelections(initialSelections);

        // [Data-Driven Refactor] 
        // We no longer auto-fetch. We expect data to be present in the store from Dashboard.
        // If analysisData is null, we could redirect or show a "Go to Dashboard" message.
    }, []);

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
                // RankingSlide expects { coreMetrics, projectRanking }
                return { data: analysisData.rankingAnalysis, visibleSections: selectedModules };
            case 'price-band':
                return {
                    data: {
                        ...analysisData.priceBandAnalysis,
                        transactionDetails: analysisData.transactionDetails
                    },
                    visibleSections: selectedModules
                };
            case 'unit-price':
                // UnitPriceSlide likely expects unitPriceAnalysis. Let's pass the specific object if possible, 
                // but checking UnitPriceSlide definition it probably destructured from root or used analysisData.
                // Safest is to pass analysisData generally IF the slide handles it, but let's look at others.
                // UnitPriceSlide usually expects { unitPriceAnalysis: ... } or just the analysis object?
                // Let's pass analysisData for now as it's less clear, but Ranking was definitely wrong.
                return { data: analysisData };
            case 'heatmap':
                // HeatmapSlide expects { priceGridAnalysis: ..., transactionDetails: ... }
                return { data: analysisData };
            case 'velocity':
                // SalesVelocitySlide expects { salesVelocity: ... }
                // analysisData has salesVelocityAnalysis.
                return {
                    data: {
                        salesVelocity: analysisData.salesVelocityAnalysis,
                        salesRate: analysisData.salesVelocityAnalysis?.salesRate
                    }
                };
            case 'parking':
                // ParkingSlide expects { parkingAnalysis: ... }
                return {
                    data: {
                        parkingAnalysis: analysisData.parkingAnalysis,
                        transactionDetails: analysisData.transactionDetails
                    }
                };
            case 'timeline':
                return { data: analysisData.transactionDetails }; // PolicyTimelineSlide receives data directly?
            default:
                return null;
        }
    };

    // ========== PPTX Download Handler ==========
    const handleDownloadPPTX = async () => {
        if (!analysisData) return;

        setIsGeneratingPPTX(true);
        try {
            await downloadReportPPTX(analysisData, {
                title: '房市分析報告',
                counties: filters.counties,
                districts: filters.districts,
                dateRange: filters.dateRange,
                startDate: filters.startDate,
                endDate: filters.endDate,
            });
        } catch (err) {
            console.error("PPTX generation failed:", err);
            alert("PPTX 生成失敗，請稍後再試。");
        } finally {
            setIsGeneratingPPTX(false);
        }
    };

    // ========== PDF Download Handler (Data-Driven) ==========
    const handleDownloadPDF = async () => {
        if (!analysisData) {
            alert("請先產生分析數據");
            return;
        }

        setIsGenerating(true);
        try {
            console.log("Starting Data-Driven PDF generation...");

            // 1. Create a hidden print window
            const printWindow = window.open('', '_blank', 'width=1280,height=720');
            if (!printWindow) {
                throw new Error("Could not open print window. Please allow popups.");
            }

            // 2. Setup the Print Window Document
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>平米內參 - 房市簡報</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <script>
                        tailwind.config = {
                            theme: {
                                extend: {
                                    colors: {
                                        violet: { 400: '#a78bfa', 900: '#4c1d95' },
                                        cyan: { 400: '#22d3ee' },
                                        emerald: { 400: '#34d399' },
                                        amber: { 400: '#fbbf24' }
                                    }
                                }
                            }
                        }
                    </script>
                    <style>
                        @page {
                            size: A4 landscape;
                            margin: 0;
                        }
                        body {
                            margin: 0;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            background-color: #0A0C10;
                        }
                        /* Print Specific Overrides */
                        @media print {
                            .break-after-page {
                                page-break-after: always;
                                break-after: page;
                            }
                            .break-inside-avoid {
                                page-break-inside: avoid;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div id="print-root"></div>
                </body>
                </html>
            `);

            printWindow.document.close();

            // Wait for Tailwind CDN to load slightly (optional but safer)
            await new Promise(resolve => setTimeout(resolve, 500));

            // 3. Render the PrintableReport into the new window
            const printRoot = printWindow.document.getElementById('print-root');
            if (printRoot) {
                const root = createRoot(printRoot);
                const today = new Date().toLocaleDateString('zh-TW');

                root.render(
                    <PrintableReport
                        data={analysisData}
                        filters={filters}
                        reportDate={today}
                    />
                );
            }

            // 4. Wait for rendering (including charts) then Print
            // Recharts needs a moment to animation/render
            await new Promise(resolve => setTimeout(resolve, 1500));

            console.log("Triggering Print Dialog...");
            printWindow.print();

        } catch (err: any) {
            console.error("PDF Generation failed:", err);
            alert(`PDF 生成失敗: ${err.message || err}`);
        } finally {
            setIsGenerating(false);
        }
    };

    // Admin Auth
    const { isAdmin, isLoading: authLoading } = useAdminAuth();

    // Calculate numbering
    let pageCount = 0;

    return (
        <AppLayout>
            <Script
                src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
                strategy="lazyOnload"
            />

            {/* Mobile Settings Toggle */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-zinc-900/80 border-b border-white/5">
                <h2 className="font-semibold text-white flex items-center gap-2">
                    <FileDown className="h-5 w-5 text-violet-400" />
                    報表生成器
                </h2>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMobileSettingsOpen(!mobileSettingsOpen)}
                    className="border-zinc-700"
                >
                    {mobileSettingsOpen ? '收起設定' : '報表設定'}
                </Button>
            </div>

            <div className="flex flex-col lg:flex-row h-[calc(100vh-theme(spacing.20))] lg:gap-6">

                {/* Sidebar: Configuration */}
                <aside className={cn(
                    "lg:w-80 flex-shrink-0 bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden flex flex-col",
                    "lg:flex",
                    mobileSettingsOpen ? "flex" : "hidden"
                )}>
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

                    <div className="p-4 border-t border-white/5 bg-zinc-900 space-y-2">
                        {/* PPTX Download Button (Primary) */}
                        <Button
                            onClick={handleDownloadPPTX}
                            disabled={loading || !analysisData || isGeneratingPPTX}
                            className="w-full bg-violet-600 hover:bg-violet-700"
                        >
                            {isGeneratingPPTX ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    生成中...
                                </>
                            ) : (
                                <>
                                    <FileType className="mr-2 h-4 w-4" />
                                    下載 PPTX 報表
                                </>
                            )}
                        </Button>

                        {/* PDF Download Button (Secondary) */}
                        <Button
                            onClick={handleDownloadPDF}
                            disabled={loading || !analysisData || isGenerating}
                            variant="outline"
                            className="w-full border-zinc-700 hover:bg-zinc-800"
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

                {/* Main: Slide Preview */}
                <main className="flex-1 bg-zinc-900/10 rounded-xl overflow-hidden flex flex-col relative min-h-[400px]">
                    {/* Status Bar */}
                    <div className="h-12 border-b border-white/5 flex items-center justify-between px-3 lg:px-4 bg-zinc-900/80">
                        <span className="text-xs lg:text-sm font-medium text-zinc-400">
                            投影片預覽 (Slide Preview) - 16:9
                        </span>
                        <div className="flex items-center gap-2">
                            {(!analysisData && !loading) && (
                                <span className="text-xs text-amber-500 hidden sm:inline">
                                    請先至儀表板進行分析
                                </span>
                            )}
                            <Button
                                onClick={handleDownloadPPTX}
                                disabled={loading || !analysisData || isGeneratingPPTX}
                                size="sm"
                                className="lg:hidden bg-violet-600 hover:bg-violet-700 text-xs"
                            >
                                <FileType className="h-3 w-3 mr-1" />
                                {isGeneratingPPTX ? '生成中...' : '下載 PPTX'}
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 lg:p-10 custom-scrollbar relative bg-zinc-950/95" id="report-preview-container">

                        {/* No Data State */}
                        {!analysisData && !loading && (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                <div className="p-6 rounded-full bg-zinc-900 border border-white/5">
                                    <FileDown className="h-10 w-10 text-zinc-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-white">尚未載入數據</h3>
                                    <p className="text-zinc-500 text-sm mt-1">請先至 <a href="/dashboard" className="text-violet-400 hover:underline">儀表板</a> 進行分析</p>
                                </div>
                            </div>
                        )}

                        {/* Rendering Loop */}
                        {analysisData && (
                            <div className="space-y-12 max-w-5xl mx-auto pb-20">

                                {/* Admin Guard */}
                                {authLoading ? (
                                    <div className="flex items-center justify-center py-20">
                                        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
                                    </div>
                                ) : !isAdmin ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <div className="p-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 max-w-lg">
                                            <div className="text-4xl mb-4">🔐</div>
                                            <h2 className="text-xl font-bold text-white mb-2">權限限制</h2>
                                            <p className="text-zinc-400 text-sm">
                                                報表生成功能目前僅開放管理員使用。<br />
                                                請聯繫系統管理員開通權限。
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    /* Actual Report Rendering */
                                    <>
                                        {REPORT_CONFIG.map((section) => {
                                            const selectedModules = selections[section.id] || [];
                                            if (selectedModules.length === 0) return null;

                                            pageCount++;
                                            // Use ONLY the static slideComponent - no fallback to interactive components
                                            const SlideComponent = section.slideComponent;
                                            const props = getReportProps(section.id);

                                            if (!props) return null;

                                            return (
                                                <div key={section.id} className="slide-item">
                                                    <SlideContainer
                                                        title={section.label}
                                                        subTitle={`${filters.counties.join('、')} • ${filters.dateRange === 'custom' ? '自訂期間' : filters.dateRange}`}
                                                        pageNumber={pageCount}
                                                    >
                                                        <div className="h-full overflow-hidden">
                                                            {/* @ts-ignore - dynamic component props */}
                                                            <SlideComponent {...props} isPrintMode={true} />
                                                        </div>
                                                    </SlideContainer>
                                                </div>
                                            );
                                        })}
                                    </>
                                )}
                            </div>
                        )}

                    </div>
                </main>
            </div>
        </AppLayout>
    );
}
