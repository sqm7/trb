'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const code = searchParams.get('code');
        const next = searchParams.get('next') ?? '/dashboard';

        if (code) {
            const exchangeCode = async () => {
                try {
                    // Exchange logic
                    const { error } = await supabase.auth.exchangeCodeForSession(code);
                    if (error) throw error;
                    router.push(next);
                } catch (err: any) {
                    console.error('Auth callback error:', err);
                    setError(err.message || 'Verification failed');
                    setTimeout(() => router.push('/'), 3000);
                }
            };

            exchangeCode();
        } else {
            router.push('/');
        }
    }, [searchParams, router]);

    if (error) {
        return (
            <div className="text-center space-y-4">
                <div className="text-red-500 text-xl font-bold">登入驗證失敗</div>
                <p className="text-zinc-400">{error}</p>
                <p className="text-sm text-zinc-500">將於 3 秒後返回首頁...</p>
            </div>
        );
    }

    return (
        <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto"></div>
            <p className="text-zinc-400">正在驗證身份，請稍候...</p>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
            <Suspense fallback={<div className="text-zinc-500">Loading...</div>}>
                <CallbackContent />
            </Suspense>
        </div>
    );
}
