"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Reports Page Error:", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 p-8 bg-zinc-950 text-white">
            <h2 className="text-xl font-bold text-red-400">Application Error</h2>
            <div className="text-sm font-mono bg-zinc-900 p-4 rounded-lg border border-red-900/50 max-w-2xl overflow-auto text-red-200">
                <p><strong>Message:</strong> {error.message}</p>
                {error.digest && <p><strong>Digest:</strong> {error.digest}</p>}
                <p className="mt-2 opacity-50">Check console for full stack trace.</p>
            </div>
            <Button
                variant="outline"
                onClick={() => reset()}
                className="hover:bg-zinc-800"
            >
                Try again
            </Button>
        </div>
    );
}
