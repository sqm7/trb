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
import { COLORS } from '../DataAlchemyVideo';

export const Scene7BrandImprint: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // 1. Extreme Zoom In into the Gem
    // 0-2s: The scene starts inside/very close to the gem surface (gold background)
    // 2-5s: Camera pulls back or focus clear to reveal the logo embedded

    // Zoom out effectively from Macro
    const macroScale = interpolate(frame, [0, 3 * fps], [4, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.exp) });
    const bgBlur = interpolate(frame, [0, 3 * fps], [20, 0]);

    // Logo Mechanics
    const logoScale = spring({ frame: frame - 1 * fps, fps, config: { damping: 15, stiffness: 60 } });
    const logoOpacity = interpolate(frame, [1 * fps, 2 * fps], [0, 1], { extrapolateRight: 'clamp' });

    // Text Assemble
    const textSlide = spring({ frame: frame - 2 * fps, fps, config: { damping: 20 } });
    const textOpacity = interpolate(frame, [2 * fps, 3 * fps], [0, 1]);

    // Shine wipe over logo
    const shineWipe = interpolate(frame, [3.5 * fps, 4.5 * fps], [-100, 200], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill style={{ backgroundColor: COLORS.bg, overflow: 'hidden' }}>

            {/* Background: Gold Texture (Inside Gem) */}
            <div style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(circle at center, ${COLORS.gold}40 0%, ${COLORS.bg} 100%)`,
                transform: `scale(${macroScale})`,
                opacity: 0.5,
            }}>
                {/* Facets simulated */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `repeating-linear-gradient(45deg, ${COLORS.gold}10 0px, transparent 2px, transparent 10px)`,
                    filter: `blur(${bgBlur}px)`,
                }} />
            </div>

            {/* Content Container */}
            <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

                {/* Logo with Glass/Gem Effect */}
                <div style={{
                    position: 'relative',
                    width: 200, height: 200,
                    marginBottom: 40,
                    transform: `scale(${logoScale})`,
                    opacity: logoOpacity,
                }}>
                    {/* Shadow/Glow */}
                    <div style={{
                        position: 'absolute', inset: 0, borderRadius: 40,
                        boxShadow: `0 0 80px ${COLORS.cyan}40`,
                    }} />

                    <Img
                        src={staticFile('icon.png')}
                        style={{
                            width: '100%', height: '100%',
                            borderRadius: 40,
                            // Blend it to look like it's inside gold
                            filter: 'brightness(1.1) contrast(1.1)',
                        }}
                    />

                    {/* Interaction Shine */}
                    <div style={{
                        position: 'absolute', inset: 0, borderRadius: 40, overflow: 'hidden',
                    }}>
                        <div style={{
                            position: 'absolute', top: 0, bottom: 0, width: 50,
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                            transform: `skewX(-20deg) translateX(${shineWipe}%)`,
                        }} />
                    </div>
                </div>

                {/* Brand Text */}
                <div style={{
                    transform: `translateY(${interpolate(textSlide, [0, 1], [50, 0])}px)`,
                    opacity: textOpacity,
                    textAlign: 'center',
                }}>
                    <h1 style={{
                        color: COLORS.white,
                        fontSize: 64, fontWeight: 800,
                        letterSpacing: '0.1em',
                        background: `linear-gradient(to bottom, #fff, ${COLORS.gray})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        margin: 0,
                    }}>
                        平米內參
                    </h1>

                    <div style={{ height: 2, width: 100, background: COLORS.cyan, margin: '20px auto' }} />

                    <p style={{
                        color: COLORS.gold, fontSize: 24, letterSpacing: '0.2em', fontWeight: 500,
                        textTransform: 'uppercase', margin: 0
                    }}>
                        Data Alchemy
                    </p>
                    <p style={{
                        color: COLORS.gray, fontSize: 16, marginTop: 10, fontFamily: 'monospace'
                    }}>
                        SQMTALK.COM
                    </p>
                </div>

            </AbsoluteFill>

        </AbsoluteFill>
    );
};
