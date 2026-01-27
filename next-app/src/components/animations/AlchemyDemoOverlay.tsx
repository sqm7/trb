'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { AlchemyOfDataWeb } from './AlchemyOfDataWeb';
import { createPortal } from 'react-dom';

interface AlchemyDemoOverlayProps {
    onClose: () => void;
}

export const AlchemyDemoOverlay = ({ onClose }: AlchemyDemoOverlayProps) => {
    // Lock body scroll when overlay is open
    React.useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    // Use Portal to break out of any z-index or stacking context issues
    // Only render on client
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-zinc-950/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 h-[100dvh]"
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 md:top-8 md:right-8 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all border border-white/10 z-[110]"
            >
                <X size={32} />
            </button>

            {/* Main Container - Constrained to 16:9 Aspect Ratio */}
            <div className="relative w-full max-w-6xl aspect-video bg-black/50 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <AlchemyOfDataWeb />


            </div>
        </motion.div>,
        document.body
    );
};
