'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useFilterStore } from '@/store/useFilterStore';
import { Loader2, AlertTriangle, Lock, UserPlus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

// Import Reports
import { PriceBandReport } from '@/components/reports/PriceBandReport';
import { SalesVelocityReport } from '@/components/reports/SalesVelocityReport';
import { RankingReport } from '@/components/reports/RankingReport';
import { UnitPriceAnalysisReport } from '@/components/reports/UnitPriceAnalysisReport';
import { DataListReport } from '@/components/reports/DataListReport';
import { HeatmapReport } from '@/components/reports/HeatmapReport';
import { ParkingAnalysisReport } from '@/components/reports/ParkingAnalysisReport';
import PolicyTimelineReport from '@/components/reports/PolicyTimelineReport';

function SharedSnapshotContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [snapshotData, setSnapshotData] = useState<any>(null);

    // Store actions
    const hydrateFilters = useFilterStore(state => state.hydrateFilters);
    const setActiveTab = useFilterStore(state => state.setActiveTab);
    const activeTab = useFilterStore(state => state.activeTab);

    useEffect(() => {
        if (!id) return;

        const fetchSnapshot = async () => {
            try {
                // Call Edge Function to get snapshot (handles view count & expiry check)
                const { data, error: funcError } = await supabase.functions.invoke(`get-snapshot?id=${id}`, {
                    method: 'GET'
                });

                if (funcError) {
                    // @ts-ignore
                    if (funcError.status === 410) throw new Error('此報表已過期');
                    throw new Error('報表讀取失敗或不存在');
                }
                setSnapshotData(data);

                // 1. Hydrate Store with locked config
                if (data.config_json) {
                    if (data.config_json.filters) {
                        hydrateFilters(data.config_json.filters);
                    }
                    if (data.config_json.activeTab) {
                        setActiveTab(data.config_json.activeTab);
                    }
                }

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSnapshot();
    }, [id, hydrateFilters, setActiveTab]);

    // Render Logic
    const renderContent = () => {
        // Fallback: Check data_json first (if column existed), then config_json.data
        const analysisData = snapshotData?.data_json || snapshotData?.config_json?.data;
        if (!analysisData) return null;

        switch (activeTab) {
            case 'ranking':
                return <RankingReport data={analysisData} />;
            case 'price-band':
                return <PriceBandReport data={analysisData.priceBandAnalysis ? { ...analysisData.priceBandAnalysis, transactionDetails: analysisData.transactionDetails } : null} />;
            case 'unit-price':
                return <UnitPriceAnalysisReport data={analysisData} />;
            case 'heatmap':
                return <HeatmapReport data={analysisData.priceGridAnalysis ? analysisData : null} />;
            case 'timeline':
                return <PolicyTimelineReport data={analysisData.transactionDetails} />;
            case 'velocity':
                return <SalesVelocityReport data={analysisData} />;
            case 'parking':
                return <ParkingAnalysisReport data={analysisData.parkingAnalysis?.parkingRatio ? analysisData : null} />;
            case 'data-list':
                return <DataListReport trigger={analysisData} data={analysisData.transactionDetails} />;
            default:
                return <RankingReport data={analysisData} />;
        }
    };

    // Expiry display
    const timeLeft = snapshotData ? new Date(snapshotData.expires_at).getTime() - Date.now() : 0;
    const hoursLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60)));

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050A15] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mb-4" />
                <p className="text-zinc-500 text-sm animate-pulse">正在解密商務快照數據...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#050A15] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-red-500/30">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl text-white font-bold mb-2">無法讀取報表</h2>
                <p className="text-zinc-400 mb-6">{error}</p>
                <Button onClick={() => router.push('/')} variant="outline">
                    返回首頁
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050A15] selection:bg-cyan-500/30">
            {/* Top Warning Bar (Read Only Context) */}
            <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-900/40 via-zinc-900/90 to-zinc-900/90 backdrop-blur-md border-b border-amber-500/20 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-500">
                    <Lock className="w-4 h-4" />
                    <span className="text-xs font-semibold tracking-wide">VIEW ONLY MODE</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-black/40 rounded-full border border-white/5">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        <span className="text-xs text-zinc-300">
                            有效期限剩餘 <span className="text-white font-mono">{hoursLeft}</span> 小時
                        </span>
                    </div>
                </div>
            </div>

            {/* Conversion Header */}
            <div className="bg-zinc-900/50 border-b border-white/5 px-4 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">
                        {snapshotData?.title || '未命名市場分析報告'}
                    </h1>
                    <p className="text-sm text-zinc-400">
                        由合作夥伴建立 • 數據已透過 <span className="text-cyan-400 font-mono">Snapshot ID: {id?.toString().slice(0, 8)}</span> 鎖定
                    </p>
                </div>
                <Button
                    onClick={() => router.push('/')}
                    className="bg-[#06C755] hover:bg-[#05b34c] text-white gap-2 shadow-lg shadow-green-900/20 w-full sm:w-auto"
                >
                    <UserPlus className="w-4 h-4" />
                    加入會員查看更多
                </Button>
            </div>

            {/* Main Report Content */}
            <main className="p-4 lg:p-8 max-w-[1600px] mx-auto opacity-100 transition-opacity duration-700">
                {/* SNAPSHOT READ-ONLY MODE */}
                <div className="snapshot-read-only">
                    <style jsx global>{`
             .snapshot-read-only button,
             .snapshot-read-only input,
             .snapshot-read-only select,
             .snapshot-read-only [role="button"],
             .snapshot-read-only [role="tab"] {
               pointer-events: none !important;
               opacity: 0.7;
               filter: grayscale(0.5);
             }
             /* Allow tooltip triggers if they are SVG elements (Charts) */
             .snapshot-read-only svg,
             .snapshot-read-only .recharts-surface {
               pointer-events: auto !important;
             }
             /* Ensure scroll containers work */
             .snapshot-read-only * {
               /* Default is auto */
             }
           `}</style>
                    {renderContent()}
                </div>
            </main>

            {/* Floating CTA for Mobile */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 sm:hidden w-[90%] max-w-sm">
                <Button
                    onClick={() => router.push('/')}
                    className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white shadow-xl shadow-black/50 border border-green-400/20"
                >
                    <UserPlus className="w-4 h-4 mr-2" />
                    解鎖完整功能
                </Button>
            </div>
        </div>
    );
}

export default function SharedSnapshotPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#050A15] flex items-center justify-center"><Loader2 className="w-10 h-10 text-cyan-500 animate-spin" /></div>}>
            <SharedSnapshotContent />
        </Suspense>
    );
}
