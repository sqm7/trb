'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { ArrowRight, Lock, Mail, User, Shield, TrendingUp, Building2, ChevronDown, Search, Zap, Play } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { getLiffId } from '@/lib/liff-config';
import { motion, AnimatePresence } from 'framer-motion';
import { ScannerBackground } from '@/components/animations/ScannerBackground';
import {
  AnimatedPriceBars,
  AnimatedHeatmap,
  AnimatedVelocity,
  AnimatedRanking,
  AnimatedSearch
} from '@/components/animations/AnimatedFeatureGraphic';
import { FeaturePromoOverlay } from '@/components/animations/FeaturePromoOverlay';
import { AlchemyDemoOverlay } from '@/components/animations/AlchemyDemoOverlay';
import { BrandImageIntro } from '@/components/animations/BrandImageIntro';
import { AlchemyOfDataWeb } from '@/components/animations/AlchemyOfDataWeb';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<any>(null);
  const [mode, setMode] = useState<'login' | 'register' | 'forgot_pass'>('login');
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showPromo, setShowPromo] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
    if (!hasSeenIntro) {
      setShowIntro(true);
    }

    setMounted(true);
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
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
      router.push('/dashboard');
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH || ''}/auth/update-password`,
      });

      if (error) throw error;
      setMessage({ text: '重設連結已發送！請檢查您的信箱', type: 'success' });
    } catch (error: any) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [liffError, setLiffError] = useState<string | null>(null);

  useEffect(() => {
    // Import LIFF dynamically to avoid SSR issues
    import('@line/liff').then((liffModule) => {
      const liff = liffModule.default;
      const liffId = getLiffId();

      liff
        .init({ liffId })
        .then(() => {
          console.log('LIFF initialized');

          // Check if we just logged out to prevent valid session from auto-re-login
          const isLoggedOut = sessionStorage.getItem('line-logout');

          // Handle redirect from Line Login
          if (liff.isLoggedIn() && !isLoggedOut) {
            const idToken = liff.getIDToken();
            const decoded = liff.getDecodedIDToken();

            // Validation: Check if token is expired (or close to expiring within 60s)
            if (!idToken || (decoded && decoded.exp && (decoded.exp * 1000) < (Date.now() + 60000))) {
              console.log('[LIFF] Token expired, forcing re-login...');
              liff.logout();
              liff.login({ redirectUri: window.location.href });
              return;
            }

            if (idToken) {
              handleLineServerLogin(idToken);
            }
          }
        })
        .catch((err) => {
          console.error('LIFF Init Error:', err);
          setLiffError(err.message);
        });
    });
  }, []);

  const handleLineServerLogin = async (idToken: string) => {
    setLoading(true);
    setMessage({ text: '正在驗證 Line 身份...', type: 'success' });

    try {
      // Call our Edge Function
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/line-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ idToken })
      });

      if (!response.ok) {
        let errorMessage = 'Line login failed';
        try {
          const err = await response.json();
          errorMessage = err.error || err.message || JSON.stringify(err);
        } catch (e) {
          errorMessage = await response.text();
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Line Auth Response:', data);

      if (data.token) {
        // We got a custom JWT from our Edge Function
        // Supabase Auth needs 'signInWithCustomToken' (not available in public client usually?)
        // Or we have to set the session manually.
        const { error } = await supabase.auth.setSession({
          access_token: data.token,
          refresh_token: data.refresh_token || 'dummy-refresh-token',
        });
        if (error) {
          console.error('Set Session Error:', error);
          throw error;
        }
        router.push('/dashboard');
      } else if (data.user) {
        // If we just return user but no token (e.g. mocking), we can't really "login" to Supabase Auth fully 
        // without a token signed by Supabase.
        // Assuming Edge Function returns a valid session or custom token.
        // For now, let's assume the Edge Function returns { token: "JWT" } called 'access_token'
        // Let's adjust the Edge Function later to match this expectation.

        // If the Edge function returned 'user' but not 'session', we might be stuck.
        // Let's assume for this step the Edge Function will return { token: ..., user: ... }
        // For now, if we get data, we just redirect or show success.
        router.push('/dashboard');
      }

    } catch (e: any) {
      console.error(e);
      setMessage({ text: `Line 登入失敗: ${e.message}`, type: 'error' });
      // Optional: liff.logout() to clear state
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: any) => {
    if (provider === 'line') {
      import('@line/liff').then((liffModule) => {
        const liff = liffModule.default;
        // User explicitly wants to login, clear logout flag
        sessionStorage.removeItem('line-logout');

        if (!liff.isLoggedIn()) {
          liff.login({ redirectUri: window.location.href });
        } else {
          // Already logged in - but check token validity first
          const idToken = liff.getIDToken();
          const decoded = liff.getDecodedIDToken();

          // Force re-login if token is expired or expiring within 60s
          if (!idToken || (decoded && decoded.exp && (decoded.exp * 1000) < (Date.now() + 60000))) {
            console.log('[LIFF] Token expired on button click, forcing re-login...');
            liff.logout();
            liff.login({ redirectUri: window.location.href });
            return;
          }

          if (idToken) handleLineServerLogin(idToken);
        }
      });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setMessage({ text: error.message, type: 'error' });
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <AnimatePresence>
        {showIntro && (
          <BrandImageIntro onComplete={() => {
            setShowIntro(false);
            sessionStorage.setItem('hasSeenIntro', 'true');
          }} />
        )}
      </AnimatePresence>

      <div className={`min-h-fit relative font-sans selection:bg-cyan-500/30 -m-6 rounded-tl-2xl transition-all duration-1000 ${showIntro ? 'opacity-0 scale-105 filter blur-md' : 'opacity-100 scale-100 filter blur-0'}`}>
        {/* Background & Overlay - Fixed */}
        <div className="fixed inset-0 z-0 bg-[#050A15] pointer-events-none overflow-hidden">
          <Image
            src="/images/loginbackground.jpg"
            alt="Background"
            fill
            className="object-cover blur-sm scale-110 opacity-10"
            priority
          />
          <div className="absolute inset-0 z-0">
            <ScannerBackground />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/60 to-zinc-950 z-10" />
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

        <main className={`relative z-30 w-full min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row items-center justify-center gap-20 p-6 lg:p-12 transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>

          {/* Visual Identity / Headlines */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ willChange: 'transform, opacity' }}
            className="flex-1 lg:max-w-xl space-y-8 text-center lg:text-left pt-10 lg:pt-0"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold tracking-wider uppercase mb-2"
              >
                <div className="relative h-4 w-4 mr-1 rounded-full overflow-hidden shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/icon.png`}
                    alt="Logo"
                    fill
                    className="object-cover"
                  />
                </div>
                sqmtalk.com
              </motion.div>
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-lg leading-[1.1]">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-zinc-400">平米內參</span>
              </h1>
              <p className="text-2xl lg:text-3xl font-light text-zinc-300">
                數據驅動的<span className="text-cyan-400 font-medium relative">
                  預售屋市場決策平台
                  <motion.span
                    className="absolute -bottom-1 left-0 w-full h-[2px] bg-cyan-500/50"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1, duration: 1 }}
                  />
                </span>
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

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex justify-center lg:justify-start"
            >
              <button
                onClick={() => setShowPromo(true)}
                className="group flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/50 transition-all text-zinc-300 hover:text-cyan-400"
              >
                <div className="p-2 rounded-full bg-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-zinc-950 transition-all">
                  <Play size={18} fill="currentColor" />
                </div>
                <span className="font-semibold tracking-wide">觀看產品演示動畫</span>
              </button>
            </motion.div>
          </motion.div>

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
                      onClick={() => router.push('/dashboard')}
                      className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-cyan-900/20 hover:shadow-cyan-900/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex justify-center items-center gap-2 group/btn"
                    >
                      進入系統
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Mode Toggle Tabs (Hidden in Forgot Password Mode) */}
                    {mode !== 'forgot_pass' && (
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
                    )}

                    {/* Forgot Password Header */}
                    {mode === 'forgot_pass' && (
                      <div className="text-center mb-8">
                        <h3 className="text-xl font-bold text-white mb-2">重設密碼</h3>
                        <p className="text-zinc-400 text-sm">請輸入您的註冊信箱，我們將寄送重設連結給您。</p>
                      </div>
                    )}

                    <form onSubmit={
                      mode === 'login' ? handleLogin :
                        mode === 'register' ? handleRegister :
                          handleResetPassword
                    } className="space-y-6">

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

                        {mode !== 'forgot_pass' && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-xs font-semibold text-zinc-400 ml-1">密碼</label>
                              {mode === 'login' && (
                                <button
                                  type="button"
                                  onClick={() => { setMode('forgot_pass'); setMessage(null); }}
                                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                                >
                                  忘記密碼？
                                </button>
                              )}
                            </div>
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
                        )}
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
                            {mode === 'login' ? '立即登入' : mode === 'register' ? '免費註冊' : '發送重設信'}
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/5 text-center">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-zinc-800"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-zinc-900 px-2 text-zinc-500">快速登入</span>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        <button
                          type="button"
                          onClick={() => handleOAuthLogin('line')}
                          className="w-full py-3 px-4 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-xl shadow-lg shadow-green-900/20 transition-all font-bold flex items-center justify-center gap-3 transform hover:-translate-y-0.5"
                        >
                          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                            <path d="M20.26 7.15c0-3.32-3.33-6.14-8.23-6.14S3.8 3.83 3.8 7.15c0 3 2.65 5.56 6.94 6.06l-.26 1.63c-.06.4-.3.94-.8 1.15-.17.07-1.1.26-1.37.3 1.12 3.1 4.54 2.89 5.86 2.3A12.56 12.56 0 0020.26 7.15z" />
                          </svg>
                          使用 LINE 帳號登入
                        </button>
                      </div>

                      <div className="relative mb-4">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-zinc-800"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-zinc-900 px-2 text-zinc-500">Or continue as</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => router.push('/dashboard')}
                        className="w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl border border-zinc-700 hover:border-zinc-600 transition-all text-sm font-medium flex items-center justify-center gap-2 group"
                      >
                        <Zap className="w-4 h-4 text-yellow-500 group-hover:text-yellow-400" />
                        訪客模式 (Guest Mode)
                      </button>

                      <p className="text-xs text-zinc-500 mt-4">
                        {mode === 'forgot_pass' ? (
                          <button
                            onClick={() => { setMode('login'); setMessage(null); }}
                            className="text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto"
                          >
                            返回登入
                          </button>
                        ) : (
                          <>
                            {mode === 'login' ? '還沒有帳號？' : '已經有帳號？'}
                            <button
                              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMessage(null); }}
                              className="ml-1 text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                            >
                              {mode === 'login' ? '立即註冊' : '登入'}
                            </button>
                          </>
                        )}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>

        <AnimatePresence>
          {showPromo && (
            <AlchemyDemoOverlay onClose={() => setShowPromo(false)} />
          )}
        </AnimatePresence>

        {/* Scroll Indicator */}
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce transition-opacity duration-1000 delay-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <ChevronDown className="w-6 h-6 text-zinc-500" />
        </div>

        {/* Feature Introduction Section (Bento Grid) */}
        <section className="relative z-20 py-16 px-6 lg:px-12 border-t border-white/5 bg-zinc-950/80 backdrop-blur-xl -mt-12 pt-32">
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
                    <AnimatedPriceBars />
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
                    <AnimatedHeatmap />
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
                graphic={<AnimatedVelocity />}
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
                  <div className="absolute right-0 bottom-10 w-full opacity-30 group-hover:opacity-50 transition-opacity">
                    <AnimatedRanking />
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
                    <AnimatedSearch />
                  </div>
                }
              />
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
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

  const hoverBorder: Record<string, string> = {
    indigo: "group-hover:border-indigo-500/50",
    pink: "group-hover:border-pink-500/50",
    violet: "group-hover:border-violet-500/50",
    yellow: "group-hover:border-yellow-500/50",
    cyan: "group-hover:border-cyan-500/50",
    emerald: "group-hover:border-emerald-500/50",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      style={{ willChange: 'transform, opacity' }}
      className={`
            group relative p-6 lg:p-8 rounded-3xl border border-white/5 bg-zinc-900/60 overflow-hidden
            transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:bg-zinc-900/80
            flex flex-col justify-between
            ${className} 
            ${hoverBorder[color]}
        `}>
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

      {/* Abstract Graphic Layer */}
      {graphic && (
        <motion.div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {graphic}
        </motion.div>
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
    </motion.div>
  );
}
