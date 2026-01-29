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

// Simplified Taiwan map path (approximation)
const TAIWAN_PATH = "M50,10 C60,5 80,8 90,20 C100,35 95,55 92,70 C88,85 82,100 75,115 C68,130 58,140 48,145 C38,150 25,145 20,130 C15,115 18,95 22,75 C26,55 35,35 42,22 C48,12 50,10 50,10 Z";

export const Scene3DataRefinery: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // Funnel/Refinery entrance
    const refineryEntrance = spring({
        frame,
        fps,
        config: { damping: 20 },
    });

    // Map path drawing animation (stroke-dashoffset style)
    const pathProgress = interpolate(frame, [30, 8 * fps], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.quad),
    });

    // Liquid dripping animation
    const dripProgress = interpolate(frame, [10 * fps, 18 * fps], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Impurity particles being separated
    const impurityOpacity = interpolate(frame, [8 * fps, 14 * fps], [0.8, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Caption timing
    const captionOpacity = interpolate(frame, [2 * fps, 4 * fps], [0, 1], {
        extrapolateRight: 'clamp',
    });
    const captionFadeOut = interpolate(frame, [16 * fps, 18 * fps], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Floating data entering the refinery
    const dataParticles = React.useMemo(() => {
        return Array.from({ length: 30 }, (_, i) => ({
            id: i,
            startY: -50 - i * 30,
            x: 400 + Math.sin(i * 0.8) * 150,
            delay: i * 8,
            isImpurity: i % 4 === 0, // 25% are impurities
        }));
    }, []);

    return (
        <AbsoluteFill style={{ backgroundColor: COLORS.bg, overflow: 'hidden' }}>
            {/* Glass Refinery Container */}
            <div
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) scale(${refineryEntrance})`,
                    width: 400,
                    height: 500,
                }}
            >
                {/* Outer Glass Effect */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '20px 20px 100px 100px',
                        border: `2px solid ${COLORS.cyan}30`,
                        background: `linear-gradient(180deg, ${COLORS.cyan}05 0%, ${COLORS.cyan}10 50%, ${COLORS.cyan}05 100%)`,
                        backdropFilter: 'blur(5px)',
                    }}
                />

                {/* Taiwan Map SVG inside refinery */}
                <svg
                    width="200"
                    height="200"
                    viewBox="0 0 100 160"
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '30%',
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <path
                        d={TAIWAN_PATH}
                        fill="none"
                        stroke={COLORS.cyan}
                        strokeWidth="2"
                        strokeDasharray="500"
                        strokeDashoffset={interpolate(pathProgress, [0, 1], [500, 0])}
                        style={{
                            filter: `drop-shadow(0 0 10px ${COLORS.cyan})`,
                        }}
                    />
                    {/* Fill appearing after stroke */}
                    <path
                        d={TAIWAN_PATH}
                        fill={`${COLORS.cyan}20`}
                        stroke="none"
                        style={{
                            opacity: interpolate(pathProgress, [0.8, 1], [0, 0.5]),
                        }}
                    />
                </svg>

                {/* Liquid collecting at bottom */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 20,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 150,
                        height: interpolate(dripProgress, [0, 1], [0, 80]),
                        background: `linear-gradient(180deg, ${COLORS.cyan}60 0%, ${COLORS.cyan}90 100%)`,
                        borderRadius: '0 0 60px 60px',
                        boxShadow: `0 0 30px ${COLORS.cyan}50`,
                    }}
                />
            </div>

            {/* Data Particles Entering */}
            {dataParticles.map((particle) => {
                const particleFrame = frame - particle.delay;
                const yProgress = interpolate(particleFrame, [0, 4 * fps], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                });

                const currentY = interpolate(yProgress, [0, 1], [particle.startY, 350]);
                const particleOpacity = particle.isImpurity
                    ? interpolate(yProgress, [0, 0.5, 0.7], [0.6, 0.6, 0])
                    : interpolate(yProgress, [0, 0.8, 1], [0.8, 0.8, 0]);

                // Impurities drift away
                const driftX = particle.isImpurity
                    ? interpolate(yProgress, [0.5, 1], [0, (particle.id % 2 === 0 ? 200 : -200)])
                    : 0;

                return (
                    <div
                        key={particle.id}
                        style={{
                            position: 'absolute',
                            left: particle.x + driftX,
                            top: currentY,
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: particle.isImpurity ? COLORS.gray : COLORS.cyan,
                            boxShadow: particle.isImpurity
                                ? 'none'
                                : `0 0 10px ${COLORS.cyan}`,
                            opacity: particleOpacity,
                        }}
                    />
                );
            })}

            {/* Impurity cloud drifting away */}
            <div
                style={{
                    position: 'absolute',
                    right: 100,
                    top: '40%',
                    width: 100,
                    height: 100,
                    background: `radial-gradient(circle, ${COLORS.gray}40 0%, transparent 70%)`,
                    borderRadius: '50%',
                    filter: 'blur(20px)',
                    opacity: impurityOpacity,
                    transform: `translateX(${interpolate(frame, [8 * fps, 14 * fps], [0, 100])}px)`,
                }}
            />

            {/* Caption */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 80,
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
                        textShadow: `0 0 20px ${COLORS.cyan}80`,
                    }}
                >
                    數據進入提煉爐，雜質被分離，精華被萃取...
                </p>
            </div>
        </AbsoluteFill>
    );
};
