import React from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
    staticFile,
    Img,
    Easing,
} from 'remotion';
import { Database, Home, DollarSign } from 'lucide-react';
import { COLORS } from '../DataAlchemyVideo';

export const Scene2AlchemyStart: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Logo rising from below
    const logoRise = spring({
        frame,
        fps,
        config: { damping: 15, stiffness: 80 },
    });

    const logoY = interpolate(logoRise, [0, 1], [200, 0]);
    const logoScale = interpolate(logoRise, [0, 1], [0.5, 1]);

    // Alchemy circle rotation
    const circleRotation = interpolate(frame, [0, 10 * fps], [0, 360]);

    // Glow intensity animation
    const glowIntensity = spring({
        frame: frame - 20,
        fps,
        config: { damping: 200 },
    });

    // Particle attraction effect (particles flying toward center)
    const attractionProgress = interpolate(frame, [30, 10 * fps], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.quad),
    });

    // Caption
    const captionOpacity = interpolate(frame, [20, 40], [0, 1], {
        extrapolateRight: 'clamp',
    });

    const captionFadeOut = interpolate(frame, [8 * fps, 10 * fps], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Floating particles being attracted
    const particles = React.useMemo(() => {
        return Array.from({ length: 20 }, (_, i) => ({
            id: i,
            startX: Math.cos(i * 0.5) * 400 + 540,
            startY: Math.sin(i * 0.7) * 400 + 540,
            icon: [Database, Home, DollarSign][i % 3],
            delay: i * 3,
        }));
    }, []);

    return (
        <AbsoluteFill style={{ backgroundColor: COLORS.bg, overflow: 'hidden' }}>
            {/* Alchemy Circle Background */}
            <div
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) rotate(${circleRotation}deg)`,
                    width: 500,
                    height: 500,
                }}
            >
                {/* Outer Ring */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        border: `2px solid ${COLORS.cyan}40`,
                        borderRadius: '50%',
                        opacity: glowIntensity,
                    }}
                />
                {/* Middle Ring */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 40,
                        border: `1px dashed ${COLORS.violet}30`,
                        borderRadius: '50%',
                        opacity: glowIntensity,
                    }}
                />
                {/* Inner Ring */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 80,
                        border: `2px solid ${COLORS.cyan}60`,
                        borderRadius: '50%',
                        opacity: glowIntensity,
                    }}
                />

                {/* Alchemy Symbols */}
                {[0, 60, 120, 180, 240, 300].map((angle, i) => {
                    const symbolOpacity = spring({
                        frame: frame - 10 - i * 5,
                        fps,
                        config: { damping: 200 },
                    });

                    return (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                left: '50%',
                                top: '50%',
                                transform: `rotate(${angle}deg) translateY(-220px)`,
                                transformOrigin: '0 0',
                                opacity: symbolOpacity,
                            }}
                        >
                            <div
                                style={{
                                    width: 20,
                                    height: 20,
                                    background: COLORS.cyan,
                                    transform: 'rotate(45deg)',
                                    boxShadow: `0 0 20px ${COLORS.cyan}`,
                                }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Central Glow */}
            <div
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 300,
                    height: 300,
                    background: `radial-gradient(circle, ${COLORS.cyan}40 0%, transparent 70%)`,
                    borderRadius: '50%',
                    filter: 'blur(30px)',
                    opacity: glowIntensity * 0.8,
                }}
            />

            {/* Attracted Particles */}
            {particles.map((particle) => {
                const Icon = particle.icon;
                const particleProgress = interpolate(
                    frame - particle.delay,
                    [30, 8 * fps],
                    [0, 1],
                    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                );

                const currentX = interpolate(particleProgress, [0, 1], [particle.startX, 540]);
                const currentY = interpolate(particleProgress, [0, 1], [particle.startY, 540]);
                const particleOpacity = interpolate(particleProgress, [0, 0.8, 1], [0.6, 0.8, 0]);
                const particleScale = interpolate(particleProgress, [0, 0.8, 1], [1, 1, 0]);

                return (
                    <div
                        key={particle.id}
                        style={{
                            position: 'absolute',
                            left: currentX,
                            top: currentY,
                            transform: `translate(-50%, -50%) scale(${particleScale})`,
                            opacity: particleOpacity,
                        }}
                    >
                        <Icon size={16} color={COLORS.white} />
                    </div>
                );
            })}

            {/* Rising Logo */}
            <div
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) translateY(${logoY}px) scale(${logoScale})`,
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        inset: -30,
                        background: `radial-gradient(circle, ${COLORS.cyan}50 0%, transparent 70%)`,
                        borderRadius: '50%',
                        filter: 'blur(20px)',
                        opacity: glowIntensity,
                    }}
                />
                <Img
                    src={staticFile('icon.png')}
                    style={{
                        width: 120,
                        height: 120,
                        borderRadius: 20,
                        boxShadow: `0 0 40px ${COLORS.cyan}60`,
                    }}
                />
            </div>

            {/* Caption */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 120,
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    opacity: captionOpacity * captionFadeOut,
                }}
            >
                <p
                    style={{
                        color: COLORS.white,
                        fontSize: 28,
                        fontFamily: 'sans-serif',
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
