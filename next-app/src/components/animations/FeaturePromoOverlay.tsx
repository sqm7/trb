'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, TrendingUp, Shield, Zap, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

const steps = [
    {
        icon: <Building2 className="w-16 h-16 text-indigo-400" />,
        title: "精準定價",
        text: "視覺化數據，鎖定市場甜蜜點",
        color: "from-indigo-500/20"
    },
    {
        icon: <TrendingUp className="w-16 h-16 text-pink-400" />,
        title: "熱力透視",
        text: "一鍵透視樓層與戶別價值",
        color: "from-pink-500/20"
    },
    {
        icon: <Zap className="w-16 h-16 text-yellow-400" />,
        title: "動態監控",
        text: "追蹤去化動能，掌控銷售節奏",
        color: "from-yellow-500/20"
    }
];

export const FeaturePromoOverlay = ({ onClose }: { onClose: () => void }) => {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentStep((prev) => (prev + 1) % steps.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-zinc-950/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6"
        >
            <button
                onClick={onClose}
                className="absolute top-8 right-8 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all border border-white/10"
            >
                <X size={24} />
            </button>

            <div className="max-w-4xl w-full text-center space-y-12">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.1, y: -20 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className={`p-12 rounded-3xl bg-gradient-to-b ${steps[currentStep].color} to-transparent border border-white/5 relative overflow-hidden`}
                    >
                        {/* Background scanner effect */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent h-full w-40"
                            animate={{ left: ['-20%', '120%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />

                        <div className="relative z-10 space-y-8">
                            <div className="inline-flex p-6 rounded-2xl bg-zinc-900/50 border border-white/5 shadow-2xl">
                                {steps[currentStep].icon}
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-5xl font-bold text-white tracking-tight">
                                    {steps[currentStep].title}
                                </h2>
                                <p className="text-2xl text-zinc-400 font-light max-w-lg mx-auto leading-relaxed">
                                    {steps[currentStep].text}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Step Indicators */}
                <div className="flex justify-center gap-3">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-500 ${i === currentStep ? 'w-12 bg-cyan-500' : 'w-3 bg-zinc-800'
                                }`}
                        />
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="pt-8"
                >
                    <p className="text-zinc-500 text-sm tracking-widest uppercase">sqmtalk.com Intelligence System</p>
                </motion.div>
            </div>
        </motion.div>
    );
};
