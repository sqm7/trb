'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { ArrowRight, Lock, Mail, User, Shield, TrendingUp, Building2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.replace('/');
            }
        };
        checkUser();
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            router.push('/');
        } catch (error: any) {
            setMessage({ text: error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (password.length < 6) {
            setMessage({ text: '密碼長度至少需 6 個字元', type: 'error' });
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;
            setMessage({ text: '註冊成功！請檢查您的信箱進行驗證', type: 'success' });
        } catch (error: any) {
            setMessage({ text: error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-zinc-950 text-white font-sans selection:bg-cyan-500/30">
            {/* Background & Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/loginbackground.jpg"
                    alt="Background"
                    fill
                    className="object-cover blur-sm scale-105"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/90 via-zinc-900/80 to-purple-950/40 z-10" />
            </div>

            {/* Back to Home Button (Guest Access) */}
            <div className="absolute top-6 left-6 z-50 animate-in fade-in slide-in-from-top-4 duration-700">
                <Link
                    href="/"
                    className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 backdrop-blur-md transition-all duration-300"
                >
                    <ChevronLeft className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                    <span className="text-sm font-medium text-zinc-300 group-hover:text-white">回首頁 (免登入瀏覽)</span>
                </Link>
            </div>


            <main className={`relative z-20 w-full max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-12 p-6 lg:p-12 transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>

                {/* Visual Identity / Headlines */}
                <div className="flex-1 lg:max-w-2xl space-y-8 text-center lg:text-left pt-10 lg:pt-0">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold tracking-wider uppercase mb-2 animate-in slide-in-from-left-4 fade-in duration-700 delay-100">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                            </span>
                            Vibe Coding Intelligence
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-lg leading-[1.1]">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">平米內參</span>
                        </h1>
                        <p className="text-2xl lg:text-3xl font-light text-zinc-300">
                            數據驅動的<span className="text-cyan-400 font-medium">預售屋市場決策平台</span>
                        </p>
                    </div>

                    <div className="hidden lg:grid grid-cols-1 gap-5 text-zinc-400 max-w-xl animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300">
                        {/* Feature 1: Price Band */}
                        <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                <Building2 size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold mb-0.5">區間定價策略分析</h3>
                                <p className="text-sm leading-relaxed text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                    視覺化總價與單價分佈區間，精準鎖定市場甜蜜點，協助案前產品規劃與定價。
                                </p>
                            </div>
                        </div>

                        {/* Feature 2: Heatmap */}
                        <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-all">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold mb-0.5">垂直價差熱力圖</h3>
                                <p className="text-sm leading-relaxed text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                    獨家樓層價差 Heatmap，一鍵透視各戶別、樓層的定價邏輯與銷售狀況 (Floor Premium)。
                                </p>
                            </div>
                        </div>

                        {/* Feature 3: Velocity & Ranking */}
                        <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold mb-0.5">去化速度與競品排行</h3>
                                <p className="text-sm leading-relaxed text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                    即時追蹤區域競品銷售週數與去化率，動態調整銷售節奏，掌握市場主導權。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Glassmorphism Auth Card */}
                <div className="w-full max-w-md animate-in zoom-in-95 fade-in duration-700 delay-200">
                    <div className="relative group">
                        {/* Glow Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>

                        <div className="relative bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">

                            {/* Toggle Tabs */}
                            <div className="flex bg-zinc-950/50 p-1 rounded-xl mb-8 relative">
                                <div className={`absolute top-1 bottom-1 w-1/2 bg-zinc-800 rounded-lg shadow-sm transition-all duration-300 ease-out ${mode === 'register' ? 'translate-x-full' : 'translate-x-0'}`}></div>
                                <button
                                    onClick={() => { setMode('login'); setMessage(null); }}
                                    className={`relative flex-1 py-2 text-sm font-medium transition-colors z-10 ${mode === 'login' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    登入帳號
                                </button>
                                <button
                                    onClick={() => { setMode('register'); setMessage(null); }}
                                    className={`relative flex-1 py-2 text-sm font-medium transition-colors z-10 ${mode === 'register' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    註冊會員
                                </button>
                            </div>

                            <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-zinc-400 ml-1">電子信箱</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-cyan-500 text-white rounded-xl pl-10 pr-4 py-3 outline-none transition-all placeholder:text-zinc-600"
                                                placeholder="name@company.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-zinc-400 ml-1">密碼</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                                            <input
                                                type="password"
                                                required
                                                minLength={6}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-cyan-500 text-white rounded-xl pl-10 pr-4 py-3 outline-none transition-all placeholder:text-zinc-600"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {message && (
                                    <div className={`flex items-center gap-2 p-3 rounded-lg text-sm bg-opacity-10 border ${message.type === 'error'
                                        ? 'bg-red-500 border-red-500/20 text-red-200'
                                        : 'bg-green-500 border-green-500/20 text-green-200'
                                        }`}>
                                        {message.type === 'error' ? <Shield className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                        {message.text}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-cyan-900/20 hover:shadow-cyan-900/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 group/btn"
                                >
                                    {loading ? (
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            {mode === 'login' ? '立即登入' : '免費註冊'}
                                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-xs text-zinc-500">
                                    {mode === 'login' ? '還沒有帳號？' : '已經有帳號？'}
                                    <button
                                        onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMessage(null); }}
                                        className="ml-1 text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                                    >
                                        {mode === 'login' ? '立即註冊' : '登入'}
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-zinc-500 text-xs mt-8">
                        &copy; 2026 平米內參 Vibe Coding. All rights reserved.
                    </p>
                </div>

            </main>
        </div>
    );
}
