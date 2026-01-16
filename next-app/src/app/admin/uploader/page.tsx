'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { scanDirectory, FileInfo } from '@/lib/file-handler';
import {
    uploadMainFileWithSmartUpdate,
    uploadSubFile,
    resetUploaderState,
    getProjectNameMappings,
    getUploadSummary,
    UploadSummary
} from '@/lib/uploader-service';
import { useRouter } from 'next/navigation';

interface LogEntry {
    id: number;
    text: string;
    type: 'info' | 'success' | 'warning' | 'error';
    time: string;
}

export default function UploaderPage() {
    const router = useRouter();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [files, setFiles] = useState<FileInfo[]>([]);
    const [uploadType, setUploadType] = useState('all');
    const [currentFile, setCurrentFile] = useState('');
    const [progress, setProgress] = useState(0);
    const [summary, setSummary] = useState<UploadSummary | null>(null);

    // Database Config State
    const [dbUrl, setDbUrl] = useState('');
    const [dbKey, setDbKey] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    // Initial Auth Check (Optional - relax requirement)
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            // If logged in, maybe pre-fill or just show connected status if we assume env vars?
            // For now, we follow legacy: require manual input or use env vars as default if available
            // We do NOT pre-fill the Service Role Key nor the URL for security/privacy reasons.
            // Users must paste it manually to ensure it's not exposed in client-side code.
            // if (process.env.NEXT_PUBLIC_SUPABASE_URL) setDbUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
        };
        checkAuth();
    }, []);

    const addLog = (text: string, type: 'info' | 'success' | 'warning' | 'error') => {
        const time = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { id: Date.now() + Math.random(), text, type, time }]);
    };

    const handleTestConnection = async () => {
        if (!dbUrl || !dbKey) {
            addLog('請填寫完整的 Supabase URL 和 Service Role Key。', 'error');
            return;
        }
        addLog('正在測試連線...', 'info');
        try {
            // Re-initialize client with manual keys if needed, or just test current
            // Here we might need to dynamically create a client if we want to support custom keys
            // For this version, let's assume we update the global client or just verify connectivity
            // Note: In a real "custom key" scenario, we'd need a way to pass this client to the service
            // For now, purely purely testing reachability:
            const { error } = await supabase.from('county_codes').select('code', { count: 'exact', head: true });

            // Legacy code ignores 42P01 (undefined table) as success? 
            // "if (error && error.code !== '42P01') throw error;"

            if (error && error.code !== '42P01') throw error;

            addLog('連線成功！', 'success');
            setIsConnected(true);

            // Load mappings
            getProjectNameMappings((msg, type) => addLog(msg, type));

        } catch (error: any) {
            addLog(`連線失敗: ${error.message}`, 'error');
            setIsConnected(false);
        }
    };

    const handleSelectFolders = async () => {
        setLogs([]);
        setFiles([]);
        setSummary(null);

        try {
            // @ts-ignore - showDirectoryPicker is experimental
            if (!window.showDirectoryPicker) {
                addLog('您的瀏覽器不支援資料夾選擇功能，請使用 Chrome 或 Edge。', 'error');
                return;
            }

            addLog('正在掃描資料夾...', 'info');
            // @ts-ignore
            const dirHandle = await window.showDirectoryPicker();
            const scannedFiles = await scanDirectory(dirHandle);

            if (scannedFiles.length === 0) {
                addLog('在選擇的資料夾中沒有找到符合命名規則的檔案。', 'warning');
                return;
            }

            setFiles(scannedFiles);
            addLog(`掃描完成！找到 ${scannedFiles.length} 個有效檔案。`, 'success');
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                addLog(`選擇資料夾時發生錯誤: ${err.message}`, 'error');
            }
        }
    };

    const handleStartUpload = async () => {
        if (files.length === 0) return;
        if (!isConnected) {
            addLog('請先確認資料庫連線成功。', 'error');
            return;
        }

        setIsUploading(true);
        resetUploaderState();
        setLogs([]);

        addLog('開始上傳任務...', 'info');

        const typeNameMap: Record<string, string> = { 'all': '全選', 'a': '中古', 'b': '預售', 'c': '租賃' };
        let filesToUpload = files;
        if (uploadType !== 'all') {
            filesToUpload = files.filter(file => file.tableType.startsWith(uploadType));
        }

        if (filesToUpload.length === 0) {
            addLog(`找不到符合「${typeNameMap[uploadType]}」類型的檔案...`, 'warning');
            setIsUploading(false);
            return;
        }

        const mainTables = filesToUpload.filter(f => f.isMain);
        const subTables = filesToUpload.filter(f => !f.isMain);

        // Phase 1: Main Tables
        addLog(`--- 階段 1: 主表 (智慧更新) ---`, 'info');
        for (let i = 0; i < mainTables.length; i++) {
            const file = mainTables[i];
            setCurrentFile(file.fullPath);
            setProgress(Math.round(((i) / mainTables.length) * 100));
            await uploadMainFileWithSmartUpdate(file, addLog);
        }

        // Phase 2: Sub Tables
        addLog(`--- 階段 2: 附表 (智慧連動) ---`, 'info');
        for (let i = 0; i < subTables.length; i++) {
            const file = subTables[i];
            setCurrentFile(file.fullPath);
            setProgress(Math.round(((i) / subTables.length) * 100));
            await uploadSubFile(file, addLog);
        }

        setCurrentFile('');
        setProgress(100);

        const finalSummary = getUploadSummary();
        setSummary(finalSummary);
        addLog(`所有檔案處理完成！新增: ${finalSummary.new}, 更新: ${finalSummary.updated}, 錯誤: ${finalSummary.errors}`, 'success');

        setIsUploading(false);
    };

    return (
        <div className="min-h-screen bg-[#1a1d29] text-gray-100 p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-center bg-[#252836] p-6 rounded-xl border border-gray-700 shadow-lg">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">平米內參 <span className="text-cyan-400">資料上傳工具</span></h1>
                        <p className="text-gray-400 mt-2 text-sm">高效能、智慧化的實價登錄資料批次處理系統 v2.0 (Next.js)</p>
                    </div>
                    <button onClick={() => router.push('/')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                        <i className="fas fa-arrow-left" /> 返回儀表板
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Settings */}
                    <div className="space-y-6">
                        {/* 1. Database Connection */}
                        <div className="bg-[#252836] p-6 rounded-xl border border-gray-700 shadow-lg">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                                <span className="bg-cyan-900 text-cyan-400 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                                資料庫連線
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Supabase URL</label>
                                    <input
                                        type="text"
                                        value={dbUrl}
                                        onChange={(e) => setDbUrl(e.target.value)}
                                        className="w-full bg-gray-800 border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500 placeholder-gray-600"
                                        placeholder="https://xyz.supabase.co"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Service Role Key</label>
                                    <input
                                        type="password"
                                        value={dbKey}
                                        onChange={(e) => setDbKey(e.target.value)}
                                        className="w-full bg-gray-800 border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500 placeholder-gray-600"
                                        placeholder="eyJhhGciOiJIUzI1NiIsInR5cCI..."
                                    />
                                </div>
                                <button
                                    onClick={handleTestConnection}
                                    className={`w-full font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${isConnected
                                        ? 'bg-green-600 hover:bg-green-500 text-white cursor-default'
                                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                                        }`}
                                >
                                    {isConnected ? <><i className="fas fa-check" /> 連線成功</> : '測試連線'}
                                </button>
                            </div>
                        </div>

                        {/* 2. Folder Selection */}
                        <div className="bg-[#252836] p-6 rounded-xl border border-gray-700 shadow-lg">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                                <span className="bg-cyan-900 text-cyan-400 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                                選擇資料來源
                            </h2>
                            <button
                                onClick={handleSelectFolders}
                                disabled={isUploading}
                                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <i className="fas fa-folder-open text-xl" /> 選擇 lvr_land 資料夾
                            </button>
                            {files.length > 0 && (
                                <div className="mt-4 p-3 bg-gray-800/50 rounded-lg text-sm">
                                    <div className="flex justify-between text-gray-300 mb-1">
                                        <span>已找到檔案:</span>
                                        <span className="font-bold text-white">{files.length} 個</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400 text-xs">
                                        <span>主表 (Main):</span>
                                        <span>{files.filter(f => f.isMain).length}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400 text-xs">
                                        <span>附表 (Sub):</span>
                                        <span>{files.filter(f => !f.isMain).length}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 3. Upload Action */}
                        <div className="bg-[#252836] p-6 rounded-xl border border-gray-700 shadow-lg">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                                <span className="bg-cyan-900 text-cyan-400 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">3</span>
                                開始處理
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">上傳類型</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['all', 'a', 'b', 'c'].map(type => (
                                            <label key={type} className={`cursor-pointer border rounded-lg p-2 text-center transition-all ${uploadType === type
                                                ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400'
                                                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                                                }`}>
                                                <input
                                                    type="radio"
                                                    name="uploadType"
                                                    value={type}
                                                    checked={uploadType === type}
                                                    onChange={(e) => setUploadType(e.target.value)}
                                                    className="sr-only"
                                                    disabled={isUploading}
                                                />
                                                <span className="font-bold">{type === 'all' ? '全部' : type === 'a' ? '中古' : type === 'b' ? '預售' : '租賃'}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={handleStartUpload}
                                    disabled={!isConnected || files.length === 0 || isUploading}
                                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isUploading ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-rocket" />}
                                    {isUploading ? '處理中...' : '開始上傳'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Console & Visuals */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Progress Area */}
                        <div className="bg-[#252836] p-6 rounded-xl border border-gray-700 shadow-lg">
                            <h3 className="text-gray-300 font-bold mb-4 flex justify-between items-center">
                                <span><i className="fas fa-tasks mr-2 text-purple-400" />執行進度</span>
                                {isUploading && <span className="text-cyan-400">{progress}%</span>}
                            </h3>
                            <div className="w-full bg-gray-700 rounded-full h-4 mb-2 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-cyan-500 to-purple-500 h-4 rounded-full transition-all duration-300 relative"
                                    style={{ width: `${progress}%` }}
                                >
                                    {isUploading && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
                                </div>
                            </div>
                            <div className="text-xs text-gray-500 h-5">
                                {currentFile && `正在處理: ${currentFile}`}
                            </div>
                        </div>

                        {/* Console */}
                        <div className="bg-black/60 p-4 rounded-xl border border-gray-800 h-[500px] overflow-hidden flex flex-col font-mono text-sm shadow-inner">
                            <div className="flex justify-between items-center mb-2 border-b border-gray-800 pb-2">
                                <span className="text-gray-400 font-bold"><i className="fas fa-terminal mr-2" />系統日誌</span>
                                <button onClick={() => setLogs([])} className="text-xs text-gray-600 hover:text-gray-300 transition-colors">清除</button>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-1 p-2 custom-scrollbar" ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }}>
                                {logs.map(log => (
                                    <div key={log.id} className={`flex gap-3 leading-relaxed border-b border-white/5 pb-1 ${log.type === 'error' ? 'text-red-400 bg-red-900/10' :
                                        log.type === 'warning' ? 'text-yellow-400' :
                                            log.type === 'success' ? 'text-emerald-400' : 'text-gray-300'
                                        }`}>
                                        <span className="text-gray-600 select-none">[{log.time}]</span>
                                        <span className="break-all">{log.text}</span>
                                    </div>
                                ))}
                                {logs.length === 0 && <div className="text-gray-700 italic text-center mt-20">等待任務啟動...</div>}
                            </div>
                        </div>

                        {/* Results */}
                        {summary && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-emerald-900/20 border border-emerald-800 p-4 rounded-xl text-center">
                                    <div className="text-3xl font-bold text-emerald-400">{summary.new}</div>
                                    <div className="text-sm text-emerald-200/70 uppercase tracking-wider mt-1">New</div>
                                </div>
                                <div className="bg-yellow-900/20 border border-yellow-800 p-4 rounded-xl text-center">
                                    <div className="text-3xl font-bold text-yellow-400">{summary.updated}</div>
                                    <div className="text-sm text-yellow-200/70 uppercase tracking-wider mt-1">Updated</div>
                                </div>
                                <div className="bg-gray-800/40 border border-gray-700 p-4 rounded-xl text-center">
                                    <div className="text-3xl font-bold text-gray-400">{summary.identical}</div>
                                    <div className="text-sm text-gray-500 uppercase tracking-wider mt-1">Skipped</div>
                                </div>
                                <div className="bg-red-900/20 border border-red-800 p-4 rounded-xl text-center">
                                    <div className="text-3xl font-bold text-red-400">{summary.errors}</div>
                                    <div className="text-sm text-red-200/70 uppercase tracking-wider mt-1">Errors</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Styles for custom scrollbar */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.2);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
}
