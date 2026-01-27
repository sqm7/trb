import React from "react";
import { cn } from "@/lib/utils";

interface PolicyTimelineSlideProps {
    data: any; // Timeline usually uses static config + some highlight data currently? 
    // Based on PolicyTimelineReport, it uses strictly static policy data currently or minimal interaction.
    // We will just render the timeline statically.
}

const POLICY_Events = [
    { date: "2023-01", title: "平均地權條例修正", desc: "預售屋禁止換約轉售，私法人購屋許可制，建立檢舉獎金制度。", type: "major" },
    { date: "2023-08", title: "新青安貸款專案", desc: "貸款額度提高至1000萬，利息補貼加碼，年限延長至40年。", type: "stimulus" },
    { date: "2023-09", title: "囤房稅2.0草案", desc: "非自住住家用房屋稅率調高，採全國歸戶。", type: "major" },
    //{ date: "2024-07", title: "囤房稅2.0上路", desc: "單一自住房屋現值一定金額以下，稅率由1.2%降為1%。", type: "major" },
];

export function PolicyTimelineSlide({ data }: PolicyTimelineSlideProps) {
    // Current PolicyTimelineReport is mostly static or just overlays on chart.
    // For Slide, we'll present a nice visual timeline of these even if not strictly data-driven yet,
    // as it serves as "Context" for the report.

    return (
        <div className="flex flex-col h-full gap-4 p-2">
            <div className="bg-zinc-900/30 rounded-xl border border-white/5 p-6 flex-1 flex flex-col justify-center relative overflow-hidden">
                <h3 className="text-lg font-semibold text-zinc-300 mb-8 flex items-center gap-2 absolute top-6 left-6">
                    <div className="w-1.5 h-6 bg-violet-500 rounded-full"></div>
                    政策影響大事記 (Policy Timeline)
                </h3>

                <div className="relative">
                    {/* Horizontal Line */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-800 -translate-y-1/2 rounded-full"></div>

                    <div className="grid grid-cols-3 gap-8 relative z-10 px-12">
                        {POLICY_Events.map((event, idx) => (
                            <div key={idx} className="flex flex-col items-center group">
                                {/* Dot */}
                                <div className={cn(
                                    "w-6 h-6 rounded-full border-4 shadow-lg mb-4 bg-zinc-900 transition-colors z-20",
                                    event.type === 'stimulus' ? "border-green-500 shadow-green-900/20" : "border-red-500 shadow-red-900/20"
                                )}></div>

                                {/* Content Card */}
                                <div className="bg-zinc-900/80 border border-white/10 rounded-xl p-4 w-full backdrop-blur-sm text-center">
                                    <div className="text-violet-400 font-mono font-bold mb-1">{event.date}</div>
                                    <h4 className="text-white font-semibold mb-2">{event.title}</h4>
                                    <p className="text-xs text-zinc-400 leading-relaxed text-left">
                                        {event.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute bottom-6 right-6 text-xs text-zinc-600">
                    * 僅列出對近期房市有重大影響之關鍵政策
                </div>
            </div>
        </div>
    );
}
