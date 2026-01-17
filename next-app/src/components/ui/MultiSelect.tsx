import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { cn } from "@/lib/utils";
import { X, Check } from "lucide-react";

export interface MultiSelectOption {
    label: string;
    value: string;
    group?: string;
    details?: {
        county?: string;
        district?: string;
        date?: string;
    }
}

interface MultiSelectProps {
    options: MultiSelectOption[];
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    maxItems?: number;
    disabled?: boolean;
    className?: string;
    onSearch?: (query: string) => void;
    loading?: boolean;
}

const MultiSelect = forwardRef<HTMLDivElement, MultiSelectProps>(({
    options,
    value,
    onChange,
    placeholder = "Select...",
    maxItems,
    disabled = false,
    className,
    onSearch,
    loading = false
}, ref) => {
    const [inputValue, setInputValue] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filter options based on input if onSearch is not provided (client-side filtering)
    const filteredOptions = onSearch
        ? options
        : options.filter(option =>
            option.label.toLowerCase().includes(inputValue.toLowerCase())
        );

    const handleSelect = (optionValue: string) => {
        if (value.includes(optionValue)) {
            onChange(value.filter(v => v !== optionValue));
        } else {
            if (maxItems && value.length >= maxItems) return;
            onChange([...value, optionValue]);
        }
        setInputValue("");
    };

    const handleRemove = (optionValue: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(value.filter(v => v !== optionValue));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
            onChange(value.slice(0, -1));
        }
    };

    const selectedLabels = value.map(v => {
        // Try to find label in options, or fallback to value if not found (e.g. initial load)
        const option = options.find(o => o.value === v);
        return option ? option.label : v;
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (onSearch) {
            onSearch(inputValue);
        }
    }, [inputValue, onSearch]);

    return (
        <div className={cn("relative w-full", className)} ref={containerRef}>
            <div
                className={cn(
                    "flex items-center gap-2 bg-zinc-950/50 border border-input rounded-md px-2 py-1.5 h-[42px] overflow-x-auto custom-scrollbar cursor-text transition-all",
                    isOpen && "ring-2 ring-ring ring-offset-0 border-ring",
                    disabled && "bg-zinc-900/50 cursor-not-allowed opacity-50"
                )}
                onClick={() => !disabled && inputRef.current?.focus()}
            >
                {value.map((v) => {

                    // Find label logic again for render
                    const option = options.find(o => o.value === v);
                    const label = option ? option.label : v;

                    return (
                        <span key={v} className="bg-violet-500/20 text-violet-200 border border-violet-500/30 text-xs rounded-full px-2 py-0.5 flex items-center gap-1 animate-in fade-in zoom-in-95 duration-100 whitespace-nowrap shrink-0">
                            {label}
                            {!disabled && (
                                <X
                                    size={12}
                                    className="cursor-pointer hover:text-white transition-colors"
                                    onClick={(e) => handleRemove(v, e)}
                                />
                            )}
                        </span>
                    );
                })}

                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={value.length === 0 ? placeholder : ""}
                    className={cn(
                        "bg-transparent outline-none flex-grow min-w-[60px] text-zinc-100 placeholder:text-zinc-500 text-sm",
                        disabled && "cursor-not-allowed"
                    )}
                    disabled={disabled}
                />
            </div>

            {
                isOpen && !disabled && (
                    <div className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-md shadow-xl max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-100">
                        {loading ? (
                            <div className="p-2 text-center text-zinc-500 text-sm">Loading...</div>
                        ) : filteredOptions.length === 0 ? (
                            <div className="p-2 text-center text-zinc-500 text-sm">No options found</div>
                        ) : (
                            filteredOptions.map((option, index) => {
                                const showHeader = index === 0 || option.group !== filteredOptions[index - 1].group;
                                return (
                                    <React.Fragment key={option.value}>
                                        {showHeader && option.group && (
                                            <div className="px-2 py-1 bg-zinc-800/50 text-xs font-semibold text-zinc-400 sticky top-0 backdrop-blur-sm z-10">
                                                {option.group}
                                            </div>
                                        )}
                                        <div
                                            className={cn(
                                                "px-3 py-2 cursor-pointer text-sm flex items-start justify-between hover:bg-zinc-800 transition-colors",
                                                value.includes(option.value) && "bg-violet-500/10 text-violet-400"
                                            )}
                                            onClick={() => handleSelect(option.value)}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-medium">{option.label}</span>
                                                {option.details && (
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        {(option.details.county || option.details.district) && (
                                                            <span className="text-xs text-zinc-500 bg-zinc-800/80 px-1.5 rounded border border-zinc-700">
                                                                {option.details.county}{option.details.district}
                                                            </span>
                                                        )}
                                                        {option.details.date && (
                                                            <span className="text-xs text-zinc-600 font-mono">
                                                                {option.details.date.substring(0, 7)}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {value.includes(option.value) && <Check size={16} className="mt-1" />}
                                        </div>
                                    </React.Fragment>
                                );
                            })
                        )}
                    </div>
                )
            }
        </div >
    );
});

MultiSelect.displayName = "MultiSelect";
export { MultiSelect };
