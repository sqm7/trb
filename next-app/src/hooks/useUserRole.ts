'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export type UserRole = 'user' | 'pro' | 'pro_max' | 'admin' | 'super_admin' | null;

export function useUserRole() {
    const [role, setRole] = useState<UserRole>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const fetchRole = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) {
                    if (mounted) {
                        setRole(null);
                        setIsLoading(false);
                    }
                    return;
                }

                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                if (mounted) {
                    if (profile) {
                        setRole(profile.role as UserRole);
                    } else {
                        setRole('user');
                    }
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('Error fetching user role:', err);
                if (mounted) {
                    setRole('user');
                    setIsLoading(false);
                }
            }
        };

        fetchRole();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                setRole(null);
            } else {
                // Ideally we re-fetch profile, but for now we re-trigger
                fetchRole();
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    return { role, isLoading };
}
