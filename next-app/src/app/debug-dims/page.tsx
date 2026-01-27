'use client';

import React, { useEffect, useState } from 'react';

export default function DebugPage() {
    const [dims, setDims] = useState({ w: 0, h: 0 });

    useEffect(() => {
        setDims({ w: window.innerWidth, h: window.innerHeight });
    }, []);

    return (
        <div className="fixed inset-0 bg-white flex items-center justify-center text-4xl font-mono text-black">
            {dims.w} x {dims.h}
        </div>
    );
}
