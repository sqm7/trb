import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from './card';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, className, maxWidth = 'max-w-4xl' }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={onClose} />
            <Card
                className={cn(
                    "relative w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200",
                    maxWidth,
                    className
                )}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-border-default">
                    {title && <h2 className="text-2xl font-bold text-white">{title}</h2>}
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </Card>
        </div>
    );
}
