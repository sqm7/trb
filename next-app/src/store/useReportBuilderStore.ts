"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Chart types available in the Report Builder
export type ChartType =
    | 'ranking-chart'
    | 'price-band-chart'
    | 'unit-price-bubble'
    | 'sales-velocity-chart'
    | 'parking-pie'
    | 'parking-price'
    | 'parking-scatter'
    | 'parking-floor'
    | 'heatmap'
    | 'data-list';

export type ScaleMode = 'crop' | 'pan' | 'fit';

export interface CanvasItem {
    id: string;
    type: ChartType;
    x: number;
    y: number;
    width: number;
    height: number;
    scaleMode: ScaleMode;
    panOffset: { x: number; y: number };
    contentScale: number;
}

export interface ReportPage {
    id: string;
    name: string;
    items: CanvasItem[];
}

const DEFAULT_SIZES: Record<ChartType, { width: number; height: number }> = {
    'ranking-chart': { width: 400, height: 300 },
    'price-band-chart': { width: 450, height: 280 },
    'unit-price-bubble': { width: 380, height: 320 },
    'sales-velocity-chart': { width: 420, height: 260 },
    'parking-pie': { width: 300, height: 300 },
    'parking-price': { width: 400, height: 300 },
    'parking-scatter': { width: 450, height: 350 },
    'parking-floor': { width: 400, height: 400 },
    'heatmap': { width: 500, height: 350 },
    'data-list': { width: 600, height: 400 },
};

interface ReportBuilderState {
    // Multi-page support
    pages: ReportPage[];
    currentPageIndex: number;

    canvasRatio: '16:9' | 'A4';
    selectedId: string | null;

    // Page Actions
    addPage: () => void;
    deletePage: (pageId: string) => void;
    setCurrentPage: (index: number) => void;
    renamePage: (pageId: string, name: string) => void;
    reorderPages: (fromIndex: number, toIndex: number) => void;

    // Item Actions (operate on current page)
    addItem: (type: ChartType) => void;
    updateItem: (id: string, updates: Partial<CanvasItem>) => void;
    removeItem: (id: string) => void;
    moveItemToPage: (itemId: string, targetPageIndex: number) => void;
    clearCanvas: () => void;

    // Canvas Actions
    setCanvasRatio: (ratio: '16:9' | 'A4') => void;
    setSelectedId: (id: string | null) => void;

    // Legacy compatibility - get current page's items
    get items(): CanvasItem[];
}

const createDefaultPage = (index: number): ReportPage => ({
    id: `page-${Date.now()}`,
    name: `第 ${index + 1} 頁`,
    items: [],
});

export const useReportBuilderStore = create<ReportBuilderState>()(
    persist(
        (set, get) => ({
            pages: [createDefaultPage(0)],
            currentPageIndex: 0,
            canvasRatio: '16:9',
            selectedId: null,

            // Getter for current page items (for backward compatibility)
            get items() {
                const state = get();
                return state.pages[state.currentPageIndex]?.items || [];
            },

            // Page Actions
            addPage: () => {
                set(state => {
                    const newPage = createDefaultPage(state.pages.length);
                    return {
                        pages: [...state.pages, newPage],
                        currentPageIndex: state.pages.length,
                        selectedId: null,
                    };
                });
            },

            deletePage: (pageId: string) => {
                set(state => {
                    if (state.pages.length <= 1) return state; // Keep at least one page

                    const pageIndex = state.pages.findIndex(p => p.id === pageId);
                    if (pageIndex === -1) return state;

                    const newPages = state.pages.filter(p => p.id !== pageId);
                    const newIndex = Math.min(state.currentPageIndex, newPages.length - 1);

                    return {
                        pages: newPages,
                        currentPageIndex: newIndex,
                        selectedId: null,
                    };
                });
            },

            setCurrentPage: (index: number) => {
                set(state => ({
                    currentPageIndex: Math.max(0, Math.min(index, state.pages.length - 1)),
                    selectedId: null,
                }));
            },

            renamePage: (pageId: string, name: string) => {
                set(state => ({
                    pages: state.pages.map(p =>
                        p.id === pageId ? { ...p, name } : p
                    ),
                }));
            },

            reorderPages: (fromIndex: number, toIndex: number) => {
                set(state => {
                    if (fromIndex === toIndex) return state;
                    const newPages = [...state.pages];
                    const [removed] = newPages.splice(fromIndex, 1);
                    newPages.splice(toIndex, 0, removed);
                    // Update page names to reflect new order
                    const renamedPages = newPages.map((p, i) => ({
                        ...p,
                        name: `第 ${i + 1} 頁`
                    }));
                    // Update currentPageIndex if needed
                    let newCurrentIndex = state.currentPageIndex;
                    if (state.currentPageIndex === fromIndex) {
                        newCurrentIndex = toIndex;
                    } else if (fromIndex < state.currentPageIndex && toIndex >= state.currentPageIndex) {
                        newCurrentIndex = state.currentPageIndex - 1;
                    } else if (fromIndex > state.currentPageIndex && toIndex <= state.currentPageIndex) {
                        newCurrentIndex = state.currentPageIndex + 1;
                    }
                    return { pages: renamedPages, currentPageIndex: newCurrentIndex };
                });
            },

            addItem: (type: ChartType) => {
                const defaultSize = DEFAULT_SIZES[type] || { width: 400, height: 300 };

                set(state => {
                    const currentPage = state.pages[state.currentPageIndex];
                    if (!currentPage) return state;

                    const offset = currentPage.items.length * 20;
                    const newItem: CanvasItem = {
                        id: `item-${Date.now()}`,
                        type,
                        x: 50 + offset,
                        y: 50 + offset,
                        width: defaultSize.width,
                        height: defaultSize.height,
                        scaleMode: 'crop',
                        panOffset: { x: 0, y: 0 },
                        contentScale: 1,
                    };

                    const updatedPages = state.pages.map((page, i) =>
                        i === state.currentPageIndex
                            ? { ...page, items: [...page.items, newItem] }
                            : page
                    );

                    return {
                        pages: updatedPages,
                        selectedId: newItem.id,
                    };
                });
            },

            updateItem: (id: string, updates: Partial<CanvasItem>) => {
                set(state => {
                    const updatedPages = state.pages.map((page, i) =>
                        i === state.currentPageIndex
                            ? {
                                ...page,
                                items: page.items.map(item =>
                                    item.id === id ? { ...item, ...updates } : item
                                ),
                            }
                            : page
                    );

                    return { pages: updatedPages };
                });
            },

            removeItem: (id: string) => {
                set(state => {
                    const updatedPages = state.pages.map((page, i) =>
                        i === state.currentPageIndex
                            ? { ...page, items: page.items.filter(item => item.id !== id) }
                            : page
                    );

                    return {
                        pages: updatedPages,
                        selectedId: state.selectedId === id ? null : state.selectedId,
                    };
                });
            },

            moveItemToPage: (itemId: string, targetPageIndex: number) => {
                set(state => {
                    const currentPage = state.pages[state.currentPageIndex];
                    const item = currentPage?.items.find(i => i.id === itemId);
                    if (!item || targetPageIndex === state.currentPageIndex) return state;
                    if (targetPageIndex < 0 || targetPageIndex >= state.pages.length) return state;

                    const updatedPages = state.pages.map((page, i) => {
                        if (i === state.currentPageIndex) {
                            return { ...page, items: page.items.filter(it => it.id !== itemId) };
                        }
                        if (i === targetPageIndex) {
                            return { ...page, items: [...page.items, { ...item, x: 50, y: 50 }] };
                        }
                        return page;
                    });

                    return { pages: updatedPages, selectedId: null };
                });
            },

            clearCanvas: () => {
                set(state => {
                    const updatedPages = state.pages.map((page, i) =>
                        i === state.currentPageIndex
                            ? { ...page, items: [] }
                            : page
                    );

                    return {
                        pages: updatedPages,
                        selectedId: null,
                    };
                });
            },

            setCanvasRatio: (canvasRatio) => set({ canvasRatio }),
            setSelectedId: (selectedId) => set({ selectedId }),
        }),
        {
            name: 'report-builder-storage',
        }
    )
);
