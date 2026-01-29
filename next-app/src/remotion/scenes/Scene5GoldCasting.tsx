import React from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
    Easing,
    Img,
    staticFile,
} from 'remotion';
import { COLORS } from '../DataAlchemyVideo';

export const Scene5GoldCasting: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // 1. Crystal Collapse (Melting)
    // 0-4s: Crystals converge and turn into liquid
    const crystalCollapse = interpolate(frame, [0, 4 * fps], [1, 0], { extrapolateRight: 'clamp' });

    // 2. Liquid Gold Flow
    // 4-8s: Liquid flows into center mold
    const fillProgress = interpolate(frame, [3 * fps, 7 * fps], [0, 100], { extrapolateRight: 'clamp' });

    // 3. Gem Solidification
    // 8-10s: Liquid turns into solid gem
    const solidify = interpolate(frame, [7 * fps, 9 * fps], [0, 1], { extrapolateRight: 'clamp' });

    // 4. Light Burst
    // 10-15s: Gem shines brightly
    const burstScale = interpolate(frame, [9 * fps, 10 * fps, 14 * fps], [1, 5, 20], { extrapolateRight: 'clamp', easing: Easing.exp });
    const burstOpacity = interpolate(frame, [9 * fps, 9.5 * fps, 14 * fps], [0, 1, 0]);

    return (
        <AbsoluteFill style={{ backgroundColor: COLORS.bg, overflow: 'hidden' }}>

            {/* Ambient Heat */}
            <div style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(circle, ${COLORS.gold}20 0%, transparent 80%)`,
                opacity: interpolate(frame, [0, 5 * fps], [0.2, 0.6]),
            }} />

            {/* Scale Container for Impact */}
            <div style={{
                position: 'absolute', inset: 0,
                transform: `scale(${interpolate(frame, [8 * fps, 10 * fps], [1, 1.1])})`,
                transition: 'transform 0.1s'
            }}>

                {/* 1. Melting Crystals */}
                {/* Only visible at start */}
                <div style={{ opacity: crystalCollapse, position: 'absolute', inset: 0 }}>
                    {[0, 72, 144, 216, 288].map((deg, i) => {
                        const r = interpolate(frame, [0, 4 * fps], [350, 50]);
                        const x = width / 2 + Math.cos(deg * Math.PI / 180) * r;
                        const y = height / 2 + Math.sin(deg * Math.PI / 180) * r;

                        return (
                            <div key={i} style={{
                                position: 'absolute', left: x, top: y,
                                width: 40, height: 40,
                                background: COLORS.white,
                                borderRadius: '50%',
                                filter: `blur(${interpolate(frame, [2 * fps, 4 * fps], [0, 20])}px)`,
                                boxShadow: `0 0 20px ${COLORS.cyan}`,
                                transform: `translate(-50%, -50%) scale(${crystalCollapse})`,
                            }} />
                        )
                    })}
                </div>

                {/* 2. The Mold (Wireframe Gem) */}
                <div style={{
                    position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
                    width: 200, height: 260,
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    border: `2px solid ${COLORS.gold}40`,
                    background: `${COLORS.gold}10`,
                }}>
                    {/* Liquid Filling Up */}
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        height: `${fillProgress}%`,
                        background: `linear-gradient(to top, ${COLORS.gold}, #ffffff)`,
                        boxShadow: `0 0 50px ${COLORS.gold}`,
                        filter: 'blur(2px)',
                    }} />
                </div>

                {/* 3. Solidified Gem (Overlays the mold) */}
                <div style={{
                    position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
                    width: 200, height: 260,
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    background: `linear-gradient(135deg, ${COLORS.gold}, #FFF7ED, ${COLORS.gold})`,
                    opacity: solidify,
                    boxShadow: `0 0 100px ${COLORS.gold}`,
                    zIndex: 10,
                }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.2)', mixBlendMode: 'overlay' }} />
                </div>

            </div>

            {/* 4. Light Burst Overlay */}
            <div style={{
                position: 'absolute', left: '50%', top: '50%',
                width: 100, height: 100, borderRadius: '50%',
                background: COLORS.white,
                transform: `translate(-50%, -50%) scale(${burstScale})`,
                opacity: burstOpacity,
                boxShadow: `0 0 200px ${COLORS.white}`,
                zIndex: 20,
            }} />

        </AbsoluteFill>
    );
};
