import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig, staticFile } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';

// Import Scenes
import { Scene1ChaosMine } from './scenes/Scene1ChaosMine';
import { Scene2AlchemyStart } from './scenes/Scene2AlchemyStart';
import { Scene3DataRefinery } from './scenes/Scene3DataRefinery';
import { Scene4CrystalRoom } from './scenes/Scene4CrystalRoom';
import { Scene5GoldCasting } from './scenes/Scene5GoldCasting';
import { Scene6ValueReveal } from './scenes/Scene6ValueReveal';
import { Scene7BrandImprint } from './scenes/Scene7BrandImprint';

// Color System
export const COLORS = {
    bg: '#050A15',
    cyan: '#06b6d4',
    violet: '#8b5cf6',
    gold: '#f59e0b',
    white: '#ffffff',
    gray: '#71717a',
};

// Scene Durations in seconds
const SCENE_DURATIONS = {
    scene1: 15,  // Chaos Mine: 0-15s
    scene2: 10,  // Alchemy Start: 15-25s
    scene3: 20,  // Data Refinery: 25-45s
    scene4: 15,  // Crystal Room: 45-60s
    scene5: 15,  // Gold Casting: 60-75s
    scene6: 10,  // Value Reveal: 75-85s
    scene7: 5,   // Brand Imprint: 85-90s
};

// Total duration: 90 seconds
export const TOTAL_DURATION_SECONDS = Object.values(SCENE_DURATIONS).reduce((a, b) => a + b, 0);

export const DataAlchemyVideo: React.FC = () => {
    const { fps } = useVideoConfig();

    // Convert durations to frames
    const scene1Frames = SCENE_DURATIONS.scene1 * fps;
    const scene2Frames = SCENE_DURATIONS.scene2 * fps;
    const scene3Frames = SCENE_DURATIONS.scene3 * fps;
    const scene4Frames = SCENE_DURATIONS.scene4 * fps;
    const scene5Frames = SCENE_DURATIONS.scene5 * fps;
    const scene6Frames = SCENE_DURATIONS.scene6 * fps;
    const scene7Frames = SCENE_DURATIONS.scene7 * fps;

    const transitionFrames = Math.round(0.5 * fps);

    return (
        <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
            {/* Background Grid - Subtle */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `
                        linear-gradient(rgba(6,182,212,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(6,182,212,0.03) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px',
                    opacity: 0.5,
                }}
            />

            <TransitionSeries>
                {/* Scene 1: Chaos Mine (0-15s) */}
                <TransitionSeries.Sequence durationInFrames={scene1Frames}>
                    <Scene1ChaosMine />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: transitionFrames })}
                />

                {/* Scene 2: Alchemy Start (15-25s) */}
                <TransitionSeries.Sequence durationInFrames={scene2Frames}>
                    <Scene2AlchemyStart />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: transitionFrames })}
                />

                {/* Scene 3: Data Refinery (25-45s) */}
                <TransitionSeries.Sequence durationInFrames={scene3Frames}>
                    <Scene3DataRefinery />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: transitionFrames })}
                />

                {/* Scene 4: Crystal Room (45-60s) */}
                <TransitionSeries.Sequence durationInFrames={scene4Frames}>
                    <Scene4CrystalRoom />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: transitionFrames })}
                />

                {/* Scene 5: Gold Casting (60-75s) */}
                <TransitionSeries.Sequence durationInFrames={scene5Frames}>
                    <Scene5GoldCasting />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: transitionFrames })}
                />

                {/* Scene 6: Value Reveal (75-85s) */}
                <TransitionSeries.Sequence durationInFrames={scene6Frames}>
                    <Scene6ValueReveal />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: transitionFrames })}
                />

                {/* Scene 7: Brand Imprint (85-90s) */}
                <TransitionSeries.Sequence durationInFrames={scene7Frames}>
                    <Scene7BrandImprint />
                </TransitionSeries.Sequence>
            </TransitionSeries>
        </AbsoluteFill>
    );
};
