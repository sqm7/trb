"use client";

import React, { useState, useEffect } from "react";
import Script from 'next/script';
import { AppLayout } from "@/components/layout/AppLayout";
import { useAnalysisData } from "@/hooks/useAnalysisData";
import { useFilterStore } from "@/store/useFilterStore";
import { Button } from "@/components/ui/button";
import { Loader2, FileDown, FileType, CheckSquare, Square, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadReportPPTX } from "@/lib/pptx-generator";

// Report Components
import { RankingReport } from "@/components/reports/RankingReport";
import { PriceBandReport } from "@/components/reports/PriceBandReport";
import { UnitPriceAnalysisReport } from "@/components/reports/UnitPriceAnalysisReport";
import { HeatmapReport } from "@/components/reports/HeatmapReport";
import { SalesVelocityReport } from "@/components/reports/SalesVelocityReport";
import { ParkingAnalysisReport } from "@/components/reports/ParkingAnalysisReport";
import PolicyTimelineReport from "@/components/reports/PolicyTimelineReport";
import { SlideContainer } from "@/components/reports/SlideContainer";

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

        // Trigger data fetch if we have filters but no data
        if (!analysisData && filters.counties.length > 0) {
            handleAnalyze();
        }
    }, [analysisData, filters.counties, handleAnalyze]); // Correct dependencies

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
                return {
                    data: {
                        parkingAnalysis: analysisData.parkingAnalysis,
                        transactionDetails: analysisData.transactionDetails
                    }
                };
            case 'timeline':
                return { data: analysisData.transactionDetails };
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

    const handleDownloadPDF = async () => {
        setIsGenerating(true);
        try {
            console.log("Starting PDF generation (Slide Deck Mode)...");

            const element = document.getElementById('report-preview-container');
            if (!element) {
                throw new Error("Element #report-preview-container not found!");
            }

            // Create a new window with ONLY the report content
            // Using 16:9 ratio window mainly for preview feel, print dialog will handle page size
            const printWindow = window.open('', '_blank', 'width=1280,height=720');
            if (!printWindow) {
                throw new Error("Could not open print window. Please allow popups.");
            }

            // Helper: Convert any color to RGBA using Canvas
            const toRgba = (color: string): string => {
                if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return color;
                if (color.startsWith('#') || color.startsWith('rgb')) return color;

                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = 1;
                    canvas.height = 1;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.fillStyle = color;
                        ctx.fillRect(0, 0, 1, 1);
                        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
                        return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`;
                    }
                } catch (e) {
                    console.warn("Color conversion failed for:", color);
                }
                return color;
            };

            // Helper: Recursively clone element with FULL inline styles
            const deepCloneWithInlineStyles = (el: Element): HTMLElement => {
                const clone = document.createElement(el.tagName.toLowerCase());

                // Copy all attributes
                Array.from(el.attributes).forEach(attr => {
                    if (attr.name !== 'style' && attr.name !== 'class') {
                        clone.setAttribute(attr.name, attr.value);
                    }
                });

                // Preserve classes for print styling hooks
                if (el.hasAttribute('class')) {
                    clone.setAttribute('class', el.getAttribute('class') || '');
                }

                // Get ALL computed styles and apply them inline
                const computed = window.getComputedStyle(el);
                const colorProps = ['color', 'background-color', 'border-color', 'border-top-color',
                    'border-bottom-color', 'border-left-color', 'border-right-color',
                    'outline-color', 'fill', 'stroke'];

                let styleString = '';
                for (let i = 0; i < computed.length; i++) {
                    const prop = computed[i];
                    let value = computed.getPropertyValue(prop);

                    // Convert colors to RGBA
                    if (colorProps.includes(prop)) {
                        value = toRgba(value);
                    }

                    styleString += `${prop}:${value};`;
                }

                // FORCE Print Breaks for Slides
                if (el.classList.contains('slide-item')) {
                    styleString += "page-break-after: always !important; break-after: page !important; margin-bottom: 0 !important; height: 100vh !important;";
                }

                clone.setAttribute('style', styleString);

                // Handle text nodes and child elements
                Array.from(el.childNodes).forEach(child => {
                    if (child.nodeType === Node.TEXT_NODE) {
                        clone.appendChild(document.createTextNode(child.textContent || ''));
                    } else if (child.nodeType === Node.ELEMENT_NODE) {
                        clone.appendChild(deepCloneWithInlineStyles(child as Element));
                    }
                });

                return clone;
            };

            console.log("Creating styled clone...");
            // Use cloneNode(true) and then iterate to apply styles might be faster but inline styles are robust.
            // We use the deepCloneWithInlineStyles approach to capture computed styles effectively.
            const styledClone = deepCloneWithInlineStyles(element);

            // Write to print window with Landscape Page Setup
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>平米內參 - 房市簡報</title>
                    <style>
                        /* A4 Landscape Page Setup */
                        @page {
                            size: A4 landscape;
                            margin: 0; /* Minimal margin, let slides define padding */
                        }
                        
                        /* Reset & Base */
                        * { 
                            margin: 0; 
                            padding: 0; 
                            box-sizing: border-box; 
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        
                        html, body {
                            width: 100%;
                            height: 100%;
                            background: #09090b; 
                        }
                        
                        /* Ensure one slide per page */
                        .slide-wrapper {
                            page-break-after: always;
                            page-break-inside: avoid;
                            width: 100%;
                            height: 100%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }

                        /* Scale content to fit page if needed */
                        /* But ideally we just let the aspect ratio container do its job */
                    </style>
                </head>
                <body>
                    <div id="report-content"></div>
                </body>
                </html>
            `);
            printWindow.document.close();

            // Append to the report-content container
            const container = printWindow.document.getElementById('report-content');
            if (container) {
                // Wrap each child of styledClone in a page-break wrapper if strictly needed?
                // Our SlideContainer has aspect-ratio. 
                // Let's rely on the structure we built.
                container.appendChild(styledClone);
            }

            // Wait a moment for styles to apply
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Trigger print dialog
            console.log("Opening print dialog...");
            printWindow.print();

        } catch (err: any) {
            console.error("PDF Generation failed:", err);
            alert(`PDF 生成失敗: ${err.message || err}\n請截圖此畫面給工程師。`);
        } finally {
            setIsGenerating(false);
        }
    };

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
                    報表生成器 (PPT Mode)
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

                    <div className="flex-1 overflow-y-auto p-4 lg:p-10 custom-scrollbar relative bg-zinc-950/95">

                        {/* Coming Soon - Feature Under Development */}
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="p-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 max-w-lg">
                                <div className="text-6xl mb-6">🚧</div>
                                <h2 className="text-2xl font-bold text-white mb-3">功能開發中</h2>
                                <p className="text-zinc-400 mb-6">
                                    報表生成功能正在積極開發中，敬請期待！
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center text-sm">
                                    <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300">PPTX 匯出</span>
                                    <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300">PDF 報告</span>
                                    <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300">圖表視覺化</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </AppLayout>
    );
}
