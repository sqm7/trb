'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export const BrandImageIntro = ({ onComplete }: { onComplete: () => void }) => {
    const [phase, setPhase] = useState<'gathering' | 'fusion' | 'explosion' | 'reveal' | 'exit'>('gathering');

    useEffect(() => {
        const schedule = [
            { t: 0, p: 'gathering' },
            { t: 1200, p: 'fusion' },
            { t: 2500, p: 'explosion' },
            { t: 2700, p: 'reveal' },
            { t: 5000, p: 'exit' },
            { t: 6000, fn: onComplete }
        ];

        const timeouts = schedule.map(s =>
            setTimeout(() => {
                if (s.fn) s.fn();
                else if (s.p) setPhase(s.p as any);
            }, s.t)
        );

        return () => timeouts.forEach(clearTimeout);
    }, [onComplete]);

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

    // Generate stable random stream data
    const [streams] = useState(() => [...Array(60)].map((_, i) => ({
        id: i,
        angle: Math.random() * 360,
        delay: Math.random() * 0.8,
        duration: 0.4 + Math.random() * 0.6,
        width: Math.random() * 300 + 100,
        thickness: Math.random() * 2 + 1,
        color: Math.random() > 0.7 ? 'white' : 'cyan'
    })));

    const [particles] = useState(() => [...Array(40)].map((_, i) => ({
        id: i,
        angle: Math.random() * 360,
        delay: Math.random() * 0.5,
        distance: Math.random() * 200 + 100
    })));

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col items-center justify-center overflow-hidden"
        >
            {/* Background Grid - subtle pulsing */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,rgba(0,0,0,0)_70%)]" />

            {/* Phase 1: Gathering Data Hyperdrive */}
            <AnimatePresence>
                {phase === 'gathering' && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                        {streams.map((s) => (
                            // Container handles Rotation only
                            <div
                                key={`stream-container-${s.id}`}
                                className="absolute flex items-center justify-start origin-center"
                                style={{
                                    width: 0,
                                    height: 0,
                                    rotate: `${s.angle}deg`,
                                }}
                            >
                                {/* Child handles Motion along X axis */}
                                <motion.div
                                    className={`absolute rounded-full origin-left ${s.color === 'white'
                                            ? 'bg-gradient-to-r from-transparent via-white/40 to-white/70 shadow-[0_0_8px_white]'
                                            : 'bg-gradient-to-r from-transparent via-cyan-500/40 to-cyan-400 shadow-[0_0_8px_cyan]'
                                        }`}
                                    style={{
                                        height: s.thickness,
                                        width: s.width,
                                        left: 0,
                                        top: -s.thickness / 2, // Center vertically
                                    }}
                                    initial={{ x: 200, opacity: 0, scaleX: 0.1 }}
                                    animate={{
                                        x: 0, // Move to center (0)
                                        opacity: [0, 1, 0.5, 0],
                                        scaleX: [0.1, 1.5, 2, 0.1]
                                    }}
                                    transition={{
                                        duration: s.duration,
                                        ease: "circIn",
                                        delay: s.delay,
                                        repeat: Infinity,
                                        repeatDelay: Math.random() * 0.1
                                    }}
                                />
                            </div>
                        ))}

                        {/* Floating Data Particles */}
                        {particles.map((p) => (
                            // Use same container strategy for particles
                            <div
                                key={`part-container-${p.id}`}
                                className="absolute flex items-center justify-center origin-center"
                                style={{
                                    width: 0,
                                    height: 0,
                                    rotate: `${p.angle}deg`,
                                }}
                            >
                                <motion.div
                                    className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_5px_white]"
                                    initial={{ x: p.distance * 2, opacity: 0, scale: 0 }}
                                    animate={{
                                        x: 0,
                                        opacity: [0, 1, 0],
                                        scale: [0, 1.2, 0]
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        ease: "circIn",
                                        delay: p.delay,
                                        repeat: Infinity,
                                        repeatDelay: Math.random() * 0.3
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* Phase 2 & 3: Fusion Core */}
            <div className="relative z-20 flex flex-col items-center justify-center">
                <AnimatePresence>
                    {(phase === 'gathering' || phase === 'fusion') && (
                        <motion.div
                            key="core"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                                scale: phase === 'fusion' ? [1, 2.5, 0.1] : 1,
                                opacity: 1,
                                rotate: 1080
                            }}
                            exit={{ scale: 40, opacity: 0 }} // Explosion effect
                            transition={{ duration: phase === 'fusion' ? 1.3 : 0.8, ease: "easeInOut" }}
                            className="absolute w-2 h-2 rounded-full bg-white shadow-[0_0_50px_rgba(255,255,255,1),0_0_100px_rgba(6,182,212,0.9)] z-30"
                        >
                            {/* Core Rings */}
                            <div className="absolute inset-[-15px] border-2 border-cyan-400/40 rounded-full animate-[spin_0.8s_linear_infinite]" />
                            <div className="absolute inset-[-30px] border border-white/20 rounded-full animate-[spin_1.5s_linear_infinite_reverse]" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Shockwave Rings */}
                {phase === 'explosion' && (
                    <>
                        <motion.div
                            initial={{ scale: 0, opacity: 1, borderWidth: '40px' }}
                            animate={{ scale: 6, opacity: 0, borderWidth: '0px' }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="absolute w-24 h-24 rounded-full border-white z-20"
                        />
                        <motion.div
                            initial={{ scale: 0, opacity: 0.8 }}
                            animate={{ scale: 5, opacity: 0 }}
                            transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
                            className="absolute w-24 h-24 rounded-full border-cyan-500 z-20"
                        />
                        <motion.div
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 10, opacity: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="absolute w-24 h-24 rounded-full bg-cyan-400/30 z-10 blur-3xl"
                        />
                    </>
                )}

                {/* Main Logo Reveal */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, filter: 'blur(15px)' }}
                    animate={['reveal', 'exit'].includes(phase) ? {
                        scale: 1,
                        opacity: 1,
                        filter: 'blur(0px)'
                    } : {}}
                    transition={{ type: "spring", bounce: 0.35, duration: 1.2 }}
                    className="relative z-50 flex flex-col items-center"
                >
                    <div className="relative w-32 h-32 mb-8 p-1 rounded-3xl bg-gradient-to-b from-zinc-800 to-black border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(6,182,212,0.2)] overflow-hidden group">
                        <div className="absolute inset-0 bg-cyan-500/5 group-hover:bg-cyan-500/10 transition-colors" />
                        <Image
                            src={`${basePath}/logo-type-a.jpg`}
                            alt="Logo"
                            fill
                            className="object-cover rounded-2xl relative z-10"
                        />
                        {/* Metallic Shine */}
                        <motion.div
                            animate={{ x: ['150%', '-150%'] }}
                            transition={{ repeat: Infinity, duration: 3.5, ease: "linear", repeatDelay: 1.5 }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 z-20"
                        />
                    </div>

                    <div className="text-center overflow-hidden">
                        <motion.h1
                            initial={{ y: 25, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.7 }}
                            className="flex flex-col items-center gap-2 mb-3"
                        >
                            <span className="text-4xl md:text-5xl font-black text-white tracking-[0.25em] uppercase">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">
                                    SQM Talk
                                </span>
                            </span>
                            <span className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-[0.4em] mt-1 drop-shadow-lg">
                                平米內參
                            </span>
                        </motion.h1>

                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.4, duration: 0.9 }}
                            className="h-[1px] bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent w-full mb-4 origin-center"
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                            className="flex items-center justify-center gap-5 text-cyan-400/80 text-[11px] tracking-[0.5em] uppercase font-mono"
                        >
                            <span className="hover:text-cyan-300 transition-colors cursor-default">Intelligence</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50 shadow-[0_0_5px_cyan]" />
                            <span className="hover:text-cyan-300 transition-colors cursor-default">Data</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50 shadow-[0_0_5px_cyan]" />
                            <span className="hover:text-cyan-300 transition-colors cursor-default">Vibe</span>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};
