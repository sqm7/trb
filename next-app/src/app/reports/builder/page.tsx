"use client";

import React, { useCallback, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAnalysisData } from "@/hooks/useAnalysisData";
import { Button } from "@/components/ui/button";
import { Trash2, FileDown, Layers, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Canvas } from "./components/Canvas";
import { DraggableChart } from "./components/DraggableChart";
import { ComponentPalette } from "./components/ComponentPalette";
import { SortablePageTab } from "./components/SortablePageTab";
import { useReportBuilderStore, ChartType, CanvasItem } from "@/store/useReportBuilderStore";
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCenter,
} from "@dnd-kit/core";
import {
    SortableContext,
    horizontalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";

// Re-export types for components that import from this file
export type { ChartType, CanvasItem };

export default function ReportBuilderPage() {
    const { loading, analysisData } = useAnalysisData();

    // Get state and actions from Zustand store
    const pages = useReportBuilderStore(state => state.pages);
    const currentPageIndex = useReportBuilderStore(state => state.currentPageIndex);
    const canvasRatio = useReportBuilderStore(state => state.canvasRatio);
    const selectedId = useReportBuilderStore(state => state.selectedId);
    const addItem = useReportBuilderStore(state => state.addItem);
    const updateItem = useReportBuilderStore(state => state.updateItem);
    const removeItem = useReportBuilderStore(state => state.removeItem);
    const clearCanvas = useReportBuilderStore(state => state.clearCanvas);
    const setCanvasRatio = useReportBuilderStore(state => state.setCanvasRatio);
    const setSelectedId = useReportBuilderStore(state => state.setSelectedId);
    const addPage = useReportBuilderStore(state => state.addPage);
    const deletePage = useReportBuilderStore(state => state.deletePage);
    const setCurrentPage = useReportBuilderStore(state => state.setCurrentPage);
    const reorderPages = useReportBuilderStore(state => state.reorderPages);
    const moveItemToPage = useReportBuilderStore(state => state.moveItemToPage);

    // Drag state
    const [activeItemId, setActiveItemId] = useState<string | null>(null);

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    // Get current page items
    const currentPage = pages[currentPageIndex];
    const items = currentPage?.items || [];

    // Add item to canvas (wrapper for ComponentPalette)
    const handleAddItem = useCallback((type: ChartType) => {
        addItem(type);
    }, [addItem]);

    // Update item position/size
    const handleUpdateItem = useCallback((id: string, updates: Partial<CanvasItem>) => {
        updateItem(id, updates);
    }, [updateItem]);

    // Remove item
    const handleRemoveItem = useCallback((id: string) => {
        removeItem(id);
    }, [removeItem]);

    // Add new page
    const handleAddPage = useCallback(() => {
        addPage();
    }, [addPage]);

    // Delete page
    const handleDeletePage = useCallback((pageId: string) => {
        if (pages.length <= 1) return;
        if (confirm("確定要刪除此頁面嗎？")) {
            deletePage(pageId);
        }
    }, [deletePage, pages.length]);

    // Handle drag start (for items or page tabs)
    const handleDragStart = useCallback((event: DragStartEvent) => {
        if (String(event.active.id).startsWith('item-')) {
            setActiveItemId(String(event.active.id));
        }
    }, []);

    // Handle drag end
    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        setActiveItemId(null);

        if (!over) return;

        // Page reordering
        if (String(active.id).startsWith('page-') && String(over.id).startsWith('page-')) {
            const fromIndex = pages.findIndex(p => p.id === active.id);
            const toIndex = pages.findIndex(p => p.id === over.id);
            if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
                reorderPages(fromIndex, toIndex);
            }
        }

        // Item dropped on page tab
        if (String(active.id).startsWith('item-') && String(over.id).startsWith('page-drop-')) {
            const targetPageIndex = parseInt(String(over.id).replace('page-drop-', ''), 10);
            if (!isNaN(targetPageIndex)) {
                moveItemToPage(String(active.id), targetPageIndex);
            }
        }
    }, [pages, reorderPages, moveItemToPage]);

    // Export to PDF
    const handleExport = useCallback(() => {
        const canvasElement = document.querySelector('.report-canvas-content');
        if (!canvasElement) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const styles = Array.from(document.styleSheets)
            .map(sheet => {
                try {
                    return Array.from(sheet.cssRules).map(rule => rule.cssText).join('');
                } catch (e) {
                    return '';
                }
            }).join('');

        const dimensions = canvasRatio === '16:9'
            ? { width: 960, height: 540 }
            : { width: 842, height: 595 };

        printWindow.document.write(`
            <html>
                <head>
                    <title>SQM Report - ${new Date().toLocaleDateString()}</title>
                    <style>
                        ${styles}
                        @media print {
                            @page {
                                size: ${canvasRatio === 'A4' ? 'A4 landscape' : '960px 540px'};
                                margin: 0;
                            }
                            body { margin: 0; padding: 0; background: #09090b !important; -webkit-print-color-adjust: exact; }
                            .print-canvas {
                                width: ${dimensions.width}px;
                                height: ${dimensions.height}px;
                                position: relative;
                                background: #09090b;
                                overflow: hidden;
                            }
                            .rnd-resizer, .no-print { display: none !important; }
                        }
                    </style>
                </head>
                <body>
                    <div class="print-canvas">
                        ${canvasElement.innerHTML}
                    </div>
                    <script>
                        window.onload = () => {
                            setTimeout(() => {
                                window.print();
                            }, 1000);
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    }, [canvasRatio]);

    // Clear canvas
    const handleClearCanvas = useCallback(() => {
        if (confirm("確定要清空當前頁面的所有元件嗎？")) {
            clearCanvas();
        }
    }, [clearCanvas]);

    // Canvas dimensions based on ratio
    const canvasDimensions = canvasRatio === '16:9'
        ? { width: 960, height: 540 }
        : { width: 842, height: 595 }; // A4 Landscape at 72dpi

    return (
        <AppLayout>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex h-[calc(100vh-theme(spacing.20))] gap-4">

                    {/* Left Sidebar: Component Palette */}
                    <aside className="w-64 flex-shrink-0 bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-white/5 bg-zinc-900">
                            <h2 className="font-semibold text-white flex items-center gap-2">
                                <Layers className="h-5 w-5 text-violet-400" />
                                元件面板
                            </h2>
                            <p className="text-xs text-zinc-500 mt-1">點擊新增到畫布</p>
                        </div>

                        <ComponentPalette
                            onAddItem={handleAddItem}
                            hasData={!!analysisData}
                        />

                        {/* Canvas Settings */}
                        <div className="p-4 border-t border-white/5 bg-zinc-900 space-y-3">
                            <div className="text-xs text-zinc-400 font-medium">畫布比例</div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant={canvasRatio === '16:9' ? 'default' : 'outline'}
                                    onClick={() => setCanvasRatio('16:9')}
                                    className={cn(
                                        "flex-1 text-xs",
                                        canvasRatio === '16:9' ? 'bg-violet-600' : 'border-zinc-700'
                                    )}
                                >
                                    16:9
                                </Button>
                                <Button
                                    size="sm"
                                    variant={canvasRatio === 'A4' ? 'default' : 'outline'}
                                    onClick={() => setCanvasRatio('A4')}
                                    className={cn(
                                        "flex-1 text-xs",
                                        canvasRatio === 'A4' ? 'bg-violet-600' : 'border-zinc-700'
                                    )}
                                >
                                    A4
                                </Button>
                            </div>

                            <Button
                                className="w-full bg-emerald-600 hover:bg-emerald-700 h-10"
                                disabled={items.length === 0}
                                onClick={handleExport}
                            >
                                <FileDown className="h-4 w-4 mr-2" />
                                匯出報表
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-500/30 h-9 text-xs"
                                disabled={items.length === 0}
                                onClick={handleClearCanvas}
                            >
                                <Trash2 className="h-3.5 w-3.5 mr-2" />
                                清空畫布
                            </Button>
                        </div>
                    </aside>

                    {/* Main: Canvas Area */}
                    <main className="flex-1 bg-zinc-950 rounded-xl overflow-hidden flex flex-col relative">
                        {/* Toolbar */}
                        <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-zinc-900/80">
                            <span className="text-sm font-medium text-zinc-400">
                                報表編輯器 • {canvasRatio} • 第 {currentPageIndex + 1}/{pages.length} 頁 • {items.length} 個元件
                            </span>
                            <div className="flex items-center gap-2">
                                {selectedId && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleRemoveItem(selectedId)}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        刪除選中
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Page Navigation Tabs */}
                        <div className="h-10 border-b border-white/5 flex items-center px-2 bg-zinc-900/50 gap-1 overflow-x-auto">
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 flex-shrink-0"
                                onClick={() => setCurrentPage(currentPageIndex - 1)}
                                disabled={currentPageIndex === 0}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <SortableContext items={pages.map(p => p.id)} strategy={horizontalListSortingStrategy}>
                                {pages.map((page, index) => (
                                    <SortablePageTab
                                        key={page.id}
                                        id={page.id}
                                        name={page.name}
                                        index={index}
                                        isActive={index === currentPageIndex}
                                        canDelete={pages.length > 1}
                                        onClick={() => setCurrentPage(index)}
                                        onDelete={() => handleDeletePage(page.id)}
                                    />
                                ))}
                            </SortableContext>

                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 flex-shrink-0"
                                onClick={() => setCurrentPage(currentPageIndex + 1)}
                                disabled={currentPageIndex === pages.length - 1}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>

                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 flex-shrink-0"
                                onClick={handleAddPage}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                新增頁面
                            </Button>
                        </div>

                        {/* Canvas Container */}
                        <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-zinc-950/50">
                            {!analysisData && !loading ? (
                                <div className="text-center space-y-4">
                                    <div className="p-6 rounded-full bg-zinc-900 border border-white/5 inline-block">
                                        <Layers className="h-10 w-10 text-zinc-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-white">尚未載入數據</h3>
                                        <p className="text-zinc-500 text-sm mt-1">
                                            請先至 <a href="/dashboard" className="text-violet-400 hover:underline">儀表板</a> 進行分析
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <Canvas
                                    width={canvasDimensions.width}
                                    height={canvasDimensions.height}
                                    onClickBackground={() => setSelectedId(null)}
                                >
                                    {items.map(item => (
                                        <DraggableChart
                                            key={item.id}
                                            item={item}
                                            isSelected={selectedId === item.id}
                                            onSelect={() => setSelectedId(item.id)}
                                            onUpdate={(updates) => handleUpdateItem(item.id, updates)}
                                            onRemove={() => handleRemoveItem(item.id)}
                                            analysisData={analysisData}
                                        />
                                    ))}
                                </Canvas>
                            )}
                        </div>
                    </main>
                </div>
            </DndContext>
        </AppLayout>
    );
}
