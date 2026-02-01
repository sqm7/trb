'use client';

import { useState } from 'react';
import { Share2, Copy, Check, Clock, Globe, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useReportBuilderStore } from '@/store/useReportBuilderStore'; // Or useFilterStore depending on what we snapshot
import { useFilterStore } from '@/store/useFilterStore';
import { supabase } from '@/lib/supabase';

interface SnapshotShareModalProps {
    trigger?: React.ReactNode;
    analysisData?: any;
}

export function SnapshotShareModal({ trigger, analysisData }: SnapshotShareModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
    const [stats, setStats] = useState<{ expiresAt: string } | null>(null);
    const [title, setTitle] = useState('');
    const [copied, setCopied] = useState(false);

    // Get current state to snapshot
    const filterState = useFilterStore((state) => state);

    // Construct the config object we want to freeze
    const getSnapshotConfig = () => {
        return {
            filters: {
                counties: filterState.counties,
                districts: filterState.districts,
                projectNames: filterState.projectNames,
                selectedRoomTypes: filterState.selectedRoomTypes,
                // Add other relevant state...
            },
            activeTab: filterState.activeTab,
            view: 'default' // could add current view mode
        };
    };

    const handleCreateSnapshot = async () => {
        setLoading(true);
        try {
            const config = getSnapshotConfig();

            // Sanitize analysisData to avoid hitting payload limits (remove large transaction lists)
            const sanitizedData = analysisData ? {
                ...analysisData,
                transactionDetails: analysisData.transactionDetails ? analysisData.transactionDetails.slice(0, 100) : [], // Keep top 100 only
                // Check other potentially large fields
                priceBandAnalysis: analysisData.priceBandAnalysis ? {
                    ...analysisData.priceBandAnalysis,
                    transactionDetails: undefined // Remove duplicate ref if exists
                } : undefined
            } : null;

            const { data, error: funcError } = await supabase.functions.invoke('create-snapshot', {
                body: {
                    title: title || `Market Report - ${new Date().toLocaleDateString()}`,
                    config_json: {
                        ...config,
                        data: sanitizedData
                    },
                    duration_hours: 24
                }
            });

            if (funcError) {
                console.error('Edge Function Error:', funcError);
                throw new Error(funcError.message || `Status: ${funcError.context?.response?.status || 'Unknown'}`);
            }

            // Handle different environments (trb vs kthd)
            const origin = window.location.origin;
            const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
            const shareLink = `${origin}${basePath}/share?id=${data.snapshot_id}`;

            setSnapshotUrl(shareLink);
            setStats({ expiresAt: data.expires_at });

        } catch (err: any) {
            console.error(err);
            const msg = err instanceof Error ? err.message : JSON.stringify(err);
            alert('Error creating link: ' + msg);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (snapshotUrl) {
            navigator.clipboard.writeText(snapshotUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const reset = () => {
        setSnapshotUrl(null);
        setStats(null);
        setTitle('');
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && reset()}>
            <DialogTrigger asChild onClick={() => setIsOpen(true)}>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-2 bg-zinc-900/50 border-white/10 hover:bg-zinc-800 text-cyan-400">
                        <Share2 className="w-4 h-4" />
                        <span className="hidden sm:inline">分享報表</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Globe className="w-5 h-5 text-cyan-400" />
                        {loading ? '生成報表連結中...' : '生成報表分享連結'}
                    </DialogTitle>
                </DialogHeader>

                {!snapshotUrl ? (
                    <div className="space-y-6 py-4">
                        {loading ? (
                            <div className="space-y-4 animate-in fade-in zoom-in-95">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-zinc-400">
                                        <span>正在加密分析數據...</span>
                                        <span className="animate-pulse">請稍候</span>
                                    </div>
                                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-cyan-500 animate-[progress_2s_ease-in-out_infinite] w-[60%] rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                                    </div>
                                </div>
                                <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-lg">
                                    <p className="text-xs text-cyan-300 flex items-center gap-2">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        系統正在為您建立專屬的快照頁面
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">報告標題 (選填)</label>
                                    <Input
                                        placeholder="例如：信義區 Q1 市場分析..."
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        className="bg-zinc-900 border-zinc-700 focus:border-cyan-500"
                                    />
                                </div>

                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 space-y-3">
                                    <h4 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        分享規則說明
                                    </h4>
                                    <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside">
                                        <li>此連結將鎖定您目前的「所有篩選條件」。</li>
                                        <li>接收者看到的數據是**即時**的，但**無法修改**篩選條件。</li>
                                        <li>連結有效期為 <strong>24 小時</strong>，過期自動失效。</li>
                                    </ul>
                                </div>

                                <Button
                                    onClick={handleCreateSnapshot}
                                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
                                >
                                    建立分享連結
                                </Button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6 py-4 animate-in fade-in zoom-in-95">
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-2 text-green-500">
                                <Check className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-white">連結建立成功！</h3>
                            <p className="text-xs text-zinc-500">
                                有效期至：{new Date(stats?.expiresAt || '').toLocaleString()}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-zinc-900 rounded-lg border border-zinc-700">
                            <code className="flex-1 text-xs text-zinc-300 break-all line-clamp-2">
                                {snapshotUrl}
                            </code>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={copyToClipboard}
                                className={copied ? "text-green-400" : "text-zinc-400 hover:text-white"}
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>

                        <Button
                            variant="secondary"
                            onClick={() => setIsOpen(false)}
                            className="w-full"
                        >
                            完成
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
