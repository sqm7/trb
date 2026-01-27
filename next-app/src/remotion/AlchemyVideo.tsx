
import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, spring, interpolate, staticFile } from 'remotion';
import { Database, Map, TrendingUp, Target, Crosshair, Building2 } from 'lucide-react';

const COLORS = {
    bg: '#050A15',
    cyan: '#06b6d4',
    violet: '#8b5cf6',
    gold: '#f59e0b',
    white: '#ffffff',
};

// Scene Configuration
const SCENES = [
    { id: 1, durationMs: 3500, title: "全境實登搜索", subtitle: "Data Integration", icon: Database },
    { id: 2, durationMs: 3500, title: "市場趨勢分析", subtitle: "Visualized Analytics", icon: TrendingUp },
    { id: 3, durationMs: 3500, title: "精準定價策略", subtitle: "Strategic Pricing", icon: Target },
    { id: 4, durationMs: 4000, title: "平米內參", subtitle: "SQMTALK.COM", icon: Building2 },
];

export const AlchemyVideo = () => {
    const { fps } = useVideoConfig();

    return (
        <AbsoluteFill style={{ backgroundColor: COLORS.bg, overflow: 'hidden' }}>
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

            {SCENES.map((scene, index) => {
                const prevDurationMs = SCENES.slice(0, index).reduce((acc, s) => acc + s.durationMs, 0);
                const startFrame = Math.round(prevDurationMs / 1000 * fps);
                const durationInFrames = Math.round(scene.durationMs / 1000 * fps);

                return (
                    <Sequence key={scene.id} from={startFrame} durationInFrames={durationInFrames}>
                        {index === 0 && <Scene1DataIntegrity />}
                        {index === 1 && <Scene2Analytics />}
                        {index === 2 && <Scene3Strategy />}
                        {index === 3 && <Scene4Branding />}
                    </Sequence>
                );
            })}

            {/* Progress Indicators */}
            <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 50, pointerEvents: 'none' }}>
                <div className="flex gap-2">
                    {SCENES.map((scene, i) => (
                        <ProgressDot key={i} index={i} scenes={SCENES} />
                    ))}
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};

const ProgressDot = ({ index, scenes }: { index: number, scenes: typeof SCENES }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const prevDurationMs = scenes.slice(0, index).reduce((acc, s) => acc + s.durationMs, 0);
    const sceneDurationMs = scenes[index].durationMs;
    const startFrame = Math.round(prevDurationMs / 1000 * fps);
    const endFrame = startFrame + Math.round(sceneDurationMs / 1000 * fps);

    const isActive = frame >= startFrame && frame < endFrame;

    return (
        <div
            className={`h-1 rounded-full transition-all duration-300 ${isActive ? 'bg-cyan-400 w-8 opacity-100' : 'bg-zinc-800 w-2 opacity-30'}`}
        />
    );
};

// Helper Spring
const useSimpleSpring = (delay = 0) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    return spring({
        frame: frame - delay,
        fps,
        config: { damping: 200, stiffness: 100 }
    });
}

// Scene 1: Data Integration
const Scene1DataIntegrity = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const entrance = useSimpleSpring(0);

    // Continuous rotation
    const rotation = interpolate(frame, [0, 20 * fps], [0, 360]);

    return (
        <div className="flex flex-col items-center justify-center relative w-full h-full text-white">
            <div className="h-[400px] w-full flex items-center justify-center relative">
                {/* Rings */}
                <div
                    className="absolute w-80 h-80 border border-dashed border-cyan-500/20 rounded-full"
                    style={{ transform: `rotate(${rotation}deg)` }}
                />
                <div className="absolute w-96 h-96 border border-zinc-800/60 rounded-full" />

                {/* Center Icon */}
                <div
                    style={{ transform: `scale(${entrance})` }}
                    className="w-32 h-32 bg-zinc-900/80 backdrop-blur rounded-3xl border border-cyan-500/50 flex items-center justify-center relative z-20 shadow-[0_0_30px_rgba(6,182,212,0.2)]"
                >
                    <Map className="w-16 h-16 text-cyan-400" />
                </div>

                {/* Orbiting Nodes */}
                {[...Array(6)].map((_, i) => {
                    const delay = i * 5;
                    const nodeEntrance = spring({ frame: frame - delay, fps, config: { damping: 15 } });
                    const angle = (i * 60) * (Math.PI / 180);
                    const x = Math.cos(angle) * 180;
                    const y = Math.sin(angle) * 180;

                    return (
                        <div
                            key={i}
                            className="absolute w-12 h-12 bg-zinc-900 border border-zinc-700/50 rounded-xl flex items-center justify-center z-10"
                            style={{
                                transform: `translate(${x}px, ${y}px) scale(${nodeEntrance})`,
                                opacity: nodeEntrance
                            }}
                        >
                            <Database className="w-6 h-6 text-zinc-500" />
                        </div>
                    )
                })}
            </div>
            <TextOverlay title="全境實登搜索" subtitle="Cross-Region Data Integration" from="from-cyan-400" to="to-blue-500" />
        </div>
    );
};

// Scene 2: Analytics
const Scene2Analytics = () => {
    return (
        <div className="flex flex-col items-center justify-center relative w-full h-full text-white">
            <div className="h-[400px] w-full flex items-center justify-center relative">
                <div className="flex items-end gap-4 h-64 mb-8">
                    {[40, 65, 45, 80, 55, 90, 100].map((h, i) => {
                        const barSpring = useSimpleSpring(i * 5);
                        const height = interpolate(barSpring, [0, 1], [0, h]);
                        const opacity = interpolate(barSpring, [0, 1], [0, 1]);

                        return (
                            <div
                                key={i}
                                style={{ height: `${height}%` }}
                                className="w-8 bg-gradient-to-t from-violet-500/20 to-violet-500 rounded-t-lg relative group shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                            >
                                <div
                                    style={{ opacity }}
                                    className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm text-violet-300 font-mono"
                                >
                                    {h}
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {/* Background Icon */}
                    <TrendingUp className="w-full h-full max-w-[320px] max-h-[200px] text-violet-500/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
            </div>
            <TextOverlay title="市場趨勢分析" subtitle="Real-time Market Visualization" from="from-violet-400" to="to-fuchsia-500" />
        </div>
    );
};

// Scene 3: Strategy
const Scene3Strategy = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const entrance = useSimpleSpring();

    const rotation = interpolate(frame, [0, 20 * fps], [0, 360]);
    const pulse = Math.sin(frame / 15) * 0.1 + 1; // Simple sine pulse

    return (
        <div className="flex flex-col items-center justify-center relative w-full h-full text-white">
            <div className="h-[400px] w-full flex items-center justify-center relative">
                <div className="relative w-80 h-80 flex items-center justify-center">
                    {/* Ring 1 */}
                    <div
                        className="absolute inset-0 border border-amber-500/20 rounded-full border-dashed"
                        style={{ transform: `rotate(${rotation}deg)` }}
                    />
                    {/* Ring 2 Pulse */}
                    <div
                        className="absolute inset-12 border border-amber-500/40 rounded-full"
                        style={{ transform: `scale(${pulse})` }}
                    />

                    <Crosshair className="absolute w-full h-full text-amber-500/10 p-6" />

                    <div
                        style={{ transform: `scale(${entrance})`, opacity: entrance }}
                        className="relative z-10 w-28 h-28 bg-amber-500/10 rounded-full border border-amber-500 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)] backdrop-blur-sm"
                    >
                        <Target className="w-14 h-14 text-amber-500" />
                    </div>

                    <div
                        className="absolute right-0 top-1/3 bg-zinc-900 border border-amber-500/50 px-4 py-2 rounded-md text-sm text-amber-500 font-mono shadow-lg"
                        style={{ opacity: entrance, transform: `translateX(${interpolate(entrance, [0, 1], [20, 0])}px)` }}
                    >
                        TARGET LOCKED
                    </div>
                </div>
            </div>
            <TextOverlay title="精準定價策略" subtitle="Identify The Sweet Spot" from="from-amber-400" to="to-orange-500" />
        </div>
    );
};

// Scene 4: Branding
const Scene4Branding = () => {
    const entrance = useSimpleSpring();
    const lineEntrance = useSimpleSpring(30);

    return (
        <div className="flex flex-col items-center justify-center relative w-full h-full">
            <div
                style={{ transform: `scale(${interpolate(entrance, [0, 1], [0.8, 1])})`, opacity: entrance }}
                className="relative mb-8"
            >
                <div className="absolute inset-0 bg-cyan-500 blur-3xl opacity-20 animate-pulse" />
                <img src={staticFile("icon.png")} alt="Logo" className="w-40 h-40 relative z-10 rounded-2xl shadow-2xl" />
            </div>

            <div
                style={{ transform: `translateY(${interpolate(entrance, [0, 1], [20, 0])}px)`, opacity: entrance }}
                className="text-center"
            >
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-3 tracking-tight">平米內參</h1>
                <p className="text-zinc-500 font-mono tracking-[0.4em] text-lg">SQMTALK.COM</p>
            </div>

            <div
                style={{ width: `${interpolate(lineEntrance, [0, 1], [0, 140])}px` }}
                className="h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent mt-10"
            />
        </div>
    );
};

const TextOverlay = ({ title, subtitle, from, to }: { title: string, subtitle: string, from: string, to: string }) => {
    const entrance = useSimpleSpring(15);

    return (
        <div
            className="flex flex-col items-center z-20"
            style={{
                opacity: entrance,
                transform: `translateY(${interpolate(entrance, [0, 1], [20, 0])}px)`
            }}
        >
            <h3 className={`text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${from} ${to} text-center mb-4 drop-shadow-sm px-4`}>
                {title}
            </h3>
            <p className="text-zinc-400 text-base md:text-lg tracking-[0.2em] uppercase text-center font-medium">
                {subtitle}
            </p>
        </div>
    )
}
