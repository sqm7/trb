'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
    Megaphone, Plus, Edit2, Trash2, Pin, PinOff,
    Eye, EyeOff, AlertTriangle, Info, AlertCircle,
    ArrowLeft, Save, X, User, Users, Search, Loader2
} from 'lucide-react';
import { api } from '@/lib/api';

interface UserData {
    id: string;
    email: string;
    full_name: string;
}

interface Announcement {
    id: string;
    title: string;
    content: string;
    type: 'info' | 'warning' | 'important';
    is_pinned: boolean;
    is_active: boolean;
    created_at: string;
    target_user_id: string | null;
}

export default function AdminAnnouncementsPage() {
    const router = useRouter();
    const { user, isAdmin, isLoading: isAuthLoading } = useAdminAuth();

    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'info' as 'info' | 'warning' | 'important',
        is_pinned: false,
        target_user_id: null as string | null,
    });
    const [saving, setSaving] = useState(false);

    // Private Message State
    const [targetType, setTargetType] = useState<'broadcast' | 'private'>('broadcast');
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<UserData[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

    // Fetch users for search
    useEffect(() => {
        if (showForm && targetType === 'private' && users.length === 0) {
            fetchUsers();
        }
    }, [showForm, targetType]);

    // Handle Edit Mode Target
    useEffect(() => {
        if (formData.target_user_id) {
            setTargetType('private');
            // Try to find user in cached list or we might need to fetch single - simpler for now:
            // if we have users loaded, find them. If not, we might display "Loading..." or just ID.
            if (users.length > 0) {
                const u = users.find(u => u.id === formData.target_user_id);
                if (u) setSelectedUser(u);
            }
        } else {
            setTargetType('broadcast');
            setSelectedUser(null);
        }
    }, [formData.target_user_id, users]);

    const fetchUsers = async () => {
        try {
            setIsSearching(true);
            const data = await api.getAdminUsers() as any;
            const memberList = Array.isArray(data) ? data : data.users || [];

            // Transform to simpler UserData
            const formattedUsers: UserData[] = memberList.map((m: any) => ({
                id: m.id,
                email: m.email,
                full_name: m.full_name || '未命名'
            }));

            setUsers(formattedUsers);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        if (!isAuthLoading && isAdmin) {
            fetchAnnouncements();
        }
    }, [isAuthLoading, isAdmin]);

    const fetchAnnouncements = async () => {
        try {
            const { data, error } = await supabase
                .from('announcements')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAnnouncements(data || []);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (editingId) {
                // Update
                const { error } = await supabase
                    .from('announcements')
                    .update({
                        title: formData.title,
                        content: formData.content,
                        type: formData.type,
                        is_pinned: formData.is_pinned,
                        target_user_id: targetType === 'private' ? selectedUser?.id : null,
                    })
                    .eq('id', editingId);

                if (error) throw error;
            } else {
                // Create - must include is_active, and RLS may require admin check
                console.log('[Announcement] Creating with user:', user?.id);
                const insertPayload = {
                    title: formData.title,
                    content: formData.content,
                    type: formData.type,
                    is_pinned: formData.is_pinned,
                    is_active: true,
                    created_by: user?.id,
                    target_user_id: targetType === 'private' ? selectedUser?.id : null,
                };
                console.log('[Announcement] Insert payload:', insertPayload);

                const { data, error } = await supabase
                    .from('announcements')
                    .insert(insertPayload)
                    .select();

                console.log('[Announcement] Insert result:', { data, error });
                if (error) throw error;
            }

            setShowForm(false);
            setEditingId(null);
            setShowForm(false);
            setEditingId(null);
            setFormData({ title: '', content: '', type: 'info', is_pinned: false, target_user_id: null });
            setTargetType('broadcast');
            setSelectedUser(null);
            setSearchQuery('');
            fetchAnnouncements();
        } catch (error: any) {
            console.error('Error saving announcement:', error);
            alert('儲存失敗：' + (error.message || JSON.stringify(error)));
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (announcement: Announcement) => {
        setFormData({
            title: announcement.title,
            content: announcement.content,
            type: announcement.type,
            is_pinned: announcement.is_pinned,
            target_user_id: announcement.target_user_id,
        });
        if (announcement.target_user_id && users.length === 0) {
            // Trigger fetch so we can resolve the name
            fetchUsers();
        }
        setEditingId(announcement.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('確定要刪除這則公告嗎？')) return;

        try {
            const { error } = await supabase
                .from('announcements')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchAnnouncements();
        } catch (error: any) {
            console.error('Error deleting announcement:', error);
            alert('刪除失敗：' + error.message);
        }
    };

    const toggleActive = async (id: string, currentValue: boolean) => {
        try {
            const { error } = await supabase
                .from('announcements')
                .update({ is_active: !currentValue })
                .eq('id', id);

            if (error) throw error;
            fetchAnnouncements();
        } catch (error: any) {
            console.error('Error toggling active:', error);
        }
    };

    const togglePinned = async (id: string, currentValue: boolean) => {
        try {
            const { error } = await supabase
                .from('announcements')
                .update({ is_pinned: !currentValue })
                .eq('id', id);

            if (error) throw error;
            fetchAnnouncements();
        } catch (error: any) {
            console.error('Error toggling pinned:', error);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
            case 'important': return <AlertCircle className="h-4 w-4 text-red-400" />;
            default: return <Info className="h-4 w-4 text-cyan-400" />;
        }
    };

    // Auth loading state
    if (isAuthLoading) {
        return (
            <div className="min-h-screen bg-[#1a1d29] flex items-center justify-center">
                <div className="h-8 w-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            </div>
        );
    }

    // Not admin
    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-[#1a1d29] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="text-4xl">⛔</div>
                    <h1 className="text-xl font-bold text-white">權限不足</h1>
                    <button onClick={() => router.push('/dashboard')} className="bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-2 rounded-lg">
                        返回首頁
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1a1d29] text-gray-100 p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/dashboard')} className="text-zinc-400 hover:text-white">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                            <Megaphone className="h-6 w-6 text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">公告發布</h1>
                            <p className="text-zinc-500 text-sm">管理系統公告</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setShowForm(true);
                            setEditingId(null);
                            setFormData({ title: '', content: '', type: 'info', is_pinned: false, target_user_id: null });
                            setTargetType('broadcast');
                            setSelectedUser(null);
                        }}
                        className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        新增公告
                    </button>
                </div>

                {/* Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                        <div className="bg-[#252836] border border-gray-700 rounded-xl w-full max-w-2xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">
                                    {editingId ? '編輯公告' : '新增公告'}
                                </h2>
                                <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-white">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1">標題</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                                        placeholder="輸入公告標題..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1">內容</label>
                                    <textarea
                                        required
                                        rows={5}
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none resize-none"
                                        placeholder="輸入公告內容..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-400 mb-1">類型</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                                        >
                                            <option value="info">一般</option>
                                            <option value="warning">注意</option>
                                            <option value="important">重要</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_pinned}
                                                onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                                                className="form-checkbox h-5 w-5 text-amber-600 bg-zinc-900 border-zinc-700 rounded"
                                            />
                                            <span className="text-sm text-zinc-300">置頂公告</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Target Selection */}
                                <div className="space-y-3 pt-2 border-t border-zinc-700/50">
                                    <label className="block text-sm font-medium text-zinc-400">發送對象</label>
                                    <div className="flex gap-4">
                                        <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all flex-1 ${targetType === 'broadcast' ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' : 'bg-zinc-900 border-zinc-700 text-zinc-400'}`}>
                                            <input
                                                type="radio"
                                                name="target"
                                                checked={targetType === 'broadcast'}
                                                onChange={() => setTargetType('broadcast')}
                                                className="hidden"
                                            />
                                            <Megaphone className="h-4 w-4" />
                                            <span>全員推播</span>
                                        </label>
                                        <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all flex-1 ${targetType === 'private' ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' : 'bg-zinc-900 border-zinc-700 text-zinc-400'}`}>
                                            <input
                                                type="radio"
                                                name="target"
                                                checked={targetType === 'private'}
                                                onChange={() => setTargetType('private')}
                                                className="hidden"
                                            />
                                            <User className="h-4 w-4" />
                                            <span>指定會員</span>
                                        </label>
                                    </div>

                                    {/* User Search */}
                                    {targetType === 'private' && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                            {selectedUser ? (
                                                <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs">
                                                            {selectedUser.full_name?.[0] || 'U'}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-white">{selectedUser.full_name}</p>
                                                            <p className="text-xs text-zinc-400">{selectedUser.email}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedUser(null)}
                                                        className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                                    <input
                                                        type="text"
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        placeholder="搜尋會員 (Email 或 名稱)..."
                                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                                                    />
                                                    {searchQuery && (
                                                        <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl max-h-48 overflow-y-auto z-10">
                                                            {isSearching ? (
                                                                <div className="p-4 text-center text-zinc-500 flex items-center justify-center gap-2">
                                                                    <Loader2 className="h-4 w-4 animate-spin" /> 載入中...
                                                                </div>
                                                            ) : filteredUsers.length === 0 ? (
                                                                <div className="p-4 text-center text-zinc-500">找不到相符會員</div>
                                                            ) : (
                                                                filteredUsers.map(u => (
                                                                    <button
                                                                        key={u.id}
                                                                        type="button"
                                                                        onClick={() => { setSelectedUser(u); setSearchQuery(''); }}
                                                                        className="w-full text-left px-4 py-2 hover:bg-zinc-800 flex items-center justify-between group"
                                                                    >
                                                                        <div>
                                                                            <p className="text-sm text-zinc-200 group-hover:text-amber-400">{u.full_name}</p>
                                                                            <p className="text-xs text-zinc-500">{u.email}</p>
                                                                        </div>
                                                                        <Plus className="h-3 w-3 text-zinc-600 group-hover:text-amber-400" />
                                                                    </button>
                                                                ))
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="px-4 py-2 text-zinc-400 hover:text-white"
                                    >
                                        取消
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-lg disabled:opacity-50"
                                    >
                                        {saving ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
                                        儲存
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Announcements List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="h-8 w-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-900/50 rounded-xl border border-zinc-800">
                        <Megaphone className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                        <p className="text-zinc-500">尚未建立任何公告</p>
                    </div>
                ) : (
                    <div className="bg-[#252836] rounded-xl border border-gray-700 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-zinc-900/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-zinc-400">狀態</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-zinc-400">發送對象</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-zinc-400">標題</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-zinc-400">類型</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-zinc-400">建立時間</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-zinc-400">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {announcements.map((a) => (
                                    <tr key={a.id} className="border-t border-zinc-800 hover:bg-zinc-800/30">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {a.is_pinned && <Pin className="h-4 w-4 text-amber-400" />}
                                                {a.is_active ? (
                                                    <span className="h-2 w-2 rounded-full bg-green-400" />
                                                ) : (
                                                    <span className="h-2 w-2 rounded-full bg-zinc-600" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {a.target_user_id ? (
                                                <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded w-fit">
                                                    <User className="h-3 w-3" />
                                                    私訊
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-800 border border-zinc-700 px-2 py-1 rounded w-fit">
                                                    <Users className="h-3 w-3" />
                                                    全員
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`font-medium ${a.is_active ? 'text-white' : 'text-zinc-500'}`}>
                                                {a.title}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                {getTypeIcon(a.type)}
                                                <span className="text-xs text-zinc-400">
                                                    {a.type === 'info' && '一般'}
                                                    {a.type === 'warning' && '注意'}
                                                    {a.type === 'important' && '重要'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-zinc-500">
                                            {new Date(a.created_at).toLocaleDateString('zh-TW')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => togglePinned(a.id, a.is_pinned)}
                                                    className={`p-2 rounded hover:bg-zinc-700 ${a.is_pinned ? 'text-amber-400' : 'text-zinc-500'}`}
                                                    title={a.is_pinned ? '取消置頂' : '置頂'}
                                                >
                                                    {a.is_pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                                                </button>
                                                <button
                                                    onClick={() => toggleActive(a.id, a.is_active)}
                                                    className={`p-2 rounded hover:bg-zinc-700 ${a.is_active ? 'text-green-400' : 'text-zinc-500'}`}
                                                    title={a.is_active ? '隱藏' : '顯示'}
                                                >
                                                    {a.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(a)}
                                                    className="p-2 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white"
                                                    title="編輯"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(a.id)}
                                                    className="p-2 rounded hover:bg-red-500/20 text-zinc-400 hover:text-red-400"
                                                    title="刪除"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
