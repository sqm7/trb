'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { AlchemyOfDataWeb } from './AlchemyOfDataWeb';

interface AlchemyDemoOverlayProps {
    onClose: () => void;
}

export const AlchemyDemoOverlay = ({ onClose }: AlchemyDemoOverlayProps) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-zinc-950/90 backdrop-blur-3xl flex flex-col items-center justify-center p-6"
        >
            <button
                onClick={onClose}
                className="absolute top-8 right-8 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all border border-white/10 z-[110]"
            >
                <X size={32} />
            </button>

            <div className="w-full h-full relative">
                <AlchemyOfDataWeb />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="absolute bottom-12 left-0 right-0 text-center z-[110]"
            >
                <p className="text-zinc-500 text-xs tracking-[0.5em] uppercase font-bold">
                    The Alchemy of Data - Cinematic Experience
                </p>
            </motion.div>
        </motion.div>
    );
};
