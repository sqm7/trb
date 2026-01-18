'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { REAL_ESTATE_POLICIES, PolicyEvent } from '@/lib/data/policies';
import { cn } from '@/lib/utils';
import { Calendar, TrendingUp, Gavel, Landmark, Info, ZoomIn, ZoomOut, ChevronDown, ChevronUp } from 'lucide-react';

import { useFilterStore } from '@/store/useFilterStore';

interface Transaction {
    "交易日": string;
    [key: string]: any;
}

interface PolicyTimelineReportProps {
    data: Transaction[];
}

export default function PolicyTimelineReport({ data }: PolicyTimelineReportProps) {
    const filters = useFilterStore();
    const [selectedEvent, setSelectedEvent] = useState<PolicyEvent | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

    // 1. Group Data by Project Name and Calculate Periods
    const projectPeriods = useMemo(() => {
        // user requirement: only show project tracks if user specifically filtered by project name
        if (filters.projectNames.length === 0) return [];

        if (!data || data.length === 0) return [];

        const groups: Record<string, number[]> = {};

        data.forEach(d => {
            const name = d["建案名稱"];
            // Skip if name is empty
            if (!name) return;

            const time = new Date(d["交易日"]).getTime();
            if (!isNaN(time)) {
                if (!groups[name]) groups[name] = [];
                groups[name].push(time);
            }
        });

        // Convert to array and Sort by Start Date
        const periods = Object.entries(groups).map(([name, times]) => {
            const min = Math.min(...times);
            const max = Math.max(...times);
            return {
                name,
                start: new Date(min),
                end: new Date(max),
                startStr: new Date(min).toISOString().slice(0, 10),
                endStr: new Date(max).toISOString().slice(0, 10),
                count: times.length
            };
        }).sort((a, b) => a.start.getTime() - b.start.getTime());

        // Limit to top 10
        return periods.slice(0, 10);
    }, [data]);

    // 2. Date Range for Timeline (Auto-zoom + Padding)
    const timelineRange = useMemo(() => {
        const minYear = 2012; // Hard start from 2012 (Real Estate Registration 1.0)
        let maxYear = new Date().getFullYear() + 1;

        if (projectPeriods.length > 0) {
            const globalEnd = Math.max(...projectPeriods.map(p => p.end.getFullYear()));
            maxYear = Math.max(maxYear, globalEnd + 1);
        }

        return {
            start: new Date(`${minYear}-01-01`),
            end: new Date(`${maxYear}-12-31`),
            totalMonths: (maxYear - minYear + 1) * 12
        };
    }, [projectPeriods]);

    const containerHeight = Math.max(300, 200 + projectPeriods.length * 60);

    // Helper: Position calculation (0% - 100%)
    const getPosition = (dateStr: string) => {
        const date = new Date(dateStr);
        const start = timelineRange.start.getTime();
        const end = timelineRange.end.getTime();
        const current = date.getTime();

        // Clamp
        if (current < start) return 0;
        if (current > end) return 100;

        return ((current - start) / (end - start)) * 100;
    };

    // Filter policies within view range
    const visiblePolicies = useMemo(() => {
        return REAL_ESTATE_POLICIES.filter(p => {
            const d = new Date(p.date);
            return d >= timelineRange.start && d <= timelineRange.end;
        });
    }, [timelineRange]);

    const getIcon = (category: string) => {
        switch (category) {
            case 'finance': return <Landmark className="w-3 h-3 text-emerald-400" />;
            case 'policy': return <Gavel className="w-3 h-3 text-rose-400" />;
            default: return <Info className="w-3 h-3 text-blue-400" />;
        }
    };

    return (
        <Card className="w-full bg-black/40 border-zinc-800 backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                    <Calendar className="w-6 h-6 text-cyan-500" />
                    房市政策時光機
                </CardTitle>
                <CardDescription className="text-zinc-400">
                    建案銷售期間與重大政策/金融事件的交叉比對
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Controls & Legend */}
                <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-black/20 rounded-lg p-1 border border-white/5">
                            <button
                                onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
                                className="p-1.5 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-colors"
                            >
                                <ZoomOut className="w-4 h-4" />
                            </button>
                            <span className="text-xs font-mono text-zinc-500 w-12 text-center">{(zoomLevel * 100).toFixed(0)}%</span>
                            <button
                                onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.25))}
                                className="p-1.5 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-colors"
                            >
                                <ZoomIn className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-500">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" /> 金融事件
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-rose-500" /> 房市政策
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative w-full overflow-x-auto pb-12 pt-8 hide-scrollbar">
                    {/* Timeline Container - Dynamic width based on zoom */}
                    <div
                        className="relative pr-20 pl-4 border-b border-zinc-800 transition-all duration-300 ease-out"
                        style={{
                            minWidth: `${1200 * zoomLevel}px`,
                            height: `${containerHeight}px`
                        }}
                    >

                        {/* Year Markers */}
                        <div className="absolute top-0 w-full h-full pointer-events-none">
                            {Array.from({ length: timelineRange.end.getFullYear() - timelineRange.start.getFullYear() + 1 }).map((_, i) => {
                                const year = timelineRange.start.getFullYear() + i;
                                const left = getPosition(`${year}-01-01`);
                                return (
                                    <div key={year} className="absolute h-full border-l border-dashed border-zinc-800/50" style={{ left: `${left}%` }}>
                                        <span className="absolute -top-6 -left-3 text-xs font-mono text-zinc-500">{year}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Project Duration Tracks */}
                        {projectPeriods.map((period, index) => {
                            // Calculate dynamic top position to stack tracks
                            // Start from 30%, add spacing.
                            // If we have many tracks, we need to ensure they don't overlap policies excessively, 
                            // but policies are z-indexed above/below.
                            // Let's place them in the middle area.
                            const topPercent = 30 + (index * 12);

                            // Colors for distinction (cycling)
                            const colors = [
                                "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400",
                                "from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-400",
                                "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400",
                                "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400",
                                "from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-400"
                            ];
                            const colorClass = colors[index % colors.length];

                            return (
                                <div
                                    key={period.name}
                                    className={cn(
                                        "absolute h-10 border-y backdrop-blur-sm z-10 flex items-center justify-center group transition-all hover:bg-white/5",
                                        `bg-gradient-to-r ${colorClass}`
                                    )}
                                    style={{
                                        left: `${getPosition(period.startStr)}%`,
                                        width: `${Math.max(0.5, getPosition(period.endStr) - getPosition(period.startStr))}%`,
                                        top: `${topPercent}%`
                                    }}
                                >
                                    <div className="absolute -top-5 left-0 text-xs font-bold whitespace-nowrap px-1 bg-black/50 rounded backdrop-blur-sm border border-white/10">
                                        {period.name}
                                    </div>
                                    <div className="absolute -top-12 text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-70 transition-opacity bg-black/80 px-2 py-1 rounded border border-zinc-700">
                                        銷售開始: {period.startStr}
                                    </div>
                                    <span className="text-[10px] font-bold px-2 truncate cursor-default opacity-80">
                                        交易區間 ({period.count}筆)
                                    </span>
                                    <div className="absolute -bottom-12 text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-70 transition-opacity bg-black/80 px-2 py-1 rounded border border-zinc-700">
                                        最後交易: {period.endStr}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Policy Events */}
                        {visiblePolicies.map((policy, index) => {
                            const left = getPosition(policy.date);
                            const isHighImpact = policy.impact === 'high';
                            // Move policies to very top and very bottom to leave room for project tracks in the middle
                            const topPos = index % 2 === 0 ? '8%' : '85%';

                            // Check if this policy falls WITHIN any of the project periods
                            let isDuringProject = false;
                            if (projectPeriods.length > 0) {
                                const pDate = new Date(policy.date);
                                isDuringProject = projectPeriods.some(period =>
                                    pDate >= period.start && pDate <= period.end
                                );
                            }

                            return (
                                <div
                                    key={policy.id}
                                    className={cn(
                                        "absolute transform -translate-x-1/2 flex flex-col items-center group cursor-pointer transition-all duration-300 z-20",
                                        isDuringProject ? "opacity-100 scale-110" : "opacity-60 hover:opacity-100 hover:scale-110",
                                        selectedEvent?.id === policy.id && "scale-125 opacity-100 z-30"
                                    )}
                                    style={{ left: `${left}%`, top: topPos }}
                                    onClick={() => setSelectedEvent(policy)}
                                >
                                    {/* Line connector to center */}
                                    <div className={cn("h-8 w-px absolute", topPos === '8%' ? "top-full bg-gradient-to-b" : "bottom-full bg-gradient-to-t", "from-transparent to-zinc-700")} />

                                    {/* Icon Badge */}
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center border shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all",
                                        policy.category === 'finance'
                                            ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-400 group-hover:shadow-emerald-500/20"
                                            : "bg-rose-950/80 border-rose-500/50 text-rose-400 group-hover:shadow-rose-500/20",
                                        isHighImpact && "ring-2 ring-offset-2 ring-offset-black/50 ring-opacity-50",
                                        policy.category === 'finance' && isHighImpact ? "ring-emerald-500" : "ring-rose-500",
                                        selectedEvent?.id === policy.id && "ring-2 ring-white ring-offset-2 ring-offset-black"
                                    )}>
                                        {getIcon(policy.category)}
                                    </div>

                                    {/* Title Label */}
                                    <div className={cn(
                                        "absolute whitespace-nowrap text-[10px] px-2 py-0.5 mt-2 rounded bg-black/80 border border-zinc-700 backdrop-blur-md transition-all font-medium",
                                        topPos === '8%' ? "-top-8" : "-bottom-8",
                                        isDuringProject ? "text-white border-yellow-500/50" : "text-zinc-400 group-hover:text-white",
                                        selectedEvent?.id === policy.id && "text-white border-white/50 bg-zinc-800"
                                    )}>
                                        {policy.title}
                                    </div>

                                    {/* Date Label (Small) */}
                                    <div className={cn(
                                        "absolute text-[9px] font-mono text-zinc-600",
                                        topPos === '8%' ? "top-10" : "bottom-10"
                                    )}>
                                        {policy.date}
                                    </div>
                                </div>
                            );
                        })}

                    </div>
                </div>


                {/* Selected Event Detail Panel */}
                {selectedEvent && (
                    <div className="mt-6 mb-8 border border-zinc-700/50 bg-zinc-900/80 p-6 rounded-xl animate-in fade-in slide-in-from-top-4 shadow-2xl shadow-black/50">
                        <div className="flex flex-col gap-6">
                            {/* Header */}
                            <div className="flex items-start justify-between border-b border-white/5 pb-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className={cn(
                                            "text-sm px-3 py-1",
                                            selectedEvent.category === 'finance' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                        )}>
                                            {selectedEvent.category === 'finance' ? '金融事件' : '房市政策'}
                                        </Badge>
                                        <span className="text-zinc-400 font-mono text-sm">{selectedEvent.date}</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white tracking-tight">{selectedEvent.title}</h3>
                                </div>
                                <div className={cn(
                                    "px-3 py-1 rounded-full text-xs font-medium border",
                                    selectedEvent.impact === 'high' ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                                )}>
                                    影響程度: {selectedEvent.impact === 'high' ? '高' : selectedEvent.impact === 'medium' ? '中' : '低'}
                                </div>
                            </div>

                            {/* Content Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column: Policy Content */}
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <Info className="w-4 h-4" /> 政策/事件內容
                                        </h4>
                                        <p className="text-zinc-200 text-base leading-relaxed bg-zinc-950/50 p-4 rounded-lg border border-white/5">
                                            {selectedEvent.description}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <Gavel className="w-4 h-4" /> 具體規範變革
                                        </h4>
                                        <div className="bg-zinc-950/50 p-4 rounded-lg border border-white/5 text-cyan-400 font-medium">
                                            {selectedEvent.change_content || "無具體規範變更"}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Background & Impact */}
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <Landmark className="w-4 h-4" /> 時代背景與金融環境
                                        </h4>
                                        <p className="text-zinc-300 text-sm leading-relaxed bg-zinc-950/30 p-4 rounded-lg border border-white/5">
                                            {selectedEvent.background || "尚無背景資料"}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4" /> 受眾影響分析
                                        </h4>
                                        <div className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-4">
                                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                                <TrendingUp className="w-24 h-24" />
                                            </div>
                                            <div className="relative z-10">
                                                <p className="text-indigo-300 font-medium mb-2 text-xs uppercase">影響對象: {selectedEvent.affected_scope}</p>
                                                <p className="text-white text-sm leading-relaxed">
                                                    {selectedEvent.impact_analysis || "尚無詳細分析"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Expandable Detailed Regulations */}
                            {selectedEvent.details && selectedEvent.details.length > 0 && (
                                <div className="border-t border-white/5 pt-4">
                                    <button
                                        onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                                        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors w-full justify-center py-2"
                                    >
                                        {isDetailsExpanded ? (
                                            <>
                                                <ChevronUp className="w-4 h-4" /> 收起完整規範細節
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="w-4 h-4" /> 展開完整規範細節 ({selectedEvent.details.length} 項)
                                            </>
                                        )}
                                    </button>

                                    {isDetailsExpanded && (
                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                            {selectedEvent.details.map((detail, idx) => (
                                                <div key={idx} className="flex items-start gap-3 bg-black/40 p-3 rounded border border-zinc-800 text-sm text-zinc-300">
                                                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-800 text-zinc-500 text-xs shrink-0 mt-0.5">
                                                        {idx + 1}
                                                    </span>
                                                    <span>{detail}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                )}
                <div className="mt-8 border-t border-zinc-800 pt-6">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-bold text-zinc-200">政策影響比較表</h3>
                    </div>

                    <div className="rounded-xl border border-white/10 overflow-hidden bg-black/20">
                        <div className="grid grid-cols-12 gap-4 p-4 bg-zinc-900/50 border-b border-white/5 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                            <div className="col-span-2">實施日期</div>
                            <div className="col-span-3">政策/事件名稱</div>
                            <div className="col-span-4">變革內容 (Before vs After)</div>
                            <div className="col-span-3">影響對象與範圍</div>
                        </div>

                        <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {visiblePolicies.slice().reverse().map((policy) => { // Reverse to show latest first
                                return (
                                    <div
                                        key={policy.id}
                                        className={cn(
                                            "grid grid-cols-12 gap-4 p-4 text-sm transition-colors hover:bg-white/5 cursor-pointer",
                                            selectedEvent?.id === policy.id ? "bg-white/10" : ""
                                        )}
                                        onClick={() => setSelectedEvent(policy)}
                                    >
                                        <div className="col-span-2 font-mono text-zinc-500">{policy.date}</div>
                                        <div className="col-span-3 flex items-start gap-2">
                                            <Badge variant="outline" className={cn(
                                                "shrink-0 mt-0.5",
                                                policy.category === 'finance' ? "text-emerald-400 border-emerald-500/30" : "text-rose-400 border-rose-500/30"
                                            )}>
                                                {policy.category === 'finance' ? '金融' : '政策'}
                                            </Badge>
                                            <span className={cn(
                                                "font-medium",
                                                policy.impact === 'high' ? "text-white" : "text-zinc-400"
                                            )}>
                                                {policy.title}
                                            </span>
                                        </div>
                                        <div className="col-span-4 text-zinc-300">
                                            {policy.change_content ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
                                                    {policy.change_content}
                                                </div>
                                            ) : (
                                                <span className="text-zinc-600 italic">--</span>
                                            )}
                                        </div>
                                        <div className="col-span-3 text-zinc-400">
                                            {policy.affected_scope || <span className="text-zinc-600 italic">--</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card >
    );
}
