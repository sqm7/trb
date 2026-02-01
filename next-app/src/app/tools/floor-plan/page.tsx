'use client';

import { AppLayout } from "@/components/layout/AppLayout";
import dynamic from 'next/dynamic';

// Dynamaic import to prevent SSR issues with Canvas API
const FloorPlanCanvas = dynamic(
    () => import('@/components/features/FloorPlan/FloorPlanCanvas'),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 border border-white/5 rounded-xl">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-10 w-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-zinc-500 text-sm">Loading Measurement Engine...</p>
                </div>
            </div>
        )
    }
);

export default function FloorPlanPage() {
    return (
        <AppLayout>
            <div className="flex flex-col h-[calc(100vh-8rem)] gap-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">平面圖測量工具</h1>
                        <p className="text-zinc-400 text-sm">上傳圖檔、設定比例尺，精準計算空間坪數。</p>
                    </div>
                </div>

                <div className="flex-1 bg-zinc-900/50 rounded-2xl border border-white/5 p-1 relative overflow-hidden shadow-2xl">
                    <FloorPlanCanvas />
                </div>
            </div>
        </AppLayout>
    );
}
