'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export const BrandImageIntro = ({ onComplete }: { onComplete: () => void }) => {
    const [phase, setPhase] = useState<'init' | 'assemble' | 'glow' | 'exit'>('init');

    useEffect(() => {
        const timers = [
            setTimeout(() => setPhase('assemble'), 500),
            setTimeout(() => setPhase('glow'), 2000),
            setTimeout(() => setPhase('exit'), 3500),
            setTimeout(() => onComplete(), 4500),
        ];
        return () => timers.forEach(clearTimeout);
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col items-center justify-center overflow-hidden"
        >
            {/* Background Matrix/Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:60px_60px]" />

            {/* Floating Particles */}
            <AnimatePresence>
                {phase !== 'exit' && (
                    <div className="absolute inset-0">
                        {[...Array(30)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1 h-1 bg-cyan-500/40 rounded-full"
                                initial={{
                                    x: Math.random() * 100 + '%',
                                    y: Math.random() * 100 + '%',
                                    scale: 0
                                }}
                                animate={phase === 'assemble' ? {
                                    x: '50%',
                                    y: '50%',
                                    scale: [0, 1.5, 0],
                                    opacity: [0, 1, 0],
                                } : {
                                    scale: 0
                                }}
                                transition={{
                                    duration: 2,
                                    delay: Math.random() * 0.5,
                                    ease: "easeInOut"
                                }}
                            />
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* Main Brand Elements */}
            <div className="relative z-10 flex flex-col items-center gap-8">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={phase === 'assemble' || phase === 'glow' ? {
                        scale: 1,
                        opacity: 1,
                        filter: phase === 'glow' ? 'brightness(1.5) drop-shadow(0 0 30px rgba(6,182,212,0.6))' : 'brightness(1) drop-shadow(0 0 10px rgba(6,182,212,0.2))'
                    } : { opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="relative w-24 h-24 mb-4"
                >
                    <Image
                        src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/icon.png`}
                        alt="Logo"
                        fill
                        className="object-cover rounded-2xl"
                    />
                </motion.div>

                <div className="overflow-hidden flex flex-col items-center">
                    <motion.h1
                        initial={{ y: 50, opacity: 0 }}
                        animate={phase === 'assemble' || phase === 'glow' ? { y: 0, opacity: 1 } : { y: -20, opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-6xl md:text-8xl font-black tracking-tighter text-white"
                    >
                        平米內參
                    </motion.h1>

                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={phase === 'assemble' || phase === 'glow' ? { scaleX: 1 } : { scaleX: 0 }}
                        transition={{ duration: 1.2, delay: 0.4 }}
                        className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent mt-4"
                    />

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={phase === 'glow' ? { opacity: 1 } : { opacity: 0 }}
                        className="text-cyan-400 font-mono tracking-[0.5em] text-sm md:text-base mt-6 uppercase"
                    >
                        sqmtalk.com Intelligence
                    </motion.p>
                </div>
            </div>

            {/* Exit Scanning Effect */}
            <AnimatePresence>
                {phase === 'exit' && (
                    <motion.div
                        initial={{ top: '-100%' }}
                        animate={{ top: '100%' }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        className="absolute left-0 right-0 h-1/2 bg-gradient-to-b from-transparent via-white/20 to-transparent z-[210] pointer-events-none"
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};
