'use client';

import { AppLayout } from "@/components/layout/AppLayout";
import { withAdminAuth } from "@/hooks/useAdminAuth";
import dynamic from 'next/dynamic';

// Dynamically import LeafletMap to avoid SSR issues (Leaflet requires window)
const LeafletMap = dynamic(
    () => import('@/components/features/Map/LeafletMap'),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900 rounded-xl border border-white/5">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-10 w-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-zinc-500 text-sm">Initializing Geospatial Engine...</p>
                </div>
            </div>
        )
    }
);

function MapPage() {
    return (
        <AppLayout>
            <div className="flex flex-col h-[calc(100vh-8rem)] gap-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">地圖分析實驗室</h1>
                        <p className="text-zinc-400 text-sm">整合 OpenStreetMap 與政府開放圖資的空間分析工具。</p>
                    </div>
                </div>

                <div className="flex-1 bg-zinc-900/50 rounded-2xl border border-white/5 p-1 relative overflow-hidden">
                    <LeafletMap />
                </div>
            </div>
        </AppLayout>
    );
}

export default withAdminAuth(MapPage);
