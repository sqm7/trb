'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { ArrowRight, Lock, Mail, User, Shield, TrendingUp, Building2, ChevronLeft, ChevronDown, BarChart2, Search, Zap, Layers } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState<any>(null);
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
                // Removed auto-redirect to allow viewing the landing page
            }
        };
        checkUser();
    }, []);

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
        <div className="min-h-screen relative overflow-x-hidden overflow-y-auto bg-zinc-950 text-white font-sans selection:bg-cyan-500/30">
            {/* Background & Overlay - Fixed */}
            <div className="fixed inset-0 z-0">
                <Image
                    src="/images/loginbackground.jpg"
                    alt="Background"
                    fill
                    className="object-cover blur-sm scale-105 opacity-40"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/90 to-zinc-950 z-10" />
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



            {/* Moving Border Style */}
            <style jsx global>{`
                @keyframes moving-border {
                    0% { border-color: rgba(6,182,212,0.2); box-shadow: 0 0 10px rgba(6,182,212,0.1); }
                    50% { border-color: rgba(139,92,246,0.5); box-shadow: 0 0 20px rgba(139,92,246,0.3); }
                    100% { border-color: rgba(6,182,212,0.2); box-shadow: 0 0 10px rgba(6,182,212,0.1); }
                }
                .animate-moving-border {
                    animation: moving-border 4s infinite ease-in-out;
                }
            `}</style>

            <main className={`relative z-30 w-full min-h-screen flex flex-col lg:flex-row items-center justify-center gap-20 p-6 lg:p-12 transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>

                {/* Visual Identity / Headlines */}
                <div className="flex-1 lg:max-w-xl space-y-8 text-center lg:text-left pt-10 lg:pt-0">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold tracking-wider uppercase mb-2 animate-in slide-in-from-left-4 fade-in duration-700 delay-100">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                            </span>
                            Vibe Coding Intelligence
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-lg leading-[1.1]">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">平米內參</span>
                        </h1>
                        <p className="text-2xl lg:text-3xl font-light text-zinc-300">
                            數據驅動的<span className="text-cyan-400 font-medium">預售屋市場決策平台</span>
                        </p>
                    </div>

                    <div className="hidden lg:grid grid-cols-1 gap-5 text-zinc-400 max-w-lg animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300">
                        {/* Feature 1: Price Band */}
                        <div className="flex items-start gap-4 p-4 rounded-xl border border-transparent hover:border-indigo-500/30 hover:bg-white/5 transition-all duration-300 group">
                            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] group-hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold mb-1 group-hover:text-indigo-300 transition-colors">區間定價策略分析</h3>
                                <p className="text-sm leading-relaxed text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                    視覺化總價與單價分佈區間，精準鎖定市場甜蜜點，協助案前產品規劃與定價。
                                </p>
                            </div>
                        </div>

                        {/* Feature 2: Heatmap */}
                        <div className="flex items-start gap-4 p-4 rounded-xl border border-transparent hover:border-pink-500/30 hover:bg-white/5 transition-all duration-300 group">
                            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-all shadow-[0_0_15px_rgba(236,72,153,0.2)] group-hover:shadow-[0_0_20px_rgba(236,72,153,0.5)]">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold mb-1 group-hover:text-pink-300 transition-colors">垂直價差熱力圖</h3>
                                <p className="text-sm leading-relaxed text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                    獨家樓層價差 Heatmap，一鍵透視各戶別、樓層的定價邏輯與銷售狀況 (Floor Premium)。
                                </p>
                            </div>
                        </div>

                        {/* Feature 3: Velocity & Ranking */}
                        <div className="flex items-start gap-4 p-4 rounded-xl border border-transparent hover:border-cyan-500/30 hover:bg-white/5 transition-all duration-300 group">
                            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold mb-1 group-hover:text-cyan-300 transition-colors">去化速度與競品排行</h3>
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
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 via-violet-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 animate-pulse"></div>

                        <div className="relative bg-zinc-900/90 backdrop-blur-xl border-2 animate-moving-border p-8 rounded-2xl shadow-2xl">

                            {user ? (
                                <div className="text-center space-y-6">
                                    <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto border border-cyan-500/20">
                                        <User className="w-10 h-10 text-cyan-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">歡迎回來</h3>
                                        <p className="text-zinc-400 text-sm">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={() => router.push('/')}
                                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-cyan-900/20 hover:shadow-cyan-900/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex justify-center items-center gap-2 group/btn"
                                    >
                                        進入系統
                                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            ) : (
                                <>
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
                                </>
                            )}
                        </div>
                    </div>

                    <p className="text-center text-zinc-500 text-xs mt-8">
                        &copy; 2026 平米內參 Vibe Coding. All rights reserved.
                    </p>
                </div>

            </main>

            {/* Scroll Indicator */}
            <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce transition-opacity duration-1000 delay-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                <ChevronDown className="w-6 h-6 text-zinc-500" />
            </div>

            {/* Feature Introduction Section (Bento Grid) */}
            <section className="relative z-20 py-16 px-6 lg:px-12 border-t border-white/5 bg-zinc-950/50 backdrop-blur-3xl -mt-12 pt-32">
                {/* Seamless transition gradient */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-zinc-950/50 pointer-events-none" />

                <div className="max-w-7xl mx-auto space-y-16 relative">
                    <div className="text-center space-y-6 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-bold tracking-wider uppercase mb-4">
                            Enterprise Grade Analytics
                        </div>
                        <h2 className="text-3xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                            數據賦能，<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">精準決策</span>
                        </h2>
                        <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
                            整合實價登錄大數據，透過多維度視覺化分析，為開發商與代銷團隊打造的市場戰情室。
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-5">

                        {/* Feature 1: Price Band (Large Horizontal) */}
                        <BentoCard
                            className="lg:col-span-2 lg:row-span-1"
                            title="區間定價策略"
                            subtitle="鎖定市場甜蜜點"
                            description="視覺化總價與單價分佈，自動計算 PR 值與甜蜜點，精準定位產品價格區間。"
                            color="indigo"
                            gradient="from-indigo-500/10 via-indigo-500/5 to-transparent"
                            graphic={
                                <div className="absolute right-0 bottom-0 w-2/3 h-full opacity-30 group-hover:opacity-50 transition-opacity">
                                    <div className="flex items-end gap-2 h-full pb-8 pr-8 justify-end">
                                        {[40, 65, 45, 80, 55, 70, 35].map((h, i) => (
                                            <div key={i} className="w-4 bg-indigo-500 rounded-t-sm" style={{ height: `${h}%`, opacity: 0.5 + (i * 0.05) }} />
                                        ))}
                                    </div>
                                </div>
                            }
                        />

                        {/* Feature 2: Heatmap (Large Vertical) */}
                        <BentoCard
                            className="lg:col-span-1 lg:row-span-2"
                            title="垂直價差透視"
                            subtitle="Floor Premium"
                            description="獨家樓層價差 Heatmap，透視整棟大樓定價邏輯。發現價值窪地，最大化整案營收。"
                            color="pink"
                            gradient="from-pink-500/10 via-pink-500/5 to-transparent"
                            graphic={
                                <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                                    <div className="grid grid-cols-3 gap-1 rotate-12 scale-110">
                                        {[...Array(12)].map((_, i) => (
                                            <div key={i} className={`w-8 h-8 rounded-sm ${i % 4 === 0 ? 'bg-pink-500/80' : i % 3 === 0 ? 'bg-pink-500/40' : 'bg-pink-500/20'}`} />
                                        ))}
                                    </div>
                                </div>
                            }
                        />

                        {/* Feature 3: Velocity */}
                        <BentoCard
                            className="lg:col-span-1 lg:row-span-1"
                            title="去化動能追蹤"
                            subtitle="銷售週數監控"
                            description="即時追蹤區域競品銷售速率 (Velocity)，動態調整推案節奏。"
                            color="yellow"
                            gradient="from-yellow-500/10 via-yellow-500/5 to-transparent"
                            graphic={
                                <div className="absolute right-4 top-4 opacity-30 group-hover:opacity-60 transition-opacity">
                                    <Zap className="w-24 h-24 text-yellow-500 rotate-12" />
                                </div>
                            }
                        />

                        {/* Feature 4: Ranking */}
                        <BentoCard
                            className="lg:col-span-1 lg:row-span-1"
                            title="競品排行分析"
                            subtitle="市佔率分析"
                            description="一鍵生成區域競品報告，掌握市場強弱勢產品。"
                            color="emerald"
                            gradient="from-emerald-500/10 via-emerald-500/5 to-transparent"
                            graphic={
                                <div className="absolute right-0 bottom-0 w-1/2 h-1/2 opacity-30 group-hover:opacity-50 transition-opacity pr-4 pb-4">
                                    <div className="space-y-2">
                                        <div className="w-full h-2 bg-emerald-500/50 rounded-full" />
                                        <div className="w-3/4 h-2 bg-emerald-500/30 rounded-full" />
                                        <div className="w-1/2 h-2 bg-emerald-500/20 rounded-full" />
                                    </div>
                                </div>
                            }
                        />

                        {/* Feature 5: Unit Price */}
                        <BentoCard
                            className="lg:col-span-1 lg:row-span-1"
                            title="多維度單價"
                            subtitle="真實行情還原"
                            description="透過泡泡圖深度解析單價差異，支援加權平均排除特殊戶。"
                            color="violet"
                            gradient="from-violet-500/10 via-violet-500/5 to-transparent"
                            graphic={
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30 group-hover:opacity-50 transition-opacity">
                                    <div className="relative w-24 h-24">
                                        <div className="absolute top-0 left-0 w-8 h-8 bg-violet-500 rounded-full blur-[2px]" />
                                        <div className="absolute bottom-2 right-4 w-12 h-12 bg-violet-400/80 rounded-full blur-[1px]" />
                                        <div className="absolute top-4 right-0 w-6 h-6 bg-violet-300/60 rounded-full" />
                                    </div>
                                </div>
                            }
                        />

                        {/* Feature 6: Data List */}
                        <BentoCard
                            className="lg:col-span-1 lg:row-span-1"
                            title="全境實登搜索"
                            subtitle="跨區數據探勘"
                            description="整合完整實價登錄資料，支援跨區搜尋與車位拆算。"
                            color="cyan"
                            gradient="from-cyan-500/10 via-cyan-500/5 to-transparent"
                            graphic={
                                <div className="absolute right-4 bottom-4 opacity-20 group-hover:opacity-40 transition-opacity">
                                    <Search className="w-20 h-20 text-cyan-500 -scale-x-100" />
                                </div>
                            }
                        />
                    </div>
                </div>
            </section>

            <footer className="relative z-20 py-12 text-center border-t border-white/5 bg-zinc-950">
                <div className="flex items-center justify-center gap-2 mb-4 opacity-30">
                    {/* Footer dots */}
                </div>
                <p className="text-zinc-600 text-sm font-medium">
                    &copy; 2026 平米內參 Vibe Coding Intelligence. All rights reserved.
                </p>
            </footer>
        </div>
    );
}

// Bento Grid Card
function BentoCard({
    className,
    title,
    subtitle,
    description,
    color,
    gradient,
    graphic
}: {
    className?: string,
    title: string,
    subtitle?: string,
    description: string,
    color: string,
    gradient: string,
    graphic?: React.ReactNode
}) {
    const textColors: Record<string, string> = {
        indigo: "text-indigo-400",
        pink: "text-pink-400",
        violet: "text-violet-400",
        yellow: "text-yellow-400",
        cyan: "text-cyan-400",
        emerald: "text-emerald-400",
    };

    // Determine glow color for hover
    const hoverBorder: Record<string, string> = {
        indigo: "group-hover:border-indigo-500/50",
        pink: "group-hover:border-pink-500/50",
        violet: "group-hover:border-violet-500/50",
        yellow: "group-hover:border-yellow-500/50",
        cyan: "group-hover:border-cyan-500/50",
        emerald: "group-hover:border-emerald-500/50",
    };

    return (
        <div className={`
            group relative p-6 lg:p-8 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-md overflow-hidden
            transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:bg-zinc-900/60
            flex flex-col justify-between
            ${className} 
            ${hoverBorder[color]}
        `}>
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

            {/* Abstract Graphic Layer */}
            {graphic && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {graphic}
                </div>
            )}

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-end">
                <div className="space-y-2">
                    {subtitle && (
                        <div className={`text-xs font-bold tracking-widest uppercase opacity-70 ${textColors[color]}`}>
                            {subtitle}
                        </div>
                    )}
                    <h3 className="text-xl lg:text-2xl font-bold text-white group-hover:text-white/90 transition-colors">
                        {title}
                    </h3>
                    <p className="text-zinc-400 leading-relaxed text-sm group-hover:text-zinc-300 transition-colors mt-2 line-clamp-3">
                        {description}
                    </p>
                </div>
            </div>

            {/* Shine Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shine" />
        </div>
    );
}
