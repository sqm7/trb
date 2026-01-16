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
            <div className="flex-1 flex flex-col lg:pl-64 min-w-0 transition-all duration-300">
                <Header />

                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
                    <div className="container-custom py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
