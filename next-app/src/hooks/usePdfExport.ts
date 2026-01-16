import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface UsePdfExportReturn {
    exportToPdf: (element: HTMLElement | null, fileName?: string) => Promise<void>;
    isExporting: boolean;
}

export const usePdfExport = (): UsePdfExportReturn => {
    const [isExporting, setIsExporting] = useState(false);

    const exportToPdf = useCallback(async (element: HTMLElement | null, fileName: string = 'dashboard-export') => {
        if (!element) return;

        try {
            setIsExporting(true);

            // Wait for any animations or rendering to settle
            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(element, {
                scale: 2, // Higher scale for better resolution
                useCORS: true, // Internal/External images
                logging: false,
                backgroundColor: '#1a1a1a', // Match theme background
                ignoreElements: (node) => {
                    // Ignore elements with 'no-print' class
                    return node.classList.contains('no-print');
                }
            });

            const imgData = canvas.toDataURL('image/png');

            // Standard A4 sizes in mm
            // A4: 210 x 297 mm
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgWidth = canvas.width;
            const imgHeight = canvas.height;

            // Calculate ratio to fit width
            const ratio = pdfWidth / imgWidth;
            const finalHeight = imgHeight * ratio;

            // If content is taller than one page, we might need multi-page or just scale it.
            // For dashboard snapshots, usually fit-to-width single page (long scroll) or split is tricky.
            // Let's stick to single page fit-width for now (might be very long).
            // Actually, if it's too long, standard approach provides pagination. 
            // Simplified approach: Add image to PDF. If height > page, create new pages?
            // "Dashboard snapshot" usually implies capturing current view. 
            // Let's do a simple fit-width, potentially multiple pages if needed logic is complex, 
            // but for now let's just render the image. 
            // A4 Landscape is limited. 

            // Allow auto-height by changing page format if needed? 
            // Or just use 'p', 'mm', [width, height] custom size?

            // Better approach for long dashboards: Custom page size PDF
            const customPdf = new jsPDF({
                orientation: 'p',
                unit: 'px',
                format: [imgWidth, imgHeight] // Exact pixel match mapped to PDF units
            });

            customPdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            customPdf.save(`${fileName}.pdf`);

        } catch (error) {
            console.error('PDF Export Failed:', error);
            // You might want to show a toast here
        } finally {
            setIsExporting(false);
        }
    }, []);

    return { exportToPdf, isExporting };
};
