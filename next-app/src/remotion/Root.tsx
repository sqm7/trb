
import React from 'react';
import { Composition } from 'remotion';
import { AlchemyVideo } from './AlchemyVideo';
import { DataAlchemyVideo, TOTAL_DURATION_SECONDS } from './DataAlchemyVideo';
import '../app/globals.css'; // Import Tailwind styles (important!)

export const RemotionRoot: React.FC = () => {
    return (
        <>
            {/* Original 15-second promo */}
            <Composition
                id="AlchemySquare"
                component={AlchemyVideo}
                durationInFrames={900} // 15s * 60fps
                fps={60}
                width={1080}
                height={1080}
                defaultProps={{}}
            />

            {/* New 90-second Data Alchemy Video */}
            <Composition
                id="DataAlchemyFull"
                component={DataAlchemyVideo}
                durationInFrames={TOTAL_DURATION_SECONDS * 60} // 90s * 60fps = 5400 frames
                fps={60}
                width={1080}
                height={1080}
                defaultProps={{}}
            />
        </>
    );
};
