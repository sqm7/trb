'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Users, ArrowLeft, Shield, ShieldOff, Search, Mail, Calendar, Crown } from 'lucide-react';

interface Member {
    id: string;
    email: string;
    role: string;
    full_name: string | null;
    created_at: string;
    last_sign_in_at: string | null;
}

export default function AdminMembersPage() {
    const router = useRouter();
    const { user, isAdmin, isLoading: isAuthLoading } = useAdminAuth();

    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentUserRole, setCurrentUserRole] = useState<string>('user');

    useEffect(() => {
        if (!isAuthLoading && isAdmin) {
            fetchMembers();
        }
    }, [isAuthLoading, isAdmin]);

    const fetchMembers = async () => {
        try {
            // Get all profiles with user info
            const { data, error } = await supabase
                .from('profiles')
                .select('id, role, full_name, created_at')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Get auth.users info (email) - we'll need to fetch from a function or edge
            // For now, use profiles data and show what we have
            const membersWithEmail = (data || []).map(profile => ({
                ...profile,
                email: profile.full_name || profile.id.substring(0, 8) + '...',
                last_sign_in_at: null,
            }));

            setMembers(membersWithEmail);

            // Get current user's role
            const currentProfile = (data || []).find(p => p.id === user?.id);
            if (currentProfile) {
                setCurrentUserRole(currentProfile.role);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleRole = async (memberId: string, currentRole: string) => {
        // Super admin protection - cannot be modified by anyone
        if (currentRole === 'super_admin') {
            alert('超級管理員權限無法被修改');
            return;
        }

        // Only super_admin can modify other admins
        if (currentRole === 'admin' && currentUserRole !== 'super_admin') {
            alert('只有超級管理員可以修改其他管理員的權限');
            return;
        }

        // Cannot modify yourself
        if (memberId === user?.id) {
            alert('您不能修改自己的權限');
            return;
        }

        const newRole = currentRole === 'admin' ? 'user' : 'admin';

        if (!confirm(`確定要將此會員設為 ${newRole === 'admin' ? '管理員' : '一般會員'} 嗎？`)) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', memberId);

            if (error) throw error;
            fetchMembers();
        } catch (error: any) {
            console.error('Error updating role:', error);
            alert('更新失敗：' + error.message);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const filteredMembers = members.filter(m =>
        m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                        <button onClick={() => router.back()} className="text-zinc-400 hover:text-white">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                            <Users className="h-6 w-6 text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">會員管理</h1>
                            <p className="text-zinc-500 text-sm">管理會員權限與資訊</p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="搜尋會員..."
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Members List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="h-8 w-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                    </div>
                ) : filteredMembers.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-900/50 rounded-xl border border-zinc-800">
                        <Users className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                        <p className="text-zinc-500">沒有找到會員</p>
                    </div>
                ) : (
                    <div className="bg-[#252836] rounded-xl border border-gray-700 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-zinc-900/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-zinc-400">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-zinc-400">名稱</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-zinc-400">角色</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-zinc-400">註冊日期</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-zinc-400">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMembers.map((m) => (
                                    <tr key={m.id} className="border-t border-zinc-800 hover:bg-zinc-800/30">
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-xs text-zinc-500">
                                                {m.id.substring(0, 8)}...
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                                                    {(m.full_name || m.email)?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">{m.full_name || '未設定'}</p>
                                                    <p className="text-xs text-zinc-500">{m.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {m.role === 'super_admin' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full">
                                                    <Crown className="h-3 w-3" />
                                                    超級管理員
                                                </span>
                                            ) : m.role === 'admin' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                                                    <Shield className="h-3 w-3" />
                                                    管理員
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full">
                                                    一般會員
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1 text-xs text-zinc-500">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(m.created_at)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end">
                                                {/* Hide button for super_admin targets, self, or if current user is not super_admin and target is admin */}
                                                {m.role !== 'super_admin' && m.id !== user?.id && (currentUserRole === 'super_admin' || m.role === 'user') && (
                                                    <button
                                                        onClick={() => toggleRole(m.id, m.role)}
                                                        className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${m.role === 'admin'
                                                            ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                                            : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                                                            }`}
                                                        title={m.role === 'admin' ? '移除管理員權限' : '設為管理員'}
                                                    >
                                                        {m.role === 'admin' ? (
                                                            <><ShieldOff className="h-3 w-3" /> 移除權限</>
                                                        ) : (
                                                            <><Shield className="h-3 w-3" /> 設為管理員</>
                                                        )}
                                                    </button>
                                                )}
                                                {m.role === 'super_admin' && (
                                                    <span className="text-xs text-zinc-600">受保護</span>
                                                )}
                                                {m.id === user?.id && (
                                                    <span className="text-xs text-zinc-600">本人</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Stats */}
                <div className="mt-6 flex gap-4">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3">
                        <p className="text-xs text-zinc-500">總會員數</p>
                        <p className="text-xl font-bold text-white">{members.length}</p>
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3">
                        <p className="text-xs text-zinc-500">管理員</p>
                        <p className="text-xl font-bold text-amber-400">{members.filter(m => m.role === 'admin' || m.role === 'super_admin').length}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
