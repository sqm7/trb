import React from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
    Easing,
} from 'remotion';
import { Database, Home, DollarSign, MapPin, Hash } from 'lucide-react';
import { COLORS } from '../DataAlchemyVideo';

// Particle types for variety
const PARTICLE_ICONS = [Database, Home, DollarSign, MapPin, Hash];

interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    speed: number;
    icon: typeof Database;
    phase: number; // For flicker timing
    delay: number;
}

// Generate random particles
const generateParticles = (count: number, width: number, height: number): Particle[] => {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: 12 + Math.random() * 20,
        speed: 0.5 + Math.random() * 1.5,
        icon: PARTICLE_ICONS[Math.floor(Math.random() * PARTICLE_ICONS.length)],
        phase: Math.random() * Math.PI * 2,
        delay: Math.random() * 30,
    }));
};

export const Scene1ChaosMine: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // Generate particles once (deterministic based on dimensions)
    const particles = React.useMemo(
        () => generateParticles(40, width, height),
        [width, height]
    );

    // Camera zoom effect (slow push in)
    const zoomProgress = interpolate(frame, [0, 15 * fps], [1, 1.15], {
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.quad),
    });

    // Light beam appearing at the end (frame 12s to 15s)
    const lightBeamProgress = interpolate(frame, [12 * fps, 15 * fps], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Caption fade in
    const captionOpacity = interpolate(frame, [2 * fps, 4 * fps], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Caption fade out before light
    const captionFadeOut = interpolate(frame, [10 * fps, 12 * fps], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    return (
        <AbsoluteFill style={{ backgroundColor: COLORS.bg, overflow: 'hidden' }}>
            {/* Scaled container for zoom effect */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    transform: `scale(${zoomProgress})`,
                    transformOrigin: 'center center',
                }}
            >
                {/* Floating Particles */}
                {particles.map((particle) => {
                    const Icon = particle.icon;

                    // Flicker effect using sin wave
                    const flicker = Math.sin((frame + particle.phase * fps) * 0.08 + particle.phase);
                    const opacity = interpolate(flicker, [-1, 1], [0.1, 0.6]);

                    // Slow drift movement
                    const driftX = Math.sin((frame * 0.02) + particle.phase) * 20;
                    const driftY = Math.cos((frame * 0.015) + particle.id) * 15;

                    // Entrance delay
                    const entranceProgress = spring({
                        frame: frame - particle.delay,
                        fps,
                        config: { damping: 200 },
                    });

                    return (
                        <div
                            key={particle.id}
                            style={{
                                position: 'absolute',
                                left: particle.x + driftX,
                                top: particle.y + driftY,
                                opacity: opacity * entranceProgress,
                                transform: `scale(${entranceProgress})`,
                            }}
                        >
                            <Icon
                                size={particle.size}
                                color={COLORS.white}
                                style={{ opacity: 0.7 }}
                            />
                        </div>
                    );
                })}

                {/* Ambient glow spots */}
                <div
                    style={{
                        position: 'absolute',
                        left: '20%',
                        top: '30%',
                        width: 200,
                        height: 200,
                        background: `radial-gradient(circle, ${COLORS.cyan}20 0%, transparent 70%)`,
                        borderRadius: '50%',
                        filter: 'blur(40px)',
                        opacity: interpolate(Math.sin(frame * 0.05), [-1, 1], [0.3, 0.6]),
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        right: '25%',
                        bottom: '40%',
                        width: 150,
                        height: 150,
                        background: `radial-gradient(circle, ${COLORS.violet}20 0%, transparent 70%)`,
                        borderRadius: '50%',
                        filter: 'blur(30px)',
                        opacity: interpolate(Math.sin(frame * 0.04 + 1), [-1, 1], [0.2, 0.5]),
                    }}
                />
            </div>

            {/* Light Beam from distance (end of scene) */}
            <div
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: interpolate(lightBeamProgress, [0, 1], [0, 800]),
                    height: interpolate(lightBeamProgress, [0, 1], [0, 800]),
                    background: `radial-gradient(circle, ${COLORS.cyan}60 0%, ${COLORS.cyan}20 30%, transparent 70%)`,
                    borderRadius: '50%',
                    opacity: lightBeamProgress,
                    filter: 'blur(20px)',
                }}
            />

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
                    在混沌的數據礦場中，隱藏著無價的商業寶藏...
                </p>
            </div>
        </AbsoluteFill>
    );
};
