import {
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
    AbsoluteFill,
    Sequence
} from 'remotion';

export const BrandIntro = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // 1. Particle assembly (simulated with SVG)
    const assemblyProgress = spring({
        frame,
        fps,
        config: { damping: 10 }
    });

    // 2. Title fade and slide
    const titleOpacity = interpolate(frame, [30, 60], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const titleSlide = interpolate(frame, [30, 60], [20, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // 3. Glitch effect simulation
    const glitchX = interpolate(frame % 5, [0, 1, 2, 3, 4], [0, 2, -2, 1, 0]);
    const isGlitching = frame > 90 && frame < 100;

    return (
        <AbsoluteFill style={{ backgroundColor: '#09090b', color: 'white', fontFamily: 'sans-serif' }}>
            {/* Background Grid */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'linear-gradient(to right, #ffffff05 1px, transparent 1px), linear-gradient(to bottom, #ffffff05 1px, transparent 1px)',
                backgroundSize: '40px 40px',
            }} />

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                transform: `translateX(${isGlitching ? glitchX : 0}px)`
            }}>
                {/* Logo Placeholder Animation */}
                <div style={{
                    width: 150,
                    height: 150,
                    borderRadius: 20,
                    backgroundColor: '#06b6d4',
                    opacity: assemblyProgress,
                    transform: `scale(${assemblyProgress})`,
                    boxShadow: '0 0 40px rgba(6,182,212,0.4)',
                    marginBottom: 40
                }} />

                <div style={{ overflow: 'hidden' }}>
                    <h1 style={{
                        fontSize: 100,
                        fontWeight: 900,
                        margin: 0,
                        opacity: titleOpacity,
                        transform: `translateY(${titleSlide}px)`,
                        letterSpacing: '-2px'
                    }}>
                        平米內參
                    </h1>
                </div>

                <div style={{
                    width: interpolate(frame, [40, 80], [0, 400], { extrapolateRight: 'clamp' }),
                    height: 4,
                    backgroundColor: '#06b6d4',
                    marginTop: 20,
                    borderRadius: 2
                }} />

                <p style={{
                    fontSize: 30,
                    color: '#94a3b8',
                    marginTop: 30,
                    opacity: interpolate(frame, [60, 90], [0, 1]),
                    letterSpacing: 10,
                    textTransform: 'uppercase'
                }}>
                    sqmtalk.com
                </p>
            </div>
        </AbsoluteFill>
    );
};
