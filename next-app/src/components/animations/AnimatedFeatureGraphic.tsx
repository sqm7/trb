'use client';

import { motion } from 'framer-motion';
import { Zap, Search, TrendingUp, Building2, Shield } from 'lucide-react';

export const AnimatedPriceBars = () => (
    <div className="flex items-end gap-2 h-full pb-8 pr-8 justify-end">
        {[40, 65, 45, 80, 55, 70, 35].map((h, i) => (
            <motion.div
                key={i}
                className="w-4 bg-indigo-500 rounded-t-sm"
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                transition={{ delay: i * 0.1, duration: 1, ease: "easeOut" }}
            />
        ))}
    </div>
);

export const AnimatedHeatmap = () => (
    <div className="grid grid-cols-3 gap-1 rotate-12 scale-110">
        {[...Array(12)].map((_, i) => (
            <motion.div
                key={i}
                className="w-8 h-8 rounded-sm"
                initial={{ opacity: 0.2 }}
                animate={{
                    opacity: [0.2, 0.8, 0.2],
                    backgroundColor: i % 4 === 0 ? '#ec4899' : i % 3 === 0 ? '#f472b6' : '#fbcfe8'
                }}
                transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2
                }}
                style={{ backgroundColor: '#ec4899' }}
            />
        ))}
    </div>
);

export const AnimatedVelocity = () => (
    <div className="absolute right-4 top-4">
        <motion.div
            animate={{
                scale: [1, 1.2, 1],
                rotate: [12, 15, 12],
                filter: ['drop-shadow(0 0 0px #eab308)', 'drop-shadow(0 0 20px #eab308)', 'drop-shadow(0 0 0px #eab308)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
        >
            <Zap className="w-24 h-24 text-yellow-500" />
        </motion.div>
    </div>
);

export const AnimatedRanking = () => (
    <div className="space-y-2 w-full px-6">
        {[1, 0.75, 0.5].map((w, i) => (
            <motion.div
                key={i}
                className="h-2 bg-emerald-500 rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: `${w * 100}%` }}
                transition={{ delay: i * 0.2, duration: 1 }}
            />
        ))}
    </div>
);

export const AnimatedSearch = () => (
    <motion.div
        animate={{
            x: [0, 10, 0, -10, 0],
            y: [0, -5, 0, 5, 0]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    >
        <Search className="w-20 h-20 text-cyan-500 -scale-x-100" />
    </motion.div>
);
