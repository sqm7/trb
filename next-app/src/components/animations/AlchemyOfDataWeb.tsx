'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Map, BarChart3, TrendingUp, Target, Crosshair, Building2 } from 'lucide-react';

const COLORS = {
    bg: '#050A15',
    cyan: '#06b6d4',
    violet: '#8b5cf6',
    gold: '#f59e0b',
    white: '#ffffff',
};

// Scene Configuration
const SCENES = [
    { id: 1, duration: 3500, title: "全境實登搜索", subtitle: "Data Integration", icon: Database },
    { id: 2, duration: 3500, title: "市場趨勢分析", subtitle: "Visualized Analytics", icon: TrendingUp },
    { id: 3, duration: 3500, title: "精準定價策略", subtitle: "Strategic Pricing", icon: Target },
    { id: 4, duration: 4000, title: "平米內參", subtitle: "SQMTALK.COM", icon: Building2 }, // Brand
];

export const AlchemyOfDataWeb = () => {
    const [sceneIndex, setSceneIndex] = useState(0);

    useEffect(() => {
        const currentDuration = SCENES[sceneIndex].duration;
        const timer = setTimeout(() => {
            setSceneIndex((prev) => (prev + 1) % SCENES.length);
        }, currentDuration);
        return () => clearTimeout(timer);
    }, [sceneIndex]);

    return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center overflow-hidden bg-zinc-950 text-white select-none">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

            <AnimatePresence mode='wait'>
                {sceneIndex === 0 && <Scene1DataIntegrity key="s1" />}
                {sceneIndex === 1 && <Scene2Analytics key="s2" />}
                {sceneIndex === 2 && <Scene3Strategy key="s3" />}
                {sceneIndex === 3 && <Scene4Branding key="s4" />}
            </AnimatePresence>

            {/* Progress Indicators */}
            <div className="absolute bottom-8 flex gap-2 z-20">
                {SCENES.map((_, i) => (
                    <motion.div
                        key={i}
                        className={`h-1 rounded-full ${i === sceneIndex ? 'bg-cyan-400' : 'bg-zinc-800'}`}
                        animate={{
                            width: i === sceneIndex ? 32 : 8,
                            opacity: i === sceneIndex ? 1 : 0.3
                        }}
                        transition={{ duration: 0.3 }}
                    />
                ))}
            </div>
        </div>
    );
};

// Shared layout component for consistent spacing
const SceneLayout = ({ children, title, subtitle, titleGradientFrom, titleGradientTo }: { children: React.ReactNode, title: string, subtitle: string, titleGradientFrom?: string, titleGradientTo?: string }) => (
    <motion.div className="flex flex-col items-center justify-center relative w-full h-full"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
        {/* Visual Area - Fixed Height to prevent text jumping */}
        <div className="h-[320px] w-full flex items-center justify-center relative">
            {children}
        </div>

        {/* Text Area - Consistent Spacing */}
        <motion.div
            className="flex flex-col items-center z-20"
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
        >
            <h3 className={`text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${titleGradientFrom || 'from-cyan-400'} ${titleGradientTo || 'to-blue-500'} text-center mb-3 drop-shadow-sm px-4`}>
                {title}
            </h3>
            <p className="text-zinc-400 text-sm md:text-base tracking-[0.2em] uppercase text-center font-medium">
                {subtitle}
            </p>
        </motion.div>
    </motion.div>
);

// Scene 1: Data Integration (Map + Database)
const Scene1DataIntegrity = () => {
    return (
        <SceneLayout title="全境實登搜索" subtitle="Cross-Region Data Integration" titleGradientFrom="from-cyan-400" titleGradientTo="to-blue-500">
            {/* Background Rings */}
            <motion.div className="absolute w-64 h-64 border border-dashed border-cyan-500/20 rounded-full animate-[spin_20s_linear_infinite]" />
            <motion.div className="absolute w-80 h-80 border border-zinc-800/60 rounded-full" />

            {/* Central Icon */}
            <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-24 h-24 bg-zinc-900/80 backdrop-blur rounded-3xl border border-cyan-500/50 flex items-center justify-center relative z-20 shadow-[0_0_30px_rgba(6,182,212,0.2)]"
            >
                <Map className="w-12 h-12 text-cyan-400" />
            </motion.div>

            {/* Floating Data Nodes - Adjusted radius to not overlap text */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-10 h-10 bg-zinc-900 border border-zinc-700/50 rounded-xl flex items-center justify-center z-10"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                        x: Math.cos(i * 60 * (Math.PI / 180)) * 140, // Increased radius to 140
                        y: Math.sin(i * 60 * (Math.PI / 180)) * 140,
                        scale: 1,
                        opacity: 1
                    }}
                    transition={{ delay: i * 0.1, duration: 0.5, type: "spring" }}
                >
                    <Database className="w-5 h-5 text-zinc-500" />
                </motion.div>
            ))}
        </SceneLayout>
    );
};

// Scene 2: Market Analytics (Charts)
const Scene2Analytics = () => {
    return (
        <SceneLayout title="市場趨勢分析" subtitle="Real-time Market Visualization" titleGradientFrom="from-violet-400" titleGradientTo="to-fuchsia-500">
            <div className="flex items-end gap-3 md:gap-4 h-48 mb-8">
                {[40, 65, 45, 80, 55, 90, 100].map((h, i) => (
                    <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                        className="w-6 md:w-8 bg-gradient-to-t from-violet-500/20 to-violet-500 rounded-t-lg relative group shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                    >
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 + i * 0.1 }}
                            className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-violet-300 font-mono"
                        >
                            {h}
                        </motion.div>
                    </motion.div>
                ))}
            </div>

            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <TrendingUp className="w-full h-full max-w-[280px] max-h-[160px] text-violet-500/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
            </motion.div>
        </SceneLayout>
    );
};

// Scene 3: Strategic Insight (Target/Radar)
const Scene3Strategy = () => {
    return (
        <SceneLayout title="精準定價策略" subtitle="Identify The Sweet Spot" titleGradientFrom="from-amber-400" titleGradientTo="to-orange-500">
            <div className="relative w-64 h-64 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }} transition={{ duration: 20, ease: "linear", repeat: Infinity }}
                    className="absolute inset-0 border border-amber-500/20 rounded-full border-dashed"
                />
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-8 border border-amber-500/40 rounded-full"
                />

                <Crosshair className="absolute w-full h-full text-amber-500/10 p-4" />

                <motion.div
                    initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100 }}
                    className="relative z-10 w-24 h-24 bg-amber-500/10 rounded-full border border-amber-500 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)] backdrop-blur-sm"
                >
                    <Target className="w-12 h-12 text-amber-500" />
                </motion.div>

                {/* Lock Tags */}
                <motion.div
                    initial={{ x: 50, opacity: 0 }} animate={{ x: 30, opacity: 1 }} transition={{ delay: 0.8 }}
                    className="absolute right-0 top-1/3 bg-zinc-900 border border-amber-500/50 px-3 py-1.5 rounded-md text-xs text-amber-500 font-mono shadow-lg"
                >
                    TARGET LOCKED
                </motion.div>
            </div>
        </SceneLayout>
    );
};

// Scene 4: Branding (New Logo)
const Scene4Branding = () => {
    return (
        <motion.div className="flex flex-col items-center justify-center relative w-full h-full bg-zinc-950"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative mb-6"
            >
                <div className="absolute inset-0 bg-cyan-500 blur-3xl opacity-20 animate-pulse" />
                <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/icon.png`} alt="Logo" className="w-32 h-32 relative z-10 rounded-2xl shadow-2xl" />
            </motion.div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center"
            >
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">平米內參</h1>
                <p className="text-zinc-500 font-mono tracking-[0.4em] text-sm md:text-base">SQMTALK.COM</p>
            </motion.div>

            <motion.div
                initial={{ width: 0 }}
                animate={{ width: 100 }}
                transition={{ delay: 1, duration: 1 }}
                className="h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent mt-8"
            />
        </motion.div>
    );
};
