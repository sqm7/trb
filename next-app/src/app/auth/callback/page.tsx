'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        const code = searchParams.get('code');
        const next = searchParams.get('next') ?? '/settings'; // Default to settings to see the change
        const errorDescription = searchParams.get('error_description');

        if (errorDescription) {
            setError(errorDescription);
            setStatus('error');
            return;
        }

        if (code) {
            const exchangeCode = async () => {
                try {
                    // Exchange logic
                    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
                    if (error) throw error;

                    console.log("Auth callback success:", data.user?.email);

                    // Refresh session to ensure everything is synced
                    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
                    if (sessionError) console.warn("Session refresh warning:", sessionError);

                    setStatus('success');

                    // Wait a bit before redirecting so user sees success message
                    setTimeout(() => {
                        router.replace(next); // Use replace to avoid back-button loops
                    }, 2000);

                } catch (err: any) {
                    console.error('Auth callback error:', err);
                    setError(err.message || 'Verification failed');
                    setStatus('error');
                }
            };

            exchangeCode();
        } else {
            // No code found
            if (!error) {
                router.push('/');
            }
        }
    }, [searchParams, router]);

    if (status === 'error') {
        return (
            <div className="text-center space-y-4 pt-20">
                <div className="text-red-500 text-xl font-bold">驗證失敗</div>
                <p className="text-zinc-400">{error}</p>
                <div className="p-4 bg-zinc-800 rounded text-sm text-left inline-block max-w-lg overflow-auto text-zinc-500">
                    <p>Debug info: code={searchParams.get('code') ? 'present' : 'missing'}</p>
                </div>
                <div>
                    <button
                        onClick={() => router.push('/settings')}
                        className="text-indigo-400 hover:text-indigo-300 underline"
                    >
                        返回設定
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="text-center space-y-4 pt-20">
                <div className="text-green-500 text-xl font-bold">驗證成功！</div>
                <p className="text-zinc-400">您的電子郵件已成功更新。</p>
                <p className="text-zinc-500 text-sm">正在跳轉回設定頁面...</p>
            </div>
        );
    }

    return (
        <div className="text-center space-y-4 pt-20">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto"></div>
            <p className="text-zinc-400">正在驗證身份並更新資料，請稍候...</p>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <div className="min-h-screen flex flex-col items-center bg-zinc-950 text-white">
            <Suspense fallback={<div className="text-zinc-500 pt-20">Loading...</div>}>
                <CallbackContent />
            </Suspense>
        </div>
    );
}
