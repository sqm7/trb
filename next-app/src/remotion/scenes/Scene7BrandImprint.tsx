import React from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
    staticFile,
    Img,
} from 'remotion';
import { COLORS } from '../DataAlchemyVideo';

export const Scene7BrandImprint: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Logo entrance animation
    const logoScale = spring({
        frame,
        fps,
        config: { damping: 15, stiffness: 100 },
    });

    const logoOpacity = interpolate(frame, [0, 15], [0, 1], {
        extrapolateRight: 'clamp',
    });

    // Text entrance (delayed)
    const textEntrance = spring({
        frame: frame - 20,
        fps,
        config: { damping: 200 },
    });

    const textY = interpolate(textEntrance, [0, 1], [30, 0]);

    // Tagline entrance (more delayed)
    const taglineEntrance = spring({
        frame: frame - 40,
        fps,
        config: { damping: 200 },
    });

    // Underline animation
    const underlineWidth = interpolate(frame, [60, 90], [0, 200], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Glow pulse
    const glowPulse = interpolate(
        Math.sin(frame * 0.1),
        [-1, 1],
        [0.3, 0.6]
    );

    return (
        <AbsoluteFill
            style={{
                backgroundColor: COLORS.bg,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {/* Background glow */}
            <div
                style={{
                    position: 'absolute',
                    width: 400,
                    height: 400,
                    background: `radial-gradient(circle, ${COLORS.cyan}30 0%, transparent 70%)`,
                    borderRadius: '50%',
                    filter: 'blur(60px)',
                    opacity: glowPulse,
                }}
            />

            {/* Logo */}
            <div
                style={{
                    position: 'relative',
                    marginBottom: 40,
                    transform: `scale(${logoScale})`,
                    opacity: logoOpacity,
                }}
            >
                {/* Logo glow */}
                <div
                    style={{
                        position: 'absolute',
                        inset: -20,
                        background: `radial-gradient(circle, ${COLORS.cyan}40 0%, transparent 70%)`,
                        borderRadius: 32,
                        filter: 'blur(20px)',
                        opacity: glowPulse,
                    }}
                />
                <Img
                    src={staticFile('icon.png')}
                    style={{
                        width: 160,
                        height: 160,
                        borderRadius: 24,
                        boxShadow: `0 0 40px ${COLORS.cyan}40`,
                    }}
                />
            </div>

            {/* Brand Name */}
            <div
                style={{
                    opacity: textEntrance,
                    transform: `translateY(${textY}px)`,
                    textAlign: 'center',
                }}
            >
                <h1
                    style={{
                        color: COLORS.white,
                        fontSize: 72,
                        fontWeight: 700,
                        fontFamily: 'sans-serif',
                        letterSpacing: '0.05em',
                        margin: 0,
                        marginBottom: 16,
                    }}
                >
                    平米內參
                </h1>
                <p
                    style={{
                        color: COLORS.gray,
                        fontSize: 20,
                        fontFamily: 'monospace',
                        letterSpacing: '0.4em',
                        margin: 0,
                        opacity: taglineEntrance,
                    }}
                >
                    SQMTALK.COM
                </p>
            </div>

            {/* Tagline */}
            <div
                style={{
                    marginTop: 50,
                    opacity: taglineEntrance,
                    textAlign: 'center',
                }}
            >
                <p
                    style={{
                        color: COLORS.gold,
                        fontSize: 24,
                        fontFamily: 'sans-serif',
                        fontWeight: 500,
                        letterSpacing: '0.15em',
                        margin: 0,
                    }}
                >
                    讓數據煉成決策黃金
                </p>
            </div>

            {/* Animated underline */}
            <div
                style={{
                    width: underlineWidth,
                    height: 2,
                    marginTop: 40,
                    background: `linear-gradient(90deg, transparent, ${COLORS.cyan}, transparent)`,
                }}
            />
        </AbsoluteFill>
    );
};
