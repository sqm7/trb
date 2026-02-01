
import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Search, Check, Trash2 } from "lucide-react";

interface ProjectSearchMultiselectProps {
    projects: { value: string, label: string }[];
    className?: string;
    onChange: (values: string[]) => void;
    max?: number;
    placeholder?: string;
    title?: string;
}

export function ProjectSearchMultiselect({
    projects,
    className,
    onChange,
    max = 6,
    placeholder = "搜尋並加入比較...",
    title = "建案亮點標示"
}: ProjectSearchMultiselectProps) {
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filtered = projects.filter(p =>
        !selected.includes(p.value) &&
        p.label.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);

    const handleSelect = (value: string) => {
        if (selected.length >= max) return;
        const newSelected = [...selected, value];
        setSelected(newSelected);
        onChange(newSelected);
        setQuery("");
        // Keep open for multi-select
        inputRef.current?.focus();
    };

    const handleRemove = (value: string) => {
        const newSelected = selected.filter(s => s !== value);
        setSelected(newSelected);
        onChange(newSelected);
    };

    const handleClearAll = () => {
        setSelected([]);
        onChange([]);
        inputRef.current?.focus();
    };

    return (
        <div className={cn("space-y-2", className)} ref={wrapperRef}>
            <div className="flex justify-between items-center bg-zinc-900/50 p-1 rounded-lg border border-white/5">
                <h4 className="text-sm font-medium text-zinc-400 pl-2 border-l-2 border-yellow-500">{title} <span className="text-xs font-normal text-zinc-600">(最多 {max} 個)</span></h4>
                {selected.length > 0 && (
                    <button
                        onClick={handleClearAll}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors flex items-center gap-1 text-xs"
                        title="清除所有選擇"
                    >
                        <Trash2 size={14} />
                        清除
                    </button>
                )}
            </div>

            {/* Selected Tags */}
            <div className="flex flex-wrap gap-2 min-h-[32px]">
                {selected.length === 0 && <span className="text-xs text-zinc-600 italic py-1">尚未選擇建案...</span>}
                {selected.map(val => (
                    <div key={val} className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded text-xs border border-yellow-500/30">
                        <span>{val}</span>
                        <button onClick={() => handleRemove(val)} className="hover:text-yellow-300">
                            <Check size={12} className="rotate-45" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full bg-zinc-900/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                    disabled={selected.length >= max}
                />

                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                        {filtered.length > 0 ? (
                            filtered.map(p => (
                                <button
                                    key={p.value}
                                    onClick={() => handleSelect(p.value)}
                                    className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                                >
                                    {p.label}
                                </button>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-sm text-zinc-600">無相關建案</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
