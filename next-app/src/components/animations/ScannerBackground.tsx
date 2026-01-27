'use client';

import { motion } from 'framer-motion';

export const ScannerBackground = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />

            {/* Moving Vertical Scanner */}
            <motion.div
                className="absolute left-0 right-0 h-40 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent"
                style={{ willChange: 'transform, top' }}
                initial={{ top: '-40%' }}
                animate={{ top: '110%' }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            />

            {/* Moving Horizontal Scanner */}
            <motion.div
                className="absolute top-0 bottom-0 w-40 bg-gradient-to-r from-transparent via-violet-500/10 to-transparent"
                style={{ willChange: 'transform, left' }}
                initial={{ left: '-40%' }}
                animate={{ left: '110%' }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear', delay: 2 }}
            />

            {/* Floating Data Points */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                    initial={{
                        x: Math.random() * 100 + '%',
                        y: Math.random() * 100 + '%',
                        opacity: 0,
                    }}
                    animate={{
                        opacity: [0, 1, 0],
                        scale: [0.5, 1.5, 0.5],
                    }}
                    transition={{
                        duration: 3 + Math.random() * 4,
                        repeat: Infinity,
                        delay: Math.random() * 10,
                    }}
                />
            ))}
        </div>
    );
};
