'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export const BrandImageIntro = ({ onComplete }: { onComplete: () => void }) => {
    const [phase, setPhase] = useState<'gathering' | 'fusion' | 'explosion' | 'reveal' | 'exit'>('gathering');

    useEffect(() => {
        const schedule = [
            { t: 0, p: 'gathering' },
            { t: 1200, p: 'fusion' }, // Slightly longer gathering
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

    // Generate random stream data once
    const streams = [...Array(40)].map((_, i) => ({
        id: i,
        angle: Math.random() * 360,
        delay: Math.random() * 0.5,
        duration: 0.5 + Math.random() * 0.5,
        width: Math.random() * 200 + 100,
        color: Math.random() > 0.7 ? 'white' : 'cyan' // Mix of white and cyan
    }));

    // Generate particles for complexity
    const particles = [...Array(30)].map((_, i) => ({
        id: i,
        angle: Math.random() * 360,
        delay: Math.random() * 0.5,
        distance: Math.random() * 50 + 100
    }));

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col items-center justify-center overflow-hidden"
        >
            {/* Background Grid - subtle pulsing */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15)_0%,rgba(0,0,0,0)_70%)]" />

            {/* Phase 1: Gathering Data Hyperdrive */}
            <AnimatePresence>
                {phase === 'gathering' && (
                    <div className="absolute inset-0 z-10 perspective-1000">
                        {/* High Speed Streams */}
                        {streams.map((s) => (
                            <motion.div
                                key={`stream-${s.id}`}
                                className={`absolute h-[2px] origin-left rounded-full ${s.color === 'white' ? 'bg-white/50 shadow-[0_0_10px_white]' : 'bg-cyan-500/80 shadow-[0_0_10px_cyan]'}`}
                                style={{
                                    width: s.width,
                                    left: '50%',
                                    top: '50%',
                                    rotate: `${s.angle}deg`,
                                    x: '100%', // Start far out
                                }}
                                initial={{ x: '200%', opacity: 0, scaleX: 0.1 }}
                                animate={{ x: '0%', opacity: [0, 1, 0], scaleX: [0.1, 1.5, 0.1] }}
                                transition={{
                                    duration: s.duration,
                                    ease: "circIn",
                                    delay: s.delay,
                                    repeat: Infinity,
                                    repeatDelay: Math.random() * 0.2
                                }}
                            />
                        ))}

                        {/* Floating Data Particles */}
                        {particles.map((p) => (
                            <motion.div
                                key={`part-${p.id}`}
                                className="absolute w-1 h-1 bg-white rounded-full"
                                style={{
                                    left: '50%',
                                    top: '50%',
                                    rotate: `${p.angle}deg`,
                                    x: p.distance
                                }}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ x: 0, opacity: [0, 1, 0], scale: [0, 1, 0] }}
                                transition={{
                                    duration: 0.8,
                                    ease: "anticipate",
                                    delay: p.delay,
                                    repeat: Infinity
                                }}
                            />
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
                                scale: phase === 'fusion' ? [1, 2, 0.1] : 1,
                                opacity: 1,
                                rotate: 720
                            }}
                            exit={{ scale: 30, opacity: 0 }} // Explosion effect
                            transition={{ duration: phase === 'fusion' ? 1.2 : 0.8, ease: "easeInOut" }}
                            className="absolute w-2 h-2 rounded-full bg-white shadow-[0_0_50px_rgba(255,255,255,0.9),0_0_100px_rgba(6,182,212,0.8)] z-30"
                        >
                            {/* Core Rings */}
                            <div className="absolute inset-[-10px] border-2 border-cyan-400/30 rounded-full animate-[spin_1s_linear_infinite]" />
                            <div className="absolute inset-[-20px] border border-white/20 rounded-full animate-[spin_2s_linear_infinite_reverse]" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Shockwave Rings */}
                {phase === 'explosion' && (
                    <>
                        <motion.div
                            initial={{ scale: 0, opacity: 1, borderWidth: '30px' }}
                            animate={{ scale: 5, opacity: 0, borderWidth: '0px' }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="absolute w-24 h-24 rounded-full border-white z-20"
                        />
                        <motion.div
                            initial={{ scale: 0, opacity: 0.8 }}
                            animate={{ scale: 4, opacity: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                            className="absolute w-24 h-24 rounded-full border-cyan-500 z-20"
                        />
                        <motion.div
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 6, opacity: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="absolute w-24 h-24 rounded-full bg-cyan-400/20 z-10 blur-2xl"
                        />
                    </>
                )}

                {/* Main Logo Reveal */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
                    animate={['reveal', 'exit'].includes(phase) ? {
                        scale: 1,
                        opacity: 1,
                        filter: 'blur(0px)'
                    } : {}}
                    transition={{ type: "spring", bounce: 0.3, duration: 1.2 }}
                    className="relative z-30 flex flex-col items-center"
                >
                    <div className="relative w-32 h-32 mb-8 p-1 rounded-3xl bg-gradient-to-b from-zinc-800 to-black border border-white/10 shadow-2xl overflow-hidden group">
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
                            transition={{ repeat: Infinity, duration: 4, ease: "linear", repeatDelay: 1 }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 z-20"
                        />
                    </div>

                    <div className="text-center overflow-hidden">
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.6 }}
                            className="flex flex-col items-center gap-2 mb-3"
                        >
                            <span className="text-4xl md:text-5xl font-black text-white tracking-[0.2em] uppercase">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                                    SQM Talk
                                </span>
                            </span>
                            <span className="text-2xl md:text-3xl font-bold text-zinc-300 tracking-widest mt-1">
                                平米內參
                            </span>
                        </motion.h1>

                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent w-full mb-3 origin-center"
                        />

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="flex items-center justify-center gap-4 text-cyan-500/70 text-[10px] tracking-[0.4em] uppercase font-mono"
                        >
                            <span>Intelligence</span>
                            <span className="w-1 h-1 rounded-full bg-cyan-500" />
                            <span>Data</span>
                            <span className="w-1 h-1 rounded-full bg-cyan-500" />
                            <span>Vibe</span>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};
