'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getLiffId } from '@/lib/liff-config';

export default function OACallbackPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isFriend, setIsFriend] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkFriendship = async () => {
            try {
                const liffModule = await import('@line/liff');
                const liff = liffModule.default;
                const liffId = getLiffId();

                await liff.init({ liffId });

                if (!liff.isLoggedIn()) {
                    // If not logged in, redirect back to login
                    router.push('/');
                    return;
                }

                // Check friendship status
                // Note: liff.getFriendship() returns { friendFlag: boolean }
                const friendship = await liff.getFriendship();

                if (friendship.friendFlag) {
                    setIsFriend(true);
                    // Update profile or user metadata if needed (optional)
                    // Redirect to dashboard
                    setTimeout(() => router.push('/dashboard'), 1500);
                } else {
                    setIsFriend(false);
                    setLoading(false);
                }
            } catch (err: any) {
                console.error('LIFF Error:', err);
                // Fallback: If running in non-LIFF browser (e.g. desktop chrome), getFriendship might fail or return false differently.
                // For standard web, we might rely on the user adding it manually.
                // If we cannot verify, we might default to showing the prompt for safety.
                setError(err.message);
                setLoading(false);
            }
        };

        checkFriendship();
    }, [router]);

    // LINE Official Account ID
    const LINE_OA_LINK = 'https://line.me/R/ti/p/@425ohbmf';
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050A15] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-6"></div>
                <h2 className="text-xl text-white font-bold">正在驗證好友狀態...</h2>
                <p className="text-zinc-500 mt-2">請稍候</p>
            </div>
        );
    }

    if (isFriend) {
        return (
            <div className="min-h-screen bg-[#050A15] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-green-500/50">
                    <MessageCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl text-white font-bold mb-2">驗證成功！</h2>
                <p className="text-zinc-400">正在進入系統...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050A15] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/loginbackground.jpg"
                    alt="Background"
                    fill
                    className="object-cover opacity-10 blur-sm"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950 to-zinc-950" />
            </div>

            <div className="relative z-10 max-w-md w-full bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl text-center space-y-8 animate-in zoom-in-95 fade-in duration-500">
                <div className="space-y-4">
                    <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#06C755]/10 border border-[#06C755]/20 mb-4 overflow-hidden">
                        <Image
                            src={`${basePath}/logo-type-a.jpg`}
                            alt="Logo"
                            fill
                            className="object-cover"
                        />
                    </div>

                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        啟用您的帳號
                    </h1>
                    <p className="text-zinc-400 leading-relaxed">
                        為了提供更完整的即時通知與客服支援，<br />
                        請先加入我們的 LINE 官方帳號。
                    </p>
                </div>

                <div className="space-y-4">
                    <a
                        href={LINE_OA_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-4 px-6 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold rounded-xl shadow-lg shadow-green-900/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
                        onClick={() => {
                            // Optimistic verification helper
                            setTimeout(() => {
                                window.location.reload();
                            }, 3000);
                        }}
                    >
                        <MessageCircle className="w-6 h-6 fill-current" />
                        加入好友並啟用
                    </a>

                    <div className="text-xs text-zinc-500 pt-2 space-y-4">
                        <div className="space-y-1">
                            <p>手機版將直接開啟 App，電腦版請掃描 QR Code 驗證</p>
                            <p className="opacity-70">加入後請點擊上方按鈕或重新整理頁面</p>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={() => window.location.reload()}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all text-xs"
                            >
                                <ArrowRight className="w-3 h-3" />
                                我已加入好友，立即驗證
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
