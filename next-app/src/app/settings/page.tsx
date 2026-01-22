"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Monitor, Moon, Sun, Layout, Check, Shield, Bell, User, LogOut, CreditCard, Mail, Fingerprint, Edit2, X, Link as LinkIcon, Lock, Key, ShieldCheck, Eye, EyeOff, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { getLiffId } from "@/lib/liff-config";

// Theme Options
const THEMES = [
    {
        id: 'cyberpunk',
        name: 'Cyberpunk',
        colors: ['#09090b', '#06b6d4', '#8b5cf6'],
        description: '高對比暗色主題，專為夜間數據分析設計。',
        active: true
    },
    {
        id: 'light',
        name: 'Light Mode',
        colors: ['#ffffff', '#f4f4f5', '#18181b'],
        description: '適合日間瀏覽的明亮主題 (即將推出)。',
        active: false,
        disabled: true
    },
    {
        id: 'print',
        name: 'Print Friendly',
        colors: ['#ffffff', '#000000', '#cccccc'],
        description: '去除背景色，優化列印輸出的純白模式 (即將推出)。',
        active: false,
        disabled: true
    }
];

export default function SettingsPage() {
    const [activeTheme, setActiveTheme] = useState('cyberpunk');
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Name Editing State
    const [displayName, setDisplayName] = useState("Vibe Member");
    const [originalName, setOriginalName] = useState("Vibe Member");
    const [isEditingName, setIsEditingName] = useState(false);
    const [savingName, setSavingName] = useState(false);

    // Account Binding State
    const [bindEmail, setBindEmail] = useState("");
    const [bindPassword, setBindPassword] = useState("");
    const [bindConfirmPassword, setBindConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [bindStatus, setBindStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [bindError, setBindError] = useState("");

    // Email Editing State
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [emailPassword, setEmailPassword] = useState(""); // Password for re-authentication/verification


    const router = useRouter();

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                // Fetch Profile Data
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', currentUser.id)
                    .single();

                if (profile?.full_name) {
                    setDisplayName(profile.full_name);
                    setOriginalName(profile.full_name);
                } else {
                    // Fallback to metadata
                    const metaName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || "Vibe Member";
                    setDisplayName(metaName);
                    setOriginalName(metaName);
                }
            }
            setLoading(false);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (!currentUser) setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const saveDisplayName = async () => {
        if (!user) return;
        if (!displayName.trim()) {
            alert("名稱不能為空");
            return;
        }

        setSavingName(true);
        try {
            // 1. Update Public Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ full_name: displayName, updated_at: new Date().toISOString() })
                .eq('id', user.id);

            if (profileError) throw profileError;

            // 2. Update Auth Metadata (Best Effort)
            await supabase.auth.updateUser({
                data: { full_name: displayName, name: displayName }
            });

            setOriginalName(displayName);
            setIsEditingName(false);
        } catch (error) {
            console.error("Failed to update name:", error);
            alert("更新失敗，請稍後再試。");
        } finally {
            setSavingName(false);
        }
    };

    const handleBindAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setBindStatus('loading');
        setBindError("");

        try {
            if (bindPassword.length < 6) {
                throw new Error("密碼長度至少需 6 個字元");
            }
            if (bindPassword !== bindConfirmPassword) {
                throw new Error("兩次輸入的密碼不一致");
            }

            // Call Edge Function to Bind Email (Bypasses old email verification)
            const { data, error } = await supabase.functions.invoke('bind-email', {
                body: {
                    email: bindEmail,
                    password: bindPassword
                }
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);

            // Refresh session to reflect changes
            await supabase.auth.refreshSession();

            setBindStatus('success');

        } catch (err: any) {
            console.error("Binding error:", err);
            setBindStatus('error');
            setBindError(err.message || "綁定失敗，請檢查電子郵件格式");
        }
    };

    // Derived States for Binding Status
    const isLineBound = !!(user?.app_metadata?.provider === 'line' || user?.user_metadata?.line_user_id || user?.identities?.some((id: any) => id.provider === 'line'));
    const isEmailBound = !!(user?.email && !user.email.includes('line.workaround'));

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setBindStatus('loading');
        setBindError("");

        try {
            if (!emailPassword) throw new Error("請輸入密碼以確認身份");

            // Verify password by attempting to sign in (Frontend Check)
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: emailPassword
            });

            if (signInError) throw new Error("密碼錯誤，請重新輸入。");

            // Use Edge Function to Force Update Email (Bypassing Old Email Verification)
            // This is necessary because if the user keys in the wrong email initially, 
            // they cannot receive the "Old Email Change Confirmation" link.
            const { data, error } = await supabase.functions.invoke('bind-email', {
                body: {
                    email: newEmail,
                    current_password: emailPassword
                }
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);

            // Force Refresh Session
            await supabase.auth.refreshSession();
            // Also explicitly get user to update local state immediately
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);

            alert(`信箱已成功更新為 ${newEmail}！`);
            setIsEditingEmail(false);
            setBindStatus('idle');
            setNewEmail("");
            setEmailPassword("");
        } catch (error: any) {
            console.error("Update Email Error:", error);
            setBindStatus('error');
            setBindError(error.message);
        }
    };

    const handleUnbindEmail = async () => {
        if (!isLineBound) {
            alert("無法解除綁定：您必須至少保留一種登入方式 (LINE)。");
            return;
        }

        if (!confirm("確定要解除 Email 綁定嗎？\n解除後您將無法使用 Email/密碼登入，僅能使用 LINE 登入。")) return;

        try {
            // Strategy: Use bind-email to revert to placeholder logic
            // providing action: 'unbind'

            const { data, error } = await supabase.functions.invoke('bind-email', {
                body: { action: 'unbind' }
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);

            alert("已成功解除 Email 綁定。");

            // Refresh
            await supabase.auth.refreshSession();
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        } catch (error: any) {
            console.error("Unbind Email Error:", error);
            alert("解除 Email 綁定失敗: " + error.message);
        }
    };

    const handleUnlinkLine = async () => {
        if (!isEmailBound) {
            alert("無法解除綁定：您必須至少保留一種登入方式 (Email)。");
            return;
        }

        if (!confirm("確定要解除 LINE 連結嗎？解除後您將無法使用 LINE 登入。")) return;

        try {
            const lineIdentity = user?.identities?.find((id: any) => id.provider === 'line');
            if (lineIdentity) {
                const { error } = await supabase.auth.unlinkIdentity(lineIdentity.identity_id);
                if (error) throw error;

                // Refresh user
                const { data: { session } } = await supabase.auth.getSession();
                setUser(session?.user ?? null);
                alert("已成功解除 LINE 連結");
            } else {
                alert("找不到 LINE 連結資訊");
            }
        } catch (error: any) {
            console.error("Unlink error:", error);
            alert("解除連結失敗: " + error.message);
        }
    };

    const handleBindLine = async () => {
        if (!user) return;
        setBindStatus('loading');

        try {
            const liffId = getLiffId();
            if (!liffId) throw new Error("LINE Liff ID not configured");

            const liffModule = await import('@line/liff');
            const liff = liffModule.default;
            await liff.init({ liffId });

            if (!liff.isLoggedIn()) {
                liff.login({ redirectUri: window.location.href });
                return;
            }

            const idToken = liff.getIDToken();
            const decoded = liff.getDecodedIDToken();

            // Validation: Check if token is expired (buffer 60s)
            if (!idToken || (decoded && decoded.exp && (decoded.exp * 1000) < (Date.now() - 60000))) {
                console.log("Token expired or missing, re-logging in...");
                liff.logout(); // Force clear stale session
                liff.login({ redirectUri: window.location.href });
                return;
            }
            if (!idToken) throw new Error("Failed to get ID Token from LINE");

            const { data, error } = await supabase.functions.invoke('line-auth', {
                body: { idToken, linkToUserId: user.id }
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);

            alert("LINE 帳號綁定成功！");
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setBindStatus('idle');

        } catch (error: any) {
            console.error("Bind LINE Error:", error);
            setBindStatus('error');
            setBindError(error.message);
            alert("綁定失敗: " + error.message);
        }
    };

    const handleLogout = async () => {
        try {
            // Attempt to logout from Line LIFF if initialized or logged in
            const liffId = getLiffId();
            if (liffId) {
                try {
                    const liffModule = await import('@line/liff');
                    const liff = liffModule.default;
                    await liff.init({ liffId });
                    if (liff.isLoggedIn()) {
                        liff.logout();
                        console.log('LIFF logged out');
                    }
                } catch (e) {
                    console.log('LIFF logout ignored:', e);
                }
            }
        } catch (error) {
            console.error('Logout error:', error);
        }

        // Mark explicitly as logged out in LOCAL STORAGE to persist across redirects
        if (typeof window !== 'undefined') {
            localStorage.setItem('line-logout', 'true');
        }

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
                                    <div className="space-y-1 w-full">
                                        <div className="flex items-center gap-2">
                                            {isEditingName ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={displayName}
                                                        onChange={(e) => setDisplayName(e.target.value)}
                                                        className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white font-bold text-lg focus:outline-none focus:border-cyan-500 w-full min-w-[150px]"
                                                        placeholder="輸入名稱"
                                                    />
                                                    <button
                                                        onClick={saveDisplayName}
                                                        disabled={savingName}
                                                        className="p-1.5 bg-cyan-600 hover:bg-cyan-500 rounded text-white disabled:opacity-50"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setIsEditingName(false);
                                                            setDisplayName(originalName);
                                                        }}
                                                        className="p-1.5 bg-zinc-700 hover:bg-zinc-600 rounded text-zinc-300"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 group/name">
                                                    <h3 className="text-2xl font-bold text-white tracking-tight">
                                                        {displayName}
                                                    </h3>
                                                    <button
                                                        onClick={() => setIsEditingName(true)}
                                                        className="p-1.5 hover:bg-white/10 rounded-full text-zinc-500 hover:text-cyan-400 transition-colors"
                                                        title="修改名稱"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Email (Hide if it's a Line workaround email) */}
                                        {!user.email?.includes('line.workaround') && (
                                            <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                                <Mail className="h-3.5 w-3.5" />
                                                {user.email}
                                            </div>
                                        )}

                                        {/* Account Binding Badges */}
                                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                            {/* LINE Binding Badge */}
                                            {(user.app_metadata?.provider === 'line' || user.user_metadata?.line_user_id || user.identities?.some((id: any) => id.provider === 'line')) && (
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase border bg-[#06C755]/10 text-[#06C755] border-[#06C755]/20">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#06C755]"></span>
                                                    LINE 綁定
                                                </div>
                                            )}

                                            {/* Email Binding Badge */}
                                            {!user.email?.includes('line.workaround') && !user.user_metadata?.provider?.includes('email') ? (
                                                null
                                            ) : (
                                                !user.email?.includes('line.workaround') && (
                                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase border bg-zinc-800 text-zinc-400 border-zinc-700">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
                                                        Email 綁定
                                                    </div>
                                                )
                                            )}
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

                    {/* Unified Account Security Card */}
                    {!loading && user && (
                        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Shield className="h-5 w-5 text-indigo-400" />
                                <h2 className="text-xl font-semibold text-zinc-200">帳號安全</h2>
                            </div>

                            <div className="space-y-4">
                                {/* Email / Password Login Section */}
                                <div className="bg-zinc-950/50 rounded-xl border border-white/5 p-4 transition-all hover:border-white/10">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("h-10 w-10 rounded-full flex items-center justify-center border", isEmailBound ? "bg-indigo-500/10 border-indigo-500/20" : "bg-zinc-800 border-zinc-700")}>
                                                <Mail className={cn("h-5 w-5", isEmailBound ? "text-indigo-400" : "text-zinc-500")} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-white font-medium">電子信箱與密碼</h4>
                                                    {isEmailBound ? (
                                                        <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">已啟用</span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">未設定</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-zinc-500 mt-0.5">
                                                    {isEmailBound ? user.email : "設定後可使用 Email 與密碼登入"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {isEmailBound ? (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setIsEditingEmail(!isEditingEmail);
                                                            setNewEmail("");
                                                            setEmailPassword("");
                                                        }}
                                                        className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                                        title="變更信箱"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={handleUnbindEmail}
                                                        disabled={!isLineBound}
                                                        className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-400 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                                                        title={!isLineBound ? "需保留至少一種登入方式" : "解除綁定"}
                                                    >
                                                        <LinkIcon className="h-4 w-4 rotate-45" />
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => setIsEditingEmail(true)} // Reuse editing state for binding
                                                    className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
                                                >
                                                    立即設定
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Inline Editing Form (Bind or Change) */}
                                    {isEditingEmail && (
                                        <div className="mt-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
                                            <form onSubmit={isEmailBound ? handleUpdateEmail : handleBindAccount} className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs text-zinc-400">
                                                            {isEmailBound ? "新電子信箱" : "電子信箱"}
                                                        </label>
                                                        <input
                                                            type="email"
                                                            required
                                                            placeholder="name@example.com"
                                                            value={isEmailBound ? newEmail : bindEmail}
                                                            onChange={(e) => isEmailBound ? setNewEmail(e.target.value) : setBindEmail(e.target.value)}
                                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                                        />
                                                    </div>

                                                    {isEmailBound ? (
                                                        <div className="space-y-1.5">
                                                            <label className="text-xs text-zinc-400">目前密碼 (驗證身份)</label>
                                                            <input
                                                                type="password"
                                                                required
                                                                placeholder="輸入密碼"
                                                                value={emailPassword}
                                                                onChange={(e) => setEmailPassword(e.target.value)}
                                                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="space-y-1.5">
                                                                <label className="text-xs text-zinc-400">設定密碼</label>
                                                                <input
                                                                    type="password"
                                                                    required
                                                                    placeholder="至少 6 位數"
                                                                    minLength={6}
                                                                    value={bindPassword}
                                                                    onChange={(e) => setBindPassword(e.target.value)}
                                                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-xs text-zinc-400">確認密碼</label>
                                                                <input
                                                                    type="password"
                                                                    required
                                                                    placeholder="再次輸入"
                                                                    minLength={6}
                                                                    value={bindConfirmPassword}
                                                                    onChange={(e) => setBindConfirmPassword(e.target.value)}
                                                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                                                />
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                {bindError && (
                                                    <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-start gap-2">
                                                        <Shield className="h-4 w-4 shrink-0 mt-0.5" />
                                                        <span>{bindError}</span>
                                                    </div>
                                                )}

                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsEditingEmail(false)}
                                                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors"
                                                    >
                                                        取消
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={bindStatus === 'loading'}
                                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        {bindStatus === 'loading' ? '處理中...' : (isEmailBound ? '確認變更' : '建立帳號')}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                </div>

                                {/* LINE Login Section */}
                                <div className="bg-zinc-950/50 rounded-xl border border-white/5 p-4 transition-all hover:border-white/10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("h-10 w-10 rounded-full flex items-center justify-center border", isLineBound ? "bg-[#06C755]/10 border-[#06C755]/20" : "bg-zinc-800 border-zinc-700")}>
                                                <span className={cn("font-bold text-[10px]", isLineBound ? "text-[#06C755]" : "text-zinc-500")}>LINE</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-white font-medium">LINE 快速登入</h4>
                                                    {isLineBound ? (
                                                        <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">已連結</span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">未設定</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-zinc-500 mt-0.5">
                                                    {isLineBound ? "已連結 LINE 帳號" : "連結後可使用 LINE 一鍵登入"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {isLineBound ? (
                                                <button
                                                    onClick={handleUnlinkLine}
                                                    disabled={!isEmailBound}
                                                    className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-400 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                                                    title={!isEmailBound ? "需保留至少一種登入方式" : "解除連結"}
                                                >
                                                    <LinkIcon className="h-4 w-4 rotate-45" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleBindLine}
                                                    disabled={bindStatus === 'loading'}
                                                    className="text-xs bg-[#06C755] hover:bg-[#05b34c] text-white px-3 py-1.5 rounded-lg transition-colors font-bold"
                                                >
                                                    {bindStatus === 'loading' ? "..." : "連結 LINE"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
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
