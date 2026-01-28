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
    | 'heatmap'
    | 'data-list';

export interface CanvasItem {
    id: string;
    type: ChartType;
    x: number;
    y: number;
    width: number;
    height: number;
}

const DEFAULT_SIZES: Record<ChartType, { width: number; height: number }> = {
    'ranking-chart': { width: 400, height: 300 },
    'price-band-chart': { width: 450, height: 280 },
    'unit-price-bubble': { width: 380, height: 320 },
    'sales-velocity-chart': { width: 420, height: 260 },
    'parking-pie': { width: 300, height: 300 },
    'heatmap': { width: 500, height: 350 },
    'data-list': { width: 600, height: 400 },
};

interface ReportBuilderState {
    items: CanvasItem[];
    canvasRatio: '16:9' | 'A4';
    selectedId: string | null;

    // Actions
    addItem: (type: ChartType) => void;
    updateItem: (id: string, updates: Partial<CanvasItem>) => void;
    removeItem: (id: string) => void;
    clearCanvas: () => void;
    setCanvasRatio: (ratio: '16:9' | 'A4') => void;
    setSelectedId: (id: string | null) => void;
}

export const useReportBuilderStore = create<ReportBuilderState>()(
    persist(
        (set, get) => ({
            items: [],
            canvasRatio: '16:9',
            selectedId: null,

            addItem: (type: ChartType) => {
                const defaultSize = DEFAULT_SIZES[type] || { width: 400, height: 300 };
                const existingItems = get().items;

                // Calculate position to avoid overlap
                const offset = existingItems.length * 20;
                const newItem: CanvasItem = {
                    id: `item-${Date.now()}`,
                    type,
                    x: 50 + offset,
                    y: 50 + offset,
                    width: defaultSize.width,
                    height: defaultSize.height,
                };

                set({
                    items: [...existingItems, newItem],
                    selectedId: newItem.id,
                });
            },

            updateItem: (id: string, updates: Partial<CanvasItem>) => {
                set(state => ({
                    items: state.items.map(item =>
                        item.id === id ? { ...item, ...updates } : item
                    ),
                }));
            },

            removeItem: (id: string) => {
                set(state => ({
                    items: state.items.filter(item => item.id !== id),
                    selectedId: state.selectedId === id ? null : state.selectedId,
                }));
            },

            clearCanvas: () => {
                set({ items: [], selectedId: null });
            },

            setCanvasRatio: (canvasRatio) => set({ canvasRatio }),
            setSelectedId: (selectedId) => set({ selectedId }),
        }),
        {
            name: 'report-builder-storage',
        }
    )
);
