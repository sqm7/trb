'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
    LayoutDashboard,
    ArrowLeft,
    Building2,
    Search,
    Edit2,
    X,
    CheckCircle,
    Clock,
    MapPin,
    Filter,
    ChevronDown,
    Save,
    SearchCode,
    Loader2,
    Info,
    CheckCircle2,
    AlertCircle,
    RotateCcw,
    ChevronRight,
    Building,
    HardHat,
    DraftingCompass,
    Rocket,
    FileText,
    Maximize2,
    ParkingCircle,
    Users,
    Zap
} from 'lucide-react';

interface Project {
    id: string;
    project_name: string;
    developer: string | null;
    site_area: string | null;
    total_households: string | null;
    public_ratio: string | null;
    total_floors: string | null;
    basement_floors: string | null;
    structure: string | null;
    land_usage_zone: string | null;
    parking_type: string | null;
    parking_count: string | null;
    contractor: string | null;
    architect: string | null;
    sales_agent: string | null;
    affiliated_companies: string | null;
    construction_license: string | null;
    enrichment_status: 'requested' | 'pending' | 'done';
    last_enriched_at: string | null;
}

const COUNTIES = [
    { label: '台北市', code: 'a' }, { label: '台中市', code: 'b' }, { label: '基隆市', code: 'c' },
    { label: '台南市', code: 'd' }, { label: '高雄市', code: 'e' }, { label: '新北市', code: 'f' },
    { label: '宜蘭縣', code: 'g' }, { label: '桃園市', code: 'h' }, { label: '嘉義市', code: 'i' },
    { label: '新竹縣', code: 'j' }, { label: '苗栗縣', code: 'k' }, { label: '南投縣', code: 'm' },
    { label: '彰化縣', code: 'n' }, { label: '新竹市', code: 'o' }, { label: '雲林縣', code: 'p' },
    { label: '嘉義縣', code: 'q' }, { label: '屏東縣', code: 't' }, { label: '花蓮縣', code: 'u' },
    { label: '台東縣', code: 'v' }, { label: '金門縣', code: 'w' }, { label: '澎湖縣', code: 'x' },
    { label: '連江縣', code: 'z' }
];

export default function AdminProjectsPage() {
    const router = useRouter();
    const { isAdmin, isLoading: isAuthLoading } = useAdminAuth();

    const [selectedCounty, setSelectedCounty] = useState(COUNTIES[0]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // UI State
    const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState<string | null>(null);
    const [isEnriching, setIsEnriching] = useState(false);

    useEffect(() => {
        if (!isAuthLoading && isAdmin) fetchProjects();
    }, [isAuthLoading, isAdmin, selectedCounty, statusFilter]);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const tableName = `${selectedCounty.code.toLowerCase()}_projects`;
            let query = supabase.from(tableName).select('*');
            if (statusFilter !== 'all') query = query.eq('enrichment_status', statusFilter);
            const { data, error } = await query.order('project_name', { ascending: true }).limit(200);
            if (error) throw error;
            setProjects(data || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickSave = async (project: Project) => {
        setIsSaving(project.id);
        try {
            const tableName = `${selectedCounty.code.toLowerCase()}_projects`;
            const { error } = await supabase
                .from(tableName)
                .update({
                    ...project,
                    last_enriched_at: new Date().toISOString()
                })
                .eq('id', project.id);
            if (error) throw error;
            setProjects(prev => prev.map(p => p.id === project.id ? { ...project } : p));
        } catch (error: any) {
            alert('儲存失敗：' + error.message);
        } finally {
            setIsSaving(null);
        }
    };

    const handleBatchRequest = async () => {
        setIsEnriching(true);
        try {
            const tableName = `${selectedCounty.code.toLowerCase()}_projects`;
            // Find projects that are 'pending' to move to 'requested'
            const pendingProjects = projects.filter(p => p.enrichment_status === 'pending').slice(0, 10);

            if (pendingProjects.length === 0) {
                alert('當前列表中沒有「待補」的建案。');
                return;
            }

            const ids = pendingProjects.map(p => p.id);
            const { error } = await supabase
                .from(tableName)
                .update({ enrichment_status: 'requested' })
                .in('id', ids);

            if (error) throw error;

            setProjects(prev => prev.map(p => ids.includes(p.id) ? { ...p, enrichment_status: 'requested' } : p));
            alert(`已將 ${ids.length} 筆建案標記為「代辦」，Agent 將稍後處理。`);
        } catch (error: any) {
            alert('操作失敗：' + error.message);
        } finally {
            setIsEnriching(false);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case 'done': return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full"><CheckCircle2 className="h-3 w-3" /> 完備</span>;
            case 'requested': return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full animate-pulse"><Zap className="h-3 w-3" /> 代辦 (Agent)</span>;
            default: return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full"><Clock className="h-3 w-3" /> 待補 (人工)</span>;
        }
    };

    const filteredProjects = projects.filter(p =>
        p.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.developer?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isAuthLoading) return null;
    if (!isAdmin) return <div className="p-8 text-center text-white">權限不足</div>;

    return (
        <div className="min-h-screen bg-[#0f1117] text-gray-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto font-sans">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div className="flex items-center gap-5">
                        <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 hover:text-white">
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black text-white tracking-tight">建案數據中控台</h1>
                                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded uppercase tracking-widest">Admin v2.0</span>
                            </div>
                            <p className="text-zinc-500 text-sm mt-1">即時管理全台建案規格與補全狀態</p>
                        </div>
                    </div>
                    <button
                        onClick={handleBatchRequest}
                        disabled={isEnriching}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isEnriching ? <Loader2 className="h-4 w-4 animate-spin" /> : <SearchCode className="h-4 w-4" />}
                        執行批次補全 (代辦 10 筆)
                    </button>
                </div>

                {/* Filter Bar */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/50 backdrop-blur-sm">
                    <div className="md:col-span-2 relative">
                        <select
                            value={selectedCounty.code}
                            onChange={(e) => setSelectedCounty(COUNTIES.find(c => c.code === e.target.value)!)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none cursor-pointer"
                        >
                            {COUNTIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 pointer-events-none" />
                    </div>
                    <div className="md:col-span-6 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                        <input
                            type="text"
                            placeholder="搜尋建案名稱、建設公司..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                        />
                    </div>
                    <div className="md:col-span-2 relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none cursor-pointer"
                        >
                            <option value="all">全部狀態</option>
                            <option value="requested">代辦 (Agent)</option>
                            <option value="pending">待補 (人工)</option>
                            <option value="done">完備</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 pointer-events-none" />
                    </div>
                    <div className="md:col-span-2 flex items-center justify-center text-zinc-600 text-xs font-mono">
                        Count: {filteredProjects.length}
                    </div>
                </div>

                {/* Project List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center gap-4">
                            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                            <span className="text-zinc-500 font-medium">盤點數據中...</span>
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="py-20 text-center text-zinc-500 border-2 border-dashed border-zinc-800 rounded-3xl">尚無符合條件的數據</div>
                    ) : (
                        filteredProjects.map((p) => {
                            const isExpanded = expandedProjectId === p.id;
                            return (
                                <div
                                    key={p.id}
                                    className={`group border transition-all duration-300 rounded-2xl overflow-hidden ${isExpanded ? 'bg-zinc-900 border-indigo-500/50 shadow-2xl shadow-indigo-500/10' : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                                        }`}
                                >
                                    {/* Main Row */}
                                    <div
                                        onClick={() => setExpandedProjectId(isExpanded ? null : p.id)}
                                        className="px-6 py-5 cursor-pointer flex items-center justify-between gap-4"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className={`p-2 rounded-xl transition-colors ${isExpanded ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700'}`}>
                                                <Building2 className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">{p.project_name}</h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs text-zinc-500 font-medium">{p.developer || '建商未載'}</span>
                                                    <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                                                    <span className="text-[10px] text-zinc-600 uppercase font-mono tracking-tighter">{p.id.split('-')[0]}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="hidden md:block">
                                                <StatusBadge status={p.enrichment_status} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-right">
                                                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-none">Last Sync</p>
                                                    <p className="text-xs text-zinc-400 mt-1">{p.last_enriched_at ? new Date(p.last_enriched_at).toLocaleDateString('zh-TW') : '-'}</p>
                                                </div>
                                                <ChevronRight className={`h-5 w-5 text-zinc-600 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-indigo-400' : ''}`} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    {isExpanded && (
                                        <div className="px-6 pb-6 pt-2 border-t border-zinc-800 animate-in slide-in-from-top-4 duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6">
                                                {/* Section: Organization */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 text-indigo-400">
                                                        <Building className="h-4 w-4" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">開發與關係企業</span>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="text-[10px] text-zinc-600 font-bold block mb-1">投資建設</label>
                                                            <input type="text" value={p.developer || ''} onChange={e => setProjects(prev => prev.map(x => x.id === p.id ? { ...x, developer: e.target.value } : x))} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:border-indigo-500 outline-none" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-zinc-600 font-bold block mb-1">關係企業</label>
                                                            <input type="text" value={p.affiliated_companies || ''} onChange={e => setProjects(prev => prev.map(x => x.id === p.id ? { ...x, affiliated_companies: e.target.value } : x))} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:border-indigo-500 outline-none" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-zinc-600 font-bold block mb-1">工程營造</label>
                                                            <input type="text" value={p.contractor || ''} onChange={e => setProjects(prev => prev.map(x => x.id === p.id ? { ...x, contractor: e.target.value } : x))} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:border-indigo-500 outline-none" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Section: Planning */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 text-indigo-400">
                                                        <DraftingCompass className="h-4 w-4" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">規劃與案名</span>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="text-[10px] text-zinc-600 font-bold block mb-1">建築設計</label>
                                                            <input type="text" value={p.architect || ''} onChange={e => setProjects(prev => prev.map(x => x.id === p.id ? { ...x, architect: e.target.value } : x))} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:border-indigo-500 outline-none" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-zinc-600 font-bold block mb-1">代銷企劃</label>
                                                            <input type="text" value={p.sales_agent || ''} onChange={e => setProjects(prev => prev.map(x => x.id === p.id ? { ...x, sales_agent: e.target.value } : x))} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:border-indigo-500 outline-none" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-zinc-600 font-bold block mb-1">建造執照</label>
                                                            <input type="text" value={p.construction_license || ''} onChange={e => setProjects(prev => prev.map(x => x.id === p.id ? { ...x, construction_license: e.target.value } : x))} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:border-indigo-500 outline-none" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Section: Specifications */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 text-indigo-400">
                                                        <Maximize2 className="h-4 w-4" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">基地與規格</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="text-[10px] text-zinc-600 font-bold block mb-1">基地規模</label>
                                                            <input type="text" value={p.site_area || ''} onChange={e => setProjects(prev => prev.map(x => x.id === p.id ? { ...x, site_area: e.target.value } : x))} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 outline-none" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-zinc-600 font-bold block mb-1">公設比</label>
                                                            <input type="text" value={p.public_ratio || ''} onChange={e => setProjects(prev => prev.map(x => x.id === p.id ? { ...x, public_ratio: e.target.value } : x))} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 outline-none" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-zinc-600 font-bold block mb-1">地上層</label>
                                                            <input type="text" value={p.total_floors || ''} onChange={e => setProjects(prev => prev.map(x => x.id === p.id ? { ...x, total_floors: e.target.value } : x))} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 outline-none" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-zinc-600 font-bold block mb-1">地下層</label>
                                                            <input type="text" value={p.basement_floors || ''} onChange={e => setProjects(prev => prev.map(x => x.id === p.id ? { ...x, basement_floors: e.target.value } : x))} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 outline-none" />
                                                        </div>
                                                        <div className="col-span-2">
                                                            <label className="text-[10px] text-zinc-600 font-bold block mb-1">結構類型</label>
                                                            <input type="text" value={p.structure || ''} onChange={e => setProjects(prev => prev.map(x => x.id === p.id ? { ...x, structure: e.target.value } : x))} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 outline-none" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Section: Parking & Status */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 text-indigo-400">
                                                        <ParkingCircle className="h-4 w-4" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">車位與狀態</span>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="text-[10px] text-zinc-600 font-bold block mb-1">車位/數量</label>
                                                            <div className="flex gap-2">
                                                                <input type="text" placeholder="型態" value={p.parking_type || ''} onChange={e => setProjects(prev => prev.map(x => x.id === p.id ? { ...x, parking_type: e.target.value } : x))} className="w-2/3 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 outline-none" />
                                                                <input type="text" placeholder="數" value={p.parking_count || ''} onChange={e => setProjects(prev => prev.map(x => x.id === p.id ? { ...x, parking_count: e.target.value } : x))} className="w-1/3 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 outline-none" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-zinc-600 font-bold block mb-1">標記狀態</label>
                                                            <div className="flex gap-1">
                                                                {[
                                                                    { val: 'requested', label: '代辦' },
                                                                    { val: 'pending', label: '待補' },
                                                                    { val: 'done', label: '完備' }
                                                                ].map(s => (
                                                                    <button
                                                                        key={s.val}
                                                                        onClick={() => setProjects(prev => prev.map(x => x.id === p.id ? { ...x, enrichment_status: s.val as any } : x))}
                                                                        className={`flex-1 py-1 rounded text-[9px] font-bold border transition-colors ${p.enrichment_status === s.val ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:text-zinc-400'}`}
                                                                    >
                                                                        {s.label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleQuickSave(p)}
                                                            disabled={isSaving === p.id}
                                                            className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-white text-black hover:bg-zinc-200 rounded-xl font-black text-xs uppercase transition-all shadow-xl shadow-white/5 active:scale-95 disabled:opacity-50"
                                                        >
                                                            {isSaving === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                                            確認並儲存變更
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
