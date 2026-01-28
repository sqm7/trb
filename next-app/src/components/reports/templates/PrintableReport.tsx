import React from 'react';
import { AnalysisData } from '@/lib/types';
import { REPORT_THEME } from '@/lib/report-design-system';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { cn } from '@/lib/utils';
import { formatNumber, formatPrice } from '@/lib/utils'; // Assuming these exist

// Use a local type if standard type isn't available yet
interface PrintableReportProps {
    data: any; // Ideally strictly typed as AnalysisData
    filters: {
        counties: string[];
        districts: string[];
        dateRange: string;
        startDate?: string;
        endDate?: string;
    };
    reportDate: string;
}

const SlideContainer = ({ title, children, pageNum }: { title: string, children: React.ReactNode, pageNum: number }) => {
    return (
        <div className="w-full h-screen break-after-page flex flex-col p-8 bg-[#0A0C10] text-white relative print:break-after-always print:h-[100vh] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-gray-800 pb-4 mb-6">
                <h2 className="text-3xl font-bold text-violet-400">{title}</h2>
                <div className="text-sm text-gray-500">SQM Talk - 平米內參</div>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 relative">
                {children}
            </div>

            {/* Footer */}
            <div className="absolute bottom-4 right-8 text-gray-600 text-sm">
                Page {pageNum}
            </div>
        </div>
    );
};

const CoverSlide = ({ filters, date, title }: { filters: any, date: string, title: string }) => (
    <div className="w-full h-screen break-after-page flex flex-col justify-center items-center bg-[#0A0C10] text-white relative print:break-after-always">
        <div className="absolute top-0 left-0 w-32 h-full bg-violet-900/20" />

        <div className="z-10 text-center space-y-6">
            <h1 className="text-6xl font-bold tracking-tight text-white mb-8">{title}</h1>

            <div className="space-y-2 text-xl text-gray-400">
                <p>區域：{filters.counties?.join('、') || '全區域'} {filters.districts?.length > 0 && ` / ${filters.districts.slice(0, 3).join('、')}...`}</p>
                <p>期間：{filters.startDate ? `${filters.startDate} ~ ${filters.endDate}` : filters.dateRange}</p>
            </div>

            <div className="pt-20 text-gray-500">
                <p>生成日期：{date}</p>
                <p className="mt-2 text-violet-400 font-bold">SQM Talk Intelligence</p>
            </div>
        </div>
    </div>
);

const MetricsSlide = ({ metrics, rankings }: { metrics: any, rankings: any[] }) => {
    if (!metrics) return null;

    const cards = [
        { label: '總銷售金額', value: formatPrice(metrics.totalSaleAmount), color: 'text-violet-400' },
        { label: '總銷坪數', value: `${formatNumber(metrics.totalHouseArea, 1)} 坪`, color: 'text-cyan-400' },
        { label: '平均單價', value: `${formatNumber(metrics.overallAveragePrice, 1)} 萬/坪`, color: 'text-emerald-400' },
        { label: '交易筆數', value: `${formatNumber(metrics.transactionCount)} 筆`, color: 'text-amber-400' },
    ];

    // Calculate Prices
    const allPrices = rankings?.map((p: any) => p.averagePrice).filter((p: number) => p > 0) || [];
    const sorted = [...allPrices].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] || 0;

    return (
        <SlideContainer title="核心指標摘要" pageNum={2}>
            <div className="grid grid-cols-4 gap-6 mb-8">
                {cards.map((c, i) => (
                    <div key={i} className="bg-[#1A1D24] border border-gray-800 rounded-xl p-6 text-center">
                        <div className="text-gray-500 text-sm mb-2">{c.label}</div>
                        <div className={cn("text-2xl font-bold", c.color)}>{c.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-4 gap-6">
                <div className="bg-[#1A1D24] border border-gray-800 rounded-xl p-6">
                    <div className="text-gray-500 text-sm mb-1">最低單價</div>
                    <div className="text-xl font-medium text-white">{formatNumber(sorted[0] || 0, 1)} <span className="text-sm text-gray-500">萬/坪</span></div>
                </div>
                <div className="bg-[#1A1D24] border border-gray-800 rounded-xl p-6">
                    <div className="text-gray-500 text-sm mb-1">最高單價</div>
                    <div className="text-xl font-medium text-white">{formatNumber(sorted[sorted.length - 1] || 0, 1)} <span className="text-sm text-gray-500">萬/坪</span></div>
                </div>
                <div className="bg-[#1A1D24] border border-gray-800 rounded-xl p-6 col-span-2">
                    <div className="text-gray-500 text-sm mb-1">中位數單價</div>
                    <div className="text-xl font-medium text-violet-300">{formatNumber(median, 1)} <span className="text-sm text-gray-500">萬/坪</span></div>
                </div>
            </div>

            {/* Placeholder for more visual summary if needed */}
            <div className="mt-8 p-6 bg-[#1A1D24]/50 rounded-xl border border-gray-800/50 flex items-center justify-center h-48 text-gray-600">
                建案排行榜請至下一頁詳細查看
            </div>
        </SlideContainer>
    );
};

// ... More slides (Ranking, PriceBand) would follow similar patterns ...
// For brevity in this prompt, implementing the core structure and first few slides.
// The real implementation would import re-usable chart logic.

const RankingSlide = ({ rankings }: { rankings: any[] }) => {
    const top10 = (rankings || []).slice(0, 10).sort((a: any, b: any) => b.saleAmountSum - a.saleAmountSum);

    return (
        <SlideContainer title="Top 10 建案銷售金額排名" pageNum={3}>
            <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={top10} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                        <XAxis type="number" stroke="#666" fontSize={12} tickFormatter={(val: number) => `${val / 10000}億`} />
                        <YAxis dataKey="projectName" type="category" width={140} stroke="#999" fontSize={12} tickFormatter={(val: string) => val.length > 8 ? val.substring(0, 8) + '...' : val} />
                        <Bar dataKey="saleAmountSum" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </SlideContainer>
    );
};

export const PrintableReport: React.FC<PrintableReportProps> = ({ data, filters, reportDate }) => {
    if (!data) return <div className="p-10 text-white">No Data Available</div>;

    return (
        <div className="w-full bg-[#0A0C10] min-h-screen">
            {/* Style injection for Print Context */}
            <style>{`
                @page { size: A4 landscape; margin: 0; }
                body { margin: 0; background-color: #0A0C10; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            `}</style>

            <CoverSlide filters={filters} date={reportDate} title="房市分析報告" />

            <MetricsSlide
                metrics={data.coreMetrics}
                rankings={data.projectRanking}
            />

            <RankingSlide rankings={data.projectRanking} />

            {/* Additional Slides would be added here */}
            {/* <PriceBandSlide ... /> */}
            {/* <DistrictSlide ... /> */}
        </div>
    );
};
