import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface AppLayoutProps {
    children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
            {/* Sidebar - Fixed Left */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:pl-20 min-w-0 transition-all duration-300">
                <Header />

                <main className="flex-1 p-4 md:p-6 lg:p-8">
                    <div className="container-custom py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[calc(100vh-12rem)]">
                        {children}
                    </div>

                    {/* Global Footer */}
                    <footer className="py-8 text-center border-t border-white/5 mt-8">
                        <p className="text-zinc-600 text-sm font-medium">
                            &copy; 2026 平米內參 sqmtalk.com. All rights reserved.
                        </p>
                        <a href="mailto:sqmtalk7@gmail.com" className="block mt-2 text-zinc-700 hover:text-cyan-500 text-xs transition-colors">
                            Contact: sqmtalk7@gmail.com
                        </a>
                    </footer>
                </main>
            </div>
        </div>
    );
}
