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

// Scene 1: Data Integration (Map + Database)
const Scene1DataIntegrity = () => {
    return (
        <motion.div className="flex flex-col items-center justify-center relative w-full h-full"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
            <div className="relative mb-8">
                {/* Connecting Lines */}
                <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-dashed border-cyan-500/30 rounded-full animate-[spin_10s_linear_infinite]" />
                <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-zinc-800 rounded-full" />

                {/* Central Icon */}
                <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-20 h-20 bg-cyan-500/10 rounded-2xl border border-cyan-500/50 flex items-center justify-center relative z-10 backdrop-blur-sm"
                >
                    <Map className="w-10 h-10 text-cyan-400" />
                </motion.div>

                {/* Floating Data Nodes */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-8 h-8 bg-zinc-900 border border-zinc-700 rounded-lg flex items-center justify-center"
                        style={{ top: '50%', left: '50%' }}
                        animate={{
                            x: Math.cos(i * 60 * (Math.PI / 180)) * 100,
                            y: Math.sin(i * 60 * (Math.PI / 180)) * 100,
                            opacity: [0, 1]
                        }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                    >
                        <Database className="w-4 h-4 text-zinc-500" />
                    </motion.div>
                ))}
            </div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 text-center mb-2">全境實登搜索</h3>
                <p className="text-zinc-400 text-sm tracking-widest uppercase text-center">Cross-Region Data Integration</p>
            </motion.div>
        </motion.div>
    );
};

// Scene 2: Market Analytics (Charts)
const Scene2Analytics = () => {
    return (
        <motion.div className="flex flex-col items-center justify-center relative w-full h-full"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
            <div className="flex items-end gap-3 h-40 mb-12">
                {[40, 65, 45, 80, 55, 90, 100].map((h, i) => (
                    <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                        className="w-6 bg-gradient-to-t from-violet-500/20 to-violet-500 rounded-t-sm relative group"
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
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[140%] w-full max-w-[200px]">
                    <TrendingUp className="w-full h-32 text-violet-500/10 absolute top-0 left-0" />
                </div>
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-500 text-center mb-2">市場趨勢分析</h3>
                <p className="text-zinc-400 text-sm tracking-widest uppercase text-center">Real-time Market Visualization</p>
            </motion.div>
        </motion.div>
    );
};

// Scene 3: Strategic Insight (Target/Radar)
const Scene3Strategy = () => {
    return (
        <motion.div className="flex flex-col items-center justify-center relative w-full h-full"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
            <div className="relative mb-10 w-64 h-64 flex items-center justify-center">
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
                    className="relative z-10 w-24 h-24 bg-amber-500/10 rounded-full border border-amber-500 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)]"
                >
                    <Target className="w-12 h-12 text-amber-500" />
                </motion.div>

                {/* Lock Tags */}
                <motion.div
                    initial={{ x: 50, opacity: 0 }} animate={{ x: 30, opacity: 1 }} transition={{ delay: 0.8 }}
                    className="absolute right-0 top-1/3 bg-zinc-900 border border-amber-500/50 px-2 py-1 rounded text-[10px] text-amber-500"
                >
                    TARGET LOCKED
                </motion.div>
            </div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500 text-center mb-2">精準定價策略</h3>
                <p className="text-zinc-400 text-sm tracking-widest uppercase text-center">Identify The Sweet Spot</p>
            </motion.div>
        </motion.div>
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
