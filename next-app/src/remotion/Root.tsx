
import React from 'react';
import { Composition } from 'remotion';
import { AlchemyVideo } from './AlchemyVideo';
import '../app/globals.css'; // Import Tailwind styles (important!)

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="AlchemySquare"
                component={AlchemyVideo}
                durationInFrames={900} // 15s * 60fps
                fps={60}
                width={1080}
                height={1080}
                defaultProps={{}}
            />
        </>
    );
};
