"use client";

import React from "react";
import { Search, Menu, Settings, Bell, ShieldCheck, LogOut, ChevronDown, Upload, Megaphone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { NAV_ITEMS } from "./Sidebar";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [user, setUser] = React.useState<any>(null);
    const [isAdmin, setIsAdmin] = React.useState(false);
    const [adminMenuOpen, setAdminMenuOpen] = React.useState(false);
    const router = useRouter();
    const pathname = usePathname();

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

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
        setIsMenuOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 flex h-16 w-full items-center border-b border-white/5 bg-zinc-950/80 backdrop-blur-md px-6 shadow-sm">
            <div className="flex items-center gap-4 lg:hidden">
                <Button variant="ghost" size="icon" className="-ml-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <Menu className="h-5 w-5" />
                </Button>
            </div>

            <div className="flex flex-1 items-center justify-between gap-4">
                {/* Left: Global Search or Breadcrumb */}
                <div className="hidden lg:flex max-w-sm flex-1 items-center gap-2">
                    {/* Search moved to Sidebar */}
                </div>

            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="absolute top-16 left-0 w-full bg-zinc-950 border-b border-zinc-800 p-4 shadow-xl lg:hidden animate-in slide-in-from-top-2 overflow-y-auto max-h-[80vh]">
                    <nav className="flex flex-col gap-2">
                        {NAV_ITEMS.map((item) => {
                            // Hide "Login" if user is logged in
                            if (user && item.label === "會員登入") return null;

                            // @ts-ignore
                            const isExternal = item.isExternal;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    target={isExternal ? "_blank" : undefined}
                                    rel={isExternal ? "noopener noreferrer" : undefined}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 transition-colors"
                                >
                                    <item.icon className="h-5 w-5 text-zinc-500" />
                                    {item.label}
                                </Link>
                            );
                        })}

                        <div className="my-2 border-t border-white/5" />

                        {/* Admin Menu */}
                        {isAdmin && (
                            <div className="space-y-1">
                                <button
                                    onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                                    className={cn(
                                        "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors w-full",
                                        pathname?.startsWith('/admin')
                                            ? "bg-amber-500/10 text-amber-400 font-semibold"
                                            : "text-amber-400/70 hover:bg-zinc-900 hover:text-amber-300"
                                    )}
                                >
                                    <ShieldCheck className="h-5 w-5 flex-shrink-0 text-amber-500" />
                                    <span className="flex-1 text-left">管理者介面</span>
                                    <ChevronDown className={cn(
                                        "h-4 w-4 transition-all duration-300",
                                        adminMenuOpen && "rotate-180"
                                    )} />
                                </button>
                                {adminMenuOpen && (
                                    <div className="ml-4 pl-4 border-l border-amber-500/20 space-y-1">
                                        <Link
                                            href="/admin/uploader"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-zinc-400 hover:text-amber-300"
                                        >
                                            <Upload className="h-4 w-4" />
                                            上傳資料工具
                                        </Link>
                                        <Link
                                            href="/admin/announcements"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-zinc-400 hover:text-amber-300"
                                        >
                                            <Megaphone className="h-4 w-4" />
                                            公告發布
                                        </Link>
                                        <Link
                                            href="/admin/members"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-zinc-400 hover:text-amber-300"
                                        >
                                            <Users className="h-4 w-4" />
                                            會員管理
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* System Items */}
                        <Link
                            href="/announcements"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 transition-colors"
                        >
                            <Bell className="h-5 w-5 text-zinc-500" />
                            系統公告
                        </Link>

                        <Link
                            href="/settings"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 transition-colors"
                        >
                            <Settings className="h-5 w-5 text-zinc-500" />
                            系統設定
                        </Link>

                        {/* User Profile / Logout */}
                        {user && (
                            <div className="mt-2 pt-2 border-t border-white/5">
                                <div className="px-3 py-2">
                                    <p className="text-xs text-zinc-500">已登入</p>
                                    <p className="text-sm font-medium text-zinc-200 truncate">{user.email}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    <LogOut className="h-5 w-5" />
                                    登出
                                </button>
                            </div>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}
