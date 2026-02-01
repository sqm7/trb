import { X, Check, Minus } from 'lucide-react';
import React from 'react';

interface PermissionTableModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUserRole?: string;
}

export function PermissionTableModal({ isOpen, onClose, currentUserRole }: PermissionTableModalProps) {
    if (!isOpen) return null;

    const isSuperAdmin = currentUserRole === 'super_admin';

    const capabilities = [
        {
            category: '核心功能',
            items: [
                { name: '瀏覽儀表板', user: true, pro: true, max: true, admin: true, super: true },
                { name: '切換縣市/區域', user: true, pro: true, max: true, admin: true, super: true },
                { name: '進階熱力圖', user: false, pro: true, max: true, admin: true, super: true },
                { name: '去化率分析', user: false, pro: true, max: true, admin: true, super: true },
            ]
        },
        {
            category: '報表與匯出',
            items: [
                { name: '匯出圖片 (PNG)', user: false, pro: true, max: true, admin: true, super: true },
                { name: '匯出原始數據 (CSV)', user: false, pro: false, max: true, admin: true, super: true },
                { name: '客製報表產生器', user: false, pro: false, max: true, admin: true, super: true },
                { name: '跨區分析', user: false, pro: false, max: true, admin: true, super: true },
            ]
        },
        {
            category: '管理權限',
            items: [
                { name: '查看會員列表', user: false, pro: false, max: false, admin: true, super: true },
                { name: '修改會員等級', user: false, pro: false, max: false, admin: true, super: true },
                { name: '資料補全 (Enrichment)', user: false, pro: false, max: false, admin: true, super: true },
                { name: '刪除會員帳號', user: false, pro: false, max: false, admin: false, super: true },
                { name: '設定管理員', user: false, pro: false, max: false, admin: false, super: true },
            ]
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-[#1a1d29] border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                    <div>
                        <h3 className="text-xl font-bold text-white">角色權限表</h3>
                        <p className="text-zinc-500 text-sm mt-1">各級會員功能對照一覽</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-auto p-6 custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="p-3 border-b border-zinc-700 w-1/4"></th>
                                <th className="p-3 border-b border-zinc-700 text-center w-[15%]">
                                    <div className="text-zinc-400 text-sm font-medium">User</div>
                                    <div className="text-xs text-zinc-600">一般會員</div>
                                </th>
                                <th className="p-3 border-b border-zinc-700 text-center w-[15%]">
                                    <div className="text-cyan-400 text-sm font-bold">Pro</div>
                                    <div className="text-xs text-zinc-600">進階會員</div>
                                </th>
                                <th className="p-3 border-b border-zinc-700 text-center w-[15%]">
                                    <div className="text-amber-400 text-sm font-bold">Pro Max</div>
                                    <div className="text-xs text-zinc-600">高階會員</div>
                                </th>
                                <th className="p-3 border-b border-zinc-700 text-center w-[15%]">
                                    <div className="text-emerald-400 text-sm font-bold">Admin</div>
                                    <div className="text-xs text-zinc-600">管理員</div>
                                </th>
                                {isSuperAdmin && (
                                    <th className="p-3 border-b border-zinc-700 text-center w-[15%]">
                                        <div className="text-purple-400 text-sm font-bold">Super Admin</div>
                                        <div className="text-xs text-zinc-600">超級管理員</div>
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {capabilities.map((cat, catIdx) => (
                                <React.Fragment key={cat.category}>
                                    {/* Category Header */}
                                    <tr className="bg-zinc-900/30">
                                        <td colSpan={isSuperAdmin ? 6 : 5} className="py-2 px-3 text-xs font-bold text-zinc-500 uppercase tracking-wider mt-4">
                                            {cat.category}
                                        </td>
                                    </tr>
                                    {/* Items */}
                                    {cat.items.map((item, itemIdx) => (
                                        <tr key={item.name} className="hover:bg-zinc-800/30 transition-colors group">
                                            <td className="p-3 text-zinc-300 text-sm font-medium border-r border-zinc-800/50">
                                                {item.name}
                                            </td>
                                            <td className="p-3 text-center border-r border-zinc-800/50">
                                                {item.user ? <Check className="h-5 w-5 text-zinc-400 mx-auto" /> : <Minus className="h-4 w-4 text-zinc-700 mx-auto" />}
                                            </td>
                                            <td className="p-3 text-center border-r border-zinc-800/50 bg-cyan-900/5 group-hover:bg-cyan-900/10">
                                                {item.pro ? <Check className="h-5 w-5 text-cyan-400 mx-auto" /> : <Minus className="h-4 w-4 text-zinc-700 mx-auto" />}
                                            </td>
                                            <td className="p-3 text-center border-r border-zinc-800/50 bg-amber-900/5 group-hover:bg-amber-900/10">
                                                {item.max ? <Check className="h-5 w-5 text-amber-400 mx-auto" /> : <Minus className="h-4 w-4 text-zinc-700 mx-auto" />}
                                            </td>
                                            <td className="p-3 text-center border-r border-zinc-800/50 bg-emerald-900/5 group-hover:bg-emerald-900/10">
                                                {item.admin ? <Check className="h-5 w-5 text-emerald-400 mx-auto" /> : <Minus className="h-4 w-4 text-zinc-700 mx-auto" />}
                                            </td>
                                            {isSuperAdmin && (
                                                <td className="p-3 text-center bg-purple-900/5 group-hover:bg-purple-900/10">
                                                    {item.super ? <Check className="h-5 w-5 text-purple-400 mx-auto" /> : <Minus className="h-4 w-4 text-zinc-700 mx-auto" />}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/30 text-right">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors font-medium text-sm"
                    >
                        關閉
                    </button>
                </div>
            </div>
        </div>
    );
}
