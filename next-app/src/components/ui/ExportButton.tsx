"use client";

import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Lock, Loader2, LayoutTemplate, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";
import { useReportBuilderStore, ChartType } from "@/store/useReportBuilderStore";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ExportButtonProps {
    data: any[];
    filename?: string;
    label?: string;
    className?: string;
    disabled?: boolean;
    columns?: Record<string, string>;
    chartType?: ChartType; // For adding to Report Builder
    snapshotData?: any;    // richer data for Report Builder (if data is not enough)
}

export function ExportButton({
    data,
    filename = "export",
    label = "匯出",
    className,
    disabled = false,
    columns,
    chartType,
    snapshotData
}: ExportButtonProps) {
    const { role, isLoading } = useUserRole();
    const router = useRouter();
    const addItem = useReportBuilderStore(state => state.addItem);

    // Check permissions
    const hasPermission = ['pro', 'pro_max', 'admin', 'super_admin'].includes(role || '');
    const isReady = !isLoading;

    const handleExport = () => {
        if (!isReady) return;

        if (!hasPermission) {
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

    // Add to Report Builder
    const handleAddToBuilder = () => {
        if (!hasPermission || !chartType) return;

        // Use snapshotData if provided, otherwise fallback to the CSV-oriented 'data'
        const finalSnapshot = snapshotData !== undefined ? snapshotData : data;
        addItem(chartType, finalSnapshot);

        // Show toast notification
        toast.success("已新增至報表編輯器", {
            description: "請點選左側「生成報告」繼續編輯",
            action: {
                label: "前往編輯",
                onClick: () => router.push('/reports/builder'),
            },
        });
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

    // If no chartType, render simple export button (no dropdown)
    if (!chartType) {
        return (
            <TooltipProvider>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <span className="inline-flex" tabIndex={!hasPermission ? 0 : -1}>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExport}
                                disabled={disabled || (hasPermission && (!data || data.length === 0))}
                                className={cn(
                                    "gap-1.5 border-dashed transition-all",
                                    !hasPermission
                                        ? 'border-zinc-800 bg-zinc-900/30 text-zinc-600 cursor-not-allowed hover:bg-zinc-900/30'
                                        : 'border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white',
                                    className
                                )}
                            >
                                {!hasPermission ? <Lock className="h-3 w-3" /> : <Download className="h-4 w-4" />}
                                <span className="hidden sm:inline">{label}</span>
                            </Button>
                        </span>
                    </TooltipTrigger>
                    {!hasPermission && (
                        <TooltipContent className="bg-zinc-950 border border-zinc-800 p-0 overflow-hidden">
                            <div className="flex flex-col gap-1 items-center p-3">
                                <p className="font-medium text-zinc-200">Pro 會員限定功能</p>
                                <Link
                                    href="/pricing"
                                    className="text-xs text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors flex items-center gap-1"
                                >
                                    查看升級方案 →
                                </Link>
                            </div>
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>
        );
    }

    // With chartType, render dropdown menu
    return (
        <TooltipProvider>
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <span className="inline-flex" tabIndex={!hasPermission ? 0 : -1}>
                        {hasPermission ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={disabled || (!data || data.length === 0)}
                                        className={cn(
                                            "gap-1.5 border-dashed transition-all border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white",
                                            className
                                        )}
                                    >
                                        <Download className="h-4 w-4" />
                                        <span className="hidden sm:inline">{label}</span>
                                        <ChevronDown className="h-3 w-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="start"
                                    className="min-w-[180px] bg-zinc-900 border-zinc-700"
                                >
                                    <DropdownMenuItem
                                        onClick={handleExport}
                                        className="flex items-center gap-2 text-zinc-300 hover:text-white focus:text-white cursor-pointer"
                                    >
                                        <Download className="h-4 w-4 text-zinc-500" />
                                        匯出 CSV
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={handleAddToBuilder}
                                        className="flex items-center gap-2 text-zinc-300 hover:text-violet-300 focus:text-violet-300 hover:bg-violet-600/20 focus:bg-violet-600/20 cursor-pointer"
                                    >
                                        <LayoutTemplate className="h-4 w-4 text-violet-500" />
                                        新增到報表編輯器
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className={cn(
                                    "gap-1.5 border-dashed transition-all border-zinc-800 bg-zinc-900/30 text-zinc-600 cursor-not-allowed hover:bg-zinc-900/30",
                                    className
                                )}
                            >
                                <Lock className="h-3 w-3" />
                                <span className="hidden sm:inline">{label}</span>
                            </Button>
                        )}
                    </span>
                </TooltipTrigger>
                {!hasPermission && (
                    <TooltipContent className="bg-zinc-950 border border-zinc-800 p-0 overflow-hidden">
                        <div className="flex flex-col gap-1 items-center p-3">
                            <p className="font-medium text-zinc-200">Pro 會員限定功能</p>
                            <Link
                                href="/pricing"
                                className="text-xs text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors flex items-center gap-1"
                            >
                                查看升級方案 →
                            </Link>
                        </div>
                    </TooltipContent>
                )}
            </Tooltip>
        </TooltipProvider>
    );
}
