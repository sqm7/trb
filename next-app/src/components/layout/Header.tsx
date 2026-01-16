"use client";

import React from "react";
import { Search, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export function Header() {
    return (
        <header className="sticky top-0 z-40 flex h-16 w-full items-center border-b border-white/5 bg-zinc-950/80 backdrop-blur-md px-6 shadow-sm">
            <div className="flex items-center gap-4 lg:hidden">
                <Button variant="ghost" size="icon" className="-ml-2">
                    <Menu className="h-5 w-5" />
                </Button>
            </div>

            <div className="flex flex-1 items-center justify-between gap-4">
                {/* Left: Global Search or Breadcrumb */}
                <div className="hidden lg:flex max-w-sm flex-1 items-center gap-2">
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                        <Input
                            placeholder="全站搜尋..."
                            className="w-full bg-zinc-900/50 pl-9 border-zinc-800 focus:border-violet-500/50"
                        />
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3 text-zinc-400 hover:text-white"
                    >
                        Login
                    </Link>
                    <Link
                        href="/admin/uploader"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3 text-zinc-400 hover:text-white"
                    >
                        Uploader
                    </Link>
                    <div className="h-4 w-[1px] bg-zinc-800 mx-2" />
                    <Button variant="ghost" size="icon" className="relative text-zinc-400 hover:text-white hover:bg-zinc-800">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-violet-500 ring-2 ring-zinc-950 block" />
                    </Button>
                </div>
            </div>
        </header>
    );
}
