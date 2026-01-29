import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
    Easing,
    random,
} from 'remotion';
import { COLORS } from '../DataAlchemyVideo';

// High-res Taiwan Path
const TAIWAN_PATH = "M50,10 C60,5 80,8 90,20 C100,35 95,55 92,70 C88,85 82,100 75,115 C68,130 58,140 48,145 C38,150 25,145 20,130 C15,115 18,95 22,75 C26,55 35,35 42,22 C48,12 50,10 50,10 Z";

export const Scene3DataRefinery: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // 1. Scanning Effect
    const scanProgress = interpolate(frame, [2 * fps, 8 * fps], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const scanLineY = interpolate(scanProgress, [0, 1], [50, 450]);

    // 2. Data Particles
    // Particles fall, get scanned, change color
    const particles = useMemo(() => {
        return Array.from({ length: 40 }, (_, i) => ({
            id: i,
            x: 400 + random(i) * 200,
            yStart: -50 - random(i + 10) * 100,
            speed: 1 + random(i + 20) * 2,
            isImpurity: random(i + 30) > 0.6, // 40% are impurities
        }));
    }, []);

    // 3. Droplet Formation (Accumulation at bottom)
    const accumulation = interpolate(frame, [5 * fps, 12 * fps], [0, 1], { extrapolateRight: 'clamp' });

    // The final drop falling (12s - 15s)
    const dropFall = interpolate(frame, [12 * fps, 14 * fps], [0, 600], {
        easing: Easing.in(Easing.quad),
        extrapolateLeft: 'clamp',
    });

    // Drop shape stretch
    const dropStretch = interpolate(frame, [12 * fps, 13 * fps], [1, 1.5], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    return (
        <AbsoluteFill style={{ backgroundColor: COLORS.bg, overflow: 'hidden' }}>

            {/* Furnace Glass Container */}
            <div
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 500,
                    height: 600,
                    borderRadius: '40px',
                    border: `1px solid ${COLORS.cyan}30`,
                    background: `linear-gradient(135deg, ${COLORS.cyan}05 0%, transparent 100%)`,
                    boxShadow: `0 0 50px ${COLORS.cyan}10`,
                    overflow: 'hidden',
                }}
            >
                {/* Background Grid inside Furnace */}
                <div style={{
                    position: 'absolute', inset: 0, opacity: 0.2,
                    backgroundImage: `linear-gradient(${COLORS.cyan} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.cyan} 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }} />

                {/* Taiwan Map Hologram */}
                <svg width="300" height="450" viewBox="0 0 100 160" style={{ position: 'absolute', left: '50%', top: '40%', transform: 'translate(-50%, -50%)', opacity: 0.6 }}>
                    <path d={TAIWAN_PATH} fill="none" stroke={COLORS.cyan} strokeWidth="0.5" strokeDasharray="2 2" />
                    <path d={TAIWAN_PATH} fill={COLORS.cyan} fillOpacity={0.1} stroke="none" />
                </svg>

                {/* Particles Logic */}
                {particles.map((p) => {
                    // Movement
                    const y = p.yStart + (frame * p.speed);

                    // Interaction with Scan Line
                    // If particle passes scanLineY, it changes state
                    const isScanned = y < (scanLineY - 50); // Relative to container top approx

                    // Colors
                    const color = !isScanned ? COLORS.white : (p.isImpurity ? COLORS.gray : COLORS.cyan);
                    const opacity = !isScanned ? 0.5 : (p.isImpurity ? 0.3 : 0.9);

                    // Impurities drifting away
                    const driftX = (isScanned && p.isImpurity) ? interpolate(y, [scanLineY, 600], [0, p.id % 2 === 0 ? 100 : -100]) : 0;

                    // Pure particles move to center bottom
                    const convergeX = (isScanned && !p.isImpurity) ? interpolate(y, [scanLineY, 550], [0, (250 - (p.x - 300))]) : 0; // Move towards center (250)

                    if (y > 650) return null;

                    return (
                        <div
                            key={p.id}
                            style={{
                                position: 'absolute',
                                left: p.x - 300, // Adjust relative to container (x origin was global approx)
                                top: y,
                                width: 6, height: 6, borderRadius: '50%',
                                backgroundColor: color,
                                opacity,
                                transform: `translateX(${driftX + convergeX}px)`,
                                boxShadow: color === COLORS.cyan ? `0 0 8px ${COLORS.cyan}` : 'none',
                            }}
                        />
                    );
                })}

                {/* Scanning Laser Line */}
                <div style={{
                    position: 'absolute',
                    top: scanLineY,
                    left: 0, right: 0,
                    height: 2,
                    background: COLORS.cyan,
                    boxShadow: `0 0 20px ${COLORS.cyan}, 0 0 40px ${COLORS.violet}`,
                    opacity: interpolate(scanProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]),
                }} />

                {/* Liquid Accumulation at Bottom */}
                <div style={{
                    position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                    width: interpolate(accumulation, [0, 1], [0, 100]),
                    height: interpolate(accumulation, [0, 1], [0, 60]),
                    background: `linear-gradient(to bottom, ${COLORS.cyan}, ${COLORS.violet})`,
                    borderRadius: '40% 40% 0 0',
                    filter: 'blur(10px)',
                    opacity: 0.8,
                }} />

            </div>

            {/* The Falling Drop (Outside container) */}
            <div style={{
                position: 'absolute',
                top: 'calc(50% + 300px)', // Bottom of furnace
                left: '50%',
                transform: `translateX(-50%) translateY(${dropFall}px) scaleY(${dropStretch})`,
                width: 20, height: 20,
                background: COLORS.cyan,
                borderRadius: '50% 50% 0 50%',
                transformOrigin: 'center bottom',
                boxShadow: `0 0 20px ${COLORS.cyan}`,
                opacity: interpolate(frame, [12 * fps, 12.5 * fps], [0, 1]), // Show when falling starts
            }} rotate="45deg" />

        </AbsoluteFill>
    );
};
