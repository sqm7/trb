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
    const { fps, width, height } = useVideoConfig();

    // 1. Morphing Transitions
    // 0-3s: Liquid -> Bar Crystal
    // 3-6s: Bar -> Heatmap Crystal
    // 6-10s: Heatmap -> Radar
    // 10-15s: Target Lock

    const liquidToSolid = interpolate(frame, [0, 2 * fps], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });

    // Rotation continues throughout
    const rotationY = interpolate(frame, [0, 15 * fps], [0, 360]);

    // Visibility Phasing
    const showBar = interpolate(frame, [1 * fps, 3 * fps, 5 * fps, 6 * fps], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const showHeat = interpolate(frame, [5 * fps, 7 * fps, 9 * fps, 10 * fps], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const showRadar = interpolate(frame, [9 * fps, 11 * fps], [0, 1], { extrapolateRight: 'clamp' });

    // Target Lock Effect
    const lockScale = spring({ frame: frame - 11 * fps, fps, config: { damping: 15, stiffness: 200 } });
    const lockOpacity = interpolate(frame, [11 * fps, 11.5 * fps], [0, 1], { extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill style={{ backgroundColor: COLORS.bg, overflow: 'hidden' }}>

            {/* Ambient Glow */}
            <div style={{
                position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
                width: 600, height: 600, background: `radial-gradient(circle, ${COLORS.cyan}10 0%, transparent 60%)`,
                borderRadius: '50%', filter: 'blur(50px)',
            }} />

            {/* Main Crystal Container */}
            <div style={{
                position: 'absolute', left: '50%', top: '50%',
                transform: `translate(-50%, -50%) perspective(1000px) rotateY(${rotationY * 0.2}deg)`,
                transformStyle: 'preserve-3d',
                width: 400, height: 400,
            }}>

                {/* 1. Liquid State (Fading Out) */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: `linear-gradient(45deg, ${COLORS.cyan}40, ${COLORS.violet}40)`,
                    borderRadius: interpolate(liquidToSolid, [0, 1], [200, 20]), // Circle to Square
                    opacity: interpolate(liquidToSolid, [0, 1], [1, 0]),
                    transform: `scale(${interpolate(liquidToSolid, [0, 1], [0.5, 1])})`,
                    filter: 'blur(20px)',
                    boxShadow: `0 0 50px ${COLORS.cyan}`,
                }} />

                {/* 2. Bar Chart Crystal */}
                <div style={{ position: 'absolute', inset: 0, opacity: showBar, transform: 'translateZ(20px)' }}>
                    <CrystalBarChart />
                </div>

                {/* 3. Heatmap Crystal */}
                <div style={{ position: 'absolute', inset: 0, opacity: showHeat, transform: 'translateZ(20px)' }}>
                    <CrystalHeatmap />
                </div>

                {/* 4. Radar Crystal */}
                <div style={{ position: 'absolute', inset: 0, opacity: showRadar, transform: 'translateZ(20px)' }}>
                    <CrystalRadar />
                </div>

            </div>

            {/* Target Locked Hologram Overlay */}
            <div style={{
                position: 'absolute', left: '50%', top: '50%',
                transform: `translate(-50%, -50%) scale(${lockScale})`,
                opacity: lockOpacity,
                border: `2px solid ${COLORS.gold}`,
                width: 450, height: 450,
                borderRadius: '10px',
                boxShadow: `0 0 20px ${COLORS.gold}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                {/* Reticle Corners */}
                <div style={{ position: 'absolute', top: -2, left: -2, width: 20, height: 20, borderTop: `4px solid ${COLORS.gold}`, borderLeft: `4px solid ${COLORS.gold}` }} />
                <div style={{ position: 'absolute', top: -2, right: -2, width: 20, height: 20, borderTop: `4px solid ${COLORS.gold}`, borderRight: `4px solid ${COLORS.gold}` }} />
                <div style={{ position: 'absolute', bottom: -2, left: -2, width: 20, height: 20, borderBottom: `4px solid ${COLORS.gold}`, borderLeft: `4px solid ${COLORS.gold}` }} />
                <div style={{ position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderBottom: `4px solid ${COLORS.gold}`, borderRight: `4px solid ${COLORS.gold}` }} />

                <h1 style={{ color: COLORS.gold, fontFamily: 'monospace', fontSize: 24, letterSpacing: 4, background: `${COLORS.bg}E6`, padding: '4px 12px' }}>
                    TARGET LOCKED
                </h1>
            </div>

            {/* Sparkles */}
            {Array.from({ length: 20 }).map((_, i) => (
                <Sparkle key={i} index={i} total={20} />
            ))}

        </AbsoluteFill>
    );
};

const Sparkle: React.FC<{ index: number, total: number }> = ({ index, total }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const delay = index * 5;
    const progress = (frame - delay) / (4 * fps); // continuous loop approx

    // Orbit logic
    const angle = (index / total) * Math.PI * 2 + (frame * 0.02);
    const radius = 250 + Math.sin(frame * 0.05 + index) * 50;

    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    const opacity = Math.max(0, Math.sin(frame * 0.1 + index));

    return (
        <div style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
            width: 4, height: 4, borderRadius: '50%',
            background: COLORS.cyan,
            boxShadow: `0 0 10px ${COLORS.white}`,
            opacity,
        }} />
    );
}

// Sub-components
const CrystalBarChart: React.FC = () => {
    const frame = useCurrentFrame();
    const bars = [0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.5];
    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 10, padding: 40, border: `1px solid ${COLORS.cyan}40`, background: `${COLORS.cyan}10`, borderRadius: 20, backdropFilter: 'blur(5px)' }}>
            {bars.map((h, i) => (
                <div key={i} style={{
                    width: 30, height: `${h * 80}%`,
                    background: `linear-gradient(to top, ${COLORS.cyan}40, ${COLORS.cyan})`,
                    boxShadow: `0 0 15px ${COLORS.cyan}60`,
                    borderRadius: '4px 4px 0 0',
                    transform: `scaleY(${Math.min(1, (frame - 60) / 20)})`, // delayed growth
                }} />
            ))}
        </div>
    )
}

const CrystalHeatmap: React.FC = () => {
    return (
        <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, padding: 20, border: `1px solid ${COLORS.violet}40`, background: `${COLORS.violet}10`, borderRadius: 20, backdropFilter: 'blur(5px)' }}>
            {Array.from({ length: 25 }).map((_, i) => {
                const intensity = Math.random();
                return (
                    <div key={i} style={{
                        backgroundColor: intensity > 0.7 ? COLORS.cyan : (intensity > 0.4 ? COLORS.violet : 'transparent'),
                        opacity: 0.8, borderRadius: 4,
                        boxShadow: intensity > 0.7 ? `0 0 10px ${COLORS.cyan}` : 'none'
                    }} />
                )
            })}
        </div>
    )
}

const CrystalRadar: React.FC = () => {
    const frame = useCurrentFrame();
    const rotate = frame * 2;
    return (
        <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: `1px solid ${COLORS.gold}40`, background: `${COLORS.gold}05`, backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '80%', height: '80%', borderRadius: '50%', border: `1px dashed ${COLORS.gold}40` }} />
            <div style={{ width: '50%', height: '50%', borderRadius: '50%', border: `1px solid ${COLORS.gold}60` }} />

            {/* Radar Sweep */}
            <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: `conic-gradient(from 0deg, transparent 270deg, ${COLORS.gold}40 360deg)`,
                transform: `rotate(${rotate}deg)`,
                mixBlendMode: 'screen',
            }} />

            {/* Ping */}
            <div style={{
                position: 'absolute', top: '30%', left: '60%', width: 10, height: 10, background: COLORS.gold, borderRadius: '50%',
                boxShadow: `0 0 10px ${COLORS.gold}`,
                animation: 'pulse 1s infinite' // Note: CSS animation might need keyframes defined or use Remotion frame
            }} />
        </div>
    )
}
