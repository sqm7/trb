"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
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
    User,
    ShieldCheck,
    Bell,
    ChevronDown,
    Upload,
    Megaphone,
    Users,
    Crown
} from "lucide-react";

export const NAV_ITEMS = [
    { label: "會員登入", href: "/", icon: User },
    { label: "總覽儀表板", href: "/dashboard", icon: LayoutDashboard },
    { label: "地圖模式", href: "/map", icon: Map },
    { label: "平面圖測量", href: "/tools/floor-plan", icon: Ruler },
    { label: "報表編輯器", href: "/reports/builder", icon: FileText },
    { label: "會員方案", href: "/pricing", icon: Crown },
    { label: "開發者日誌", href: "https://medium.com/@sqmtalk7", icon: BookOpen, isExternal: true },
    { label: "Threads", href: "https://www.threads.net/@sqm.talk", icon: AtSign, isExternal: true },
];


export function Sidebar() {
    const pathname = usePathname();
    const [user, setUser] = React.useState<any>(null);
    const [isAdmin, setIsAdmin] = React.useState(false);
    const [showNewBadge, setShowNewBadge] = React.useState(false);
    const [adminMenuOpen, setAdminMenuOpen] = React.useState(false);
    const router = useRouter();

    React.useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            // Check admin status
            if (session?.user) {
                supabase.from('profiles').select('role').eq('id', session.user.id).single()
                    .then(({ data }) => setIsAdmin(data?.role === 'admin' || data?.role === 'super_admin'));
            }
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                supabase.from('profiles').select('role').eq('id', session.user.id).single()
                    .then(({ data }) => setIsAdmin(data?.role === 'admin' || data?.role === 'super_admin'));
            } else {
                setIsAdmin(false);
            }
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
        <aside className="hidden lg:flex fixed left-0 top-0 z-[60] h-screen w-20 flex-col border-r border-white/5 bg-zinc-950 transition-all duration-300 ease-in-out hover:w-64 group shadow-2xl shadow-black/50 overflow-hidden">
            {/* Brand */}
            <Link href="/" className="flex h-16 items-center justify-center px-4 border-b border-white/5 overflow-hidden whitespace-nowrap transition-all duration-300 gap-1.5 flex-shrink-0 hover:bg-zinc-900/50">
                <div className="relative h-8 w-8 flex-shrink-0 rounded-full overflow-hidden">
                    <Image
                        src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/logo-type-a.jpg`}
                        alt="Logo"
                        fill
                        className="object-cover"
                        sizes="32px"
                    />
                </div>
                <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-all duration-300 w-0 group-hover:w-auto overflow-hidden">
                    <span className="font-bold text-white text-lg leading-none">平米內參</span>
                    <span className="font-mono text-[10px] text-zinc-500 leading-none">sqmtalk.com</span>
                </div>
            </Link>

            {/* Global Search (Sidebar) */}
            <div className="px-3 py-4 border-b border-white/5">
                <div className="relative group/search">
                    <div className="absolute left-0 top-0 flex items-center justify-center h-10 w-full group-hover:w-10 transition-all duration-300 pointer-events-none">
                        <div className="flex items-center justify-center h-10 w-10">
                            {/* Icon placeholder for collapsed state */}
                        </div>
                    </div>

                    <div className="relative flex items-center">
                        <div className="absolute left-2.5 z-10 text-zinc-500 group-hover/search:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </div>
                        <input
                            type="text"
                            placeholder="全站搜尋..."
                            className="h-10 w-full bg-zinc-900/50 rounded-lg border border-transparent focus:border-violet-500/50 focus:bg-zinc-900 text-sm text-zinc-200 placeholder:text-zinc-600 pl-9 pr-3 outline-none transition-all duration-300 opacity-0 group-hover:opacity-100 w-0 group-hover:w-full overflow-hidden"
                        />
                        {/* Icon visible in collapsed state (overlaid) */}
                        <div className="absolute left-0 top-0 h-10 w-full flex items-center justify-center group-hover:hidden cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search text-zinc-500"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 scrollbar-none">
                <nav className="flex flex-col gap-1 space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href || (item.href === '/reports/builder' && pathname?.startsWith('/reports'));
                        // @ts-ignore
                        const isExternal = item.isExternal;
                        const isUnderDevelopment = item.href === '/map' || item.href === '/reports/builder';

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
                    {/* Admin Menu - Only visible to admins */}
                    {isAdmin && (
                        <div className="space-y-1">
                            {/* Admin Menu Toggle */}
                            <button
                                onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors min-h-[40px] w-full",
                                    pathname?.startsWith('/admin')
                                        ? "bg-amber-500/10 text-amber-400 font-semibold"
                                        : "text-amber-400/70 hover:bg-zinc-900 hover:text-amber-300"
                                )}
                            >
                                <ShieldCheck className="h-5 w-5 flex-shrink-0 text-amber-500" />
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap flex-1 text-left">
                                    管理者介面
                                </span>
                                <ChevronDown className={cn(
                                    "h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-300",
                                    adminMenuOpen && "rotate-180"
                                )} />
                            </button>

                            {/* Admin Sub Menu */}
                            {adminMenuOpen && (
                                <div className="ml-4 pl-4 border-l border-amber-500/20 space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <Link
                                        href="/admin/uploader"
                                        className={cn(
                                            "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                                            pathname === '/admin/uploader'
                                                ? "bg-amber-500/10 text-amber-300"
                                                : "text-zinc-400 hover:text-amber-300"
                                        )}
                                    >
                                        <Upload className="h-4 w-4" />
                                        上傳資料工具
                                    </Link>
                                    <Link
                                        href="/admin/announcements"
                                        className={cn(
                                            "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                                            pathname === '/admin/announcements'
                                                ? "bg-amber-500/10 text-amber-300"
                                                : "text-zinc-400 hover:text-amber-300"
                                        )}
                                    >
                                        <Megaphone className="h-4 w-4" />
                                        公告發布
                                    </Link>
                                    <Link
                                        href="/admin/members"
                                        className={cn(
                                            "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                                            pathname === '/admin/members'
                                                ? "bg-amber-500/10 text-amber-300"
                                                : "text-zinc-400 hover:text-amber-300"
                                        )}
                                    >
                                        <Users className="h-4 w-4" />
                                        會員管理
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Announcements */}
                    <Link
                        href="/announcements"
                        className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors min-h-[40px] relative",
                            pathname === '/announcements'
                                ? "bg-violet-500/10 text-violet-400 font-semibold"
                                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                        )}
                    >
                        <div className="relative flex-shrink-0">
                            <Bell className="h-5 w-5 text-zinc-500" />
                            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-violet-500 ring-2 ring-zinc-950" />
                        </div>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                            系統公告
                        </span>
                    </Link>

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
