/**
 * Report Design System
 * 
 * Defines the shared visual language for both PDF (PrintableReport) and PPTX (PptxGenJS)
 * ensuring consistency across different output formats.
 * 
 * Aesthetic: Vibe Coding / Data-Dense / Dark Mode (for PPTX), Light Mode (option for PDF if needed, but keeping Dark for now)
 */

export const REPORT_THEME = {
    colors: {
        background: '#0A0C10',      // Deep Black Background
        cardBg: '#1A1D24',          // Card/Container Background
        headerBg: '#12141A',        // Header/Section Background

        // Text Colors
        textPrimary: '#FFFFFF',
        textSecondary: '#9CA3AF',   // gray-400
        textMuted: '#6B7280',       // gray-500

        // Brand/Data Colors
        primary: '#8B5CF6',         // Violet-500
        secondary: '#06B6D4',       // Cyan-500
        accent: '#F59E0B',          // Amber-500
        danger: '#EF4444',          // Red-500
        success: '#10B981',         // Emerald-500

        border: '#374151',          // gray-700
    },
    fonts: {
        heading: 'Arial',           // PPTX safe font
        body: 'Arial',
        mono: 'Courier New',
    },
    // Chart specific color palette
    chartColors: [
        '#8B5CF6', // Violet
        '#06B6D4', // Cyan
        '#10B981', // Emerald
        '#F59E0B', // Amber
        '#EF4444', // Red
        '#EC4899', // Pink
        '#3B82F6', // Blue
        '#14B8A6'  // Teal
    ],
    // Layout Constants
    layout: {
        slideWidth: 10,   // Inches (16:9 standard width)
        slideHeight: 5.625, // Inches
        margin: 0.5,
    }
};

/**
 * Helper to convert Hex to standardized format if needed
 */
export const hexToRgb = (hex: string) => {
    // Implementation if needed for specific libraries
    return hex;
};
