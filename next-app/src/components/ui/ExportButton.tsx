import Link from 'next/link';
import React from 'react';
import { Download, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface ExportButtonProps {
    data: any[];
    filename?: string;
    label?: string;
    className?: string;
    disabled?: boolean;
    columns?: Record<string, string>; // Map english keys to chinese headers
}

export function ExportButton({
    data,
    filename = "export",
    label = "匯出 CSV",
    className,
    disabled = false,
    columns
}: ExportButtonProps) {
    const { role, isLoading } = useUserRole();

    // Check permissions
    const hasPermission = ['pro', 'pro_max', 'admin', 'super_admin'].includes(role || '');
    const isReady = !isLoading;

    const handleExport = () => {
        if (!isReady) return;

        if (!hasPermission) {
            // alert("此功能僅限 Pro 會員使用");
            return;
        }

        if (!data || data.length === 0) {
            alert("無數據可導出");
            return;
        }

        try {
            // Get data keys from the first object
            const dataKeys = Object.keys(data[0]);

            // Map keys to headers (use Chinese name if provided in columns map, else use key)
            const headers = dataKeys.map(key => columns ? (columns[key] || key) : key);

            // Generate CSV content
            const csvRows = [
                headers.join(","), // Header row (Chinese)
                ...data.map(row => dataKeys.map(key => {
                    const value = row[key]; // Access via original english key

                    // Handle null/undefined
                    if (value === null || value === undefined) return "";

                    // Handle Numbers (Formatting per user request)
                    if (typeof value === 'number') {
                        const headerName = columns ? (columns[key] || key) : key;
                        // Heuristic: Area and Rates get 2 decimals, everything else (Price/Count) gets 0 decimals
                        const isDecimalField = /Area|坪|Rate|Ratio|Share|Percent|比|率/.test(key) || /Area|坪|Rate|Ratio|Share|Percent|比|率/.test(headerName);

                        if (isDecimalField) {
                            return value.toFixed(2);
                        }
                        return Math.round(value).toFixed(0);
                    }

                    // Handle objects/arrays (stringify them)
                    if (typeof value === 'object') {
                        try {
                            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                        } catch (e) {
                            return "";
                        }
                    }

                    // Handle strings with commas, quotes, newlines
                    if (typeof value === 'string') {
                        return `"${value.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
                    }

                    return value;
                }).join(","))
            ];

            const csvContent = csvRows.join("\n");

            // Create blob and download with BOM for Excel compatibility (UTF-8 with BOM)
            const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            // Generate nice filename with date
            const dateStr = new Date().toISOString().split('T')[0];
            const finalFilename = `${filename}_${dateStr}.csv`;

            link.href = url;
            link.setAttribute("download", finalFilename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Cleanup
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export failed:", error);
            alert("匯出失敗，請查看控制台日誌");
        }
    };

    if (isLoading) {
        return (
            <Button
                variant="outline"
                size="sm"
                disabled
                className={`gap-2 border-dashed border-zinc-700 bg-zinc-900/50 text-zinc-600 ${className}`}
            >
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">載入中...</span>
            </Button>
        );
    }

    return (
        <TooltipProvider>
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    {/* Wrap in span to ensure tooltip works even if button is disabled (though here we handle logic inside) */}
                    <span className="inline-block" tabIndex={!hasPermission ? 0 : -1}>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExport}
                            // Logic: If user is not pro, we DO NOT disable the button natively, we just style it as disabled. 
                            // This allows proper event capture for tooltips.
                            disabled={disabled || (hasPermission && (!data || data.length === 0))}
                            className={`gap-2 border-dashed ${!hasPermission
                                ? 'border-zinc-800 bg-zinc-900/30 text-zinc-600 cursor-not-allowed hover:bg-zinc-900/30'
                                : 'border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white'
                                } transition-all ${className}`}
                        >
                            {!hasPermission ? <Lock className="h-3 w-3" /> : <Download className="h-4 w-4" />}
                            <span className="hidden sm:inline">{label}</span>
                        </Button>
                    </span>
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-950 border border-zinc-800 p-0 overflow-hidden">
                    <div className="flex flex-col gap-1 items-center p-3">
                        <p className="font-medium text-zinc-200">
                            {!hasPermission ? "Pro 會員限定功能" : "下載 CSV 檔案"}
                        </p>
                        {!hasPermission && (
                            <Link
                                href="/pricing"
                                className="text-xs text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors flex items-center gap-1"
                            >
                                查看升級方案 →
                            </Link>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
