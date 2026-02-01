import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const MarketReport = () => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // Fade in intro
    const opacity = interpolate(frame, [0, 30], [0, 1], {
        extrapolateRight: 'clamp',
    });

    // Bar animation using spring as per remotion-best-practices rules
    const barHeight = spring({
        frame,
        fps,
        config: {
            damping: 12,
        },
    });

    return (
        <div style={{
            flex: 1,
            backgroundColor: '#09090b',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontFamily: 'system-ui',
            opacity,
        }}>
            <h1 style={{ fontSize: 80, marginBottom: 40 }}>sqmtalk.com</h1>
            <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                height: 300,
                gap: 20
            }}>
                {[200, 350, 280, 450, 390].map((h, i) => {
                    const stagger = spring({
                        frame: frame - (i * 5),
                        fps,
                        config: { damping: 10 }
                    });
                    return (
                        <div key={i} style={{
                            width: 60,
                            height: stagger * h,
                            backgroundColor: '#06b6d4',
                            borderRadius: '10px 10px 0 0',
                            boxShadow: '0 0 20px rgba(6,182,212,0.5)'
                        }} />
                    );
                })}
            </div>
            <p style={{ fontSize: 40, marginTop: 40, color: '#94a3b8' }}>數據驅動的建案分析</p>
        </div>
    );
};
