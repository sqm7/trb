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

// Chart crystal types
type ChartType = 'bar' | 'heatmap' | 'radar';

export const Scene4CrystalRoom: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Crystal formation phases
    const liquidToSolid = interpolate(frame, [0, 3 * fps], [0, 1], {
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.quad),
    });

    // 3D rotation for crystal showcase
    const rotationY = interpolate(frame, [0, 15 * fps], [0, 360]);

    // Crystal visibility phases (show different charts)
    const showBarChart = interpolate(frame, [2 * fps, 4 * fps, 6 * fps, 7 * fps], [0, 1, 1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    const showHeatmap = interpolate(frame, [6 * fps, 8 * fps, 10 * fps, 11 * fps], [0, 1, 1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    const showRadar = interpolate(frame, [10 * fps, 12 * fps, 15 * fps], [0, 1, 1], {
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

    return (
        <AbsoluteFill style={{ backgroundColor: COLORS.bg, overflow: 'hidden' }}>
            {/* Ambient crystal glow */}
            <div
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 500,
                    height: 500,
                    background: `radial-gradient(circle, ${COLORS.violet}20 0%, transparent 60%)`,
                    borderRadius: '50%',
                    filter: 'blur(40px)',
                }}
            />

            {/* Rotating crystal container */}
            <div
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '45%',
                    transform: `translate(-50%, -50%) perspective(1000px) rotateY(${rotationY * 0.1}deg)`,
                    transformStyle: 'preserve-3d',
                }}
            >
                {/* Liquid condensing effect */}
                <div
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: interpolate(liquidToSolid, [0, 1], [200, 300]),
                        height: interpolate(liquidToSolid, [0, 1], [200, 350]),
                        background: `linear-gradient(180deg, ${COLORS.cyan}30 0%, ${COLORS.violet}20 100%)`,
                        borderRadius: interpolate(liquidToSolid, [0, 1], [100, 20]),
                        opacity: interpolate(liquidToSolid, [0, 0.5], [0.8, 0.3]),
                        filter: 'blur(10px)',
                    }}
                />

                {/* Bar Chart Crystal */}
                <div
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        opacity: showBarChart,
                    }}
                >
                    <CrystalBarChart />
                </div>

                {/* Heatmap Crystal */}
                <div
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        opacity: showHeatmap,
                    }}
                >
                    <CrystalHeatmap />
                </div>

                {/* Radar Crystal */}
                <div
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        opacity: showRadar,
                    }}
                >
                    <CrystalRadar />
                </div>
            </div>

            {/* Floating sparkles */}
            {Array.from({ length: 15 }).map((_, i) => {
                const sparkleDelay = i * 10;
                const sparkleProgress = spring({
                    frame: frame - sparkleDelay,
                    fps,
                    config: { damping: 200 },
                });
                const x = 300 + Math.cos(i * 0.8) * 350;
                const y = 300 + Math.sin(i * 1.2) * 250;

                return (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            left: x,
                            top: y,
                            width: 4,
                            height: 4,
                            borderRadius: '50%',
                            background: i % 2 === 0 ? COLORS.cyan : COLORS.violet,
                            boxShadow: `0 0 10px ${i % 2 === 0 ? COLORS.cyan : COLORS.violet}`,
                            opacity: interpolate(
                                Math.sin(frame * 0.1 + i),
                                [-1, 1],
                                [0.2, 0.8]
                            ) * sparkleProgress,
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
                        textShadow: `0 0 20px ${COLORS.violet}80`,
                    }}
                >
                    純淨數據在晶體室中凝結，形成可視化圖表...
                </p>
            </div>
        </AbsoluteFill>
    );
};

// Crystal Bar Chart Component
const CrystalBarChart: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const bars = [40, 65, 50, 85, 60, 95, 75];

    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 200 }}>
            {bars.map((height, i) => {
                const barHeight = spring({
                    frame: frame - i * 5,
                    fps,
                    config: { damping: 15 },
                });

                return (
                    <div
                        key={i}
                        style={{
                            width: 24,
                            height: interpolate(barHeight, [0, 1], [0, height * 2]),
                            background: `linear-gradient(180deg, ${COLORS.cyan} 0%, ${COLORS.violet} 100%)`,
                            borderRadius: 4,
                            boxShadow: `0 0 20px ${COLORS.cyan}40`,
                        }}
                    />
                );
            })}
        </div>
    );
};

// Crystal Heatmap Component
const CrystalHeatmap: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const cells = Array.from({ length: 25 }, (_, i) => ({
        row: Math.floor(i / 5),
        col: i % 5,
        intensity: 0.3 + Math.random() * 0.7,
    }));

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 40px)',
                gap: 4,
            }}
        >
            {cells.map((cell, i) => {
                const cellEntrance = spring({
                    frame: frame - i * 2,
                    fps,
                    config: { damping: 200 },
                });

                const color = interpolate(
                    cell.intensity,
                    [0.3, 0.7, 1],
                    [0, 0.5, 1]
                );

                return (
                    <div
                        key={i}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 4,
                            background: `hsl(${interpolate(color, [0, 1], [200, 320])}, 80%, ${interpolate(color, [0, 1], [30, 60])}%)`,
                            opacity: cellEntrance,
                            boxShadow: `0 0 10px ${COLORS.violet}30`,
                        }}
                    />
                );
            })}
        </div>
    );
};

// Crystal Radar Component
const CrystalRadar: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const scanLine = interpolate(frame, [0, 3 * fps], [0, 360], {
        extrapolateRight: 'extend',
    }) % 360;

    return (
        <div
            style={{
                width: 200,
                height: 200,
                borderRadius: '50%',
                border: `2px solid ${COLORS.cyan}40`,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Concentric circles */}
            {[0.25, 0.5, 0.75].map((scale, i) => (
                <div
                    key={i}
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: `${scale * 100}%`,
                        height: `${scale * 100}%`,
                        borderRadius: '50%',
                        border: `1px solid ${COLORS.cyan}20`,
                    }}
                />
            ))}

            {/* Scan line */}
            <div
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: '50%',
                    height: 2,
                    background: `linear-gradient(90deg, ${COLORS.cyan}, transparent)`,
                    transformOrigin: 'left center',
                    transform: `rotate(${scanLine}deg)`,
                    boxShadow: `0 0 20px ${COLORS.cyan}`,
                }}
            />

            {/* Target dot */}
            <div
                style={{
                    position: 'absolute',
                    left: '70%',
                    top: '40%',
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: COLORS.gold,
                    boxShadow: `0 0 15px ${COLORS.gold}`,
                    opacity: interpolate(Math.sin(frame * 0.2), [-1, 1], [0.5, 1]),
                }}
            />
        </div>
    );
};
