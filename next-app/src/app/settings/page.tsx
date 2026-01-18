"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Monitor, Moon, Sun, Layout, Check, Shield, Bell, User, LogOut, CreditCard, Mail, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

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
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-white tracking-tight">系統設定</h1>
                    <p className="text-zinc-400">管理您的會員資訊、介面外觀與分析偏好。</p>
                </div>

                {/* Section: Member Zone */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <User className="h-5 w-5 text-cyan-400" />
                        <h2 className="text-xl font-semibold text-zinc-200">會員專區</h2>
                    </div>

                    {!loading && user ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* User Profile Card */}
                            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 space-y-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Fingerprint className="h-24 w-24 text-cyan-500" />
                                </div>

                                <div className="flex items-start gap-4 relative z-10">
                                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-cyan-900/20">
                                        {user.email?.[0].toUpperCase()}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold text-white">Vibe Member</h3>
                                        <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                            <Mail className="h-3.5 w-3.5" />
                                            {user.email}
                                        </div>
                                        <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono mt-1">
                                            <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">UID</span>
                                            {user.id.slice(0, 8)}...{user.id.slice(-4)}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl px-4 py-2.5 transition-all text-sm font-medium"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        登出帳號
                                    </button>
                                </div>
                            </div>

                            {/* Subscription Status Card */}
                            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-zinc-400 text-sm font-medium">目前方案</span>
                                        <span className="bg-cyan-500/20 text-cyan-300 text-xs px-2 py-1 rounded-full border border-cyan-500/30">
                                            Free Tier
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">標準會員</h3>

                                    <div className="mt-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-400">本月報表生成額度</span>
                                            <span className="text-white font-mono">3 / 3</span>
                                        </div>
                                        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-cyan-500 w-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                                        </div>
                                        <p className="text-xs text-zinc-500 pt-1">
                                            額度將於每月 1 號重置。
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5">
                                    <button className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl px-4 py-2.5 transition-all text-sm font-medium cursor-not-allowed opacity-70">
                                        <CreditCard className="h-4 w-4" />
                                        升級 Pro 方案 (Coming Soon)
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 text-center space-y-4">
                            <p className="text-zinc-400">請先登入以查看會員資訊。</p>
                            <button
                                onClick={() => router.push('/')}
                                className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                前往登入
                            </button>
                        </div>
                    )}
                </section>

                <div className="h-px bg-white/5" />

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
