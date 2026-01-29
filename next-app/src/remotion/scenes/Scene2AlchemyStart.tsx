import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
    staticFile,
    Img,
    Easing,
    random,
} from 'remotion';
import { Database, Home, DollarSign } from 'lucide-react';
import { COLORS } from '../DataAlchemyVideo';

export const Scene2AlchemyStart: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // 1. Alchemy Array Mechanics
    // Multiple rotating rings
    const ring1Rot = interpolate(frame, [0, 10 * fps], [0, 180]); // Clockwise
    const ring2Rot = interpolate(frame, [0, 10 * fps], [0, -120]); // Counter-clockwise
    const ring3Rot = interpolate(frame, [0, 10 * fps], [0, 90]);   // Slow clockwise

    // Pulse Effect (Breathing)
    const pulse = Math.sin(frame * 0.1) * 0.1 + 1; // 0.9 to 1.1 scale

    // Logo Reveal
    const logoEntrance = spring({
        frame,
        fps,
        config: { damping: 12, stiffness: 100 },
    });

    // 2. Swirling Vortex Particles
    // 50 particles swirling into the center
    const particles = useMemo(() => {
        return Array.from({ length: 50 }, (_, i) => {
            const angleOffset = random(i) * Math.PI * 2;
            const radius = 500 + random(i + 100) * 300; // Start far out
            const speed = 0.5 + random(i + 200) * 0.5;
            const icon = [Database, Home, DollarSign][i % 3];
            return { id: i, angleOffset, radius, speed, icon };
        });
    }, []);

    // 3. Caption
    const captionOpacity = interpolate(frame, [2 * fps, 3 * fps], [0, 1], { extrapolateRight: 'clamp' });
    const captionFadeOut = interpolate(frame, [8 * fps, 9.5 * fps], [1, 0], { extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill style={{ backgroundColor: COLORS.bg, overflow: 'hidden' }}>

            {/* Center Everything */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>

                {/* --- Alchemy Array Layer --- */}
                <div style={{ position: 'relative', width: 0, height: 0 }}>

                    {/* Ring 1: Complex Geometry (Hexagonish) */}
                    <div style={{ position: 'absolute', transform: `translate(-50%, -50%) rotate(${ring1Rot}deg) scale(${pulse})` }}>
                        <svg width="600" height="600" viewBox="0 0 600 600" style={{ opacity: 0.3 }}>
                            <circle cx="300" cy="300" r="280" fill="none" stroke={COLORS.cyan} strokeWidth="2" strokeDasharray="20 10" />
                            <circle cx="300" cy="300" r="250" fill="none" stroke={COLORS.violet} strokeWidth="1" />
                            <path d="M300 50 L516 175 L516 425 L300 550 L84 425 L84 175 Z" fill="none" stroke={COLORS.cyan} strokeWidth="2" />
                        </svg>
                    </div>

                    {/* Ring 2: Squares */}
                    <div style={{ position: 'absolute', transform: `translate(-50%, -50%) rotate(${ring2Rot}deg) scale(${pulse})` }}>
                        <svg width="400" height="400" viewBox="0 0 400 400" style={{ opacity: 0.4 }}>
                            <rect x="50" y="50" width="300" height="300" fill="none" stroke={COLORS.cyan} strokeWidth="2" />
                            <rect x="50" y="50" width="300" height="300" fill="none" stroke={COLORS.violet} strokeWidth="1" transform="rotate(45 200 200)" />
                        </svg>
                    </div>

                    {/* Ring 3: Runes/Small Circles */}
                    <div style={{ position: 'absolute', transform: `translate(-50%, -50%) rotate(${ring3Rot}deg) scale(${pulse})` }}>
                        <svg width="200" height="200" viewBox="0 0 200 200" style={{ opacity: 0.6 }}>
                            <circle cx="100" cy="100" r="90" fill="none" stroke={COLORS.gold} strokeWidth="1" strokeDasharray="5 5" />
                        </svg>
                    </div>

                </div>

                {/* --- Logo Layer --- */}
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) scale(${logoEntrance})`,
                        zIndex: 10
                    }}
                >
                    {/* Glow Behind Logo */}
                    <div style={{
                        position: 'absolute', inset: -50, borderRadius: '50%',
                        background: `radial-gradient(circle, ${COLORS.cyan}80 0%, transparent 70%)`,
                        filter: 'blur(30px)',
                    }} />

                    <Img
                        src={staticFile('icon.png')}
                        style={{
                            width: 140, height: 140, borderRadius: 28,
                            boxShadow: `0 0 50px ${COLORS.cyan}60`,
                            position: 'relative',
                        }}
                    />
                </div>

                {/* --- Vortex Particles Layer - DISABLED due to Render Issues --- */}
                {/* Particles removed for stability */}

            </div>

            {/* Caption */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 120, // Relative to center if inside AbsoluteFill, but we are inside centered div? No, need to move out
                    width: width,
                    textAlign: 'center',
                    opacity: captionOpacity * captionFadeOut,
                    transform: 'translate(-50%, 0)', // Fix centering relative to parent 50%
                    left: 0,
                }}
            >
                <p
                    style={{
                        color: COLORS.white,
                        fontSize: 28,
                        fontWeight: 300,
                        letterSpacing: '0.1em',
                        textShadow: `0 0 20px ${COLORS.cyan}80`,
                    }}
                >
                    直到現代煉金術的誕生，改變了一切...
                </p>
            </div>

        </AbsoluteFill>
    );
};
