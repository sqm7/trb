import React from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
} from 'remotion';
import { TrendingUp, ArrowUpRight, Sparkles } from 'lucide-react';
import { COLORS } from '../DataAlchemyVideo';

export const Scene6ValueReveal: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Gem floating and rotating
    const gemFloat = Math.sin(frame * 0.05) * 10;
    const gemRotate = interpolate(frame, [0, 10 * fps], [0, 15]);

    // Success indicators appearing
    const indicator1 = spring({
        frame: frame - 30,
        fps,
        config: { damping: 15 },
    });
    const indicator2 = spring({
        frame: frame - 50,
        fps,
        config: { damping: 15 },
    });
    const indicator3 = spring({
        frame: frame - 70,
        fps,
        config: { damping: 15 },
    });

    // Growth curve animation
    const curveProgress = interpolate(frame, [2 * fps, 6 * fps], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Caption timing
    const captionOpacity = interpolate(frame, [fps, 2 * fps], [0, 1], {
        extrapolateRight: 'clamp',
    });
    const captionFadeOut = interpolate(frame, [8 * fps, 9 * fps], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    return (
        <AbsoluteFill style={{ backgroundColor: COLORS.bg, overflow: 'hidden' }}>
            {/* Ambient glow */}
            <div
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '40%',
                    transform: 'translate(-50%, -50%)',
                    width: 500,
                    height: 500,
                    background: `radial-gradient(circle, ${COLORS.gold}15 0%, transparent 60%)`,
                    borderRadius: '50%',
                    filter: 'blur(40px)',
                }}
            />

            {/* Floating Gold Gem */}
            <div
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '40%',
                    transform: `translate(-50%, -50%) translateY(${gemFloat}px) rotate(${gemRotate}deg)`,
                }}
            >
                {/* Outer glow ring */}
                <div
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 200,
                        height: 200,
                        border: `2px solid ${COLORS.gold}30`,
                        borderRadius: '50%',
                        opacity: interpolate(Math.sin(frame * 0.08), [-1, 1], [0.3, 0.7]),
                    }}
                />

                {/* Main gem */}
                <div
                    style={{
                        width: 100,
                        height: 120,
                        background: `linear-gradient(135deg, #fbbf24 0%, ${COLORS.gold} 50%, #b45309 100%)`,
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                        boxShadow: `0 0 50px ${COLORS.gold}60`,
                        position: 'relative',
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            left: '20%',
                            top: '15%',
                            width: '30%',
                            height: '20%',
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, transparent 100%)',
                            borderRadius: '50%',
                        }}
                    />
                </div>
            </div>

            {/* Success Indicators orbiting */}
            {/* Indicator 1: Trending Up */}
            <div
                style={{
                    position: 'absolute',
                    left: '30%',
                    top: '30%',
                    transform: `scale(${indicator1})`,
                    opacity: indicator1,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: `${COLORS.cyan}20`,
                        border: `1px solid ${COLORS.cyan}40`,
                        borderRadius: 12,
                        padding: '10px 16px',
                    }}
                >
                    <TrendingUp size={24} color={COLORS.cyan} />
                    <span style={{ color: COLORS.cyan, fontSize: 18, fontWeight: 600 }}>
                        +45%
                    </span>
                </div>
            </div>

            {/* Indicator 2: Arrow Up Right */}
            <div
                style={{
                    position: 'absolute',
                    right: '25%',
                    top: '35%',
                    transform: `scale(${indicator2})`,
                    opacity: indicator2,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: `${COLORS.gold}20`,
                        border: `1px solid ${COLORS.gold}40`,
                        borderRadius: 12,
                        padding: '10px 16px',
                    }}
                >
                    <ArrowUpRight size={24} color={COLORS.gold} />
                    <span style={{ color: COLORS.gold, fontSize: 18, fontWeight: 600 }}>
                        精準決策
                    </span>
                </div>
            </div>

            {/* Indicator 3: Sparkles */}
            <div
                style={{
                    position: 'absolute',
                    left: '35%',
                    bottom: '35%',
                    transform: `scale(${indicator3})`,
                    opacity: indicator3,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: `${COLORS.violet}20`,
                        border: `1px solid ${COLORS.violet}40`,
                        borderRadius: 12,
                        padding: '10px 16px',
                    }}
                >
                    <Sparkles size={24} color={COLORS.violet} />
                    <span style={{ color: COLORS.violet, fontSize: 18, fontWeight: 600 }}>
                        市場洞察
                    </span>
                </div>
            </div>

            {/* Growth Curve */}
            <svg
                width="400"
                height="150"
                style={{
                    position: 'absolute',
                    right: '20%',
                    bottom: '25%',
                    opacity: curveProgress,
                }}
            >
                <path
                    d={`M 0 120 Q 100 100 200 60 T 400 ${interpolate(curveProgress, [0, 1], [120, 20])}`}
                    fill="none"
                    stroke={COLORS.cyan}
                    strokeWidth="3"
                    strokeDasharray="500"
                    strokeDashoffset={interpolate(curveProgress, [0, 1], [500, 0])}
                    style={{ filter: `drop-shadow(0 0 10px ${COLORS.cyan})` }}
                />
            </svg>

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
                        textShadow: `0 0 20px ${COLORS.gold}80`,
                    }}
                >
                    決策寶石散發光芒，指引成功方向...
                </p>
            </div>
        </AbsoluteFill>
    );
};
