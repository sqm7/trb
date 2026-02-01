'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export const BrandImageIntro = ({ onComplete }: { onComplete: () => void }) => {
    const [phase, setPhase] = useState<'gathering' | 'fusion' | 'explosion' | 'reveal' | 'exit'>('gathering');

    useEffect(() => {
        const schedule = [
            { t: 0, p: 'gathering' },
            { t: 1500, p: 'fusion' },
            { t: 3000, p: 'explosion' },
            { t: 3200, p: 'reveal' },
            { t: 5500, p: 'exit' },
            { t: 6500, fn: onComplete }
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

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#050A15] flex flex-col items-center justify-center overflow-hidden"
        >
            {/* Phase 1: Gathering Data Streams */}
            <AnimatePresence>
                {phase === 'gathering' && (
                    <div className="absolute inset-0">
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={`stream-${i}`}
                                className="absolute bg-gradient-to-r from-transparent via-cyan-500 to-transparent h-[1px] w-[200px]"
                                initial={{
                                    x: Math.random() < 0.5 ? '-100%' : '100%',
                                    y: `${Math.random() * 100}%`,
                                    opacity: 0,
                                    scaleX: 0
                                }}
                                animate={{
                                    x: '50%',
                                    y: '50%',
                                    opacity: [0, 1, 0],
                                    scaleX: [0.5, 2, 0]
                                }}
                                transition={{
                                    duration: 1.5,
                                    ease: "easeIn",
                                    delay: Math.random() * 1
                                }}
                                style={{
                                    left: 0,
                                    top: 0,
                                    transformOrigin: 'center',
                                    rotate: `${Math.random() * 360}deg`
                                }}
                            />
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* Phase 2 & 3: Fusion Core */}
            <div className="relative z-10 flex flex-col items-center justify-center">
                <AnimatePresence>
                    {(phase === 'gathering' || phase === 'fusion') && (
                        <motion.div
                            key="core"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                                scale: phase === 'fusion' ? [1, 1.5, 0.2] : 1,
                                opacity: 1,
                                rotate: 360
                            }}
                            exit={{ scale: 20, opacity: 0 }} // Explosion effect
                            transition={{ duration: phase === 'fusion' ? 1.5 : 2 }}
                            className="absolute w-4 h-4 rounded-full bg-white shadow-[0_0_50px_rgba(6,182,212,0.8)] z-20"
                        >
                            <div className="absolute inset-0 bg-cyan-400 blur-md rounded-full animate-pulse" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Shockwave Rings */}
                {phase === 'explosion' && (
                    <>
                        <motion.div
                            initial={{ scale: 0, opacity: 1, borderWidth: '20px' }}
                            animate={{ scale: 4, opacity: 0, borderWidth: '0px' }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="absolute w-24 h-24 rounded-full border-cyan-500 z-10"
                        />
                        <motion.div
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 3, opacity: 0 }}
                            transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                            className="absolute w-24 h-24 rounded-full bg-white/20 z-10 blur-xl"
                        />
                    </>
                )}

                {/* Main Logo Reveal */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0, filter: 'blur(20px)' }}
                    animate={['reveal', 'exit'].includes(phase) ? {
                        scale: 1,
                        opacity: 1,
                        filter: 'blur(0px)'
                    } : {}}
                    transition={{ type: "spring", bounce: 0.4, duration: 1.5 }}
                    className="relative z-30 flex flex-col items-center"
                >
                    <div className="relative w-32 h-32 mb-6 p-1 rounded-3xl bg-gradient-to-b from-zinc-700 to-zinc-900 border border-white/10 shadow-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-cyan-500/10 animate-pulse" />
                        <Image
                            src={`${basePath}/logo-type-a.jpg`}
                            alt="Logo"
                            fill
                            className="object-cover rounded-2xl relative z-10"
                        />
                        {/* Shine effect */}
                        <motion.div
                            animate={{ x: ['100%', '-100%'] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 z-20"
                        />
                    </div>

                    <div className="text-center overflow-hidden">
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="text-4xl md:text-6xl font-black text-white tracking-widest uppercase mb-2"
                        >
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                                SQM Talk
                            </span>
                        </motion.h1>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="h-[1px] bg-gradient-to-r from-transparent via-zinc-500 to-transparent w-full mb-3"
                        />
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-zinc-500 text-xs tracking-[0.6em] uppercase"
                        >
                            Intelligence • Data • Vibe
                        </motion.p>
                    </div>
                </motion.div>
            </div>

            {/* Exit Curtain */}
            {phase === 'exit' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 bg-transparent z-50 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, transparent 0%, #000 150%)' }}
                />
            )}
        </motion.div>
    );
};
