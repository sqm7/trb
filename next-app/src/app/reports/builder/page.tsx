"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAnalysisData } from "@/hooks/useAnalysisData";
import { withAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Trash2, FileDown, Layers, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Canvas } from "./components/Canvas";
import { DraggableChart } from "./components/DraggableChart";
import { ComponentPalette } from "./components/ComponentPalette";
import { SortablePageTab } from "./components/SortablePageTab";
import { PageDropZone } from "./components/PageDropZone";
import { ZoomControls } from "./components/ZoomControls";
import { ExportPageModal } from "./components/ExportPageModal";
import { FloatingToolbar } from "./components/FloatingToolbar";
import { useReportBuilderStore, ChartType, CanvasItem, ScaleMode } from "@/store/useReportBuilderStore";
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



function ReportBuilderPage() {
    const { loading, analysisData } = useAnalysisData();

    const pages = useReportBuilderStore(state => state.pages);
    const currentPageIndex = useReportBuilderStore(state => state.currentPageIndex);
    const canvasRatio = useReportBuilderStore(state => state.canvasRatio);
    const viewMode = useReportBuilderStore(state => state.viewMode);
    const setViewMode = useReportBuilderStore(state => state.setViewMode);
    const selectedIds = useReportBuilderStore(state => state.selectedIds);
    const addItem = useReportBuilderStore(state => state.addItem);
    const updateItem = useReportBuilderStore(state => state.updateItem);
    const removeItem = useReportBuilderStore(state => state.removeItem);
    const clearCanvas = useReportBuilderStore(state => state.clearCanvas);
    const setCanvasRatio = useReportBuilderStore(state => state.setCanvasRatio);
    const setSelectedIds = useReportBuilderStore(state => state.setSelectedIds);
    const toggleSelection = useReportBuilderStore(state => state.toggleSelection);
    const addToSelection = useReportBuilderStore(state => state.addToSelection);
    const clearSelection = useReportBuilderStore(state => state.clearSelection);
    const removeSelectedItems = useReportBuilderStore(state => state.removeSelectedItems);
    const moveSelectedItemsToPage = useReportBuilderStore(state => state.moveSelectedItemsToPage);
    const addPage = useReportBuilderStore(state => state.addPage);
    const deletePage = useReportBuilderStore(state => state.deletePage);
    const setCurrentPage = useReportBuilderStore(state => state.setCurrentPage);
    const reorderPages = useReportBuilderStore(state => state.reorderPages);
    const moveItemToPage = useReportBuilderStore(state => state.moveItemToPage);
    const batchUpdateItems = useReportBuilderStore(state => state.batchUpdateItems);

    // Drag state
    const [activeItemId, setActiveItemId] = useState<string | null>(null);
    const isDragging = useReportBuilderStore(state => state.isDragging);
    const draggedItemCount = useReportBuilderStore(state => state.draggedItemCount);
    const hoveredPageIndex = useReportBuilderStore(state => state.hoveredPageIndex);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isMouseOverCanvas, setIsMouseOverCanvas] = useState(true);

    // Image Export State
    const [exportModalOpen, setExportModalOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState<'png' | 'jpg'>('png');
    const [isExportingBatch, setIsExportingBatch] = useState(false);
    const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 });

    // Track mouse position global for drag feedback
    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setMousePos({ x: e.clientX, y: e.clientY });
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Check if user is typing in an input or textarea
            const isTyping = document.activeElement?.tagName === 'INPUT' ||
                document.activeElement?.tagName === 'TEXTAREA' ||
                (document.activeElement as HTMLElement)?.isContentEditable;

            if (isTyping) return;

            // Handle Delete or Backspace
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
                e.preventDefault();
                // Confirm if deleting many items or complex ones?
                // For now, just remove selected items as requested.
                removeSelectedItems();
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isDragging, selectedIds, removeSelectedItems]);

    // Handler for scale mode change from floating toolbar
    const handleScaleModeChange = useCallback((mode: ScaleMode) => {
        const updates: Record<string, Partial<CanvasItem>> = {};
        selectedIds.forEach(id => {
            updates[id] = { scaleMode: mode };
        });
        batchUpdateItems(updates);
    }, [selectedIds, batchUpdateItems]);

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    // Get current page items
    const currentPage = pages[currentPageIndex];
    const items = currentPage?.items || [];

    // Canvas dimensions based on ratio
    const canvasDimensions = canvasRatio === '16:9'
        ? { width: 960, height: 540 }
        : canvasRatio === 'A4'
            ? { width: 595, height: 842 } // A4 portrait
            : canvasRatio === '1:1'
                ? { width: 900, height: 900 }
                : canvasRatio === '9:16'
                    ? { width: 540, height: 960 }
                    : { width: 720, height: 900 }; // 4:5

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

        // Item dropped on page tab OR page drop zone
        const overId = String(over.id);
        if (String(active.id).startsWith('item-')) {
            let targetPageIndex = -1;

            if (overId.startsWith('page-drop-')) {
                // Drop on PageDropZone (Continuous Mode)
                targetPageIndex = parseInt(overId.replace('page-drop-', ''), 10);
            } else if (overId.startsWith('page-tab-drop-')) {
                // Drop on Page Tab (Single Page Mode)
                targetPageIndex = parseInt(overId.replace('page-tab-drop-', ''), 10);
            }

            if (targetPageIndex !== -1 && !isNaN(targetPageIndex)) {
                moveItemToPage(String(active.id), targetPageIndex);
                // Auto switch to target page
                setCurrentPage(targetPageIndex);
            }
        }
    }, [pages, reorderPages, moveItemToPage, setCurrentPage]);

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

    // Export to Image (PNG/JPG) - Modified for Multi-page support
    const handleExportImage = useCallback((format: 'png' | 'jpg') => {
        setExportFormat(format);
        setExportModalOpen(true);
    }, []);

    const handleBatchExport = useCallback(async (pageIndices: number[]) => {
        setExportModalOpen(false);
        setIsExportingBatch(true);
        setExportProgress({ current: 0, total: pageIndices.length });

        const originalPageIndex = useReportBuilderStore.getState().currentPageIndex;
        const originalViewMode = useReportBuilderStore.getState().viewMode;

        try {
            const { domToPng, domToJpeg } = await import('modern-screenshot');

            for (let i = 0; i < pageIndices.length; i++) {
                const targetIdx = pageIndices[i];
                setExportProgress({ current: i + 1, total: pageIndices.length });

                // Switch to target page and single mode to ensure it's rendered correctly for capture
                // (or just switch page if in single mode)
                useReportBuilderStore.getState().setCurrentPage(targetIdx);

                // Small delay for React to render the new page
                await new Promise(resolve => setTimeout(resolve, 500));

                const canvasElement = document.querySelector('.report-canvas-content') as HTMLElement;
                if (!canvasElement) {
                    console.error(`Canvas element not found for page ${targetIdx}`);
                    continue;
                }

                const width = canvasDimensions.width;
                const height = canvasDimensions.height;

                const options = {
                    scale: 2,
                    backgroundColor: '#09090b',
                    width,
                    height,
                    style: {
                        transform: 'none',
                        width: `${width}px`,
                        height: `${height}px`,
                    },
                };

                let dataUrl: string;
                if (exportFormat === 'png') {
                    dataUrl = await domToPng(canvasElement, options);
                } else {
                    dataUrl = await domToJpeg(canvasElement, { ...options, quality: 0.95 });
                }

                const link = document.createElement('a');
                link.download = `SQM-Report-P${targetIdx + 1}-${new Date().getTime()}.${exportFormat}`;
                link.href = dataUrl;
                link.click();
            }
        } catch (error) {
            console.error("Batch export failed:", error);
            alert("批次匯出失敗，部分頁面可能未完成。");
        } finally {
            // Restore original state
            useReportBuilderStore.getState().setCurrentPage(originalPageIndex);
            useReportBuilderStore.getState().setViewMode(originalViewMode);
            setIsExportingBatch(false);
        }
    }, [canvasDimensions, exportFormat]);

    // Clear canvas
    const handleClearCanvas = useCallback(() => {
        if (confirm("確定要清空當前頁面的所有元件嗎？")) {
            clearCanvas();
        }
    }, [clearCanvas]);


    return (
        <AppLayout>
            <FloatingToolbar
                selectedIds={selectedIds}
                onScaleModeChange={handleScaleModeChange}
                onDelete={removeSelectedItems}
            />
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex h-[calc(100vh-theme(spacing.20))] gap-4">

                    {/* Left Sidebar: Component Palette */}
                    <aside className="w-80 flex-shrink-0 bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-white/5 bg-zinc-900">
                            <h2 className="font-semibold text-white flex items-center gap-2">
                                <Layers className="h-5 w-5 text-violet-400" />
                                元件面板
                            </h2>
                            <p className="text-xs text-zinc-500 mt-1">點擊或拖曳新增到畫布</p>
                        </div>

                        <ComponentPalette
                            onAddItem={handleAddItem}
                            hasData={!!analysisData}
                        />

                        {/* Canvas Settings */}
                        <div className="p-4 border-t border-white/5 bg-zinc-900 space-y-3">
                            <div className="text-xs text-zinc-400 font-medium">畫布比例</div>
                            {/* Row 1: 16:9 and A4 */}
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant={canvasRatio === '16:9' ? 'default' : 'outline'}
                                    onClick={() => setCanvasRatio('16:9')}
                                    className={cn(
                                        "flex-1 h-12 flex-col gap-1",
                                        canvasRatio === '16:9' ? 'bg-violet-600' : 'border-zinc-700'
                                    )}
                                    title="16:9 (簡報/影片)"
                                >
                                    <div className={cn(
                                        "w-8 h-[18px] border-2",
                                        canvasRatio === '16:9' ? 'border-white' : 'border-zinc-500'
                                    )} />
                                    <span className="text-[10px]">16:9</span>
                                </Button>
                                <Button
                                    size="sm"
                                    variant={canvasRatio === 'A4' ? 'default' : 'outline'}
                                    onClick={() => setCanvasRatio('A4')}
                                    className={cn(
                                        "flex-1 h-12 flex-col gap-1",
                                        canvasRatio === 'A4' ? 'bg-violet-600' : 'border-zinc-700'
                                    )}
                                    title="A4 (直式列印)"
                                >
                                    <div className={cn(
                                        "w-[14px] h-5 border-2",
                                        canvasRatio === 'A4' ? 'border-white' : 'border-zinc-500'
                                    )} />
                                    <span className="text-[10px]">A4</span>
                                </Button>
                            </div>
                            {/* Row 2: 1:1, 9:16, 4:5 */}
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant={canvasRatio === '1:1' ? 'default' : 'outline'}
                                    onClick={() => setCanvasRatio('1:1')}
                                    className={cn(
                                        "flex-1 h-12 flex-col gap-1",
                                        canvasRatio === '1:1' ? 'bg-violet-600' : 'border-zinc-700'
                                    )}
                                    title="1:1 (IG/FB方圖)"
                                >
                                    <div className={cn(
                                        "w-4 h-4 border-2",
                                        canvasRatio === '1:1' ? 'border-white' : 'border-zinc-500'
                                    )} />
                                    <span className="text-[10px]">1:1</span>
                                </Button>
                                <Button
                                    size="sm"
                                    variant={canvasRatio === '9:16' ? 'default' : 'outline'}
                                    onClick={() => setCanvasRatio('9:16')}
                                    className={cn(
                                        "flex-1 h-12 flex-col gap-1",
                                        canvasRatio === '9:16' ? 'bg-violet-600' : 'border-zinc-700'
                                    )}
                                    title="9:16 (IG限動)"
                                >
                                    <div className={cn(
                                        "w-[11px] h-5 border-2",
                                        canvasRatio === '9:16' ? 'border-white' : 'border-zinc-500'
                                    )} />
                                    <span className="text-[10px]">9:16</span>
                                </Button>
                                <Button
                                    size="sm"
                                    variant={canvasRatio === '4:5' ? 'default' : 'outline'}
                                    onClick={() => setCanvasRatio('4:5')}
                                    className={cn(
                                        "flex-1 h-12 flex-col gap-1",
                                        canvasRatio === '4:5' ? 'bg-violet-600' : 'border-zinc-700'
                                    )}
                                    title="4:5 (FB/IG直式)"
                                >
                                    <div className={cn(
                                        "w-4 h-5 border-2",
                                        canvasRatio === '4:5' ? 'border-white' : 'border-zinc-500'
                                    )} />
                                    <span className="text-[10px]">4:5</span>
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <Button
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 h-10"
                                    disabled={items.length === 0}
                                    onClick={handleExport}
                                >
                                    <FileDown className="h-4 w-4 mr-2" />
                                    匯出 PDF
                                </Button>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 border-emerald-900/50 text-emerald-400 hover:bg-emerald-500/10 h-8 text-[10px]"
                                        disabled={items.length === 0}
                                        onClick={() => handleExportImage('png')}
                                    >
                                        PNG 圖片
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 border-emerald-900/50 text-emerald-400 hover:bg-emerald-500/10 h-8 text-[10px]"
                                        disabled={items.length === 0}
                                        onClick={() => handleExportImage('jpg')}
                                    >
                                        JPG 圖片
                                    </Button>
                                </div>
                            </div>

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
                            <div className="h-6 w-px bg-white/10 mx-2" />
                            <div className="bg-zinc-900 border border-white/10 rounded-lg p-0.5 flex">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setViewMode('single')}
                                    className={cn(
                                        "h-6 w-6 rounded-md",
                                        viewMode === 'single' ? "bg-white/20 text-white" : "text-zinc-500 hover:text-white"
                                    )}
                                    title="單頁模式"
                                >
                                    <div className="w-3 h-4 border border-current rounded-[1px]" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setViewMode('continuous')}
                                    className={cn(
                                        "h-6 w-6 rounded-md",
                                        viewMode === 'continuous' ? "bg-white/20 text-white" : "text-zinc-500 hover:text-white"
                                    )}
                                    title="多頁模式"
                                >
                                    <div className="flex flex-col gap-[1px]">
                                        <div className="w-3 h-2 border border-current rounded-[1px]" />
                                        <div className="w-3 h-2 border border-current rounded-[1px]" />
                                    </div>
                                </Button>
                            </div>
                            <ZoomControls />
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
                        <div
                            className="flex-1 p-8 flex flex-col items-center bg-zinc-950/50 overflow-auto scroll-smooth"
                            onWheel={(e) => {
                                if (e.ctrlKey || e.metaKey) {
                                    e.preventDefault();
                                    const delta = e.deltaY > 0 ? -10 : 10;
                                    const newZoom = Math.min(Math.max(useReportBuilderStore.getState().zoomLevel + delta, 10), 200);
                                    useReportBuilderStore.getState().setZoomLevel(newZoom);
                                }
                            }}
                        >
                            {!analysisData && !loading ? (
                                <div className="text-center space-y-4 mt-20">
                                    <div className="p-6 rounded-full bg-zinc-900 border border-white/5 inline-block">
                                        <Layers className="h-10 w-10 text-zinc-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-white">尚未載入數據</h3>
                                        <p className="text-zinc-500 text-sm mt-1">
                                            請先至 <Link href="/dashboard" className="text-violet-400 hover:underline">儀表板</Link> 進行分析
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8 pb-20">
                                    {viewMode === 'single' ? (
                                        /* Single Page Mode */
                                        pages[currentPageIndex] && (
                                            <PageDropZone
                                                key="single-page-view"
                                                pageIndex={currentPageIndex}
                                                isActive={true}
                                                onFocus={() => { }}
                                                onClick={() => { }}
                                            >
                                                {/* Page Label */}
                                                <div className="absolute -top-6 left-0 text-[10px] font-medium text-violet-300 bg-violet-500/10 border-t border-x border-violet-500/20 px-2 py-0.5 rounded-t-md">
                                                    Page {currentPageIndex + 1} - {pages[currentPageIndex].name}
                                                </div>

                                                {/* Page Canvas */}
                                                <div className="ring-2 ring-violet-500/30 shadow-2xl shadow-violet-900/10 transition-shadow duration-200">
                                                    <Canvas
                                                        width={canvasDimensions.width}
                                                        height={canvasDimensions.height}
                                                        items={pages[currentPageIndex].items}
                                                        onClickBackground={() => clearSelection()}
                                                        onMarqueeSelect={(ids, isAdditive) => {
                                                            if (isAdditive) {
                                                                ids.forEach(id => addToSelection(id));
                                                            } else {
                                                                setSelectedIds(ids);
                                                            }
                                                        }}
                                                    >
                                                        {pages[currentPageIndex].items.map(item => (
                                                            <DraggableChart
                                                                key={item.id}
                                                                item={item}
                                                                isSelected={selectedIds.includes(item.id)}
                                                                onSelect={(e?: React.MouseEvent) => {
                                                                    if (e?.ctrlKey || e?.metaKey) {
                                                                        toggleSelection(item.id);
                                                                    } else {
                                                                        setSelectedIds([item.id]);
                                                                    }
                                                                }}
                                                                onUpdate={(updates) => handleUpdateItem(item.id, updates)}
                                                                onRemove={() => handleRemoveItem(item.id)}
                                                                onMoveToPage={(targetIndex) => moveItemToPage(item.id, targetIndex)}
                                                                analysisData={analysisData}
                                                            />
                                                        ))}
                                                    </Canvas>
                                                </div>
                                            </PageDropZone>
                                        )
                                    ) : (
                                        /* Continuous Mode */
                                        pages.map((page, index) => (
                                            <PageDropZone
                                                key={page.id}
                                                pageIndex={index}
                                                isActive={index === currentPageIndex}
                                                onFocus={() => setCurrentPage(index)}
                                                onClick={() => setCurrentPage(index)}
                                            >
                                                {/* Page Label */}
                                                <div className={cn(
                                                    "absolute -top-6 left-0 text-[10px] font-medium transition-colors px-2 py-0.5 rounded-t-md",
                                                    index === currentPageIndex
                                                        ? "text-violet-300 bg-violet-500/10 border-t border-x border-violet-500/20"
                                                        : "text-zinc-500"
                                                )}>
                                                    Page {index + 1} - {page.name}
                                                </div>

                                                {/* Page Canvas */}
                                                <div className={cn(
                                                    "transition-shadow duration-200",
                                                    index === currentPageIndex ? "ring-2 ring-violet-500/30 shadow-2xl shadow-violet-900/10" : "opacity-90 hover:opacity-100"
                                                )}>
                                                    <Canvas
                                                        width={canvasDimensions.width}
                                                        height={canvasDimensions.height}
                                                        items={page.items}
                                                        onClickBackground={() => {
                                                            clearSelection();
                                                            setCurrentPage(index);
                                                        }}
                                                        onMarqueeSelect={(ids, isAdditive) => {
                                                            setCurrentPage(index);
                                                            if (isAdditive) {
                                                                ids.forEach(id => addToSelection(id));
                                                            } else {
                                                                setSelectedIds(ids);
                                                            }
                                                        }}
                                                    >
                                                        {page.items.map(item => (
                                                            <DraggableChart
                                                                key={item.id}
                                                                item={item}
                                                                isSelected={selectedIds.includes(item.id)}
                                                                onSelect={(e?: React.MouseEvent) => {
                                                                    setCurrentPage(index);
                                                                    if (e?.ctrlKey || e?.metaKey) {
                                                                        toggleSelection(item.id);
                                                                    } else {
                                                                        setSelectedIds([item.id]);
                                                                    }
                                                                }}
                                                                onUpdate={(updates) => handleUpdateItem(item.id, updates)}
                                                                onRemove={() => handleRemoveItem(item.id)}
                                                                onMoveToPage={(targetIndex) => moveItemToPage(item.id, targetIndex)}
                                                                analysisData={analysisData}
                                                            />
                                                        ))}
                                                    </Canvas>
                                                </div>
                                            </PageDropZone>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </main>
                </div>

                {/* Drag Overlay - Shows a ghost preview when dragging (DND Kit version) */}
                <DragOverlay dropAnimation={null}>
                    {activeItemId ? (
                        <div className="px-4 py-3 bg-violet-600/80 backdrop-blur-sm text-white rounded-lg shadow-2xl border border-violet-400/50 flex items-center gap-2 pointer-events-none">
                            <div className="w-6 h-6 border-2 border-white/80 rounded flex items-center justify-center">
                                <Plus className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium">
                                多選拖移中... {selectedIds.length > 1 ? `(${selectedIds.length} 個元件)` : ''}
                            </span>
                        </div>
                    ) : null}
                </DragOverlay>

                {/* Global Draggable Feedback (React-Rnd version) - Show when dragging across pages */}
                {
                    isDragging && !activeItemId && (
                        (!isMouseOverCanvas || (hoveredPageIndex !== null && hoveredPageIndex !== currentPageIndex))
                    ) && (
                        <div
                            className={cn(
                                "fixed z-[9999] pointer-events-none px-3 py-1.5 bg-violet-600 text-white rounded-full shadow-xl border-2 border-white/20 flex items-center gap-2 transform -translate-x-1/2 -translate-y-[150%] transition-transform",
                                hoveredPageIndex !== null && hoveredPageIndex !== currentPageIndex ? "scale-110 bg-violet-500" : ""
                            )}
                            style={{
                                left: mousePos.x,
                                top: mousePos.y,
                            }}
                        >
                            <Plus className="w-4 h-4" />
                            <div className="flex flex-col">
                                <span className="text-xs font-bold leading-none">
                                    {hoveredPageIndex !== null && hoveredPageIndex !== currentPageIndex
                                        ? `移動至第 ${hoveredPageIndex + 1} 頁`
                                        : '跨頁移動'}
                                </span>
                                {draggedItemCount > 1 && (
                                    <span className="text-[9px] opacity-80 leading-none mt-0.5">
                                        選取 {draggedItemCount} 個元件
                                    </span>
                                )}
                            </div>
                        </div>
                    )
                }
            </DndContext >
            {/* Export Page Selection Modal */}
            <ExportPageModal
                isOpen={exportModalOpen}
                onClose={() => setExportModalOpen(false)}
                onExport={handleBatchExport}
                format={exportFormat}
            />

            {/* Batch Export Loading Overlay */}
            {isExportingBatch && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="text-center space-y-6 max-w-sm w-full px-6">
                        <div className="relative mx-auto w-24 h-24">
                            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
                            <div
                                className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"
                                style={{ animationDuration: '1.5s' }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <FileDown className="h-8 w-8 text-emerald-400" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-white">正在處理匯出...</h3>
                            <p className="text-emerald-400 font-mono text-sm tracking-widest">
                                PAGE {exportProgress.current} OF {exportProgress.total}
                            </p>
                        </div>

                        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                style={{ width: `${(exportProgress.current / exportProgress.total) * 100}%` }}
                            />
                        </div>

                        <p className="text-zinc-500 text-xs italic">請勿關閉視窗，正在準備下載內容</p>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

export default withAdminAuth(ReportBuilderPage);

