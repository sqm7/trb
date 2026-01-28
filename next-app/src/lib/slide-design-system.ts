/**
 * Slide Design System
 * 
 * Unified visual language for all report slides.
 * These tokens should be used across all *Slide.tsx components for consistency.
 */

export const SlideTheme = {
    colors: {
        // Backgrounds
        background: '#0A0C10',
        surfacePrimary: 'rgba(24, 24, 27, 0.5)',   // zinc-900/50
        surfaceSecondary: 'rgba(24, 24, 27, 0.3)', // zinc-900/30

        // Borders
        borderSubtle: 'rgba(255, 255, 255, 0.05)',
        borderAccent: 'rgba(139, 92, 246, 0.2)',   // violet-500/20

        // Brand
        primary: '#8b5cf6',      // violet-500
        accent: '#22d3ee',       // cyan-400
        success: '#34d399',      // emerald-400
        warning: '#fbbf24',      // amber-400
        danger: '#ef4444',       // red-500

        // Text
        textPrimary: '#ffffff',
        textSecondary: '#a1a1aa', // zinc-400
        textMuted: '#52525b',     // zinc-600
        textDisabled: '#3f3f46',  // zinc-700
    },

    typography: {
        // Slide Titles
        slideTitle: 'text-lg font-bold text-white',
        sectionTitle: 'text-sm font-semibold text-zinc-300',

        // Metrics
        metricLarge: 'text-4xl font-bold font-mono text-white',
        metricMedium: 'text-2xl font-bold font-mono text-white',
        metricSmall: 'text-xl font-medium font-mono text-zinc-200',

        // Labels
        label: 'text-xs text-zinc-500',
        labelAlt: 'text-xs text-zinc-400',

        // Table
        tableHeader: 'text-xs font-semibold text-zinc-400',
        tableCell: 'text-sm text-zinc-300',
        tableCellMono: 'text-sm font-mono text-zinc-300',
    },

    spacing: {
        slide: 'p-2',
        card: 'p-4',
        cardLarge: 'p-6',
        gap: 'gap-4',
        gapSmall: 'gap-2',
    },

    components: {
        // Card variants
        card: 'bg-zinc-900/30 rounded-xl border border-white/5',
        cardHighlight: 'bg-zinc-900/50 rounded-lg border border-violet-500/20',

        // Section indicators
        sectionBar: 'w-1 h-4 bg-violet-500 rounded-full',
        sectionBarAlt: 'w-1.5 h-6 bg-violet-500 rounded-full',
    },

    chart: {
        // Chart configuration defaults for print-ready slides
        animation: false,
        tooltip: { enabled: false },
        legend: { show: false },
        gridColor: 'rgba(255, 255, 255, 0.05)',
    }
} as const;

// Helper function to get chart config for ApexCharts
export function getStaticChartConfig(): Partial<ApexCharts.ApexOptions> {
    return {
        chart: {
            background: 'transparent',
            toolbar: { show: false },
            zoom: { enabled: false },
            animations: { enabled: false },
            selection: { enabled: false },
        },
        tooltip: { enabled: false },
        states: {
            hover: { filter: { type: 'none' } },
            active: { filter: { type: 'none' } },
        },
        grid: {
            borderColor: SlideTheme.chart.gridColor,
            strokeDashArray: 4,
        },
    };
}

// Helper function to get chart config for Recharts
export function getRechartsStaticProps() {
    return {
        isAnimationActive: false,
    };
}
