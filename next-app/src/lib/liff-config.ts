/**
 * LIFF Configuration Helper
 * Automatically selects the correct LIFF ID based on the current environment/domain.
 */

// LIFF IDs for different environments
const LIFF_IDS = {
    production: '2008934556-Ud86tczR',  // www.sqmtalk.com
    test: '2008934556-oxSVZdHU',         // sqm7.github.io/trb
} as const;

/**
 * Get the appropriate LIFF ID based on the current hostname.
 * Falls back to the environment variable or production ID.
 */
export function getLiffId(): string {
    // Server-side or during build: use env variable
    if (typeof window === 'undefined') {
        return process.env.NEXT_PUBLIC_LINE_LIFF_ID || LIFF_IDS.production;
    }

    const hostname = window.location.hostname;

    // Test environment detection
    if (hostname === 'sqm7.github.io') {
        // Check if it's the /trb path (test)
        if (window.location.pathname.startsWith('/trb')) {
            return LIFF_IDS.test;
        }
    }

    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Use test ID for local development by default
        return LIFF_IDS.test;
    }

    // Production (www.sqmtalk.com or sqm7.github.io/kthd)
    return LIFF_IDS.production;
}

export default LIFF_IDS;
