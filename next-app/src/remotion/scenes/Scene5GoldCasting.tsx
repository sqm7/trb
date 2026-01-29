import React from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
    Easing,
} from 'remotion';
import { COLORS } from '../DataAlchemyVideo';

export const Scene5GoldCasting: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Crystals converging to center
    const convergeProgress = interpolate(frame, [0, 4 * fps], [0, 1], {
        extrapolateRight: 'clamp',
        easing: Easing.inOut(Easing.quad),
    });

    // Melting animation
    const meltProgress = interpolate(frame, [3 * fps, 6 * fps], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Gold formation
    const goldFormProgress = interpolate(frame, [6 * fps, 10 * fps], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.quad),
    });

    // Final gem polish
    const gemShine = spring({
        frame: frame - 10 * fps,
        fps,
        config: { damping: 10, stiffness: 80 },
    });

    // Light rays burst
    const lightBurst = interpolate(frame, [11 * fps, 13 * fps], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Caption timing
    const captionOpacity = interpolate(frame, [fps, 2 * fps], [0, 1], {
        extrapolateRight: 'clamp',
    });
    const captionFadeOut = interpolate(frame, [13 * fps, 14 * fps], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Crystal positions (start scattered, converge to center)
    const crystals = [
        { startX: 200, startY: 200, color: COLORS.cyan },
        { startX: 880, startY: 200, color: COLORS.violet },
        { startX: 200, startY: 880, color: COLORS.cyan },
        { startX: 880, startY: 880, color: COLORS.violet },
        { startX: 540, startY: 100, color: COLORS.cyan },
    ];

    return (
        <AbsoluteFill style={{ backgroundColor: COLORS.bg, overflow: 'hidden' }}>
            {/* Background gold ambient */}
            <div
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 600,
                    height: 600,
                    background: `radial-gradient(circle, ${COLORS.gold}15 0%, transparent 60%)`,
                    borderRadius: '50%',
                    filter: 'blur(50px)',
                    opacity: goldFormProgress,
                }}
            />

            {/* Converging crystals */}
            {crystals.map((crystal, i) => {
                const x = interpolate(convergeProgress, [0, 1], [crystal.startX, 540]);
                const y = interpolate(convergeProgress, [0, 1], [crystal.startY, 540]);
                const scale = interpolate(meltProgress, [0, 1], [1, 0]);
                const opacity = interpolate(meltProgress, [0, 0.8, 1], [1, 0.5, 0]);

                return (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            left: x,
                            top: y,
                            transform: `translate(-50%, -50%) scale(${scale}) rotate(${i * 72}deg)`,
                            width: 60,
                            height: 80,
                            opacity,
                        }}
                    >
                        {/* Crystal shape */}
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                background: `linear-gradient(135deg, ${crystal.color}80 0%, ${crystal.color}20 100%)`,
                                clipPath: 'polygon(50% 0%, 100% 30%, 100% 70%, 50% 100%, 0% 70%, 0% 30%)',
                                boxShadow: `0 0 30px ${crystal.color}60`,
                            }}
                        />
                    </div>
                );
            })}

            {/* Melting pool */}
            <div
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: interpolate(meltProgress, [0, 1], [0, 200]),
                    height: interpolate(meltProgress, [0, 1], [0, 200]),
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${COLORS.gold}90 0%, ${COLORS.gold}50 60%, transparent 100%)`,
                    opacity: interpolate(goldFormProgress, [0, 0.3, 1], [meltProgress, 1, 0.3]),
                    filter: 'blur(10px)',
                }}
            />

            {/* Gold Gem Formation */}
            <div
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) scale(${goldFormProgress})`,
                }}
            >
                {/* Outer glow */}
                <div
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 250,
                        height: 250,
                        background: `radial-gradient(circle, ${COLORS.gold}40 0%, transparent 70%)`,
                        borderRadius: '50%',
                        filter: 'blur(20px)',
                        opacity: gemShine,
                    }}
                />

                {/* Main gem */}
                <div
                    style={{
                        width: 120,
                        height: 150,
                        background: `linear-gradient(135deg, #fbbf24 0%, ${COLORS.gold} 50%, #b45309 100%)`,
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                        boxShadow: `
                            0 0 60px ${COLORS.gold}80,
                            inset 0 0 30px rgba(255, 255, 255, 0.3)
                        `,
                        position: 'relative',
                    }}
                >
                    {/* Shine highlight */}
                    <div
                        style={{
                            position: 'absolute',
                            left: '20%',
                            top: '15%',
                            width: '30%',
                            height: '20%',
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, transparent 100%)',
                            borderRadius: '50%',
                            opacity: gemShine,
                        }}
                    />
                </div>
            </div>

            {/* Light rays burst */}
            {Array.from({ length: 8 }).map((_, i) => {
                const angle = i * 45;
                const rayLength = interpolate(lightBurst, [0, 1], [0, 400]);
                const rayOpacity = interpolate(lightBurst, [0, 0.5, 1], [0, 1, 0.3]);

                return (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            width: rayLength,
                            height: 3,
                            background: `linear-gradient(90deg, ${COLORS.gold}, transparent)`,
                            transformOrigin: 'left center',
                            transform: `rotate(${angle}deg)`,
                            opacity: rayOpacity,
                            filter: 'blur(1px)',
                        }}
                    />
                );
            })}

            {/* Caption */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 100,
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    opacity: captionOpacity * captionFadeOut,
                }}
            >
                <p
                    style={{
                        color: COLORS.white,
                        fontSize: 26,
                        fontFamily: 'sans-serif',
                        fontWeight: 300,
                        letterSpacing: '0.1em',
                        textShadow: `0 0 20px ${COLORS.gold}80`,
                    }}
                >
                    晶體熔煉，鑄造成決策黃金寶石...
                </p>
            </div>
        </AbsoluteFill>
    );
};
