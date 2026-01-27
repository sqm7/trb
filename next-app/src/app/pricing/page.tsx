import React from 'react';
import Link from 'next/link';
import { Check, X, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';

export default function PricingPage() {
    return (
        <AppLayout>
            <div className="relative">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[128px] pointer-events-none" />

                <div className="relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400 mb-6">
                            升級您的分析體驗
                        </h1>
                        <p className="text-xl text-zinc-400 leading-relaxed">
                            解鎖完整的房地產市場洞察，做出更精準的投資決策。
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                        {/* Free Plan */}
                        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 hover:border-zinc-700 transition-all duration-300">
                            <div className="mb-8">
                                <h3 className="text-lg font-medium text-zinc-300 mb-2">一般會員</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white">免費</span>
                                </div>
                                <p className="text-zinc-500 mt-4 text-sm">適合剛開始探索市場的個人用戶。</p>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-zinc-300">
                                    <Check className="w-5 h-5 text-zinc-500" />
                                    <span>基礎建案搜尋</span>
                                </li>
                                <li className="flex items-center gap-3 text-zinc-300">
                                    <Check className="w-5 h-5 text-zinc-500" />
                                    <span>查看基本實價登錄數據</span>
                                </li>
                                <li className="flex items-center gap-3 text-zinc-500">
                                    <X className="w-5 h-5" />
                                    <span>進階圖表分析 (散佈圖、熱力圖)</span>
                                </li>
                                <li className="flex items-center gap-3 text-zinc-500">
                                    <X className="w-5 h-5" />
                                    <span>匯出 CSV 報表</span>
                                </li>
                            </ul>
                            <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700" asChild>
                                <Link href="/dashboard">開始使用</Link>
                            </Button>
                        </div>

                        {/* Pro Plan (Highlighted) */}
                        <div className="bg-zinc-900/80 backdrop-blur-md border border-violet-500/30 rounded-2xl p-8 relative transform md:-translate-y-4 shadow-2xl shadow-violet-900/20">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-lg">
                                Most Popular
                            </div>
                            <div className="mb-8">
                                <h3 className="text-lg font-medium text-violet-300 mb-2 flex items-center gap-2">
                                    <Crown className="w-5 h-5" />
                                    Pro 專業版
                                </h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white">NT$ 990</span>
                                    <span className="text-zinc-500">/月</span>
                                </div>
                                <p className="text-violet-200/60 mt-4 text-sm">為專業投資者與房地產從業人員設計。</p>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-white">
                                    <span className="bg-violet-500/20 p-1 rounded-full"><Check className="w-3 h-3 text-violet-400" /></span>
                                    <span>包含所有免費功能</span>
                                </li>
                                <li className="flex items-center gap-3 text-white">
                                    <span className="bg-violet-500/20 p-1 rounded-full"><Check className="w-3 h-3 text-violet-400" /></span>
                                    <span><span className="text-violet-400 font-semibold">解鎖匯出 CSV 功能</span></span>
                                </li>
                                <li className="flex items-center gap-3 text-white">
                                    <span className="bg-violet-500/20 p-1 rounded-full"><Check className="w-3 h-3 text-violet-400" /></span>
                                    <span>車位/附屬建物分析報告</span>
                                </li>
                                <li className="flex items-center gap-3 text-white">
                                    <span className="bg-violet-500/20 p-1 rounded-full"><Check className="w-3 h-3 text-violet-400" /></span>
                                    <span>進階熱力圖與價格帶分析</span>
                                </li>
                            </ul>
                            <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-900/40">
                                立即升級
                            </Button>
                        </div>

                        {/* Pro Max Plan */}
                        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 hover:border-zinc-700 transition-all duration-300">
                            <div className="mb-8">
                                <h3 className="text-lg font-medium text-amber-500 mb-2 flex items-center gap-2">
                                    <Zap className="w-5 h-5" />
                                    Pro Max 企業版
                                </h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white">專案報價</span>
                                </div>
                                <p className="text-zinc-500 mt-4 text-sm">為大型團隊與企業提供的定制解決方案。</p>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-zinc-300">
                                    <Check className="w-5 h-5 text-amber-500" />
                                    <span>多帳號團隊管理</span>
                                </li>
                                <li className="flex items-center gap-3 text-zinc-300">
                                    <Check className="w-5 h-5 text-amber-500" />
                                    <span>API 串接服務</span>
                                </li>
                                <li className="flex items-center gap-3 text-zinc-300">
                                    <Check className="w-5 h-5 text-amber-500" />
                                    <span>專屬客戶經理支援</span>
                                </li>
                                <li className="flex items-center gap-3 text-zinc-300">
                                    <Check className="w-5 h-5 text-amber-500" />
                                    <span>客製化報表開發</span>
                                </li>
                            </ul>
                            <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800 text-zinc-300">
                                聯絡我們
                            </Button>
                        </div>
                    </div>

                    <div className="mt-20 text-center border-t border-zinc-900 pt-16">
                        <h2 className="text-2xl font-bold text-white mb-6">常見問題</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
                            <div>
                                <h4 className="font-semibold text-zinc-200 mb-2">如何付款？</h4>
                                <p className="text-zinc-500 text-sm">我們目前支援信用卡與銀行轉帳。請點擊「立即升級」聯絡客服進行啟用。</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-zinc-200 mb-2">可以隨時取消嗎？</h4>
                                <p className="text-zinc-500 text-sm">是的，您可以隨時取消訂閱，權益將保留至當期結束。</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
