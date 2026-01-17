'use client';

import React, { useState } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { Monitor, Moon, Sun, Layout, Check, Shield, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

// Theme Options
const THEMES = [
    {
        id: 'cyberpunk',
        name: 'Cyberpunk',
        description: '高對比暗色主題，專為夜間數據分析設計。',
        colors: ['#09090b', '#06b6d4', '#8b5cf6'],
        active: true
    },
    {
        id: 'light',
        name: 'Light Mode',
        description: '適合日間瀏覽的明亮主題 (即將推出)。',
        colors: ['#ffffff', '#f4f4f5', '#18181b'],
        active: false,
        disabled: true
    },
    {
        id: 'print',
        name: 'Print Friendly',
        description: '去除背景色，優化列印輸出的純白模式 (即將推出)。',
        colors: ['#ffffff', '#000000', '#cccccc'],
        active: false,
        disabled: true
    }
];

export default function SettingsPage() {
    const [activeTheme, setActiveTheme] = useState('cyberpunk');

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-white tracking-tight">系統設定</h1>
                    <p className="text-zinc-400">管理您的介面外觀與分析偏好。</p>
                </div>

                {/* Section: Appearance */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Monitor className="h-5 w-5 text-violet-400" />
                        <h2 className="text-xl font-semibold text-zinc-200">外觀設定</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {THEMES.map((theme) => (
                            <div
                                key={theme.id}
                                onClick={() => !theme.disabled && setActiveTheme(theme.id)}
                                className={cn(
                                    "relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden group",
                                    activeTheme === theme.id
                                        ? "bg-zinc-900/80 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/50"
                                        : theme.disabled
                                            ? "bg-zinc-900/20 border-white/5 opacity-50 cursor-not-allowed grayscale"
                                            : "bg-zinc-900/40 border-white/5 hover:bg-zinc-900/60 hover:border-white/10"
                                )}
                            >
                                {/* Active Indicator */}
                                {activeTheme === theme.id && (
                                    <div className="absolute top-4 right-4 h-6 w-6 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/30">
                                        <Check className="h-3.5 w-3.5 text-black font-bold" />
                                    </div>
                                )}

                                {/* Color Preview */}
                                <div className="flex gap-2 mb-4">
                                    {theme.colors.map((color, i) => (
                                        <div
                                            key={i}
                                            className="h-8 w-8 rounded-full shadow-sm ring-1 ring-white/10"
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>

                                <h3 className={cn("font-bold mb-2", activeTheme === theme.id ? "text-white" : "text-zinc-300")}>
                                    {theme.name}
                                </h3>
                                <p className="text-sm text-zinc-500 leading-relaxed">
                                    {theme.description}
                                </p>

                                {theme.disabled && (
                                    <span className="absolute bottom-4 right-4 text-[10px] font-bold uppercase tracking-wider text-zinc-600 bg-zinc-800/50 px-2 py-1 rounded">
                                        Coming Soon
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                <div className="h-px bg-white/5" />

                {/* Section: Analysis Preferences (Placeholder) */}
                <section className="space-y-6 opacity-60 pointer-events-none filter grayscale">
                    <div className="flex items-center gap-2 mb-4">
                        <Layout className="h-5 w-5 text-indigo-400" />
                        <h2 className="text-xl font-semibold text-zinc-200">分析偏好 (開發中)</h2>
                    </div>

                    <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-zinc-300 font-medium">預設排除車位</span>
                                <p className="text-xs text-zinc-500">計算單價時自動扣除車位價格</p>
                            </div>
                            <div className="h-6 w-11 bg-zinc-800 rounded-full relative">
                                <div className="absolute top-1 left-1 h-4 w-4 bg-zinc-600 rounded-full" />
                            </div>
                        </div>
                        <div className="h-px bg-white/5" />
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-zinc-300 font-medium">預設排除一樓與特殊戶</span>
                                <p className="text-xs text-zinc-500">自動過濾露臺、店面等特殊戶別</p>
                            </div>
                            <div className="h-6 w-11 bg-cyan-900/30 rounded-full relative">
                                <div className="absolute top-1 right-1 h-4 w-4 bg-cyan-600 rounded-full shadow-sm" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section: Notifications (Placeholder) */}
                <section className="space-y-6 opacity-60 pointer-events-none filter grayscale">
                    <div className="flex items-center gap-2 mb-4">
                        <Bell className="h-5 w-5 text-pink-400" />
                        <h2 className="text-xl font-semibold text-zinc-200">通知設定 (開發中)</h2>
                    </div>
                    <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 text-center py-12">
                        <p className="text-zinc-500 text-sm">新案通知與價格變動提醒功能即將上線</p>
                    </div>
                </section>

            </div>
        </AppLayout>
    );
}
