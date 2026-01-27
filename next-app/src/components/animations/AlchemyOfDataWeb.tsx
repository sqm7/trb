'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = {
    bg: '#050A15',      // Midnight Blue
    cyan: '#06b6d4',    // Neon Cyan (Data)
    gold: '#f59e0b',    // Amber Gold (Value)
    white: '#ffffff',
    grid: 'rgba(30, 41, 59, 0.4)', // Slate 800-ish
};

export const AlchemyOfDataWeb = () => {
    const [scene, setScene] = useState(1);

    useEffect(() => {
        let timer: NodeJS.Timeout;

        // Scene duration logic
        const duration = 3000; // 3 seconds per scene

        switch (scene) {
            case 1:
                timer = setTimeout(() => setScene(2), duration);
                break;
            case 2:
                timer = setTimeout(() => setScene(3), duration);
                break;
            case 3:
                timer = setTimeout(() => setScene(4), duration);
                break;
            case 4:
                timer = setTimeout(() => setScene(5), duration);
                break;
            case 5:
                timer = setTimeout(() => setScene(1), duration);
                break;
        }

        return () => clearTimeout(timer);
    }, [scene]);

    return (
        <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden pointer-events-none">
            <AnimatePresence>
                {scene === 1 && <Scene1Dust key="s1" />}
                {scene === 2 && <Scene2Lattice key="s2" />}
                {scene === 3 && <Scene3Crown key="s3" />}
                {scene === 4 && <Scene4Ripples key="s4" />}
                {scene === 5 && <Scene5Diamond key="s5" />}
            </AnimatePresence>

            {/* Global Ambient Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.05)_0%,transparent_70%)] pointer-events-none" />
        </div>
    );
};

// Scene 1: Dust in the Fog (0-4s)
const Scene1Dust = () => {
    const particles = useMemo(() =>
        new Array(120).fill(0).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 1,
            delay: Math.random() * 2,
        })), []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
        >
            {particles.map(p => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.id % 8 === 0 ? COLORS.cyan : COLORS.white,
                        boxShadow: p.id % 8 === 0 ? `0 0 12px ${COLORS.cyan}` : '0 0 8px rgba(255,255,255,0.3)',
                    }}
                    animate={{
                        x: [0, (Math.random() - 0.5) * 150],
                        y: [0, (Math.random() - 0.5) * 150],
                        opacity: [0, 0.8, 0],
                        scale: [0, 1.2, 0],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "easeInOut"
                    }}
                />
            ))}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#050A15_90%)] opacity-40" />
        </motion.div>
    );
};

// Scene 2: Etchings of Law (4-8s)
const Scene2Lattice = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 flex items-center justify-center"
        >
            {/* Rotating Halo */}
            <motion.div
                initial={{ scale: 3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10"
            >
                <svg width="400" height="400" className="animate-spin-slow">
                    <circle cx="200" cy="200" r="180" fill="none" stroke={COLORS.cyan} strokeWidth="1" strokeDasharray="4 8" className="opacity-40" />
                    <circle cx="200" cy="200" r="150" fill="none" stroke={COLORS.white} strokeWidth="0.5" className="opacity-20" />
                </svg>
            </motion.div>

            {/* Grid Formation */}
            <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 opacity-30">
                {new Array(72).fill(0).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.01 + 1 }}
                        className="border-[0.5px] border-slate-800 flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.01 + 2 }}
                            className="w-[2px] h-[2px] bg-cyan-400 rounded-full"
                        />
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

// Scene 3: Ascension of the Crown (8-12s)
const Scene3Crown = () => {
    const bars = 15;
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1 }}
            className="flex items-end gap-3 h-[400px]"
        >
            {new Array(bars).fill(0).map((_, i) => {
                const dist = Math.abs(i - Math.floor(bars / 2));
                const height = 300 - (dist * 35);
                return (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: height }}
                            transition={{
                                type: "spring",
                                stiffness: 60,
                                damping: 15,
                                delay: i * 0.1
                            }}
                            className="w-4 rounded-t-full bg-gradient-to-t from-cyan-500/0 via-cyan-500/50 to-cyan-400 relative"
                            style={{ boxShadow: '0 -10px 20px -5px rgba(6, 182, 212, 0.4)' }}
                        >
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.1 + 0.5 }}
                                className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_#fff]"
                            />
                        </motion.div>
                    </div>
                );
            })}
        </motion.div>
    );
};

// Scene 4: Pulsating Heat (12-16s)
const Scene4Ripples = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
        >
            {/* Amber Ripples */}
            {new Array(4).fill(0).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0.8 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.8,
                        ease: "easeOut"
                    }}
                    className="absolute w-64 h-64 border border-amber-500/40 rounded-full"
                    style={{ boxShadow: 'inset 0 0 30px rgba(245, 158, 11, 0.1)' }}
                />
            ))}

            {/* Core */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 bg-amber-500 rounded-full shadow-[0_0_60px_rgba(245,158,11,0.8)] z-10"
            />
        </motion.div>
    );
};

// Scene 5: Wisdom (16-20s)
const Scene5Diamond = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-20"
        >
            {/* Diamond Core */}
            <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 45 }}
                transition={{ type: "spring", stiffness: 100, damping: 10 }}
                className="w-24 h-24 bg-white shadow-[0_0_80px_rgba(6,182,212,0.6)] relative z-20"
            >
                {/* Internal Glow */}
                <div className="absolute inset-2 bg-cyan-50 opacity-40 blur-sm" />
            </motion.div>

            {/* Arcing Beam */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
                    d="M 50% 50% Q 70% 30% 120% 20%"
                    fill="none"
                    stroke="url(#beamGrad)"
                    strokeWidth="3"
                    className="filter drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]"
                />
                <defs>
                    <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#fff" />
                        <stop offset="100%" stopColor={COLORS.cyan} stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="mt-32 text-cyan-400 font-mono tracking-[0.6em] text-lg uppercase font-bold"
            >
                SQMTALK.COM
            </motion.div>
        </motion.div>
    );
};
