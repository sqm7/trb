'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AppLayout } from '@/components/layout/AppLayout';
import { Lock, Shield, ArrowRight } from 'lucide-react';

export default function UpdatePasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (password.length < 6) {
            setMessage({ text: '密碼長度至少需 6 個字元', type: 'error' });
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            setMessage({ text: '密碼更新成功！正在跳轉至儀表板...', type: 'success' });

            // Delay to show success message
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
        } catch (error: any) {
            setMessage({ text: error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-950 -m-6 rounded-tl-2xl">
                <div className="w-full max-w-md">
                    <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 p-8 rounded-2xl shadow-2xl space-y-6">
                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto border border-cyan-500/20 mb-4">
                                <Lock className="w-8 h-8 text-cyan-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-white">設定新密碼</h1>
                            <p className="text-zinc-400 text-sm">請輸入您的新密碼以完成重設。</p>
                        </div>

                        <form onSubmit={handleUpdatePassword} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-zinc-400 ml-1">新密碼</label>
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

                            {message && (
                                <div className={`flex items-center gap-2 p-3 rounded-lg text-sm bg-opacity-10 border ${message.type === 'error'
                                    ? 'bg-red-500 border-red-500/20 text-red-200'
                                    : 'bg-green-500 border-green-500/20 text-green-200'
                                    }`}>
                                    <Shield className="w-4 h-4" />
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
                                        更新密碼
                                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
