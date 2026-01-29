import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    spring,
    Easing,
    random,
} from 'remotion';
import { Database, Home, DollarSign, MapPin, Hash, FileText, TrendingUp } from 'lucide-react';
import { COLORS } from '../DataAlchemyVideo';

// Particle types: Icons and Text (Prices/Numbers)
const ICONS = [Database, Home, DollarSign, MapPin, Hash, FileText, TrendingUp];
const TEXT_PARTICLES = ["$1,250W", "$880W", "35.2/p", "42.1/p", "+12%", "No.1", "78坪"];

type ParticleType = 'icon' | 'text';

interface Particle {
    id: number;
    type: ParticleType;
    content: any;
    x: number; // 0-1 percentage
    y: number; // 0-1 percentage
    z: number; // Depth factor for parallax (0.5 - 2)
    size: number;
    phase: number;
    delay: number;
    color: string;
}

const generateParticles = (count: number, seed: number): Particle[] => {
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
        const isIcon = random(seed + i) > 0.4;
        const depth = 0.5 + random(seed + i + 100) * 1.5; // Depth 0.5 to 2.0

        particles.push({
            id: i,
            type: isIcon ? 'icon' : 'text',
            content: isIcon
                ? ICONS[Math.floor(random(seed + i + 200) * ICONS.length)]
                : TEXT_PARTICLES[Math.floor(random(seed + i + 300) * TEXT_PARTICLES.length)],
            x: random(seed + i + 400),
            y: random(seed + i + 500),
            z: depth,
            size: 14 + random(seed + i + 600) * 20,
            phase: random(seed + i + 700) * Math.PI * 2,
            delay: random(seed + i + 800) * 15, // Staggered start 0-15 frames relative
            color: random(seed + i + 900) > 0.8 ? COLORS.cyan : COLORS.white, // mostly white, some cyan
        });
    }
    return particles;
};

export const Scene1ChaosMine: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // Generate 60 particles
    const particles = useMemo(() => generateParticles(60, 1001), []);

    // 1. Camera Deep Dive (0-3s) -> Continues drifting (3-15s)
    // Scale goes from 1 (far) to 3 (very close/through)
    const diveProgress = interpolate(frame, [0, 3 * fps, 15 * fps], [1, 1.8, 2.5], {
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        extrapolateRight: 'clamp',
    });

    // 2. Light Beam (12-15s)
    const lightBeamOpacity = interpolate(frame, [12 * fps, 13.5 * fps], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Caption Opacity
    const captionOpacity = interpolate(frame, [3 * fps, 4.5 * fps, 11 * fps, 12 * fps], [0, 1, 1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    return (
        <AbsoluteFill style={{ backgroundColor: COLORS.bg, overflow: 'hidden', perspective: '1000px' }}>

            {/* 3D Container for Particles */}
            <div
                style={{
                    position: 'absolute',
                    inset: -width * 0.5, // Make container larger to handle zoom
                    width: width * 2,
                    height: height * 2,
                    transformStyle: 'preserve-3d',
                    transform: `scale(${diveProgress}) translateZ(0px)`,
                    transformOrigin: 'center center',
                }}
            >
                {particles.map((p) => {
                    // Parallax movement based on Z depth
                    const initialY = p.y * height * 2;
                    const initialX = p.x * width * 2;

                    // Floating animation
                    const floatY = Math.sin((frame * 0.05) + p.phase) * 30;
                    const floatX = Math.cos((frame * 0.03) + p.phase) * 30;

                    // Visibility (flicker)
                    const flicker = Math.sin((frame * 0.1) + p.id) > 0 ? 1 : 0.4;

                    // Entrance
                    const entrance = spring({
                        frame: frame - p.delay,
                        fps,
                        config: { damping: 200 }
                    });

                    return (
                        <div
                            key={p.id}
                            style={{
                                position: 'absolute',
                                left: initialX + floatX,
                                top: initialY + floatY,
                                opacity: p.color === COLORS.cyan ? 0.8 : 0.4 * flicker * entrance,
                                transform: `translateZ(${p.z * 50}px) scale(${entrance})`,
                                color: p.color,
                                fontSize: p.type === 'text' ? p.size * 0.6 : undefined,
                                fontFamily: 'monospace',
                                fontWeight: 'bold',
                                textShadow: p.color === COLORS.cyan ? `0 0 10px ${COLORS.cyan}` : 'none',
                            }}
                        >
                            {p.type === 'icon' ? (
                                <p.content size={p.size} strokeWidth={1.5} />
                            ) : (
                                <span>{p.content}</span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Vignette Overlay to darken edges */}
            <AbsoluteFill
                style={{
                    background: 'radial-gradient(circle, transparent 30%, #000000 120%)',
                    opacity: 0.8,
                    pointerEvents: 'none',
                }}
            />

            {/* Light Beam (End Transition) */}
            <div
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100%',
                    height: '100%',
                    background: `radial-gradient(circle at center, ${COLORS.cyan} 0%, transparent 60%)`,
                    opacity: lightBeamOpacity,
                    mixBlendMode: 'screen',
                    filter: 'blur(50px)',
                    zIndex: 10,
                }}
            />

            {/* Caption */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 120,
                    width: '100%',
                    textAlign: 'center',
                    opacity: captionOpacity,
                    zIndex: 20,
                }}
            >
                <p
                    style={{
                        color: COLORS.white,
                        fontSize: 32,
                        fontWeight: 300,
                        letterSpacing: '0.1em',
                        textShadow: `0 4px 20px ${COLORS.bg}`,
                        margin: 0,
                    }}
                >
                    在混沌的數據礦場中...
                </p>
                <p
                    style={{
                        color: COLORS.cyan,
                        fontSize: 24,
                        fontWeight: 400,
                        letterSpacing: '0.05em',
                        marginTop: 10,
                        opacity: 0.9,
                    }}
                >
                    隱藏著無價的商業寶藏
                </p>
            </div>
        </AbsoluteFill>
    );
};
