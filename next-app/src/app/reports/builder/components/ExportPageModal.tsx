"use client";

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useReportBuilderStore } from '@/store/useReportBuilderStore';
import { Image, Layers, ListChecks } from 'lucide-react';

interface ExportPageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (pageIndices: number[]) => void;
    format: 'png' | 'jpg';
}

export function ExportPageModal({ isOpen, onClose, onExport, format }: ExportPageModalProps) {
    const pages = useReportBuilderStore(state => state.pages);
    const currentPageIndex = useReportBuilderStore(state => state.currentPageIndex);
    const [mode, setMode] = useState<'all' | 'current' | 'range'>('all');
    const [range, setRange] = useState({ start: 1, end: pages.length });

    const handleExport = () => {
        let indices: number[] = [];
        if (mode === 'all') {
            indices = pages.map((_, i) => i);
        } else if (mode === 'current') {
            indices = [currentPageIndex];
        } else if (mode === 'range') {
            const start = Math.max(0, range.start - 1);
            const end = Math.min(pages.length - 1, range.end - 1);
            for (let i = start; i <= end; i++) {
                indices.push(i);
            }
        }
        onExport(indices);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                        <Image className="h-5 w-5" />
                    </div>
                    <span className="text-xl">匯出 {format.toUpperCase()} 圖片</span>
                </div>
            }
            maxWidth="max-w-md"
        >
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-3">
                    <button
                        onClick={() => setMode('all')}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${mode === 'all'
                                ? 'bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/50'
                                : 'bg-zinc-900/50 border-white/5 hover:border-white/10'
                            }`}
                    >
                        <div className={`p-2 rounded-lg ${mode === 'all' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                            <Layers className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="font-medium text-white">全部頁面 ({pages.length} 頁)</div>
                            <div className="text-xs text-zinc-500">匯出所有報告頁面</div>
                        </div>
                    </button>

                    <button
                        onClick={() => setMode('current')}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${mode === 'current'
                                ? 'bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/50'
                                : 'bg-zinc-900/50 border-white/5 hover:border-white/10'
                            }`}
                    >
                        <div className={`p-2 rounded-lg ${mode === 'current' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                            <Image className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="font-medium text-white">僅限目前頁面 (第 {currentPageIndex + 1} 頁)</div>
                            <div className="text-xs text-zinc-500">僅匯出當前正編輯的頁面</div>
                        </div>
                    </button>

                    <button
                        onClick={() => setMode('range')}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${mode === 'range'
                                ? 'bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/50'
                                : 'bg-zinc-900/50 border-white/5 hover:border-white/10'
                            }`}
                    >
                        <div className={`p-2 rounded-lg ${mode === 'range' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                            <ListChecks className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="font-medium text-white">指定範圍</div>
                            <div className="text-xs text-zinc-500">自定義要匯出的頁碼範圍</div>
                        </div>
                    </button>
                </div>

                {mode === 'range' && (
                    <div className="flex items-center gap-4 p-4 bg-zinc-950/50 rounded-xl border border-white/5 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex-1 space-y-1">
                            <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold ml-1">起始頁碼</label>
                            <Input
                                type="number"
                                min={1}
                                max={pages.length}
                                value={range.start}
                                onChange={(e) => setRange(prev => ({ ...prev, start: parseInt(e.target.value) || 1 }))}
                                className="bg-zinc-900 border-white/5 h-10"
                            />
                        </div>
                        <div className="text-zinc-700 mt-5">至</div>
                        <div className="flex-1 space-y-1">
                            <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold ml-1">結束頁碼</label>
                            <Input
                                type="number"
                                min={1}
                                max={pages.length}
                                value={range.end}
                                onChange={(e) => setRange(prev => ({ ...prev, end: parseInt(e.target.value) || 1 }))}
                                className="bg-zinc-900 border-white/5 h-10"
                            />
                        </div>
                    </div>
                )}

                <div className="pt-2 flex gap-3">
                    <Button variant="outline" onClick={onClose} className="flex-1 bg-zinc-900 border-white/5">
                        取消
                    </Button>
                    <Button onClick={handleExport} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white border-none shadow-lg shadow-emerald-900/20">
                        開始匯出
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
