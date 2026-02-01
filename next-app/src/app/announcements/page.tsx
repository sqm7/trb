'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AppLayout } from '@/components/layout/AppLayout';
import { Bell, Pin, AlertTriangle, Info, AlertCircle } from 'lucide-react';

interface Announcement {
    id: string;
    title: string;
    content: string;
    type: 'info' | 'warning' | 'important';
    is_pinned: boolean;
    created_at: string;
    target_user_id: string | null;
}

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            let query = supabase
                .from('announcements')
                .select('*')
                .eq('is_active', true);

            if (user) {
                // Determine visibility: Broadcast (null) OR Private (user.id)
                query = query.or(`target_user_id.is.null,target_user_id.eq.${user.id}`);
            } else {
                // Public only
                query = query.is('target_user_id', null);
            }

            const { data, error } = await query
                .order('is_pinned', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAnnouncements(data || []);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
            case 'important':
                return <AlertCircle className="h-5 w-5 text-red-400" />;
            default:
                return <Info className="h-5 w-5 text-cyan-400" />;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'warning':
                return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'important':
                return 'bg-red-500/10 text-red-400 border-red-500/20';
            default:
                return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-zinc-950 p-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 flex items-center gap-4">
                        <div className="p-3 bg-violet-500/10 rounded-xl border border-violet-500/20">
                            <Bell className="h-6 w-6 text-violet-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">系統公告</h1>
                            <p className="text-zinc-500 text-sm">最新消息與重要通知</p>
                        </div>
                    </div>

                    {/* Announcements List */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="h-8 w-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                        </div>
                    ) : announcements.length === 0 ? (
                        <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                            <Bell className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                            <p className="text-zinc-500">目前沒有公告</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {announcements.map((announcement) => (
                                <div
                                    key={announcement.id}
                                    className={`bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 transition-all hover:border-zinc-700 ${announcement.is_pinned ? 'ring-1 ring-amber-500/30' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 mt-1">
                                            {getTypeIcon(announcement.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                {announcement.target_user_id && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                                                        私訊
                                                    </span>
                                                )}
                                                {announcement.is_pinned && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                                                        <Pin className="h-3 w-3" />
                                                        置頂
                                                    </span>
                                                )}
                                                <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border rounded-full ${getTypeBadge(announcement.type)}`}>
                                                    {announcement.type === 'info' && '一般'}
                                                    {announcement.type === 'warning' && '注意'}
                                                    {announcement.type === 'important' && '重要'}
                                                </span>
                                                <span className="text-xs text-zinc-600">
                                                    {formatDate(announcement.created_at)}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-white mb-2">
                                                {announcement.title}
                                            </h3>
                                            <p className="text-zinc-400 text-sm whitespace-pre-wrap">
                                                {announcement.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
