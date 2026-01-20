"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
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
    Ruler,
    User
} from "lucide-react";

export const NAV_ITEMS = [
    { label: "會員登入", href: "/", icon: User },
    { label: "總覽儀表板", href: "/dashboard", icon: LayoutDashboard },
    { label: "地圖模式", href: "/map", icon: Map },
    { label: "平面圖測量", href: "/tools/floor-plan", icon: Ruler },
    { label: "生成報告", href: "/reports", icon: FileText },
    { label: "開發者日誌", href: "https://medium.com/@sqmtalk7", icon: BookOpen, isExternal: true },
    { label: "Threads", href: "https://www.threads.net/@sqm.talk", icon: AtSign, isExternal: true },
];

export function Sidebar() {
    const pathname = usePathname();
    const [user, setUser] = React.useState<any>(null);
    const [showNewBadge, setShowNewBadge] = React.useState(false);
    const router = useRouter();

    React.useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Listen for reportReady event to show NEW badge
    React.useEffect(() => {
        // Check localStorage on mount
        if (localStorage.getItem('reportReady') === 'true') {
            setShowNewBadge(true);
        }

        const handleReportReady = () => {
            setShowNewBadge(true);
        };

        window.addEventListener('reportReady', handleReportReady);
        return () => window.removeEventListener('reportReady', handleReportReady);
    }, []);

    // Clear badge when navigating to reports page
    React.useEffect(() => {
        if (pathname === '/reports') {
            setShowNewBadge(false);
            localStorage.removeItem('reportReady');
        }
    }, [pathname]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <aside className="hidden lg:flex fixed left-0 top-0 z-50 h-screen w-20 flex-col border-r border-white/5 bg-zinc-950 transition-all duration-300 ease-in-out hover:w-64 group shadow-2xl shadow-black/50 overflow-hidden">
            {/* Brand */}
            <div className="flex h-16 flex-col items-center justify-center px-4 border-b border-white/5 overflow-hidden whitespace-nowrap transition-all duration-300">
                <div className="flex flex-col group-hover:flex-row items-center justify-center transition-all duration-300 font-bold text-white group-hover:text-xl text-[10px] leading-tight group-hover:leading-normal group-hover:gap-0">
                    <span className="group-hover:tracking-normal tracking-widest">平米</span>
                    <span className="group-hover:tracking-normal tracking-widest">內參</span>
                </div>
                <span className="font-mono text-zinc-500 transition-all duration-300 group-hover:text-xs group-hover:text-zinc-400 opacity-0 group-hover:opacity-100 h-0 group-hover:h-auto -translate-y-2 group-hover:translate-y-0 text-[10px]">
                    sqmtalk.com
                </span>
            </div>

            {/* Nav */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 scrollbar-none">
                <nav className="flex flex-col gap-1 space-y-1">
                    {NAV_ITEMS.map((item) => {
                        // Hide "Login" if user is logged in
                        if (user && item.label === "會員登入") return null;

                        const isActive = pathname === item.href;
                        // @ts-ignore
                        const isExternal = item.isExternal;
                        const isReportsItem = item.href === '/reports';
                        const isMapItem = item.href === '/map';
                        const isUnderDevelopment = isReportsItem || isMapItem;

                        // Features under development - show badge but keep link clickable
                        if (isUnderDevelopment) {
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 min-h-[40px] relative",
                                        isActive
                                            ? "bg-violet-500/10 text-violet-400 font-semibold"
                                            : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                                    )}
                                >
                                    <div className="relative flex-shrink-0">
                                        <item.icon className={cn("h-5 w-5", isActive ? "text-violet-400" : "text-zinc-500")} />
                                    </div>
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap translate-x-[-10px] group-hover:translate-x-0 flex items-center gap-2">
                                        {item.label}
                                        <span className="text-[10px] font-bold bg-amber-500/80 text-white px-1.5 py-0.5 rounded-full">
                                            開發中
                                        </span>
                                    </span>
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                target={isExternal ? "_blank" : undefined}
                                rel={isExternal ? "noopener noreferrer" : undefined}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 min-h-[40px] relative", // height fixed
                                    isActive
                                        ? "bg-violet-500/10 text-violet-400 font-semibold"
                                        : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                                )}
                            >
                                <div className="relative flex-shrink-0">
                                    <item.icon className={cn("h-5 w-5", isActive ? "text-violet-400" : "text-zinc-500")} />
                                </div>
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap translate-x-[-10px] group-hover:translate-x-0 flex items-center gap-2">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Separator */}
                <div className="my-6 border-t border-white/5 mx-3" />

                <nav className="flex flex-col gap-1 space-y-1">
                    <Link
                        href="/settings"
                        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 transition-colors min-h-[40px]"
                    >
                        <Settings className="h-5 w-5 flex-shrink-0 text-zinc-500" />
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                            系統設定
                        </span>
                    </Link>
                </nav>
            </div>

            {/* User Footer - Only show if logged in */}
            {user && (
                <div className="border-t border-white/5 p-4 bg-zinc-950">
                    <div className="flex items-center gap-3 rounded-lg bg-zinc-900/50 p-3 hover:bg-zinc-900 transition-colors cursor-pointer border border-transparent hover:border-white/5 overflow-hidden">
                        <div className="h-9 w-9 flex-shrink-0 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white ring-2 ring-zinc-950">
                            {user.email?.[0].toUpperCase() ?? 'U'}
                        </div>
                        <div className="flex-1 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 min-w-[120px]">
                            <p className="truncate text-sm font-medium text-zinc-200">User</p>
                            <p className="truncate text-xs text-zinc-500">{user.email}</p>
                        </div>
                        <button onClick={handleLogout} className="p-1 hover:bg-red-500/20 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                            <LogOut className="h-4 w-4 text-zinc-500 hover:text-red-400" />
                        </button>
                    </div>
                </div>
            )}
        </aside>
    );
}
