"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { FileText, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ReportsPage() {
    return (
        <AppLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in zoom-in duration-500">

                {/* Icon Container */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-1000 animate-pulse"></div>
                    <div className="relative h-24 w-24 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 shadow-2xl">
                        <FileText className="h-10 w-10 text-cyan-400" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-violet-600 rounded-full p-2 border-4 border-zinc-950">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                </div>

                {/* Text Content */}
                <div className="text-center space-y-4 max-w-md px-4">
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        客製化報表生成
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400 text-lg mt-1 font-medium">
                            Report Generator
                        </span>
                    </h1>
                    <p className="text-zinc-400 leading-relaxed">
                        未來您將能在此將儀表板的精選數據，一鍵生成為專業的 PDF 分析報告，方便您分享與簡報。
                    </p>
                </div>

                {/* Status Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                    功能開發中・Coming Very Soon
                </div>

                {/* Action */}
                <div className="pt-4">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors group"
                    >
                        <span>返回儀表板</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
