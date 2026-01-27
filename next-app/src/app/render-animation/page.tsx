'use client';

import React from 'react';
import { AlchemyOfDataWeb } from '@/components/animations/AlchemyOfDataWeb';

/**
 * Clean rendering page for video export
 * No headers, no sidebars, fixed 16:9 aspect ratio
 */
export default function RenderAnimationPage() {
    return (
        <div className="fixed inset-0 bg-black flex items-center justify-center">
            {/* Safe Area Container 1080x1080 */}
            <div className="relative w-[1080px] h-[1080px] bg-black overflow-hidden shadow-2xl">
                <AlchemyOfDataWeb />
            </div>
        </div>
    );
}
