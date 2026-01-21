'use client';

import { useState, useEffect } from 'react';
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
import { counties, columnMappings } from '@/lib/uploader-config';
import { searchData, batchUpdateData } from './admin-service';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface LogEntry {
    id: number;
    text: string;
    type: 'info' | 'success' | 'warning' | 'error';
    time: string;
}

export default function UploaderPage() {
    const router = useRouter();
    const { user, isAdmin, isLoading: isAuthLoading } = useAdminAuth();

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

    // Batch Update State
    const [updateCounty, setUpdateCounty] = useState('f'); // Default to New Taipei (F) as per legacy
    const [updateType, setUpdateType] = useState('b'); // Default to Presale (B)
    const [updateSearchField, setUpdateSearchField] = useState('建案名稱');
    const [updateKeyword, setUpdateKeyword] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [batchUpdateField, setBatchUpdateField] = useState('建案名稱');
    const [batchUpdateValue, setBatchUpdateValue] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isBatchUpdating, setIsBatchUpdating] = useState(false);
    const [currentUpdateContext, setCurrentUpdateContext] = useState<{ tableName: string, city: string } | null>(null);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [showModalSearch, setShowModalSearch] = useState(false);

    // Admin Access Check - Show loading or access denied
    if (isAuthLoading) {
        return (
            <div className="min-h-screen bg-[#1a1d29] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="h-8 w-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto" />
                    <p className="text-zinc-500 text-sm">驗證管理員權限...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#1a1d29] flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                    <div className="text-4xl">🔒</div>
                    <h1 className="text-xl font-bold text-white">請先登入</h1>
                    <p className="text-zinc-500">此頁面需要登入才能訪問</p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        前往登入
                    </button>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-[#1a1d29] flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                    <div className="text-4xl">⛔</div>
                    <h1 className="text-xl font-bold text-white">權限不足</h1>
                    <p className="text-zinc-500">此頁面僅限管理員訪問</p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        返回首頁
                    </button>
                </div>
            </div>
        );
    }

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
            // @ts-expect-error - showDirectoryPicker is experimental
            if (!window.showDirectoryPicker) {
                addLog('您的瀏覽器不支援資料夾選擇功能，請使用 Chrome 或 Edge。', 'error');
                return;
            }

            addLog('正在掃描資料夾...', 'info');
            // @ts-expect-error - showDirectoryPicker is experimental
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

    // --- Batch Update Handlers ---
    const handleSearch = async () => {
        if (!dbUrl || !dbKey) {
            addLog('請先填寫資料庫連線資訊 (URL & Key)', 'error');
            return;
        }
        if (!updateKeyword.trim()) {
            addLog('請輸入搜尋關鍵字', 'warning');
            return;
        }

        setIsSearching(true);
        setLogs([]); // Optional: clear logs or keep them
        addLog(`正在搜尋: ${counties[updateCounty.toUpperCase()]} ${updateType} ${updateSearchField} containing "${updateKeyword}"...`, 'info');

        try {
            const result = await searchData(
                updateCounty,
                updateType,
                updateSearchField,
                updateKeyword.trim(),
                { url: dbUrl, key: dbKey }
            );

            if (result.success && result.data) {
                setSearchResults(result.data);
                setCurrentUpdateContext({
                    tableName: result.tableName!,
                    city: counties[updateCounty.toUpperCase()]
                });
                setShowUpdateModal(true);
                setSelectedIds(new Set()); // Reset selection
                addLog(`搜尋完成，找到 ${result.data.length} 筆資料`, 'success');
            } else {
                addLog(`搜尋失敗: ${result.error}`, 'error');
            }
        } catch (e: any) {
            addLog(`搜尋發生錯誤: ${e.message}`, 'error');
        } finally {
            setIsSearching(false);
        }
    };

    const handleExecuteBatchUpdate = async () => {
        if (!currentUpdateContext || selectedIds.size === 0) return;

        // Find one sample for old value (legacy logic uses the first selected)
        let oldValue = null;
        let district = null;

        // If updating '建案名稱', try to find old value from the first selected record
        if (batchUpdateField === '建案名稱') {
            const firstId = Array.from(selectedIds)[0];
            const record = searchResults.find(r => r['編號'] === firstId);
            if (record) {
                oldValue = record['建案名稱'];
                district = record['行政區'];
            }
        }

        setIsBatchUpdating(true);
        addLog(`開始批次更新 ${selectedIds.size} 筆資料...`, 'info');

        try {
            const result = await batchUpdateData(
                currentUpdateContext.tableName,
                Array.from(selectedIds),
                batchUpdateField,
                batchUpdateValue,
                oldValue,
                district,
                currentUpdateContext.city,
                { url: dbUrl, key: dbKey }
            );

            if (result.success) {
                addLog(`成功更新 ${result.count} 筆資料！`, 'success');
                setShowUpdateModal(false);
                // Optionally re-search to show updated results? 
                // For now just close modal as per legacy
            } else {
                addLog(`批次更新失敗: ${result.error}`, 'error');
            }
        } catch (e: any) {
            addLog(`批次更新發生錯誤: ${e.message}`, 'error');
        } finally {
            setIsBatchUpdating(false);
        }
    };

    // Toggle checkbox
    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    // Toggle All
    const toggleSelectAll = () => {
        if (selectedIds.size === searchResults.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(searchResults.map(r => r['編號'])));
        }
    };

    // Toggle Details Row
    const toggleDetails = (index: number) => {
        const newSet = new Set(expandedRows);
        if (newSet.has(index)) newSet.delete(index);
        else newSet.add(index);
        setExpandedRows(newSet);
    };

    return (
        <div className="min-h-screen bg-[#1a1d29] text-gray-100 p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-center bg-[#252836] p-6 rounded-xl border border-gray-700 shadow-lg">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">平米內參 <span className="text-amber-400">資料上傳工具</span></h1>
                        <p className="text-gray-400 mt-2 text-sm">高效能、智慧化的實價登錄資料批次處理系統 v2.0 (Next.js)</p>
                    </div>
                    <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                        <i className="fas fa-arrow-left" /> 返回儀表板
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Settings */}
                    <div className="space-y-6">
                        {/* 1. Database Connection */}
                        <div className="bg-[#252836] p-6 rounded-xl border border-gray-700 shadow-lg">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                                <span className="bg-amber-900 text-amber-400 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                                資料庫連線
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Supabase URL</label>
                                    <input
                                        type="text"
                                        value={dbUrl}
                                        onChange={(e) => setDbUrl(e.target.value)}
                                        className="w-full bg-gray-800 border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-amber-500 focus:border-amber-500 placeholder-gray-600"
                                        placeholder="https://xyz.supabase.co"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Service Role Key</label>
                                    <input
                                        type="password"
                                        value={dbKey}
                                        onChange={(e) => setDbKey(e.target.value)}
                                        className="w-full bg-gray-800 border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-amber-500 focus:border-amber-500 placeholder-gray-600"
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
                                <span className="bg-amber-900 text-amber-400 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
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
                                <span className="bg-amber-900 text-amber-400 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">3</span>
                                開始處理
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">上傳類型</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['all', 'a', 'b', 'c'].map(type => (
                                            <label key={type} className={`cursor-pointer border rounded-lg p-2 text-center transition-all ${uploadType === type
                                                ? 'bg-amber-900/30 border-amber-500 text-amber-400'
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
                                    className="w-full bg-gradient-to-r from-amber-600 to-blue-600 hover:from-amber-500 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isUploading ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-rocket" />}
                                    {isUploading ? '處理中...' : '開始上傳'}
                                </button>
                            </div>
                        </div>

                        {/* 4. Batch Data Modification (Legacy Feature) */}
                        <div className="bg-[#252836] p-6 rounded-xl border border-gray-700 shadow-lg">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                                <span className="bg-amber-900 text-amber-400 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">4</span>
                                資料批次修改 (獨立功能)
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">選擇縣市</label>
                                    <select
                                        value={updateCounty}
                                        onChange={(e) => setUpdateCounty(e.target.value)}
                                        className="w-full bg-gray-800 border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-amber-500 focus:border-amber-500"
                                    >
                                        {Object.entries(counties).map(([code, name]) => (
                                            <option key={code} value={code.toLowerCase()}>{name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">交易類型</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['a', 'b', 'c'].map(type => (
                                            <label key={type} className={`cursor-pointer border rounded-lg p-2 text-center transition-all ${updateType === type
                                                ? 'bg-amber-900/30 border-amber-500 text-amber-400'
                                                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                                                }`}>
                                                <input
                                                    type="radio"
                                                    name="updateType"
                                                    value={type}
                                                    checked={updateType === type}
                                                    onChange={(e) => setUpdateType(e.target.value)}
                                                    className="sr-only"
                                                    disabled={isSearching}
                                                />
                                                <span className="font-bold">{type === 'a' ? '中古' : type === 'b' ? '預售' : '租賃'}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">搜尋欄位</label>
                                    <select
                                        value={updateSearchField}
                                        onChange={(e) => setUpdateSearchField(e.target.value)}
                                        className="w-full bg-gray-800 border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-amber-500 focus:border-amber-500"
                                    >
                                        {Array.from(new Set(Object.values(columnMappings[updateType] || {})))
                                            .filter(f => !['編號', 'id'].includes(f))
                                            .sort()
                                            .map(field => (
                                                <option key={field} value={field}>{field}</option>
                                            ))}
                                        <option value="編號">編號</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">關鍵字</label>
                                    <input
                                        type="text"
                                        value={updateKeyword}
                                        onChange={(e) => setUpdateKeyword(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-full bg-gray-800 border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-amber-500 focus:border-amber-500 placeholder-gray-600"
                                        placeholder="輸入關鍵字..."
                                    />
                                </div>
                                <button
                                    onClick={handleSearch}
                                    disabled={!isConnected || isSearching}
                                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSearching ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-search" />}
                                    {isSearching ? '搜尋中...' : '搜尋資料'}
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
                                {isUploading && <span className="text-amber-400">{progress}%</span>}
                            </h3>
                            <div className="w-full bg-gray-700 rounded-full h-4 mb-2 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-amber-500 to-purple-500 h-4 rounded-full transition-all duration-300 relative"
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

            {/* Batch Update Modal */}
            {showUpdateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="bg-[#1a1d29] border border-gray-700 rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-[#252836] rounded-t-xl">
                            <div>
                                <h3 className="text-xl font-bold text-white">批次修改搜尋結果</h3>
                                <p className="text-sm text-gray-400 mt-1">
                                    資料表: {currentUpdateContext?.tableName} |
                                    搜尋條件: {counties[updateCounty.toUpperCase()]} {updateSearchField} like &apos;%{updateKeyword}%&apos; |
                                    共 {searchResults.length} 筆
                                </p>
                            </div>
                            <button
                                onClick={() => setShowUpdateModal(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <i className="fas fa-times text-xl" />
                            </button>
                        </div>

                        {/* Controls Toolbar */}
                        <div className="p-4 border-b border-gray-700 bg-gray-800/50 flex gap-4 items-end flex-wrap">
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.size > 0 && selectedIds.size === searchResults.length}
                                    onChange={toggleSelectAll}
                                    className="form-checkbox h-5 w-5 text-amber-600 bg-gray-700 border-gray-600 rounded"
                                />
                                <span>全選 ({selectedIds.size} 筆)</span>
                            </div>

                            <div className="flex-1" />

                            <div className="flex gap-2 items-center">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">欲修改欄位</label>
                                    <select
                                        value={batchUpdateField}
                                        onChange={(e) => setBatchUpdateField(e.target.value)}
                                        className="bg-gray-800 border-gray-600 rounded px-3 py-1.5 text-sm text-white focus:ring-amber-500"
                                    >
                                        {Array.from(new Set(Object.values(columnMappings[updateType] || {})))
                                            .filter(f => !['編號', 'id'].includes(f))
                                            .sort()
                                            .map(field => (
                                                <option key={field} value={field}>{field}</option>
                                            ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">新數值</label>
                                    <input
                                        type="text"
                                        value={batchUpdateValue}
                                        onChange={(e) => setBatchUpdateValue(e.target.value)}
                                        className="bg-gray-800 border-gray-600 rounded px-3 py-1.5 text-sm text-white w-48 focus:ring-amber-500"
                                        placeholder="輸入新內容..."
                                    />
                                </div>
                                <div className="pb-0.5">
                                    <button
                                        onClick={handleExecuteBatchUpdate}
                                        disabled={selectedIds.size === 0 || isBatchUpdating}
                                        className="bg-red-600 hover:bg-red-500 text-white font-bold py-1.5 px-4 rounded transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed h-[34px]"
                                    >
                                        {isBatchUpdating ? '更新中...' : '執行批次更新'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Results Table */}
                        <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-800 sticky top-0 z-10">
                                    <tr>
                                        <th className="p-3 text-xs font-bold text-gray-400 border-b border-gray-700 w-12">選取</th>
                                        <th className="p-3 text-xs font-bold text-gray-400 border-b border-gray-700 w-24">編號</th>
                                        <th className="p-3 text-xs font-bold text-gray-400 border-b border-gray-700 w-24">行政區</th>
                                        <th className="p-3 text-xs font-bold text-gray-400 border-b border-gray-700 w-48">建案名稱</th>
                                        <th className="p-3 text-xs font-bold text-gray-400 border-b border-gray-700">地址/位置</th>
                                        <th className="p-3 text-xs font-bold text-gray-400 border-b border-gray-700 w-16">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {searchResults.map((row, idx) => (
                                        <>
                                            <tr key={row['編號']} className="hover:bg-white/5 border-b border-gray-800">
                                                <td className="p-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.has(row['編號'])}
                                                        onChange={() => toggleSelection(row['編號'])}
                                                        className="form-checkbox h-4 w-4 text-amber-600 bg-gray-700 border-gray-600 rounded"
                                                    />
                                                </td>
                                                <td className="p-3 font-mono text-xs text-gray-400">{row['編號']}</td>
                                                <td className="p-3">{row['行政區']}</td>
                                                <td className="p-3 text-amber-300">{row['建案名稱']}</td>
                                                <td className="p-3 text-gray-400 truncate max-w-[200px]">{row['其他門牌'] || row['地址'] || row['土地位置建物門牌']}</td>
                                                <td className="p-3">
                                                    <button
                                                        onClick={() => toggleDetails(idx)}
                                                        className="text-gray-500 hover:text-white text-xs underline"
                                                    >
                                                        {expandedRows.has(idx) ? '收合' : '明細'}
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedRows.has(idx) && (
                                                <tr className="bg-gray-900/50">
                                                    <td colSpan={6} className="p-4 border-b border-gray-800">
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                                            {Object.entries(row).filter(([k]) => k !== 'id').map(([key, val]) => (
                                                                <div key={key}>
                                                                    <div className="text-gray-500 mb-1">{key}</div>
                                                                    <div className="text-gray-300 break-all">{String(val)}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))}
                                </tbody>
                            </table>
                            {searchResults.length === 0 && (
                                <div className="text-center py-20 text-gray-500">
                                    無符合資料
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Batch Update Modal */}
            {showUpdateModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 transition-opacity animate-in fade-in duration-200"
                    onClick={() => setShowUpdateModal(false)}
                >
                    <div
                        className="bg-[#1a1d29] border border-gray-700 rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-[#252836] rounded-t-xl">
                            <div>
                                <h3 className="text-xl font-bold text-white">批次修改搜尋結果</h3>
                                <p className="text-sm text-gray-400 mt-1">
                                    資料表: {currentUpdateContext?.tableName} |
                                    搜尋條件: {counties[updateCounty.toUpperCase()]} {updateSearchField} like &apos;%{updateKeyword}%&apos; |
                                    共 {searchResults.length} 筆
                                </p>
                            </div>
                            <button
                                onClick={() => setShowUpdateModal(false)}
                                className="text-gray-400 hover:text-white hover:bg-gray-700/50 p-2 rounded-full transition-colors flex items-center justify-center w-8 h-8"
                                title="關閉視窗 (Esc)"
                            >
                                <i className="fas fa-times text-xl" />
                            </button>
                        </div>

                        {/* Modal Search Bar (Collapsible) */}
                        <div className="bg-[#252836] border-b border-gray-700">
                            <button
                                onClick={() => setShowModalSearch(!showModalSearch)}
                                className="w-full text-center py-2 text-xs text-gray-500 hover:text-white hover:bg-gray-700/50 transition-colors flex items-center justify-center gap-2"
                            >
                                <i className={`fas fa-search ${showModalSearch ? 'text-amber-400' : ''}`} />
                                {showModalSearch ? '收合搜尋條件' : '再次搜尋 / 修改條件'}
                            </button>

                            {showModalSearch && (
                                <div className="p-4 grid grid-cols-1 md:grid-cols-5 gap-4 animate-in slide-in-from-top-2 duration-200">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">縣市</label>
                                        <select
                                            value={updateCounty}
                                            onChange={(e) => setUpdateCounty(e.target.value)}
                                            className="w-full bg-gray-800 border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:ring-amber-500"
                                        >
                                            {Object.entries(counties).map(([code, name]) => (
                                                <option key={code} value={code.toLowerCase()}>{name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">類型</label>
                                        <div className="flex bg-gray-800 rounded border border-gray-600 p-0.5">
                                            {['a', 'b', 'c'].map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => setUpdateType(type)}
                                                    className={`flex-1 text-xs py-1 rounded transition-colors ${updateType === type
                                                        ? 'bg-amber-900 text-amber-400'
                                                        : 'text-gray-400 hover:text-white'}`}
                                                >
                                                    {type === 'a' ? '中古' : type === 'b' ? '預售' : '租賃'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">欄位</label>
                                        <select
                                            value={updateSearchField}
                                            onChange={(e) => setUpdateSearchField(e.target.value)}
                                            className="w-full bg-gray-800 border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:ring-amber-500"
                                        >
                                            {Array.from(new Set(Object.values(columnMappings[updateType] || {})))
                                                .filter(f => !['編號', 'id'].includes(f))
                                                .sort()
                                                .map(field => (
                                                    <option key={field} value={field}>{field}</option>
                                                ))}
                                            <option value="編號">編號</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">關鍵字</label>
                                        <input
                                            type="text"
                                            value={updateKeyword}
                                            onChange={(e) => setUpdateKeyword(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                            className="w-full bg-gray-800 border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:ring-amber-500"
                                            placeholder="關鍵字..."
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            onClick={handleSearch}
                                            disabled={isSearching}
                                            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-1.5 px-4 rounded transition-colors text-sm h-[34px] flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isSearching ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-search" />}
                                            搜尋
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Controls Toolbar */}
                        <div className="p-4 border-b border-gray-700 bg-gray-800/50 flex gap-4 items-end flex-wrap">
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.size > 0 && selectedIds.size === searchResults.length}
                                    onChange={toggleSelectAll}
                                    className="form-checkbox h-5 w-5 text-amber-600 bg-gray-700 border-gray-600 rounded"
                                />
                                <span>全選 ({selectedIds.size} 筆)</span>
                            </div>

                            <div className="flex-1" />

                            <div className="flex gap-2 items-center">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">欲修改欄位</label>
                                    <select
                                        value={batchUpdateField}
                                        onChange={(e) => setBatchUpdateField(e.target.value)}
                                        className="bg-gray-800 border-gray-600 rounded px-3 py-1.5 text-sm text-white focus:ring-amber-500"
                                    >
                                        {Array.from(new Set(Object.values(columnMappings[updateType] || {})))
                                            .filter(f => !['編號', 'id'].includes(f))
                                            .sort()
                                            .map(field => (
                                                <option key={field} value={field}>{field}</option>
                                            ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">新數值</label>
                                    <input
                                        type="text"
                                        value={batchUpdateValue}
                                        onChange={(e) => setBatchUpdateValue(e.target.value)}
                                        className="bg-gray-800 border-gray-600 rounded px-3 py-1.5 text-sm text-white w-48 focus:ring-amber-500"
                                        placeholder="輸入新內容..."
                                    />
                                </div>
                                <div className="pb-0.5">
                                    <button
                                        onClick={handleExecuteBatchUpdate}
                                        disabled={selectedIds.size === 0 || isBatchUpdating}
                                        className="bg-red-600 hover:bg-red-500 text-white font-bold py-1.5 px-4 rounded transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed h-[34px]"
                                    >
                                        {isBatchUpdating ? '更新中...' : '執行批次更新'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Results Table */}
                        <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-800 sticky top-0 z-10">
                                    <tr>
                                        <th className="p-3 text-xs font-bold text-gray-400 border-b border-gray-700 w-12">選取</th>
                                        <th className="p-3 text-xs font-bold text-gray-400 border-b border-gray-700 w-24">編號</th>
                                        <th className="p-3 text-xs font-bold text-gray-400 border-b border-gray-700 w-24">行政區</th>
                                        <th className="p-3 text-xs font-bold text-gray-400 border-b border-gray-700 w-48">建案名稱</th>
                                        <th className="p-3 text-xs font-bold text-gray-400 border-b border-gray-700">地址/位置</th>
                                        <th className="p-3 text-xs font-bold text-gray-400 border-b border-gray-700 w-16">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {searchResults.map((row, idx) => (
                                        <>
                                            <tr key={row['編號']} className="hover:bg-white/5 border-b border-gray-800">
                                                <td className="p-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.has(row['編號'])}
                                                        onChange={() => toggleSelection(row['編號'])}
                                                        className="form-checkbox h-4 w-4 text-amber-600 bg-gray-700 border-gray-600 rounded"
                                                    />
                                                </td>
                                                <td className="p-3 font-mono text-xs text-gray-400">{row['編號']}</td>
                                                <td className="p-3">{row['行政區']}</td>
                                                <td className="p-3 text-amber-300">{row['建案名稱']}</td>
                                                <td className="p-3 text-gray-400 truncate max-w-[200px]">{row['其他門牌'] || row['地址'] || row['土地位置建物門牌']}</td>
                                                <td className="p-3">
                                                    <button
                                                        onClick={() => toggleDetails(idx)}
                                                        className="text-gray-500 hover:text-white text-xs underline"
                                                    >
                                                        {expandedRows.has(idx) ? '收合' : '明細'}
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedRows.has(idx) && (
                                                <tr className="bg-gray-900/50">
                                                    <td colSpan={6} className="p-4 border-b border-gray-800">
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                                            {Object.entries(row).filter(([k]) => k !== 'id').map(([key, val]) => (
                                                                <div key={key}>
                                                                    <div className="text-gray-500 mb-1">{key}</div>
                                                                    <div className="text-gray-300 break-all">{String(val)}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))}
                                </tbody>
                            </table>
                            {searchResults.length === 0 && (
                                <div className="text-center py-20 text-gray-500">
                                    無符合資料
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

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
