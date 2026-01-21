'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { api } from '@/lib/api';
import { Users, ArrowLeft, Shield, Search, Calendar, Crown, Zap, Star, Edit2, X, Mail, MessageCircle, Clock, CheckCircle, Ban } from 'lucide-react';

interface Member {
    id: string;
    email: string | undefined;
    role: string;
    full_name: string | null;
    created_at: string;
    last_sign_in_at: string | null;
    providers: string[];
    banned_until: string | null;
}

export default function AdminMembersPage() {
    const router = useRouter();
    const { user, isAdmin, isLoading: isAuthLoading } = useAdminAuth();

    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentUserRole, setCurrentUserRole] = useState<string>('user');
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthLoading && isAdmin) {
            fetchMembers();
        }
    }, [isAuthLoading, isAdmin]);

    const fetchMembers = async () => {
        try {
            const data = await api.getAdminUsers() as Member[];
            setMembers(data);

            const currentProfile = data.find(p => p.id === user?.id);
            if (currentProfile) {
                setCurrentUserRole(currentProfile.role);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (memberId: string, newRole: string) => {
        const targetMember = members.find(m => m.id === memberId);
        if (targetMember?.role === 'super_admin') {
            alert('超級管理員權限無法被修改');
            return;
        }

        if ((newRole === 'admin' || targetMember?.role === 'admin') && currentUserRole !== 'super_admin') {
            alert('只有超級管理員可以設置其他管理員');
            return;
        }

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', memberId);

            if (error) throw error;

            setMenuOpenId(null);
            fetchMembers();
        } catch (error: any) {
            console.error('Error updating role:', error);
            alert('更新失敗：' + error.message);
        }
    };

    const RoleBadge = ({ role }: { role: string }) => {
        switch (role) {
            case 'super_admin':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full">
                        <Crown className="h-3 w-3" /> 超級管理員
                    </span>
                );
            case 'admin':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                        <Shield className="h-3 w-3" /> 管理員
                    </span>
                );
            case 'pro_max':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gradient-to-r from-purple-500/10 to-amber-500/10 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-amber-400 border border-purple-500/20 rounded-full">
                        <Star className="h-3 w-3 text-amber-400" /> PRO MAX
                    </span>
                );
            case 'pro':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
                        <Zap className="h-3 w-3" /> PRO
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full">
                        一般會員
                    </span>
                );
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('zh-TW', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const filteredMembers = members.filter(m =>
        m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isAuthLoading) {
        return (
            <div className="min-h-screen bg-[#1a1d29] flex items-center justify-center">
                <div className="h-8 w-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            </div>
        );
    }

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
                                    <th className="px-4 py-3 text-left text-xs font-bold text-zinc-400">ID / 名稱</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-zinc-400">綁定</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-zinc-400">角色</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-zinc-400">最後登入</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-zinc-400">狀態</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-zinc-400">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMembers.map((m) => (
                                    <tr key={m.id} className="border-t border-zinc-800 hover:bg-zinc-800/30">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                                    {(m.full_name || m.email)?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-white truncate">{m.full_name || '未設定'}</p>
                                                    <p className="text-xs text-zinc-500 truncate font-mono">{m.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {m.providers.includes('line') && (
                                                    <div className="p-1.5 bg-[#06C755]/10 rounded border border-[#06C755]/20" title="LINE 綁定">
                                                        <MessageCircle className="h-3.5 w-3.5 text-[#06C755]" />
                                                    </div>
                                                )}
                                                {m.providers.includes('email') && (
                                                    <div className="p-1.5 bg-blue-500/10 rounded border border-blue-500/20" title="Email 綁定">
                                                        <Mail className="h-3.5 w-3.5 text-blue-400" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <RoleBadge role={m.role} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-1 text-xs text-zinc-300">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDateTime(m.last_sign_in_at)}
                                                </div>
                                                <div className="text-[10px] text-zinc-600">
                                                    註冊: {formatDate(m.created_at)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {m.banned_until ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">
                                                    <Ban className="h-3 w-3" /> 停用
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                                                    <CheckCircle className="h-3 w-3" /> 正常
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end relative">
                                                {/* Simpler Button Logic - triggers Modal via menuOpenId */}
                                                {m.role !== 'super_admin' && m.id !== user?.id && (currentUserRole === 'super_admin' || m.role !== 'admin') && (
                                                    <button
                                                        onClick={() => setMenuOpenId(m.id)}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
                                                    >
                                                        <Edit2 className="h-3 w-3" /> 編輯權限
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

                {/* Role Edit Modal */}
                {menuOpenId && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setMenuOpenId(null)}>
                        <div
                            className="bg-[#252836] border border-zinc-700 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="px-6 py-4 border-b border-zinc-700/50 flex justify-between items-center bg-zinc-900/50">
                                <h3 className="text-lg font-bold text-white">設定會員權限</h3>
                                <button onClick={() => setMenuOpenId(null)} className="text-zinc-500 hover:text-white">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="p-3 space-y-2">
                                {['user', 'pro', 'pro_max', 'admin'].map((role) => {
                                    if (role === 'admin' && currentUserRole !== 'super_admin') return null;

                                    const currentMember = members.find(m => m.id === menuOpenId);
                                    const isActive = currentMember?.role === role;

                                    return (
                                        <button
                                            key={role}
                                            onClick={() => handleUpdateRole(menuOpenId, role)}
                                            className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-all ${isActive
                                                ? 'bg-amber-500/10 border border-amber-500/50 shadow-sm'
                                                : 'bg-zinc-800/50 border border-transparent hover:bg-zinc-700 hover:border-zinc-600'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-inner ${role === 'pro_max' ? 'bg-gradient-to-br from-purple-500 to-amber-500' :
                                                    role === 'pro' ? 'bg-gradient-to-br from-cyan-400 to-blue-500' :
                                                        role === 'admin' ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                                                            'bg-zinc-700'
                                                    }`}>
                                                    {role === 'pro_max' ? <Star className="h-5 w-5 text-white" /> :
                                                        role === 'pro' ? <Zap className="h-5 w-5 text-white" /> :
                                                            role === 'admin' ? <Shield className="h-5 w-5 text-white" /> :
                                                                <Users className="h-5 w-5 text-zinc-400" />}
                                                </div>
                                                <div>
                                                    <p className={`font-bold text-base ${isActive ? 'text-amber-400' : 'text-white'}`}>
                                                        {role === 'pro_max' ? 'PRO MAX' :
                                                            role === 'pro' ? 'PRO' :
                                                                role === 'admin' ? '管理員' :
                                                                    '一般會員'}
                                                    </p>
                                                    <p className="text-xs text-zinc-500">
                                                        {role === 'pro_max' ? '最高等級，完整功能' :
                                                            role === 'pro' ? '進階會員，更多權限' :
                                                                role === 'admin' ? '系統管理與維護' :
                                                                    '基本瀏覽與查詢'}
                                                    </p>
                                                </div>
                                            </div>
                                            {isActive && (
                                                <div className="h-3 w-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="px-6 py-3 bg-zinc-900/30 text-center border-t border-zinc-700/30">
                                <p className="text-xs text-zinc-500">點擊上方選項即會立即更新權限</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 min-w-[120px]">
                        <p className="text-xs text-zinc-500">總會員數</p>
                        <p className="text-xl font-bold text-white">{members.length}</p>
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 min-w-[120px]">
                        <p className="text-xs text-zinc-500">PRO MAX</p>
                        <p className="text-xl font-bold text-purple-400">{members.filter(m => m.role === 'pro_max').length}</p>
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 min-w-[120px]">
                        <p className="text-xs text-zinc-500">PRO</p>
                        <p className="text-xl font-bold text-cyan-400">{members.filter(m => m.role === 'pro').length}</p>
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 min-w-[120px]">
                        <p className="text-xs text-zinc-500">管理員</p>
                        <p className="text-xl font-bold text-amber-400">{members.filter(m => m.role === 'admin' || m.role === 'super_admin').length}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
