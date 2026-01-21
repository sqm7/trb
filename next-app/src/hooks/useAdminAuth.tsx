'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export interface AdminAuthState {
    user: User | null;
    isAdmin: boolean;
    isLoading: boolean;
    error: string | null;
}

/**
 * Hook to check if the current user has admin privileges.
 * Returns loading state, user info, and admin status.
 */
export function useAdminAuth(): AdminAuthState {
    const [state, setState] = useState<AdminAuthState>({
        user: null,
        isAdmin: false,
        isLoading: true,
        error: null,
    });

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                // Get current session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) throw sessionError;

                if (!session?.user) {
                    setState({
                        user: null,
                        isAdmin: false,
                        isLoading: false,
                        error: null,
                    });
                    return;
                }

                // Check profile for admin role
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                if (profileError) {
                    console.warn('Profile fetch error:', profileError);
                    // If profile doesn't exist or error, default to non-admin
                    setState({
                        user: session.user,
                        isAdmin: false,
                        isLoading: false,
                        error: null,
                    });
                    return;
                }

                setState({
                    user: session.user,
                    isAdmin: profile?.role === 'admin' || profile?.role === 'super_admin',
                    isLoading: false,
                    error: null,
                });

            } catch (err: any) {
                console.error('Admin auth check error:', err);
                setState({
                    user: null,
                    isAdmin: false,
                    isLoading: false,
                    error: err.message,
                });
            }
        };

        checkAdminStatus();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            checkAdminStatus();
        });

        return () => subscription.unsubscribe();
    }, []);

    return state;
}

/**
 * Higher-order component to protect admin-only pages.
 * Redirects non-admin users to homepage.
 */
export function withAdminAuth<P extends object>(
    WrappedComponent: React.ComponentType<P>
): React.FC<P> {
    return function AdminProtectedComponent(props: P) {
        const { user, isAdmin, isLoading, error } = useAdminAuth();
        const router = useRouter();

        useEffect(() => {
            if (!isLoading && !isAdmin) {
                router.replace('/');
            }
        }, [isLoading, isAdmin, router]);

        if (isLoading) {
            return (
                <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <div className="h-8 w-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto" />
                        <p className="text-zinc-500 text-sm">驗證管理員權限...</p>
                    </div>
                </div>
            );
        }

        if (!user) {
            return (
                <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                    <div className="text-center space-y-4 p-8">
                        <div className="text-4xl">🔒</div>
                        <h1 className="text-xl font-bold text-white">請先登入</h1>
                        <p className="text-zinc-500">此頁面需要登入才能訪問</p>
                        <button
                            onClick={() => router.push('/')}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            前往登入
                        </button>
                    </div>
                </div>
            );
        }

        if (!isAdmin) {
            return (
                <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                    <div className="text-center space-y-4 p-8">
                        <div className="text-4xl">⛔</div>
                        <h1 className="text-xl font-bold text-white">權限不足</h1>
                        <p className="text-zinc-500">此頁面僅限管理員訪問</p>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            返回首頁
                        </button>
                    </div>
                </div>
            );
        }

        return <WrappedComponent {...props} />;
    };
}
