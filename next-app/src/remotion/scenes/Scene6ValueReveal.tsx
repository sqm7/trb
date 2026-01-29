import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
    Easing,
    Img,
    staticFile
} from 'remotion';
import { TrendingUp, ArrowUpRight, Sparkles, Target, BarChart2 } from 'lucide-react';
import { COLORS } from '../DataAlchemyVideo';

export const Scene6ValueReveal: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // 1. Gem Physics (Bobbing and Rotating)
    const gemY = Math.sin(frame * 0.05) * 20;
    const gemRotate = Math.sin(frame * 0.03) * 5;

    // 2. Orbital System
    // Indicators orbit around the gem
    const indicators = [
        { icon: TrendingUp, label: "+150% ROI", color: COLORS.cyan, delay: 0 },
        { icon: Target, label: "精準命中", color: COLORS.violet, delay: 5 },
        { icon: BarChart2, label: "市場份額", color: COLORS.gold, delay: 10 },
    ];

    // 3. Background Data Grid
    // Moving grid to show depth
    const gridY = (frame * 0.5) % 50;

    return (
        <AbsoluteFill style={{ backgroundColor: COLORS.bg, overflow: 'hidden' }}>

            {/* Background Moving Grid */}
            <div style={{
                position: 'absolute', inset: -100,
                backgroundImage: `linear-gradient(${COLORS.cyan}20 1px, transparent 1px), linear-gradient(90deg, ${COLORS.cyan}20 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
                transform: `perspective(500px) rotateX(60deg) translateY(${gridY}px)`,
                opacity: 0.3,
            }} />

            {/* Central Glow */}
            <div style={{
                position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
                width: 600, height: 600,
                background: `radial-gradient(circle, ${COLORS.gold}20 0%, transparent 70%)`,
                borderRadius: '50%',
                filter: 'blur(60px)',
            }} />

            {/* Floating Gem Container */}
            <div style={{
                position: 'absolute', left: '50%', top: '50%',
                transform: `translate(-50%, -50%) translateY(${gemY}px) rotate(${gemRotate}deg)`,
                zIndex: 10,
            }}>
                {/* Gem Shape */}
                <div style={{
                    width: 160, height: 220,
                    background: `linear-gradient(135deg, ${COLORS.gold}, #FFF, ${COLORS.gold})`,
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    boxShadow: `0 0 100px ${COLORS.gold}80`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {/* Inner Reflection */}
                    <div style={{
                        width: '80%', height: '80%',
                        background: 'rgba(255,255,255,0.4)',
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                        mixBlendMode: 'overlay',
                    }} />
                </div>
            </div>

            {/* Orbiting Indicators */}
            {indicators.map((item, i) => {
                const angle = (frame * 0.02) + (i * ((Math.PI * 2) / 3)); // Even separation
                const radiusX = 350;
                const radiusY = 100;

                const x = Math.cos(angle) * radiusX;
                const y = Math.sin(angle) * radiusY;

                // Depth sorting: if y < 0 (back), lower z-index
                const isBack = Math.sin(angle) < 0;
                const scale = interpolate(Math.sin(angle), [-1, 1], [0.8, 1.2]);
                const opacity = interpolate(Math.sin(angle), [-1, 1], [0.5, 1]);

                // Entrance
                const ent = spring({ frame: frame - i * 10, fps, config: { damping: 12 } });

                return (
                    <div key={i} style={{
                        position: 'absolute', left: '50%', top: '50%',
                        transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale * ent})`,
                        zIndex: isBack ? 5 : 15,
                        opacity: opacity * ent,
                    }}>
                        <div style={{
                            background: `rgba(0,0,0,0.6)`,
                            border: `1px solid ${item.color}`,
                            padding: '12px 24px',
                            borderRadius: 16,
                            display: 'flex', alignItems: 'center', gap: 12,
                            backdropFilter: 'blur(8px)',
                            boxShadow: `0 0 20px ${item.color}40`,
                        }}>
                            <item.icon color={item.color} size={24} />
                            <span style={{ color: COLORS.white, fontSize: 18, fontWeight: 'bold' }}>{item.label}</span>
                        </div>

                        {/* Connecting Line to Gem (Optional, maybe too messy) */}
                    </div>
                );
            })}

            {/* Caption */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 100,
                    width: '100%',
                    textAlign: 'center',
                    opacity: interpolate(frame, [0, 2 * fps], [0, 1]),
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
