'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Upload, Ruler, Spline, Move, Trash2, RotateCcw, ZoomIn, ZoomOut, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Constants
const PING_FACTOR = 33057.9; // 1 Ping = 33057.9 cm^2 approx (generic formulation)

type Point = { x: number; y: number };
type Line = { type: 'line'; pixelStart: Point; pixelEnd: Point; color: string; };
type Area = { type: 'area'; pixelPoints: Point[]; fillColor: string; fillOpacity: number; };
type DrawingObject = Line | Area;
type Mode = 'setScale' | 'measureLine' | 'measureArea' | 'moveDrawing' | null;

export default function FloorPlanCanvas() {
    // Refs for Canvas Logic (Mutable state without re-render)
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    // Core State (Refs)
    const state = useRef({
        zoomLevel: 1,
        panOffset: { x: 0, y: 0 },
        isPanning: false,
        panStart: { x: 0, y: 0 },
        drawing: false,
        startPoint: { x: 0, y: 0 } as Point,
        endPoint: { x: 0, y: 0 } as Point,
        areaPoints: [] as Point[],
        lines: [] as Line[],
        areas: [] as Area[],
        scale: null as number | null, // pixels per cm
        selectedObject: null as DrawingObject | null,
        draggingHandle: null as Point | null,
        dragStartMouse: { x: 0, y: 0 },
        originalSelectedObjectState: null as any,
        lastMouseScreenPos: { x: 0, y: 0 },
        isSpacePressed: false,
        isShiftPressed: false,
        snappedPoint: null as Point | null,
        isOrthoMode: false, // Strict straight line mode
    });

    // UI React State
    const [uiState, setUiState] = useState({
        mode: null as Mode,
        hasImage: false,
        scaleSet: false,
        selectedObject: false,
        infoText: '請上傳平面圖開始',
        fillColor: '#4ade80',
        fillOpacity: 0.3,
        zoomDisplay: 100,
        isOrtho: false // UI toggle state
    });

    // --- Helpers ---
    const screenToWorld = (p: Point) => ({
        x: (p.x - state.current.panOffset.x) / state.current.zoomLevel,
        y: (p.y - state.current.panOffset.y) / state.current.zoomLevel
    });

    const worldToScreen = (p: Point) => ({
        x: p.x * state.current.zoomLevel + state.current.panOffset.x,
        y: p.y * state.current.zoomLevel + state.current.panOffset.y
    });

    const calculateDistance = (p1: Point, p2: Point) => Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);

    const calculatePolygonArea = (vertices: Point[]) => {
        let total = 0;
        for (let i = 0, l = vertices.length; i < l; i++) {
            const addX = vertices[i].x;
            const addY = vertices[i === l - 1 ? 0 : i + 1].y;
            const subX = vertices[i === l - 1 ? 0 : i + 1].x;
            const subY = vertices[i].y;
            total += (addX * addY - subX * subY);
        }
        return Math.abs(total / 2);
    };

    const getPolygonCentroid = (vertices: Point[]) => {
        if (vertices.length === 0) return { x: 0, y: 0 };
        let x = 0, y = 0, signedArea = 0;
        for (let i = 0; i < vertices.length; i++) {
            const p1 = vertices[i];
            const p2 = vertices[(i + 1) % vertices.length];
            const a = p1.x * p2.y - p2.x * p1.y;
            signedArea += a;
            x += (p1.x + p2.x) * a;
            y += (p1.y + p2.y) * a;
        }
        const finalSignedArea = signedArea * 3;
        if (finalSignedArea === 0) return vertices[0];
        return { x: x / finalSignedArea, y: y / finalSignedArea };
    };

    // --- Drawing Logic ---
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const s = state.current;
        const { width, height } = canvas;

        // Clear
        ctx.clearRect(0, 0, width, height);

        ctx.save();
        ctx.translate(s.panOffset.x, s.panOffset.y);
        ctx.scale(s.zoomLevel, s.zoomLevel);

        // Draw Image
        if (imageRef.current) {
            const img = imageRef.current;
            ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
        }

        // Draw Objects
        const handleSize = 8 / s.zoomLevel;
        const lineWidth = 2 / s.zoomLevel;
        const selectedLineWidth = 3.5 / s.zoomLevel;

        // Areas
        s.areas.forEach(area => {
            const isSelected = s.selectedObject === area;
            if (area.pixelPoints.length < 2) return;

            ctx.beginPath();
            ctx.moveTo(area.pixelPoints[0].x, area.pixelPoints[0].y);
            for (let i = 1; i < area.pixelPoints.length; i++) ctx.lineTo(area.pixelPoints[i].x, area.pixelPoints[i].y);
            ctx.closePath();

            // Fill
            ctx.fillStyle = hexToRgba(area.fillColor, area.fillOpacity);
            ctx.fill();

            // Stroke
            ctx.strokeStyle = isSelected ? '#06b6d4' : '#3b82f6';
            ctx.lineWidth = isSelected ? selectedLineWidth : lineWidth;
            ctx.stroke();

            // Label
            if (s.scale) {
                const areaCm2 = calculatePolygonArea(area.pixelPoints) / (s.scale * s.scale);
                const areaPing = areaCm2 / PING_FACTOR;
                const centroid = getPolygonCentroid(area.pixelPoints);
                drawLabel(ctx, `${areaPing.toFixed(2)} 坪`, centroid, isSelected ? '#06b6d4' : '#60a5fa', s.zoomLevel);
            }
        });

        // Lines
        s.lines.forEach(line => {
            const isSelected = s.selectedObject === line;
            ctx.beginPath();
            ctx.moveTo(line.pixelStart.x, line.pixelStart.y);
            ctx.lineTo(line.pixelEnd.x, line.pixelEnd.y);
            ctx.strokeStyle = isSelected ? '#06b6d4' : line.color;
            ctx.lineWidth = isSelected ? selectedLineWidth : lineWidth;
            ctx.stroke();

            // Label
            if (s.scale) {
                const lenCm = calculateDistance(line.pixelStart, line.pixelEnd) / s.scale;
                const mid = { x: (line.pixelStart.x + line.pixelEnd.x) / 2, y: (line.pixelStart.y + line.pixelEnd.y) / 2 };
                drawLabel(ctx, `${lenCm.toFixed(1)} cm`, mid, isSelected ? '#06b6d4' : '#f87171', s.zoomLevel);
            }
        });

        // Temporary Drawing
        if (s.drawing) {
            if (uiState.mode === 'setScale' || uiState.mode === 'measureLine') {
                ctx.beginPath();
                ctx.moveTo(s.startPoint.x, s.startPoint.y);
                ctx.lineTo(s.endPoint.x, s.endPoint.y);
                ctx.strokeStyle = '#ef4444'; // Red for temp
                ctx.lineWidth = 2 / s.zoomLevel;
                ctx.stroke();
            } else if (uiState.mode === 'measureArea' && s.areaPoints.length > 0) {
                ctx.beginPath();
                ctx.moveTo(s.areaPoints[0].x, s.areaPoints[0].y);
                for (let i = 1; i < s.areaPoints.length; i++) ctx.lineTo(s.areaPoints[i].x, s.areaPoints[i].y);
                ctx.lineTo(s.endPoint.x, s.endPoint.y); // Dynamic line to mouse
                ctx.fillStyle = hexToRgba(uiState.fillColor, 0.2); // Preview fill
                ctx.fill();
                ctx.strokeStyle = '#3b82f6';
                ctx.lineWidth = 2 / s.zoomLevel;
                ctx.stroke();
            }
        }

        ctx.restore();

        // Draw Snapped Indicator (Screen Space)
        if (s.snappedPoint) {
            const screenPos = worldToScreen(s.snappedPoint);
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, 6, 0, Math.PI * 2);
            ctx.strokeStyle = '#facc15'; // Yellow
            ctx.lineWidth = 2;
            ctx.stroke();
        }

    }, [uiState]);

    const drawLabel = (ctx: CanvasRenderingContext2D, text: string, pos: Point, color: string, zoom: number) => {
        ctx.save();
        const fontSize = 14 / zoom;
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = 'rgba(0,0,0,0.7)'; // Bg for text visibility
        const width = ctx.measureText(text).width;
        ctx.fillRect(pos.x - width / 2 - 2 / zoom, pos.y - fontSize - 2 / zoom, width + 4 / zoom, fontSize + 4 / zoom);

        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.fillText(text, pos.x, pos.y - (4 / zoom));
        ctx.restore();
    };

    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // --- Ortho Logic ---
    const applyOrthoConstraint = (start: Point, current: Point) => {
        const dx = Math.abs(current.x - start.x);
        const dy = Math.abs(current.y - start.y);
        if (dx > dy) return { x: current.x, y: start.y };
        return { x: start.x, y: current.y };
    };

    // --- Interaction Handlers ---
    useEffect(() => {
        state.current.isOrthoMode = uiState.isOrtho;
        draw();
    }, [uiState, draw]);

    const finishArea = useCallback(() => {
        const s = state.current;
        if (s.areaPoints.length >= 3) {
            s.areas.push({
                type: 'area',
                pixelPoints: [...s.areaPoints],
                fillColor: uiState.fillColor,
                fillOpacity: uiState.fillOpacity
            });
            s.areaPoints = [];
            s.drawing = false;
            setUiState(prev => ({ ...prev, infoText: `區域繪製完成。${s.areas.length} 個區域` }));
            // Force redraw is handled by setUiState implicitly or explicit draw
            // But since setUiState is async, let's draw immediately too
            // Note: draw() inside setUiState callback or useEffect is safer but standard draw here works for immediate canvas update
        } else {
            s.areaPoints = [];
            s.drawing = false;
            setUiState(prev => ({ ...prev, infoText: `點數不足，已取消區域` }));
        }
        draw();
    }, [draw, uiState.fillColor, uiState.fillOpacity]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Shift') state.current.isShiftPressed = true;
            if (e.code === 'Space') state.current.isSpacePressed = true;
            if (e.code === 'Enter') {
                if (uiState.mode === 'measureArea') finishArea();
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Shift') state.current.isShiftPressed = false;
            if (e.code === 'Space') state.current.isSpacePressed = false;
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [finishArea, uiState.mode]); // Re-bind when finishArea or mode changes

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                imageRef.current = img;
                state.current.panOffset = { x: (canvasRef.current?.width || 0) / 2, y: (canvasRef.current?.height || 0) / 2 };

                // Fit to screen logic
                const canvas = canvasRef.current;
                if (canvas) {
                    const hRatio = canvas.width / img.naturalWidth;
                    const vRatio = canvas.height / img.naturalHeight;
                    state.current.zoomLevel = Math.min(hRatio, vRatio) * 0.9;
                }

                setUiState(prev => ({ ...prev, hasImage: true, infoText: '圖片已載入。請設定比例尺 (Step 1)。' }));
                draw();
            };
            img.src = ev.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    // --- Main Event Loop Logic (MouseDown/Move/Up) ---
    // Note: Attached to canvas in render

    const handleMouseDown = (e: React.MouseEvent) => {
        const s = state.current;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const worldPos = screenToWorld({ x: mouseX, y: mouseY });

        if (e.button !== 0) return; // Only left click

        // Spacebar Panning Mode
        if (s.isSpacePressed) {
            s.isPanning = true;
            s.panStart = { x: e.clientX, y: e.clientY };
            return;
        }

        // Tool Logic
        s.startPoint = s.snappedPoint ? { ...s.snappedPoint } : worldPos;

        if (uiState.mode === 'measureArea') {
            s.drawing = true;
            s.areaPoints.push(s.startPoint);
            s.endPoint = { ...s.startPoint }; // Init end point for preview line
        } else if (uiState.mode === 'moveDrawing') {
            // Logic for selecting object (Simplified for brevity: assume click on object center)
            const found = findObjectAt(worldPos);
            if (found) {
                s.selectedObject = found;
                setUiState(prev => ({ ...prev, selectedObject: true }));
            } else {
                s.selectedObject = null;
                setUiState(prev => ({ ...prev, selectedObject: false }));
            }
        } else if (uiState.mode) {
            // Measure Line or Set Scale
            s.drawing = true;
            s.endPoint = { ...s.startPoint };
        }

        draw();
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const s = state.current;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Panning
        if (s.isPanning) {
            const dx = e.clientX - s.panStart.x;
            const dy = e.clientY - s.panStart.y;
            s.panOffset.x += dx;
            s.panOffset.y += dy;
            s.panStart = { x: e.clientX, y: e.clientY };
            draw();
            return;
        }

        // Logic
        const worldPos = screenToWorld({ x: mouseX, y: mouseY });

        // Snap Check (Snap to existing points)
        checkForSnap(worldPos);

        // Update temporary end point with Ortho Check
        let finalPos = s.snappedPoint ? { ...s.snappedPoint } : worldPos;

        if (s.drawing && (s.isShiftPressed || s.isOrthoMode)) {
            // Constrain based on start point (or last area point)
            let refPoint = s.startPoint;
            if (uiState.mode === 'measureArea' && s.areaPoints.length > 0) {
                refPoint = s.areaPoints[s.areaPoints.length - 1];
            }
            finalPos = applyOrthoConstraint(refPoint, finalPos);
        }

        s.endPoint = finalPos;

        if (s.drawing) {
            draw();
        } else {
            // Just update cursor/snap indicator
            draw();
        }
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        const s = state.current;
        if (s.isPanning) {
            s.isPanning = false;
            return;
        }

        if (!s.drawing) return;
        if (uiState.mode === 'measureArea') {
            // Check for closing loop (clicking near start point)
            if (s.areaPoints.length >= 2) { // Need at least 2 points to form a triangle with the new point
                const startPoint = s.areaPoints[0];
                const threshold = 15 / s.zoomLevel;
                if (calculateDistance(s.endPoint, startPoint) < threshold) {
                    // Snap to start and finish
                    // Note: We don't add the current s.endPoint as a distinct point if it's basically the start point
                    // We just close the loop.
                    finishArea();
                    return;
                }
            }
            return; // Area points added on MouseDown, MouseUp just checks for completion
        }

        // Finish Line/Scale
        const dist = calculateDistance(s.startPoint, s.endPoint);
        if (dist < 1 / s.zoomLevel) return; // Too short, ignore

        if (uiState.mode === 'setScale') {
            const realCm = parseFloat(prompt("請輸入這段距離的實際長度(公分) e.g. 100", "100") || "");
            if (realCm > 0) {
                s.scale = dist / realCm;
                // Add reference line
                s.lines.push({ type: 'line', pixelStart: s.startPoint, pixelEnd: s.endPoint, color: '#06b6d4' });
                setUiState(prev => ({ ...prev, scaleSet: true, mode: null, infoText: `比例尺已設定: ${(s.scale || 0).toFixed(2)} px/cm` }));
            }
        } else if (uiState.mode === 'measureLine' && s.scale) {
            s.lines.push({ type: 'line', pixelStart: s.startPoint, pixelEnd: s.endPoint, color: '#facc15' });
        }

        s.drawing = false;
        draw();
    };

    const handleRightClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const s = state.current;
        if (uiState.mode === 'measureArea') {
            finishArea();
        } else {
            // Cancel current operation
            s.areaPoints = [];
            s.drawing = false;
            draw();
        }
    };

    // --- Spatial Logic Helper ---
    const checkForSnap = (pos: Point) => {
        const s = state.current;
        const threshold = 15 / s.zoomLevel;
        let bestDist = threshold;
        let found: Point | null = null;

        const check = (p: Point) => {
            const d = calculateDistance(pos, p);
            if (d < bestDist) {
                bestDist = d;
                found = p;
            }
        };

        s.lines.forEach(l => { check(l.pixelStart); check(l.pixelEnd); });
        s.areas.forEach(a => a.pixelPoints.forEach(p => check(p)));
        s.areaPoints.forEach(p => check(p));

        s.snappedPoint = found;
    };

    const findObjectAt = (pos: Point): DrawingObject | null => {
        const s = state.current;
        const threshold = 10 / s.zoomLevel;
        // Check areas first
        // Simple bounding box or ray casting for polygons? Let's implement ray casting later if needed
        // For now, check if point is "near" any vertex or centroid (Simplified for initial version)
        // ... Implementing a simple "near vertex" check for selection
        for (const area of s.areas) {
            for (const p of area.pixelPoints) {
                if (calculateDistance(pos, p) < threshold) return area;
            }
        }
        for (const line of s.lines) {
            if (calculateDistance(pos, line.pixelStart) < threshold) return line;
            if (calculateDistance(pos, line.pixelEnd) < threshold) return line;
        }
        return null; // TODO: Better hit testing
    };

    // --- Window Events ---
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current && canvasRef.current) {
                canvasRef.current.width = containerRef.current.clientWidth;
                canvasRef.current.height = containerRef.current.clientHeight;
                draw();
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize(); // Init

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') state.current.isSpacePressed = true;
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') state.current.isSpacePressed = false;
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [draw]);


    return (
        <div className="flex flex-col h-full w-full gap-4 relative" ref={containerRef}>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 p-2 bg-zinc-900/80 backdrop-blur border border-white/5 rounded-xl z-10 w-full lg:w-max lg:absolute lg:top-4 lg:left-1/2 lg:-translate-x-1/2 shadow-xl">

                {/* File input hidden */}
                <input type="file" id="fp-upload" className="hidden" accept="image/*" onChange={handleFileUpload} />

                <label htmlFor="fp-upload" className="p-2 hover:bg-zinc-800 rounded-lg cursor-pointer text-zinc-400 hover:text-white transition-colors" title="上傳圖片">
                    <Upload className="h-5 w-5" />
                </label>

                <div className="h-6 w-px bg-white/10 mx-1" />

                <button
                    onClick={() => setUiState(p => ({ ...p, mode: 'setScale' }))}
                    className={cn("p-2 rounded-lg transition-colors flex items-center gap-2", uiState.mode === 'setScale' ? "bg-cyan-600 text-white" : "text-zinc-400 hover:bg-zinc-800")}
                    disabled={!uiState.hasImage}
                    title="1. 設定比例尺"
                >
                    <Move className="h-5 w-5 rotate-45" />
                    <span className="text-xs font-bold hidden lg:block">比例尺</span>
                </button>

                <button
                    onClick={() => setUiState(p => ({ ...p, mode: 'measureLine' }))}
                    className={cn("p-2 rounded-lg transition-colors flex items-center gap-2", uiState.mode === 'measureLine' ? "bg-cyan-600 text-white" : "text-zinc-400 hover:bg-zinc-800")}
                    disabled={!uiState.scaleSet}
                    title="2. 測量長度"
                >
                    <Ruler className="h-5 w-5" />
                    <span className="text-xs font-bold hidden lg:block">測距</span>
                </button>

                <button
                    onClick={() => setUiState(p => ({ ...p, mode: 'measureArea' }))}
                    className={cn("p-2 rounded-lg transition-colors flex items-center gap-2", uiState.mode === 'measureArea' ? "bg-cyan-600 text-white" : "text-zinc-400 hover:bg-zinc-800")}
                    disabled={!uiState.scaleSet}
                    title="3. 測量面積"
                >
                    <Spline className="h-5 w-5" />
                    <span className="text-xs font-bold hidden lg:block">面積</span>
                </button>

                <div className="h-6 w-px bg-white/10 mx-1" />

                <button
                    onClick={() => setUiState(p => ({ ...p, isOrtho: !p.isOrtho }))}
                    className={cn("p-2 rounded-lg transition-colors flex items-center gap-2", uiState.isOrtho ? "bg-purple-600 text-white" : "text-zinc-400 hover:bg-zinc-800")}
                    title="垂直/水平鎖定 (Shift)"
                >
                    <Move className="h-5 w-5" />
                    <span className="text-xs font-bold hidden lg:block">正交</span>
                </button>

                <div className="h-6 w-px bg-white/10 mx-1" />

                <button
                    onClick={() => {
                        if (confirm('清除所有繪製？')) {
                            state.current.lines = [];
                            state.current.areas = [];
                            state.current.scale = null;
                            setUiState(p => ({ ...p, scaleSet: false, infoText: '已清除，請重新設定比例尺' }));
                            draw();
                        }
                    }}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="全部清除"
                >
                    <Trash2 className="h-5 w-5" />
                </button>

            </div>

            {/* Info Bar */}
            <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full border border-white/10 text-xs text-zinc-300">
                {uiState.infoText}
            </div>

            {/* Canvas */}
            <canvas
                ref={canvasRef}
                className={cn("w-full h-full bg-zinc-950 cursor-crosshair touch-none", state.current.isPanning ? 'cursor-grab active:cursor-grabbing' : '')}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onContextMenu={handleRightClick}
            />

            {/* Help Overlay for interaction */}
            <div className="absolute bottom-4 left-4 text-[10px] text-zinc-500 pointer-events-none bg-black/40 p-2 rounded-lg backdrop-blur-sm border border-white/5">
                <p>左鍵: 繪圖 | 右鍵/Enter: 結束區域 | Shift: 正交模式 | 空白鍵: 平移</p>
            </div>

        </div>
    );
}
