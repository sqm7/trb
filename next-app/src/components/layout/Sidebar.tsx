"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    PieChart,
    Map,
    Settings,
    FileText,
    LogOut,
    Building,
    BookOpen,
    AtSign,
    Ruler
} from "lucide-react";

export const NAV_ITEMS = [
    { label: "總覽儀表板", href: "/", icon: LayoutDashboard },
    { label: "地圖模式", href: "/map", icon: Map },
    { label: "平面圖測量", href: "/tools/floor-plan", icon: Ruler },
    { label: "分析報告", href: "/reports", icon: FileText },
    { label: "開發者日誌", href: "https://medium.com/@sqmtalk7", icon: BookOpen, isExternal: true },
    { label: "Threads", href: "https://www.threads.net/@sqm.talk", icon: AtSign, isExternal: true },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden h-screen w-64 flex-col border-r border-white/5 bg-zinc-950 lg:flex fixed left-0 top-0 z-50">
            {/* Brand */}
            <div className="flex h-16 items-center border-b border-white/5 px-6">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white shadow-lg shadow-violet-500/30">
                        <Building className="h-5 w-5" />
                    </div>
                    <span>平米內參</span>
                </div>
            </div>

            {/* Nav */}
            <div className="flex-1 overflow-y-auto py-6 px-3">
                <nav className="flex flex-col gap-1 space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        // @ts-ignore
                        const isExternal = item.isExternal;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                target={isExternal ? "_blank" : undefined}
                                rel={isExternal ? "noopener noreferrer" : undefined}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-violet-500/10 text-violet-400 font-semibold"
                                        : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                                )}
                            >
                                <item.icon className={cn("h-4 w-4", isActive ? "text-violet-400" : "text-zinc-500")} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Separator */}
                <div className="my-6 border-t border-white/5 mx-3" />

                <nav className="flex flex-col gap-1 space-y-1">
                    <Link
                        href="/settings"
                        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 transition-colors"
                    >
                        <Settings className="h-4 w-4 text-zinc-500" />
                        系統設定
                    </Link>
                </nav>
            </div>

            {/* User Footer */}
            <div className="border-t border-white/5 p-4">
                <div className="flex items-center gap-3 rounded-lg bg-zinc-900/50 p-3 hover:bg-zinc-900 transition-colors cursor-pointer border border-transparent hover:border-white/5">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white ring-2 ring-zinc-950">
                        KT
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium text-zinc-200">KT Pro</p>
                        <p className="truncate text-xs text-zinc-500">ktpro@vibe.co</p>
                    </div>
                    <LogOut className="h-4 w-4 text-zinc-500 hover:text-white transition-colors" />
                </div>
            </div>
        </aside>
    );
}
