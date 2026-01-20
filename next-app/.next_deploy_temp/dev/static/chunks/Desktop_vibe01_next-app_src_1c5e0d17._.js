(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Desktop/vibe01/next-app/src/lib/supabase.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/Desktop/vibe01/next-app/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/node_modules/@supabase/supabase-js/dist/index.mjs [app-client] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://zxbmbbfrzbtuueysicoc.supabase.co");
const supabaseKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4Ym1iYmZyemJ0dXVleXNpY29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODg5ODksImV4cCI6MjA2NjI2NDk4OX0.1IUynv5eK1xF_3pb-oasqaTrPvbeAOC4Sc1oykPBy4M");
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseKey);
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/vibe01/next-app/src/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn,
    "formatNumber",
    ()=>formatNumber
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
function formatNumber(value, decimals = 2) {
    if (value === null || value === undefined || isNaN(value)) return '-';
    return value.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/vibe01/next-app/src/lib/config.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "API_ENDPOINTS",
    ()=>API_ENDPOINTS,
    "COUNTY_CODE_MAP",
    ()=>COUNTY_CODE_MAP,
    "DISTRICT_DATA",
    ()=>DISTRICT_DATA,
    "SUPABASE_ANON_KEY",
    ()=>SUPABASE_ANON_KEY,
    "SUPABASE_URL",
    ()=>SUPABASE_URL,
    "THEME_COLORS",
    ()=>THEME_COLORS
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/Desktop/vibe01/next-app/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const SUPABASE_URL = ("TURBOPACK compile-time value", "https://zxbmbbfrzbtuueysicoc.supabase.co") || 'https://zxbmbbfrzbtuueysicoc.supabase.co';
const SUPABASE_ANON_KEY = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4Ym1iYmZyemJ0dXVleXNpY29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODg5ODksImV4cCI6MjA2NjI2NDk4OX0.1IUynv5eK1xF_3pb-oasqaTrPvbeAOC4Sc1oykPBy4M") || '';
const THEME_COLORS = {
    'dark-bg': '#1a1d29',
    'dark-card': '#252836',
    'cyan-accent': '#06b6d4',
    'purple-accent': '#8b5cf6',
    'form-bg': '#1f2937',
    'border-default': '#4b5563',
    'text-light': '#e5e7eb',
    'text-dark': '#9ca3af'
};
// API Endpoints
const BASE_URL = 'https://zxbmbbfrzbtuueysicoc.supabase.co/functions/v1';
const API_ENDPOINTS = {
    QUERY_DATA: `${BASE_URL}/query-data`,
    SUB_DATA: `${BASE_URL}/query-sub-data`,
    PROJECT_NAMES: `${BASE_URL}/query-names`,
    RANKING_ANALYSIS: `${BASE_URL}/analyze-project-ranking`,
    GENERATE_SHARE_LINK: `${BASE_URL}/generate-share-link`
};
const DISTRICT_DATA = {
    "臺北市": [
        "中正區",
        "大同區",
        "中山區",
        "松山區",
        "大安區",
        "萬華區",
        "信義區",
        "士林區",
        "北投區",
        "內湖區",
        "南港區",
        "文山區"
    ],
    "新北市": [
        "板橋區",
        "三重區",
        "中和區",
        "永和區",
        "新莊區",
        "新店區",
        "樹林區",
        "鶯歌區",
        "三峽區",
        "淡水區",
        "汐止區",
        "瑞芳區",
        "土城區",
        "蘆洲區",
        "五股區",
        "泰山區",
        "林口區",
        "深坑區",
        "石碇區",
        "坪林區",
        "三芝區",
        "石門區",
        "八里區",
        "平溪區",
        "雙溪區",
        "貢寮區",
        "金山區",
        "萬里區",
        "烏來區"
    ],
    "桃園市": [
        "桃園區",
        "中壢區",
        "大溪區",
        "楊梅區",
        "蘆竹區",
        "大園區",
        "龜山區",
        "八德區",
        "龍潭區",
        "平鎮區",
        "新屋區",
        "觀音區",
        "復興區"
    ],
    "臺中市": [
        "中區",
        "東區",
        "南區",
        "西區",
        "北區",
        "北屯區",
        "西屯區",
        "南屯區",
        "太平區",
        "大里區",
        "霧峰區",
        "烏日區",
        "豐原區",
        "后里區",
        "石岡區",
        "東勢區",
        "和平區",
        "新社區",
        "潭子區",
        "大雅區",
        "神岡區",
        "大肚區",
        "沙鹿區",
        "龍井區",
        "梧棲區",
        "清水區",
        "大甲區",
        "外埔區",
        "大安區"
    ],
    "臺南市": [
        "中西區",
        "東區",
        "南區",
        "北區",
        "安平區",
        "安南區",
        "永康區",
        "歸仁區",
        "新化區",
        "左鎮區",
        "玉井區",
        "楠西區",
        "南化區",
        "仁德區",
        "關廟區",
        "龍崎區",
        "官田區",
        "麻豆區",
        "佳里區",
        "西港區",
        "七股區",
        "將軍區",
        "學甲區",
        "北門區",
        "新營區",
        "後壁區",
        "白河區",
        "東山區",
        "六甲區",
        "下營區",
        "柳營區",
        "鹽水區",
        "善化區",
        "大內區",
        "山上區",
        "新市區",
        "安定區"
    ],
    "高雄市": [
        "新興區",
        "前金區",
        "苓雅區",
        "鹽埕區",
        "鼓山區",
        "旗津區",
        "前鎮區",
        "三民區",
        "楠梓區",
        "小港區",
        "左營區",
        "仁武區",
        "大社區",
        "岡山區",
        "路竹區",
        "阿蓮區",
        "田寮區",
        "燕巢區",
        "橋頭區",
        "梓官區",
        "彌陀區",
        "永安區",
        "湖內區",
        "鳳山區",
        "大寮區",
        "林園區",
        "鳥松區",
        "大樹區",
        "旗山區",
        "美濃區",
        "六龜區",
        "內門區",
        "杉林區",
        "甲仙區",
        "桃源區",
        "那瑪夏區",
        "茂林區",
        "茄萣區"
    ],
    "基隆市": [
        "仁愛區",
        "信義區",
        "中正區",
        "中山區",
        "安樂區",
        "暖暖區",
        "七堵區"
    ],
    "新竹市": [
        "東區",
        "北區",
        "香山區"
    ],
    "嘉義市": [
        "東區",
        "西區"
    ],
    "宜蘭縣": [
        "宜蘭市",
        "羅東鎮",
        "蘇澳鎮",
        "頭城鎮",
        "礁溪鄉",
        "壯圍鄉",
        "員山鄉",
        "冬山鄉",
        "五結鄉",
        "三星鄉",
        "大同鄉",
        "南澳鄉"
    ],
    "新竹縣": [
        "竹北市",
        "竹東鎮",
        "新埔鎮",
        "關西鎮",
        "湖口鄉",
        "新豐鄉",
        "芎林鄉",
        "橫山鄉",
        "北埔鄉",
        "寶山鄉",
        "峨眉鄉",
        "尖石鄉",
        "五峰鄉"
    ],
    "苗栗縣": [
        "苗栗市",
        "苑裡鎮",
        "通霄鎮",
        "竹南鎮",
        "頭份鎮",
        "後龍鎮",
        "卓蘭鎮",
        "大湖鄉",
        "公館鄉",
        "銅鑼鄉",
        "南庄鄉",
        "頭屋鄉",
        "三義鄉",
        "西湖鄉",
        "造橋鄉",
        "三灣鄉",
        "獅潭鄉",
        "泰安鄉"
    ],
    "彰化縣": [
        "彰化市",
        "鹿港鎮",
        "和美鎮",
        "線西鄉",
        "伸港鄉",
        "福興鄉",
        "秀水鄉",
        "花壇鄉",
        "芬園鄉",
        "員林鎮",
        "溪湖鎮",
        "田中鎮",
        "大村鄉",
        "埔鹽鄉",
        "埔心鄉",
        "永靖鄉",
        "社頭鄉",
        "二水鄉",
        "北斗鎮",
        "二林鎮",
        "田尾鄉",
        "埤頭鄉",
        "芳苑鄉",
        "大城鄉",
        "竹塘鄉",
        "溪州鄉"
    ],
    "南投縣": [
        "南投市",
        "埔里鎮",
        "草屯鎮",
        "竹山鎮",
        "集集鎮",
        "名間鄉",
        "鹿谷鄉",
        "中寮鄉",
        "魚池鄉",
        "國姓鄉",
        "水里鄉",
        "信義鄉",
        "仁愛鄉"
    ],
    "雲林縣": [
        "斗六市",
        "斗南鎮",
        "虎尾鎮",
        "西螺鎮",
        "土庫鎮",
        "北港鎮",
        "古坑鄉",
        "大埤鄉",
        "莿桐鄉",
        "林內鄉",
        "二崙鄉",
        "崙背鄉",
        "麥寮鄉",
        "東勢鄉",
        "褒忠鄉",
        "台西鄉",
        "元長鄉",
        "四湖鄉",
        "口湖鄉",
        "水林鄉"
    ],
    "嘉義縣": [
        "太保市",
        "朴子市",
        "布袋鎮",
        "大林鎮",
        "民雄鄉",
        "溪口鄉",
        "新港鄉",
        "六腳鄉",
        "東石鄉",
        "義竹鄉",
        "鹿草鄉",
        "水上鄉",
        "中埔鄉",
        "竹崎鄉",
        "梅山鄉",
        "番路鄉",
        "大埔鄉",
        "阿里山鄉"
    ],
    "屏東縣": [
        "屏東市",
        "潮州鎮",
        "東港鎮",
        "恆春鎮",
        "萬丹鄉",
        "長治鄉",
        "麟洛鄉",
        "九如鄉",
        "里港鄉",
        "鹽埔鄉",
        "高樹鄉",
        "萬巒鄉",
        "內埔鄉",
        "竹田鄉",
        "新埤鄉",
        "枋寮鄉",
        "新園鄉",
        "崁頂鄉",
        "林邊鄉",
        "南州鄉",
        "佳冬鄉",
        "琉球鄉",
        "車城鄉",
        "滿州鄉",
        "枋山鄉",
        "霧台鄉",
        "瑪家鄉",
        "泰武鄉",
        "來義鄉",
        "春日鄉",
        "獅子鄉",
        "牡丹鄉",
        "三地門鄉"
    ],
    "花蓮縣": [
        "花蓮市",
        "鳳林鎮",
        "玉里鎮",
        "新城鄉",
        "吉安鄉",
        "壽豐鄉",
        "光復鄉",
        "豐濱鄉",
        "瑞穗鄉",
        "富里鄉",
        "秀林鄉",
        "萬榮鄉",
        "卓溪鄉"
    ],
    "臺東縣": [
        "臺東市",
        "成功鎮",
        "關山鎮",
        "卑南鄉",
        "鹿野鄉",
        "池上鄉",
        "東河鄉",
        "長濱鄉",
        "太麻里鄉",
        "大武鄉",
        "綠島鄉",
        "海端鄉",
        "延平鄉",
        "金峰鄉",
        "達仁鄉",
        "蘭嶼鄉"
    ],
    "澎湖縣": [
        "馬公市",
        "湖西鄉",
        "白沙鄉",
        "西嶼鄉",
        "望安鄉",
        "七美鄉"
    ],
    "金門縣": [
        "金城鎮",
        "金湖鎮",
        "金沙鄉",
        "金寧鄉",
        "烈嶼鄉",
        "烏坵鄉"
    ],
    "連江縣": [
        "南竿鄉",
        "北竿鄉",
        "莒光鄉",
        "東引鄉"
    ]
};
const COUNTY_CODE_MAP = {
    "臺北市": "A",
    "新北市": "F",
    "桃園市": "H",
    "臺中市": "B",
    "臺南市": "D",
    "高雄市": "E",
    "基隆市": "C",
    "新竹市": "O",
    "嘉義市": "I",
    "新竹縣": "J",
    "苗栗縣": "K",
    "彰化縣": "N",
    "南投縣": "M",
    "雲林縣": "P",
    "嘉義縣": "Q",
    "屏東縣": "T",
    "宜蘭縣": "G",
    "花蓮縣": "U",
    "臺東縣": "V",
    "澎湖縣": "X",
    "金門縣": "W",
    "連江縣": "Z"
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/vibe01/next-app/src/lib/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "analyzeData",
    ()=>analyzeData,
    "api",
    ()=>api,
    "checkAuth",
    ()=>checkAuth,
    "fetchData",
    ()=>fetchData,
    "fetchProjectNameSuggestions",
    ()=>fetchProjectNameSuggestions,
    "fetchSubData",
    ()=>fetchSubData,
    "generateShareLink",
    ()=>generateShareLink,
    "getUser",
    ()=>getUser,
    "signOut",
    ()=>signOut
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/src/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/src/lib/config.ts [app-client] (ecmascript)");
;
;
async function getAuthHeaders() {
    const { data: { session } } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.getSession();
    return {
        'Content-Type': 'application/json',
        'apikey': __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SUPABASE_ANON_KEY"],
        'Authorization': `Bearer ${session?.access_token || __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SUPABASE_ANON_KEY"]}`
    };
}
async function checkAuth() {
    const { data: { session } } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.getSession();
    if (!session) {
        console.log('User not logged in, but allowing access.');
    }
}
async function getUser() {
    const { data: { user } } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.getUser();
    return user;
}
async function signOut() {
    const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.signOut();
    if (error) {
        console.error('Sign out failed:', error);
        throw error;
    }
}
async function fetchData(filters, pagination) {
    const headers = await getAuthHeaders();
    const response = await fetch(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].QUERY_DATA, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            filters,
            pagination
        })
    });
    if (!response.ok) {
        const err = await response.json().catch(()=>({
                error: 'Failed to parse server response'
            }));
        throw new Error(err.error || 'Fetch data failed');
    }
    return response.json();
}
async function analyzeData(filters) {
    const headers = await getAuthHeaders();
    const response = await fetch(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].RANKING_ANALYSIS, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            filters
        })
    });
    if (!response.ok) {
        const err = await response.json().catch(()=>({
                error: `Analysis request failed: ${response.status}`
            }));
        throw new Error(err.error || 'Analyze data failed');
    }
    return response.json();
}
async function fetchSubData(id, type, county) {
    if (!id || !type || !county) {
        throw new Error(`Insufficient parameters: ${id}, ${type}, ${county}`);
    }
    const headers = await getAuthHeaders();
    const response = await fetch(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].SUB_DATA, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            id,
            type,
            county
        })
    });
    if (!response.ok) {
        const err = await response.json().catch(()=>({
                error: 'Failed to fetch sub data'
            }));
        throw new Error(err.error || 'Fetch sub data failed');
    }
    return response.json();
}
async function fetchProjectNameSuggestions(countyCode, query, districts = []) {
    const headers = await getAuthHeaders();
    const payload = {
        countyCode,
        query,
        districts,
        detailed: true
    };
    const response = await fetch(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].PROJECT_NAMES, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return response.json();
}
async function generateShareLink(payload) {
    const headers = await getAuthHeaders();
    const response = await fetch(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].GENERATE_SHARE_LINK, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        const err = await response.json().catch(()=>({
                error: 'Generate share link failed'
            }));
        throw new Error(err.error);
    }
    return response.json();
}
const api = {
    checkAuth,
    getUser,
    signOut,
    fetchData,
    analyzeData,
    analyzeProjectRanking: analyzeData,
    fetchSubData,
    fetchProjectNameSuggestions,
    generateShareLink
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/vibe01/next-app/src/lib/date-utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getDateRangeDates",
    ()=>getDateRangeDates
]);
const getDateRangeDates = (rangeType)=>{
    const end = new Date();
    let start = new Date();
    switch(rangeType){
        case '1q':
            start.setMonth(end.getMonth() - 3);
            break;
        case '2q':
            start.setMonth(end.getMonth() - 6);
            break;
        case '3q':
            start.setMonth(end.getMonth() - 9);
            break;
        case '1y':
            start.setFullYear(end.getFullYear() - 1);
            break;
        case 'this_year':
            start = new Date(end.getFullYear(), 0, 1);
            break;
        case 'last_2_years':
            start = new Date(end.getFullYear() - 1, 0, 1);
            break;
        case 'last_3_years':
            start = new Date(end.getFullYear() - 2, 0, 1);
            break;
        default:
            return {
                startDate: '',
                endDate: ''
            };
    }
    return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
    };
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/vibe01/next-app/src/lib/room-utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * src/lib/room-utils.ts
 * 用於前端一致地判斷房型分類的工具函數
 */ __turbopack_context__.s([
    "extractUnitType",
    ()=>extractUnitType,
    "getRoomType",
    ()=>getRoomType
]);
function getRoomType(record) {
    // 為了與後端邏輯一致，也進行標準化處理
    const normalizeString = (str)=>{
        if (!str) return '';
        return String(str).normalize('NFKC').toUpperCase().replace(/\s+/g, '');
    };
    // Support both API raw keys (Chinese) and normalized keys (CamelCase)
    const buildingType = normalizeString(record['建物型態'] || record.buildingType);
    const mainPurpose = normalizeString(record['主要用途'] || record.mainPurpose);
    const unitName = normalizeString(record['戶別'] || record.unit);
    const rooms = record['房數'] !== undefined ? record['房數'] : record.rooms;
    const houseArea = record['房屋面積(坪)'] !== undefined ? parseFloat(record['房屋面積(坪)']) : parseFloat(record.houseArea || 0);
    // 【新增規則】處理住宅大樓內含 'S' 的特殊店舖情況
    if (buildingType.includes('住宅大樓') && unitName.includes('S')) {
        return '店舖';
    }
    // 第零優先級：從「戶別」文字直接判斷 (補全關鍵字)
    if (unitName.includes('店舖') || unitName.includes('店面') || unitName.includes('店鋪')) return '店舖';
    if (unitName.includes('事務所') || unitName.includes('辦公')) return '辦公/事務所';
    // 第一優先級：特殊商業用途 (建物型態/主要用途) (補全關鍵字)
    if (buildingType.includes('店舖') || buildingType.includes('店面') || buildingType.includes('店鋪')) return '店舖';
    if (buildingType.includes('工廠') || buildingType.includes('倉庫') || buildingType.includes('廠辦')) return '廠辦/工廠';
    if (mainPurpose.includes('商業') || buildingType.includes('辦公') || buildingType.includes('事務所')) return '辦公/事務所';
    // 第二優先級：特殊住宅格局 (0房)
    const isResidentialBuilding = buildingType.includes('住宅大樓') || buildingType.includes('華廈');
    if (isResidentialBuilding && rooms === 0) {
        if (houseArea > 35) return '毛胚';
        if (houseArea <= 35) return '套房';
    }
    // 第三優先級：標準住宅房型
    if (typeof rooms === 'number' && !isNaN(rooms)) {
        if (rooms === 1) return '1房';
        if (rooms === 2) return '2房';
        if (rooms === 3) return '3房';
        if (rooms === 4) return '4房';
        if (rooms >= 5) return '5房以上';
    }
    return '其他';
}
function extractUnitType(unitName) {
    if (!unitName) return '-';
    // 1. 移除 "棟", "號", "樓", "F" 等後綴及其後的內容 (如果有明確分隔)
    // 常見格式: "A2棟14F號", "A5棟10樓", "B1-5F", "T1-12F"
    let processed = unitName.trim();
    // Case 1: "A2棟..." -> "A2"
    if (processed.includes('棟')) {
        processed = processed.split('棟')[0];
    }
    // Case 2: "XXX號" (通常出現在最後，且前面可能是樓層)
    // 很多時候 "A2棟14F號" -> "A2" (已經被 Case 1 處理)
    // 如果沒有棟，例如 "14F-5號" -> 可能是透天或公寓，較難處理，暫不強行截斷
    // Case 3: 含有 "-" (通常是 戶型-樓層，如 B1-5F)
    // 但要小心 "B1-1" 這種可能是戶型本身
    // 判斷 "-" 後面是否為樓層 (數字+F 或 純數字)
    if (processed.includes('-')) {
        const parts = processed.split('-');
        // 如果 part[1] 看起來像樓層 (5F, 12, 12F)
        if (/^\d+F?$/.test(parts[1])) {
            processed = parts[0];
        }
    }
    // Case 4: 含有樓層關鍵字但沒有明確分隔符 (比較危險，需保守)
    // 例如 "A1戶10樓"
    if (processed.includes('戶')) {
        processed = processed.split('戶')[0];
    }
    // Advanced cleaning: 移除可能殘留的 "F" 如果它在末尾且前面是數字 (通常被 Case 1/3 處理了，但以防萬一)
    return processed;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/vibe01/next-app/src/lib/unit-parser.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// 檔案路徑: supabase/functions/_shared/unit-parser.ts
/**
 * @file 自適應戶別解析系統 (Adaptive Unit Parser System) - v12.6 (新增五個使用者定義規則)
 * @description 具備自動學習能力的戶別解析系統，能夠從數據中學習新的命名模式並適應各種建案的獨特規則
 * @final-logic 系統提供初步的、基於單筆上下文的解析，最終的風格一致性校正由主分析函式完成。
 */ // ===== 類型定義 =====
__turbopack_context__.s([
    "AdaptiveUnitResolver",
    ()=>AdaptiveUnitResolver,
    "UnitIdentifierResolver",
    ()=>UnitIdentifierResolver,
    "getUnitIdentifier",
    ()=>getUnitIdentifier
]);
// ===== 模式偵測器 =====
class PatternDetector {
    knownPatterns = new Map();
    patternFrequency = new Map();
    constructor(){
        this.initializeBasePatterns();
    }
    initializeBasePatterns() {
        const basePatterns = [
            // ==========================================================
            //【使用者新增規則】
            // 案例: A2/9F號, 樓層為 9, 應解析為 "A2"
            {
                id: 'unit_slash_floorF_format',
                name: '戶號斜線樓層F格式',
                regex: /^([A-Z]\d+)\/(\d+)F[號号]?$/i,
                extract: (m, ctx)=>{
                    const unitIdentifier = m[1]; // A2
                    const floorInUnit = m[2]; // 9
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return unitIdentifier;
                    }
                    return unitIdentifier + floorInUnit;
                },
                confidence: 100,
                priority: 0.01 // 極高優先級
            },
            // 案例: C棟6-9號, 樓層為 9, 應解析為 "C6"
            {
                id: 'building_unit_floor_combined',
                name: '棟別戶號樓層合併格式',
                regex: /^([A-Z])棟(\d+)-(\d+)[號号]?$/i,
                extract: (m, ctx)=>{
                    const buildingLetter = m[1]; // C
                    const unitPart = m[2]; // 6
                    const floorPart = m[3]; // 9
                    if (ctx?.floor && parseInt(floorPart, 10) === parseInt(ctx.floor, 10)) {
                        return buildingLetter + unitPart;
                    }
                    return buildingLetter + unitPart + floorPart;
                },
                confidence: 100,
                priority: 0.02 // 極高優先級
            },
            // 案例: B棟3-2F號, 樓層為 2, 應解析為 "B3"
            {
                id: 'building_unit_floorF_format_v2',
                name: '棟別戶號樓層F格式v2',
                regex: /^([A-Z])棟(\d+)-(\d+)F[號号]?$/i,
                extract: (m, ctx)=>{
                    const buildingLetter = m[1]; // B
                    const unitPart = m[2]; // 3
                    const floorPart = m[3]; // 2
                    if (ctx?.floor && parseInt(floorPart, 10) === parseInt(ctx.floor, 10)) {
                        return buildingLetter + unitPart;
                    }
                    return buildingLetter + unitPart + floorPart;
                },
                confidence: 100,
                priority: 0.03 // 極高優先級
            },
            // 案例: C2棟0號, 樓層為 9, 應解析為 "C2"
            {
                id: 'unit_building_zero_format',
                name: '戶號棟別0號格式',
                regex: /^([A-Z]\d+)棟0[號号]?$/i,
                extract: (m)=>m[1],
                confidence: 100,
                priority: 0.04 // 極高優先級
            },
            // 案例: A號, 應解析為 "A"
            {
                id: 'single_letter_unit',
                name: '單字母戶號格式',
                regex: /^([A-Z])[號号]$/i,
                extract: (m)=>m[1],
                confidence: 95,
                priority: 0.045 // 高優先級，處理最簡單的模式
            },
            // ==========================================================
            {
                id: 'building_floor_unit_letter_format',
                name: '棟別樓層數字戶型字母格式',
                regex: /^([A-Z])棟(\d+)([A-Z])[號号]?$/i,
                extract: (m, ctx)=>{
                    const buildingLetter = m[1]; // e.g., 'A'
                    const floorInUnit = parseInt(m[2], 10); // e.g., 8
                    const unitLetter = m[3]; // e.g., 'A'
                    // 如果戶別中的樓層與上下文樓層相符，則回傳戶型字母
                    if (ctx?.floor && floorInUnit === parseInt(ctx.floor, 10)) {
                        return unitLetter; // 期望結果為 "A"
                    }
                    // 如果樓層不符或沒有上下文樓層，則回傳組合，以便於除錯或進一步判斷
                    return `${buildingLetter}${floorInUnit}${unitLetter}`;
                },
                confidence: 99,
                priority: 0.05 // 給予高優先級，以確保此特定模式能被優先匹配
            },
            {
                id: 'building_floor_unit_format',
                name: '棟別樓層戶號格式',
                regex: /^([A-Z])棟(\d{1,2})F-(\d+)[號号]?$/,
                extract: (m, ctx)=>{
                    const buildingLetter = m[1];
                    const floorInUnit = m[2];
                    const unitNumber = m[3];
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return buildingLetter + unitNumber;
                    }
                    return buildingLetter + floorInUnit + unitNumber;
                },
                confidence: 99,
                priority: 0.1
            },
            {
                id: 'letter_number_floor_format',
                name: '字母數字-樓層F格式',
                regex: /^([A-Z])0*(\d+)-(\d{1,2})F[號号]?$/,
                extract: (m, ctx)=>{
                    const buildingLetter = m[1];
                    const unitNumber = m[2];
                    const floorInUnit = m[3];
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return buildingLetter + unitNumber;
                    }
                    return buildingLetter + unitNumber + floorInUnit;
                },
                confidence: 99,
                priority: 0.15
            },
            {
                id: 'identifier_building_floor_redundant',
                name: '識別碼棟與F樓層格式(贅余樓層)',
                // 案例: "A01棟F02號", 樓層為 2, 應解析為 "A1"
                // 【修正】: 將 "号" 改為 "[號号]" 以匹配兩種寫法
                regex: /^([A-Z]\d+)棟F(\d+)[號号]?$/i,
                extract: (m, ctx)=>{
                    const identifier = m[1]; // "A01"
                    const floorInUnit = m[2]; // "02"
                    // 提取字母和數字部分，並去除數字開頭的0
                    const letterPart = identifier.match(/^[A-Z]+/)?.[0] || '';
                    const numberPart = parseInt(identifier.match(/\d+/)?.[0] || '0', 10);
                    // 組合成標準化ID ("A" + 1 -> "A1")
                    const cleanedIdentifier = `${letterPart}${numberPart}`;
                    // 如果戶別中的樓層與上下文樓層相符，則視為贅余資訊，只回傳標準化ID
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return cleanedIdentifier;
                    }
                    // 如果不符，則保留樓層資訊以供除錯
                    return cleanedIdentifier + 'F' + floorInUnit;
                },
                confidence: 98,
                priority: 0.18 // 優先級高，因為格式非常特定
            },
            {
                id: 'identifier_building_floorF_format',
                name: '識別碼棟與樓層F格式(贅余樓層)',
                // 案例: "A2棟5F號", 樓層為 5, 應解析為 "A2"
                // 【修正】: 將 "号" 改為 "[號号]" 以匹配兩種寫法
                regex: /^([A-Z]\d+)棟(\d{1,2})F[號号]?$/i,
                extract: (m, ctx)=>{
                    const identifier = m[1]; // "A2"
                    const floorInUnit = m[2]; // "5"
                    // 如果戶別中的樓層與上下文樓層相符，則只回傳識別碼
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return identifier;
                    }
                    // 如果不符，則保留樓層資訊
                    return identifier + floorInUnit;
                },
                confidence: 98,
                priority: 0.19 // 優先級高，緊跟上一條規則
            },
            {
                id: 'unit_building_floor_format',
                name: '戶棟樓層格式',
                regex: /^([A-Z]\d+)戶棟(\d+)F[號号]?$/,
                extract: (m, ctx)=>{
                    const unitIdentifier = m[1];
                    const floorInUnit = m[2];
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return unitIdentifier;
                    }
                    return unitIdentifier + floorInUnit;
                },
                confidence: 99,
                priority: 0.2
            },
            {
                id: 'building_sub_unit_floor_format',
                name: '棟別子戶號樓層格式',
                regex: /^([A-Z])棟(\d+)-(\d+)F[號号]?$/,
                extract: (m, ctx)=>{
                    const buildingLetter = m[1];
                    const subUnitNumber = m[2];
                    const floorInUnit = m[3];
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return buildingLetter + subUnitNumber;
                    }
                    return buildingLetter + subUnitNumber + floorInUnit;
                },
                confidence: 99,
                priority: 0.3
            },
            {
                id: 'building_unit_floor_format',
                name: '棟別戶別樓層格式',
                regex: /^([A-Z])棟([A-Z])-(\d{1,2})F[號号]?$/,
                extract: (m, ctx)=>{
                    const unitLetter = m[2];
                    const floorInUnit = m[3];
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return unitLetter;
                    }
                    return unitLetter + floorInUnit;
                },
                confidence: 99,
                priority: 0.4
            },
            {
                id: 'building_self_unit_floor_format',
                name: '棟別自身戶號樓層格式',
                regex: /^([A-Z])棟\1-(\d+)[號号]?$/,
                extract: (m, ctx)=>{
                    const unitLetter = m[1];
                    const floorInUnit = m[2];
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return unitLetter;
                    }
                    return unitLetter + floorInUnit;
                },
                confidence: 98,
                priority: 0.45
            },
            {
                id: 'building_unit_letter_floor_number',
                name: '棟別戶號字母樓層數字格式',
                regex: /^([A-Z])棟([A-Z])(\d{1,2})[號号]?$/,
                extract: (m, ctx)=>{
                    const unitLetter = m[2];
                    const floorInUnit = m[3];
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return unitLetter;
                    }
                    return unitLetter + floorInUnit;
                },
                confidence: 98,
                priority: 0.46
            },
            {
                id: 'redundant_building_format',
                name: '重複棟別格式',
                regex: /^([A-Z])棟\1-(\d{1,2})F[號号]?$/,
                extract: (m, ctx)=>{
                    const buildingLetter = m[1];
                    const floorInUnit = m[2];
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return buildingLetter;
                    }
                    return buildingLetter + floorInUnit;
                },
                confidence: 98,
                priority: 0.5
            },
            {
                id: 'building_floor_letter_unit',
                name: '棟別樓層字母戶號格式',
                regex: /^[A-Z]棟(\d{1,2})F-([A-Z])[號号]?$/,
                extract: (m, ctx)=>{
                    const floorInUnit = m[1];
                    const unitLetter = m[2];
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return unitLetter;
                    }
                    return unitLetter + floorInUnit;
                },
                confidence: 98,
                priority: 0.6
            },
            {
                id: 'letter_leading_zero_unit',
                name: '字母與0開頭數字戶號',
                regex: /^([A-Z])0+(\d+)[號号]?$/,
                extract: (m)=>m[1] + m[2],
                confidence: 97,
                priority: 0.7
            },
            {
                id: 'floor_prefix_format',
                name: '樓層前綴格式',
                regex: /^(\d{1,2})([A-Z])[號号]?$/,
                extract: (m, ctx)=>{
                    const floorInUnit = m[1];
                    const letterPart = m[2];
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return letterPart;
                    }
                    return floorInUnit + letterPart;
                },
                confidence: 96,
                priority: 0.8
            },
            {
                id: 'floorF_building_unit_format',
                name: '樓層F棟戶號格式',
                regex: /^(\d{1,2})F棟([A-Z])[號号]?$/,
                extract: (m, ctx)=>{
                    const floorInUnit = m[1];
                    const unitLetter = m[2];
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return unitLetter;
                    }
                    return floorInUnit + unitLetter;
                },
                confidence: 98,
                priority: 0.85
            },
            {
                id: 'numericBuilding_floor_unit_format',
                name: '數字棟別樓層戶號格式',
                regex: /^(\d+)棟(\d{1,2})([A-Z])[號号]?$/,
                extract: (m, ctx)=>{
                    const floorInUnit = m[2];
                    const unitLetter = m[3];
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return unitLetter;
                    }
                    return floorInUnit + unitLetter;
                },
                confidence: 98,
                priority: 0.86
            },
            {
                id: 'floor_first_detailed',
                name: '樓層優先詳細格式',
                regex: /(\d{1,2})F-([A-Z])(\d{2})/,
                extract: (m)=>m[2] + m[3],
                confidence: 95,
                priority: 1
            },
            {
                id: 'floor_prefix_complex_unit',
                name: '樓層前綴複合戶號',
                regex: /^(\d{1,2})F-([A-Z]\d+)[號号]?$/,
                extract: (m, ctx)=>{
                    const floorInUnit = m[1];
                    const unitIdentifier = m[2];
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return unitIdentifier;
                    }
                    return floorInUnit + unitIdentifier;
                },
                confidence: 94,
                priority: 1.2
            },
            {
                id: 'floor_first_simple_letter',
                name: '樓層優先簡單字母格式',
                regex: /^(\d{1,2})F-([A-Z])[號号]?$/,
                extract: (match, context)=>{
                    const floorInUnit = match[1];
                    const unitLetter = match[2];
                    if (context?.floor && parseInt(floorInUnit, 10) === parseInt(context.floor, 10)) {
                        return unitLetter;
                    } else {
                        return floorInUnit + unitLetter;
                    }
                },
                confidence: 90,
                priority: 1.5
            },
            {
                id: 'building_with_unit',
                name: '棟別完整戶號',
                regex: /([A-Z])棟([A-Z])(\d{1,2})(?:-(\d{1,2})F?[號号])?/,
                extract: (m)=>m[2] + m[3],
                confidence: 90,
                priority: 2,
                conditions: [
                    {
                        type: 'building_match',
                        validator: (ctx)=>{
                            const match = ctx.rawUnit.match(/([A-Z])棟([A-Z])/);
                            return match ? match[1] === match[2] : false;
                        }
                    }
                ]
            },
            {
                id: 'building_simple_letter_unit',
                name: '棟別字母戶號格式',
                regex: /^[A-Z]棟([A-Z])[號号]?$/,
                extract: (m)=>m[1],
                confidence: 92,
                priority: 2.5
            },
            {
                id: 'unit_floor_suffix',
                name: '戶號樓層後綴',
                regex: /([A-Z]\d{1,2})-(\d{1,2})F?[號号]?/,
                extract: (m)=>m[1],
                confidence: 85,
                priority: 3
            },
            {
                id: 'building_floor_format',
                name: '棟別樓層格式',
                regex: /^([A-Z]\d{1,2})棟(\d{1,2})(?:F|樓)[號号]?$/,
                extract: (m, ctx)=>{
                    const unitIdentifier = m[1];
                    const floorInUnit = m[2];
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return unitIdentifier;
                    }
                    return unitIdentifier + floorInUnit;
                },
                confidence: 88,
                priority: 3.5
            },
            {
                id: 'building_complex_number',
                name: '複合棟別編號',
                regex: /^([A-Z]\d+)棟(\d+)[號号]$/,
                extract: (m, ctx)=>{
                    const unitIdentifier = m[1];
                    const floorInUnit = m[2];
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return unitIdentifier;
                    }
                    return unitIdentifier + floorInUnit;
                },
                confidence: 86,
                priority: 3.8
            },
            {
                id: 'building_floor_F_format',
                name: '棟別樓層F格式',
                regex: /^([A-Z])棟(\d{1,2})F[號号]?$/,
                extract: (m, ctx)=>{
                    const letterPart = m[1];
                    const floorInUnit = m[2];
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return letterPart;
                    }
                    return letterPart + floorInUnit;
                },
                confidence: 87,
                priority: 3.9
            },
            {
                id: 'building_zero_placeholder_unit',
                name: '棟別0號佔位符格式',
                regex: /^([A-Z])棟0[號号]?$/,
                extract: (m)=>m[1],
                confidence: 95,
                priority: 3.95
            },
            {
                id: 'building_simple_number',
                name: '棟別簡單編號',
                regex: /([A-Z])棟(\d{1,2})[號号]/,
                extract: (match, context)=>{
                    const buildingLetter = match[1];
                    const unitNumber = match[2];
                    if (context?.floor && parseInt(unitNumber, 10) === parseInt(context.floor, 10)) {
                        return buildingLetter;
                    } else {
                        return buildingLetter + unitNumber;
                    }
                },
                confidence: 85,
                priority: 4
            },
            {
                id: 'unit_floor_concatenated',
                name: '複合戶號樓層格式',
                regex: /^([A-Z])(\d+)F[號号]?$/,
                extract: (m, ctx)=>{
                    const letterPart = m[1];
                    const numberPart = m[2];
                    const floorStr = ctx?.floor;
                    if (floorStr) {
                        const floorInt = parseInt(floorStr, 10);
                        if (!isNaN(floorInt)) {
                            if (floorInt < 10) {
                                const paddedFloor = '0' + floorStr;
                                if (numberPart.endsWith(paddedFloor)) {
                                    const unitNumber = numberPart.substring(0, numberPart.length - 2);
                                    return letterPart + unitNumber;
                                }
                            }
                            if (numberPart.endsWith(floorStr)) {
                                const unitNumber = numberPart.substring(0, numberPart.length - floorStr.length);
                                return letterPart + unitNumber;
                            }
                        }
                    }
                    return letterPart + numberPart;
                },
                confidence: 80,
                priority: 4.5
            },
            {
                id: 'letter_floor',
                name: '字母樓層格式',
                regex: /^([A-Z])-(\d{1,2})F?[號号]?$/,
                extract: (m, ctx)=>{
                    const floorInUnit = m[2];
                    if (ctx?.floor && parseInt(floorInUnit, 10) === parseInt(ctx.floor, 10)) {
                        return m[1];
                    }
                    return m[1] + floorInUnit;
                },
                confidence: 70,
                priority: 5
            }
        ];
        basePatterns.forEach((pattern)=>{
            this.knownPatterns.set(pattern.id, pattern);
        });
    }
    detectPattern(text, context) {
        const normalizedText = this.normalizeText(text);
        let bestMatch = null;
        const sortedPatterns = Array.from(this.knownPatterns.values()).sort((a, b)=>a.priority - b.priority);
        for (const rule of sortedPatterns){
            const match = normalizedText.match(rule.regex);
            if (match) {
                if (rule.conditions && context) {
                    const allConditionsMet = rule.conditions.every((condition)=>condition.validator(context));
                    if (!allConditionsMet) continue;
                }
                bestMatch = {
                    rule,
                    match
                };
                break;
            }
        }
        if (bestMatch) {
            this.patternFrequency.set(bestMatch.rule.id, (this.patternFrequency.get(bestMatch.rule.id) || 0) + 1);
        }
        return bestMatch;
    }
    normalizeText(text) {
        if (!text) return '';
        return text.toUpperCase().replace(/[\uff01-\uff5e]/g, (ch)=>String.fromCharCode(ch.charCodeAt(0) - 0xfee0)).replace(/\s+/g, '');
    }
}
// ===== 建案分析器 =====
class ProjectAnalyzer {
    projectProfiles = new Map();
    analyzeProject(projectName, records) {
        const profile = {
            projectName,
            patterns: new Map(),
            unitMappings: new Map(),
            namingStyle: 'unknown'
        };
        const detector = new PatternDetector();
        for (const record of records){
            const rawUnit = record['戶別'];
            const floor = record['樓層'];
            if (!rawUnit) continue;
            const context = {
                rawUnit,
                floor: floor ? String(floor) : undefined,
                projectName
            };
            const detectionResult = detector.detectPattern(rawUnit, context);
            if (detectionResult) {
                const pattern = detectionResult.rule;
                if (!profile.patterns.has(pattern.id)) {
                    profile.patterns.set(pattern.id, {
                        patternId: pattern.id,
                        count: 0,
                        examples: [],
                        confidence: pattern.confidence
                    });
                }
                const usage = profile.patterns.get(pattern.id);
                usage.count++;
                if (usage.examples.length < 10) {
                    usage.examples.push(rawUnit);
                }
            }
            if (!profile.unitMappings.has(rawUnit)) {
                profile.unitMappings.set(rawUnit, {
                    floors: new Set(),
                    rawVariations: new Set([
                        rawUnit
                    ])
                });
            }
            const unitInfo = profile.unitMappings.get(rawUnit);
            if (floor) unitInfo.floors.add(String(floor));
        }
        this.determineNamingStyle(profile);
        this.projectProfiles.set(projectName, profile);
        return profile;
    }
    determineNamingStyle(profile) {
        const patternCount = profile.patterns.size;
        const totalUsage = Array.from(profile.patterns.values()).reduce((sum, p)=>sum + p.count, 0);
        if (patternCount === 0) {
            profile.namingStyle = 'unknown';
            return;
        }
        let dominantPattern = null;
        let maxCount = 0;
        for (const pattern of profile.patterns.values()){
            if (pattern.count > maxCount) {
                maxCount = pattern.count;
                dominantPattern = pattern;
            }
        }
        if (dominantPattern) {
            profile.dominantPattern = dominantPattern.patternId;
            if (dominantPattern.count / totalUsage > 0.8) {
                profile.namingStyle = 'consistent';
            } else {
                profile.namingStyle = 'mixed';
            }
        }
    }
    getProjectProfile(projectName) {
        return this.projectProfiles.get(projectName);
    }
    isAmbiguousUnit(projectName, rawUnit) {
        const profile = this.projectProfiles.get(projectName);
        if (!profile) return false;
        const unitInfo = profile.unitMappings.get(rawUnit);
        return unitInfo ? unitInfo.floors.size > 1 : false;
    }
}
// ===== 規則引擎 (RuleEngine) =====
class RuleEngine {
    detector;
    customRules = new Map();
    constructor(detector){
        this.detector = detector;
        this.initializeCustomRules();
    }
    initializeCustomRules() {}
    applyRules(context) {
        for (const [ruleName, ruleFunc] of this.customRules){
            const result = ruleFunc(context);
            if (result) {
                return result;
            }
        }
        const detectionResult = this.detector.detectPattern(context.rawUnit, context);
        if (detectionResult) {
            const { rule, match } = detectionResult;
            return {
                identifier: rule.extract(match, context),
                confidence: rule.confidence,
                method: `pattern:${rule.id}`
            };
        }
        return {
            identifier: this.simpleFallback(context.rawUnit),
            confidence: 50,
            method: 'fallback'
        };
    }
    simpleFallback(text) {
        if (!text) return '';
        const normalized = text.toUpperCase().replace(/[\uff01-\uff5e]/g, (ch)=>String.fromCharCode(ch.charCodeAt(0) - 0xfee0)).replace(/\s+/g, '');
        return normalized.replace(/[棟樓F室號\-]/g, '');
    }
}
class AdaptiveUnitResolver {
    detector;
    analyzer;
    ruleEngine;
    resolveCache = new Map();
    constructor(records){
        console.log('[AdaptiveUnitResolver] 初始化，處理', records.length, '筆資料');
        this.detector = new PatternDetector();
        this.analyzer = new ProjectAnalyzer();
        this.ruleEngine = new RuleEngine(this.detector);
        this.buildKnowledgeBase(records);
    }
    buildKnowledgeBase(records) {
        const projectGroups = new Map();
        for (const record of records){
            const projectName = record['建案名稱'];
            if (!projectName) continue;
            if (!projectGroups.has(projectName)) {
                projectGroups.set(projectName, []);
            }
            projectGroups.get(projectName).push(record);
        }
        console.log('[AdaptiveUnitResolver] 分析', projectGroups.size, '個建案');
        for (const [projectName, projectRecords] of projectGroups){
            this.analyzer.analyzeProject(projectName, projectRecords);
        }
    }
    resolve(record) {
        return this.resolveWithContext(record).identifier;
    }
    resolveWithContext(record) {
        let rawUnit = record['戶別'];
        if (rawUnit && typeof rawUnit === 'string') {
            rawUnit = rawUnit.trim();
        }
        const floor = record['樓層'];
        const projectName = record['建案名稱'];
        if (!rawUnit) return {
            identifier: '',
            confidence: 0,
            method: 'no_input'
        };
        const cacheKey = `${projectName}|${rawUnit}|${floor || ''}`;
        if (this.resolveCache.has(cacheKey)) {
            return this.resolveCache.get(cacheKey);
        }
        const context = {
            rawUnit,
            floor: floor ? String(floor) : undefined,
            projectName
        };
        const result = this.ruleEngine.applyRules(context);
        if (result) {
            this.resolveCache.set(cacheKey, result);
            return result;
        }
        // Should be covered by fallback in ruleEngine, but safe fallback here
        const fallback = {
            identifier: rawUnit,
            confidence: 0,
            method: 'fallback_null'
        };
        this.resolveCache.set(cacheKey, fallback);
        return fallback;
    }
}
class UnitIdentifierResolver extends AdaptiveUnitResolver {
}
const getUnitIdentifier = (rawText, _buildingName, floor)=>{
    if (!rawText) return '';
    let cleanedText = rawText;
    cleanedText = cleanedText.trim();
    const detector = new PatternDetector();
    const ruleEngine = new RuleEngine(detector);
    return ruleEngine.applyRules({
        rawUnit: cleanedText,
        floor: floor || undefined
    })?.identifier || '';
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/vibe01/next-app/src/lib/heatmap-utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateHeatmapData",
    ()=>generateHeatmapData
]);
/**
 * src/lib/heatmap-utils.ts
 * 負責將原始交易資料轉換為熱力圖所需的水平銷控表格式
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$unit$2d$parser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/src/lib/unit-parser.ts [app-client] (ecmascript)");
;
function generateHeatmapData(projectTransactions, floorPremiumPercent = 0.3) {
    // 1. Group by Floor and Unit
    const horizontalGrid = {};
    const floorsSet = new Set();
    const unitsSet = new Set();
    // Initialize Unit Resolver with all transactions for context learning
    const unitResolver = new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$unit$2d$parser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AdaptiveUnitResolver"](projectTransactions);
    projectTransactions.forEach((tx)=>{
        // Safe property access
        let floor = tx['樓層'] || tx.floor || tx.layer;
        if (floor === undefined || floor === null) return; // Skip invalid records
        if (typeof floor === 'number') floor = String(floor);
        if (typeof floor === 'number') floor = String(floor);
        // Resolve Normalized Unit Name
        const unit = unitResolver.resolve(tx);
        // Fallback or keep raw if resolve returns empty? usually returns identifier.
        // If empty, fallback to raw? NO, resolver should handle fallback.
        // Original: const unit = tx['戶別'] || tx['戶型'] || tx.unit || '?';
        floorsSet.add(floor);
        unitsSet.add(unit);
        if (!horizontalGrid[floor]) horizontalGrid[floor] = {};
        if (!horizontalGrid[floor][unit]) horizontalGrid[floor][unit] = [];
        // Pre-calculate some fields
        const unitPrice = parseFloat(tx['房屋單價(萬)'] || tx.unitPrice || 0);
        const totalPrice = parseFloat(tx['交易總價(萬)'] || tx.totalPrice || 0);
        const housePrice = parseFloat(tx['房屋總價(萬)'] || tx.housePrice || 0);
        const parkingPrice = parseFloat(tx['車位總價(萬)'] || tx.parkingPrice || 0);
        const houseArea = parseFloat(tx['房屋面積(坪)'] || tx.houseArea || 0);
        const rooms = tx['房數'] || tx.rooms;
        const parkingType = tx['車位類別'] || tx.parkingType || '';
        const parkingCount = typeof parkingType === 'string' && parkingType.includes('車位') ? 1 : 0;
        const mainPurpose = tx['主要用途'] || tx.mainPurpose || '';
        const buildingType = tx['建物型態'] || tx.buildingType || '';
        const isStorefront = mainPurpose.includes('商業') || buildingType.includes('店') || mainPurpose.includes('店');
        const isOffice = mainPurpose.includes('辦公') || buildingType.includes('辦公') || buildingType.includes('事務所');
        horizontalGrid[floor][unit].push({
            ...tx,
            unitPrice,
            floor,
            unit,
            isStorefront,
            isOffice,
            hasParking: parkingPrice > 0,
            tooltipInfo: {
                totalPrice,
                housePrice,
                parkingPrice,
                houseArea,
                rooms
            }
        });
    });
    if (floorsSet.size === 0) {
        // Return empty structure if no valid data
        return {
            horizontalGrid: {},
            sortedFloors: [],
            sortedUnits: [],
            unitColorMap: {},
            summary: {
                totalBaselineHousePrice: 0,
                totalPricePremiumValue: 0,
                totalSoldArea: 0,
                transactionCount: 0
            },
            horizontalComparison: []
        };
    }
    // Sort floors (numeric desc, handled B1 etc)
    const sortedFloors = Array.from(floorsSet).sort((a, b)=>{
        const getFloorVal = (f)=>{
            if (!f) return 0;
            if (f.startsWith('B')) return -parseInt(f.substring(1));
            return parseInt(f) || 0;
        };
        return getFloorVal(b) - getFloorVal(a);
    });
    const sortedUnits = Array.from(unitsSet).sort();
    // 2. Identify Anchor (Baseline) Transactions
    let minPrice = Infinity;
    let anchorTx = null;
    projectTransactions.forEach((tx)=>{
        const mainPurpose = tx['主要用途'] || tx.mainPurpose || '';
        const buildingType = tx['建物型態'] || tx.buildingType || '';
        const note = tx['備註'] || tx.note || '';
        const unitPrice = parseFloat(tx['房屋單價(萬)'] || tx.unitPrice || 0);
        const isSpecial = mainPurpose.includes('商業') || buildingType.includes('店') || note.includes('特殊') || note.includes('親友');
        if (!isSpecial && unitPrice < minPrice && unitPrice > 0) {
            minPrice = unitPrice;
            anchorTx = tx;
        }
    });
    // Calculate details
    let totalBaselineHousePrice = 0;
    let totalPricePremiumValue = 0;
    let totalSoldArea = 0;
    let transactionCount = 0;
    // We need to apply the logic to each cell
    Object.keys(horizontalGrid).forEach((floor)=>{
        Object.keys(horizontalGrid[floor]).forEach((unit)=>{
            horizontalGrid[floor][unit].forEach((tx, idx)=>{
                // Determine premium
                let premium = null;
                if (anchorTx) {
                    // Theoretical price based on anchor
                    // Floor diff
                    const getFloorVal = (f)=>f.startsWith('B') ? -parseInt(f.substring(1)) : parseInt(f);
                    const anchorFloorVal = getFloorVal(anchorTx['樓層'].toString());
                    const currentFloorVal = getFloorVal(tx.floor);
                    const floorDiff = currentFloorVal - anchorFloorVal;
                    // Theoretical Unit Price = Anchor Unit Price + (Floor Diff * Premium %)
                    // Simplified model: 
                    const floorAdjustment = floorDiff * floorPremiumPercent; // %
                    // If we treat the Anchor as THE baseline for the whole project:
                    const theoreticalPrice = anchorTx['房屋單價(萬)'] * (1 + floorAdjustment / 100);
                    // Premium = (Actual - Theoretical) / Theoretical * 100
                    if (theoreticalPrice > 0) {
                        premium = (tx['房屋單價(萬)'] - theoreticalPrice) / theoreticalPrice * 100;
                        // If it IS the anchor, premium is 0
                        if (tx === anchorTx || Math.abs(tx['房屋單價(萬)'] - theoreticalPrice) < 0.1) premium = 0;
                    }
                    // Accumulate summary stats (simplified)
                    if (tx.tooltipInfo.housePrice && tx.tooltipInfo.houseArea) {
                        const baselineHousePrice = theoreticalPrice * tx.tooltipInfo.houseArea; // approx
                        totalBaselineHousePrice += baselineHousePrice;
                        totalPricePremiumValue += tx.tooltipInfo.housePrice - baselineHousePrice;
                        totalSoldArea += tx.tooltipInfo.houseArea;
                        transactionCount++;
                    }
                }
                horizontalGrid[floor][unit][idx].premium = premium;
            });
        });
    });
    // Color map
    const unitColorMap = {};
    const colors = [
        '#f87171',
        '#fb923c',
        '#fbbf24',
        '#a3e635',
        '#34d399',
        '#22d3ee',
        '#818cf8',
        '#c084fc',
        '#f472b6'
    ];
    sortedUnits.forEach((u, i)=>{
        unitColorMap[u] = colors[i % colors.length];
    });
    // 3. Horizontal Comparison (Unit Type Analysis)
    const unitTypeStats = {};
    // Initialize map
    sortedUnits.forEach((u)=>{
        unitTypeStats[u] = {
            totalPremium: 0,
            totalSoldArea: 0,
            count: 0,
            anchorPrice: null
        };
    });
    // Find anchor price for each unit type (Baseline Logic: Anchor Floor's price for this unit)
    if (anchorTx) {
        const getFloorVal = (f)=>f.startsWith('B') ? -parseInt(f.substring(1)) : parseInt(f);
        const anchorFloorVal = getFloorVal(anchorTx['樓層'].toString());
        projectTransactions.forEach((tx)=>{
            const unit = unitResolver.resolve(tx); // Ensure consistent resolution
            const floorVal = getFloorVal(tx['樓層']?.toString());
            if (floorVal === anchorFloorVal) {
                unitTypeStats[unit].anchorPrice = parseFloat(tx['房屋單價(萬)'] || 0);
            }
        });
    }
    // Accumulate Stats
    Object.keys(horizontalGrid).forEach((floor)=>{
        Object.keys(horizontalGrid[floor]).forEach((unit)=>{
            horizontalGrid[floor][unit].forEach((tx)=>{
                if (tx.premium !== null && tx.tooltipInfo.housePrice && tx.tooltipInfo.houseArea) {
                    // Using the calculated theoretical price from earlier loop
                    const getFloorVal = (f)=>f.startsWith('B') ? -parseInt(f.substring(1)) : parseInt(f);
                    const anchorFloorVal = anchorTx ? getFloorVal(anchorTx['樓層'].toString()) : 0;
                    const currentFloorVal = getFloorVal(tx.floor);
                    const floorDiff = currentFloorVal - anchorFloorVal;
                    const floorAdjustment = floorDiff * floorPremiumPercent;
                    const theoreticalPrice = anchorTx ? anchorTx['房屋單價(萬)'] * (1 + floorAdjustment / 100) : 0;
                    if (theoreticalPrice > 0) {
                        const baselineHousePrice = theoreticalPrice * tx.tooltipInfo.houseArea;
                        const premiumValue = tx.tooltipInfo.housePrice - baselineHousePrice;
                        if (unitTypeStats[unit]) {
                            unitTypeStats[unit].totalPremium += premiumValue;
                            unitTypeStats[unit].totalSoldArea += tx.tooltipInfo.houseArea;
                            unitTypeStats[unit].count++;
                        }
                    }
                }
            });
        });
    });
    const horizontalComparison = Object.keys(unitTypeStats).map((unit)=>{
        const stats = unitTypeStats[unit];
        if (stats.count === 0) return null;
        return {
            unitType: unit,
            anchorInfo: stats.anchorPrice ? `${anchorTx['樓層']}F / ${stats.anchorPrice}萬` : 'N/A',
            horizontalPriceDiff: stats.totalSoldArea > 0 ? stats.totalPremium / stats.totalSoldArea : 0,
            unitsSold: stats.count,
            timePremiumContribution: stats.totalPremium,
            contributionPercentage: totalPricePremiumValue > 0 ? stats.totalPremium / totalPricePremiumValue * 100 : 0,
            baselineHousePrice: totalBaselineHousePrice,
            avgPriceAdjustment: stats.totalSoldArea > 0 ? stats.totalPremium / stats.totalSoldArea : 0
        };
    }).filter(Boolean);
    return {
        horizontalGrid,
        sortedFloors,
        sortedUnits,
        unitColorMap,
        summary: {
            totalBaselineHousePrice,
            totalPricePremiumValue,
            totalSoldArea,
            transactionCount
        },
        horizontalComparison,
        refFloorForComparison: anchorTx ? anchorTx['樓層'] : '-'
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/vibe01/next-app/src/lib/data/policies.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "REAL_ESTATE_POLICIES",
    ()=>REAL_ESTATE_POLICIES
]);
const REAL_ESTATE_POLICIES = [
    // 2012-2015: First Phase - Transparency & Initial Controls
    {
        id: 'p-2012-08-01',
        date: '2012-08-01',
        title: '實價登錄 1.0 上路',
        category: 'policy',
        impact: 'high',
        description: '交易後30日內申報，區段化揭露(30號區間)，預售屋採代銷結案後整批申報。',
        change_content: "交易資訊不透明 -> 區段化揭露",
        affected_scope: "房仲業者、買賣雙方、預售屋投機客",
        background: "低利環境延續：國內房貸利率處於低檔 (約1.8%-1.9%)。",
        impact_analysis: "[受益] 買方獲得參考依據。[適應] 房仲失去資訊壟斷優勢。[無感] 預售屋投機客因資訊未即時揭露，仍可操作紅單。",
        details: [
            "申報義務人：地政士、經紀業或權利人。",
            "申報時機：買賣案件於辦竣所有權移轉登記後30日內申報。",
            "揭露方式：以區段化、去識別化方式提供查詢 (例如：中正路1-30號)。",
            "預售屋規定：委託代銷者，於委託代銷契約屆滿或終止30日內「整批」申報 (資訊落後嚴重)。"
        ]
    },
    {
        id: 'p-2014-06-04',
        date: '2014-06-04',
        title: '囤房稅 1.0',
        category: 'policy',
        impact: 'medium',
        description: '非自住住家用稅率由1.2%-2%調高為1.5%-3.6%，授權地方政府自訂差別稅率。',
        change_content: "非自住稅率 1.2% -> 1.5%~3.6%",
        affected_scope: "多屋族、台北市置產客",
        background: "美國聯準會結束QE：預期升息心理浮現，全球資金派對暫歇。",
        impact_analysis: "[微痛] 持有成本上升，但因多數縣市未採最高稅率，且稅基(房屋評定現值)偏低，實質痛感有限。",
        details: [
            "自住房屋稅率：維持 1.2% (需本人、配偶或直系親屬實際居住，且全國合計3戶以內)。",
            "非自住房屋稅率：由 1.2%~2% 調升至 1.5%~3.6%。",
            "地方權限：各地方政府可視地方發展需要，在範圍內自訂差別稅率。",
            "持有認定：以個人(自然人)或法人(公司)為單位個別計算。"
        ]
    },
    // 2016-2019: Second Phase - Tax Reform & Repatriation
    {
        id: 'p-2016-01-01',
        date: '2016-01-01',
        title: '房地合一稅 1.0',
        category: 'policy',
        impact: 'high',
        description: '獲利課稅取代舊制。持有<1年45%，1-2年35%，自用滿6年獲利400萬免稅。奢侈稅同步停徵。',
        change_content: "按售價課稅(奢侈稅) -> 按獲利課稅(45%~15%)",
        affected_scope: "短線炒作客、自住客",
        background: "奢侈稅同步停徵：象徵房市進入「實價課稅」新紀元。",
        impact_analysis: "[毀滅] 短進短出獲利被腰斬，投資客大量退場。[受益] 房價盤整，自住客獲得較佳議價空間。",
        details: [
            "課稅基礎：房地交易所得 = 交易成交價額 - 原始取得成本 - 相關費用 - 土地漲價總數額。",
            "持有1年以內：稅率 45%。",
            "持有1-2年：稅率 35%。",
            "持有2-10年：稅率 20%。",
            "持有超過10年：稅率 15%。",
            "自用住宅優惠：獲利400萬元以下免稅，超過部分10%。(需連續設籍滿6年)",
            "日出條款：2016年1月1日以後取得之房地適用新制。"
        ]
    },
    {
        id: 'f-2016-03-24',
        date: '2016-03-24',
        title: '央行大幅鬆綁信用管制',
        category: 'finance',
        impact: 'high',
        description: '刪除特定地區管制與自然人第3戶以上限制，僅保留豪宅管制(6成)。',
        change_content: "刪除多數管制，僅保留豪宅限貸",
        affected_scope: "換屋族、一般投資客",
        background: "經濟成長疲弱：為提振內需經濟，央行解除長達6年的房市管制。",
        impact_analysis: "[受益] 貸款成數恢復，換屋與置產門檻降低，市場交易量逐漸回溫。",
        details: [
            "解除管制區域：台北市及新北市特定地區。",
            "解除限制對象：自然人第3戶以上購屋貸款、公司法人購屋貸款。",
            "保留限制：高價住宅(豪宅)貸款最高成數仍維持6成。"
        ]
    },
    {
        id: 'p-2018-06-27',
        date: '2018-06-27',
        title: '租賃住宅市場發展及管理條例',
        category: 'policy',
        impact: 'low',
        description: '建立包租代管機制，鼓勵房東釋出空屋，給予稅賦優惠(所得稅減免)。',
        change_content: "包租代管稅賦優惠",
        affected_scope: "房東、租屋族",
        background: "美中貿易戰開打：全球供應鏈重組，資金開始撤離中國。",
        impact_analysis: "[受益] 房東享有所得稅減免；租屋族獲得專業代管服務，租賃關係較有保障。",
        details: [
            "租稅優惠：個人房東委託包租代管，月租金6000元以下免稅；6000-20000元必要費用率53%。",
            "專業證照：建立租賃住宅管理人員證照制度。",
            "糾紛處理：建立租賃糾紛免費調處機制。"
        ]
    },
    {
        id: 'f-2019-08-15',
        date: '2019-08-15',
        title: '境外資金匯回專法',
        category: 'finance',
        impact: 'medium',
        description: '鼓勵台商資金回流享優惠稅率，禁止直接投資房地產，但產生外溢效應帶動豪宅與工業地產。',
        change_content: "資金專法回流 (禁入房市但有外溢)",
        affected_scope: "工業地產主、豪宅建商",
        background: "台商回流潮：史上最大規模資金回台，雖禁入房市，但產生外溢效應。",
        impact_analysis: "[暴富] 工業用地與廠房價格飆漲。[受益] 企業主獲利與分紅轉入豪宅市場，帶動高總價產品去化。",
        details: [
            "優惠稅率：第一年匯回稅率8%，第二年10%。(實質投資可退稅一半)",
            "投資限制：禁止資金直接投資房地產(避免炒房)。",
            "資金控管：資金需存入專戶，控管5-7年才能分批提取。",
            "外溢效應：雖然不能直接買房，但增加市場資金總量，且企業獲利後的分紅仍可自由運用。"
        ]
    },
    // 2020-2022: Third Phase - Capital Surge & Crackdown
    {
        id: 'f-2020-03-19',
        date: '2020-03-19',
        title: '央行降息 1 碼',
        category: 'finance',
        impact: 'high',
        description: '重貼現率降至1.125%，房貸利率跌破1.4%歷史新低，無限QE背景下引發資產通膨。',
        change_content: "重貼現率 1.375% -> 1.125%",
        affected_scope: "全體購屋族、股市投資人",
        background: "COVID-19 疫情爆發：美國聯準會無限QE，全球熱錢氾濫。",
        impact_analysis: "[刺激] 持有成本極低，「租不如買」與「買房抗通膨」心理大爆發，股房雙漲。",
        details: [
            "降息幅度：調降重貼現率 0.25個百分點。",
            "房貸利率：五大銀行新承做房貸利率跌破 1.4%，創歷史新低。",
            "配套補貼：針對受疫情影響產業及自用住宅貸款提供額外補貼。"
        ]
    },
    {
        id: 'f-2020-12-08',
        date: '2020-12-08',
        title: '央行信用管制 (第一波)',
        category: 'finance',
        impact: 'medium',
        description: '法人購屋限貸6成，自然人第3戶限貸6成，建商餘屋限貸5成。',
        change_content: "法人/第3戶/餘屋 限貸 5-6成",
        affected_scope: "公司法人、多屋族(3戶+)",
        background: "房市過熱跡象：紅單炒作猖獗，排隊買房現象頻傳。",
        impact_analysis: "[警示] 宣示政府打炒房決心，但因低利環境，實質殺傷力有限。",
        details: [
            "公司法人：第一戶貸款成數最高 6成，無寬限期。",
            "自然人第3戶(含)以上：貸款成數最高 6成，無寬限期。",
            "購地貸款：限貸 6.5成，需保留 1成動工款。",
            "餘屋貸款：限貸 5成。"
        ]
    },
    {
        id: 'f-2021-03-19',
        date: '2021-03-19',
        title: '央行信用管制 (第二波)',
        category: 'finance',
        impact: 'medium',
        description: '法人購屋成數降至4成，豪宅降至5.5成。',
        change_content: "法人限貸 4成；豪宅限貸 5.5成",
        affected_scope: "公司法人、豪宅客",
        background: "投機風氣未減",
        impact_analysis: "[打擊] 封鎖利用公司名義高槓桿炒房的途徑。",
        details: [
            "公司法人：貸款成數調降至 4成。",
            "自然人高價住宅：第1戶限貸 5.5成，第3戶以上限貸 4成。",
            "工業區閒置土地：貸款最高 5.5成。"
        ]
    },
    {
        id: 'p-2021-07-01',
        date: '2021-07-01',
        title: '實價登錄 2.0 & 房地合一 2.0',
        category: 'policy',
        impact: 'high',
        description: '門牌完整揭露，預售屋即時申報(30日)，禁止紅單轉售；重稅期延長(45%改2年, 35%改5年)，預售屋納稅。',
        change_content: "預售屋納管、重稅閉鎖期延長、禁紅單",
        affected_scope: "預售屋買方/投機客、建商、換屋族",
        background: "房市多頭確立；疫情三級警戒(內需停滯但房市創高)",
        impact_analysis: "[雙面刃] 資訊全透明反成定錨工具。[閉鎖] 投機客無法短進短出，成屋惜售供給減少，價格難跌。",
        details: [
            "實價登錄2.0：門牌號碼完整揭露 (不再區段化)。",
            "預售屋納管：銷售前需備查，簽約後30日內申報實價登錄。",
            "紅單禁止：禁止預售屋紅單轉售。",
            "房地合一2.0：預售屋獲利納入房地合一稅課徵。",
            "延長重稅期：持有2年內45%，2-5年35% (原為1-2年)。",
            "法人比照：法人交易比照自然人稅率 (防堵公司名義短期炒作)。"
        ]
    },
    {
        id: 'f-2021-09-24',
        date: '2021-09-24',
        title: '央行信用管制 (第三波)',
        category: 'finance',
        impact: 'medium',
        description: '特定地區 (六都+新竹) 第2戶取消寬限期。',
        change_content: "特定地區第2戶 取消寬限期",
        affected_scope: "投資客、換屋族",
        background: "房價持續攀升",
        impact_analysis: "[壓力] 買第2間房必須立刻還本金，增加現金流壓力，迫使部分槓桿過大者退場。",
        details: [
            "管制區域：新增特定地區 (六都 + 新竹縣市)。",
            "自然人第2戶：取消寬限期 (需本息攤還)。",
            "購地貸款：調降至 6成。",
            "工業區閒置土地：調降至 5成。"
        ]
    },
    {
        id: 'f-2021-12-17',
        date: '2021-12-17',
        title: '央行信用管制 (第四波)',
        category: 'finance',
        impact: 'medium',
        description: '豪宅貸款降至4成，第3戶降至4成，餘屋貸款降至4成。',
        change_content: "豪宅/第3戶/餘屋 限貸 4成",
        affected_scope: "建商、豪宅客",
        background: "營建成本飆漲：缺工缺料議題發酵。",
        impact_analysis: "[緊縮] 建商資金鏈趨緊，中小型建商生存困難，市場走向大者恆大。",
        details: [
            "自然人高價住宅：貸款成數一律降至 4成 (無寬限期)。",
            "自然人第3戶(含)以上：貸款成數一律降至 4成。",
            "購地貸款：降至 5成。",
            "餘屋貸款：降至 4成。"
        ]
    },
    {
        id: 'f-2022-03-17',
        date: '2022-03-17',
        title: '央行升息循環啟動',
        category: 'finance',
        impact: 'medium',
        description: '央行跟進Fed升息(全年共2.5碼)，房貸利率重回2%以上。',
        change_content: "升息 2.5碼 (利率重回 2% table+)",
        affected_scope: "房貸族",
        background: "全球通膨危機：美國暴力升息，全球股市修正。",
        impact_analysis: "[負擔增加] 每千萬房貸每年利息支出增加約3-4萬元，稍微冷卻追價意願。",
        details: [
            "2022-03：升息 1碼 (0.25%)。",
            "2022-06：升息 半碼 (0.125%)。",
            "2022-09：升息 半碼 (0.125%)。",
            "2022-12：升息 半碼 (0.125%)。",
            "存款準備率：同步調升，緊縮市場游資。"
        ]
    },
    // 2023-2025: Fourth Phase - Contradictions & Heavy Controls
    {
        id: 'f-2023-06-16',
        date: '2023-06-16',
        title: '央行信用管制 (第五波)',
        category: 'finance',
        impact: 'medium',
        description: '特定地區第2戶限貸成數上限 7成。',
        change_content: "特定地區第2戶 限貸 7成",
        affected_scope: "換屋族、投資客",
        background: "房市量縮價穩：市場觀望平均地權條例上路。",
        impact_analysis: "[微痛] 需多準備1成自備款，影響尚可控。",
        details: [
            "管制區域：特定地區 (六都 + 新竹縣市)。",
            "自然人第2戶：新增貸款成數上限 7成 (此前僅無寬限期)。"
        ]
    },
    {
        id: 'p-2023-07-01',
        date: '2023-07-01',
        title: '平均地權條例修正',
        category: 'policy',
        impact: 'high',
        description: '預售屋禁止換約轉售，建立檢舉獎金，私法人購屋許可制。',
        change_content: "預售屋禁換約、私法人許可制",
        affected_scope: "預售屋黃牛、豪宅法人",
        background: "投機客的大限",
        impact_analysis: "[滅絕] 純粹賺價差的紅單與換約客徹底消失。豪宅市場因法人需經許可，交易量急凍。",
        details: [
            "限制換約轉售：預售屋與新建成屋簽約後，除配偶、直系或二親等旁系外，不得讓與或轉售 (禁止黃牛)。",
            "重罰炒作：嚴懲散播不實資訊影響房價，最高罰5000萬元。",
            "檢舉獎金：建立檢舉實名制，獎金為罰鍰 30%。",
            "私法人購屋許可制：私法人購買住宅用房屋需經內政部許可 (限制豪宅私法人節稅管道)。"
        ]
    },
    {
        id: 'p-2023-08-01',
        date: '2023-08-01',
        title: '新青安貸款專案',
        category: 'policy',
        impact: 'high',
        description: '額度1000萬，年限40年，寬限期5年，利率補貼(1.775%起)。',
        change_content: "40年期/5年寬限/降息補貼",
        affected_scope: "首購族、投機客(人頭)、低總價屋主",
        background: "總統大選前夕：政府釋出利多，試圖減輕年輕人負擔。",
        impact_analysis: "[狂熱] 創造「租不如買」與「5年免還本」的套利空間。低總價成屋被掃貨，房價逆勢暴漲。",
        details: [
            "貸款額度：提高至 1000萬元。",
            "利息補貼：政府補貼 1.5碼 (0.375%) + 公股銀行減半碼 = 利率 1.775% 起。",
            "貸款年限：延長至 40年。",
            "寬限期：延長至 5年 (只繳息不還本)。",
            "資格：本人、配偶及未成年子女名下均無自有住宅。"
        ]
    },
    {
        id: 'f-2024-06-14',
        date: '2024-06-14',
        title: '央行信用管制 (第六波)',
        category: 'finance',
        impact: 'medium',
        description: '特定地區第2戶限貸成數降至 6成。',
        change_content: "特定地區第2戶 限貸 6成",
        affected_scope: "換屋族、置產客",
        background: "台股站上2萬點：AI熱潮帶動股市財富效應，資金外溢至房市。",
        impact_analysis: "[無效] 股市獲利豐厚，6成限貸無法阻擋資金湧入房市。",
        details: [
            "管制區域：特定地區 (六都 + 新竹縣市)。",
            "自然人第2戶：貸款成數上限由 7成調降為 6成。",
            "調升存款準備率：調升 0.25個百分點 (收回市場資金)。"
        ]
    },
    {
        id: 'p-2024-07-01',
        date: '2024-07-01',
        title: '囤房稅 2.0 實施',
        category: 'policy',
        impact: 'medium',
        description: '全國歸戶，非自用稅率調高至 2.0%-4.8%，建商餘屋依持有年限課稅。',
        change_content: "全國歸戶；稅率 2.0%~4.8%",
        affected_scope: "多屋族、租屋族、建商",
        background: "租金指數創高",
        impact_analysis: "[轉嫁] 多屋族將稅負轉嫁至租金，導致租金上漲。建商面臨餘屋去化壓力，傾向預售完銷。",
        details: [
            "全國歸戶：由縣市歸戶改為全國歸戶計算戶數。",
            "稅率調升：非自住住家用稅率調升為 2%~4.8% (原1.5%~3.6%)。",
            "單一自住優惠：全國單一自住(本人配偶子女僅一戶)且房屋現值在一定金額以下，稅率降至 1%。",
            "建商餘屋：持有2年以內稅率 2%~3.6%；超過2年稅率 2%~4.8% (鼓勵釋出餘屋)。"
        ]
    },
    {
        id: 'f-2024-08-01',
        date: '2024-08-01',
        title: '銀行限貸令 (72-2水位)',
        category: 'finance',
        impact: 'high',
        description: '銀行法72-2條逼近30%上限，自主限貸、排隊撥款，市場流動性急凍。',
        change_content: "銀行自主限貸、排隊撥款",
        affected_scope: "即將交屋族、賣屋換屋族",
        background: "新青安效應發酵：過多成屋交易與新青安撥款，耗盡銀行額度。",
        impact_analysis: "[恐慌] 買了房卻貸不到款，面臨違約風險。市場流動性瞬間急凍。",
        details: [
            "銀行法72-2條：商業銀行辦理住宅建築及企業建築放款總額，不得超過存款總餘額及金融債券發售額之 30%。",
            "現象：多家銀行房貸水位接近滿載。",
            "影響：銀行暫停收件、排隊撥款(需等數月)、利率大幅調升(2.6%-3%以上)。"
        ]
    },
    {
        id: 'f-2024-09-20',
        date: '2024-09-20',
        title: '央行信用管制 (第七波)',
        category: 'finance',
        impact: 'high',
        description: '有房者第1戶無寬限期；全國第2戶限貸5成；法人/豪宅/第3戶限貸3成。',
        change_content: "有房者第1戶無寬限；第2戶全國限貸5成",
        affected_scope: "換屋族、繼承族、交屋族",
        background: "金龍海嘯：央行判定房市過熱，認為新青安助長投機，決心斷絕金流。",
        impact_analysis: "[重傷/錯殺] 史上最嚴厲管制。1. 換屋族需5成自備。2. 繼承祖產失寬限。3. 預售交屋斷頭風險大增。",
        details: [
            "自然人第1戶：名下有房屋者(含繼承、持分)，第1戶購屋貸款「無寬限期」。",
            "自然人第2戶：貸款成數上限降至 5成，且擴及「全國」。",
            "自然人第3戶以上：貸款成數上限降至 3成。",
            "公司法人：購屋貸款成數降至 3成。",
            "豪宅(高價住宅)：貸款成數降至 3成。",
            "餘屋貸款：降至 3成。",
            "存款準備率：再調升 0.25個百分點。"
        ]
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/vibe01/next-app/src/lib/aggregator.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "aggregateAnalysisData",
    ()=>aggregateAnalysisData
]);
function aggregateAnalysisData(currentTotal, newData) {
    if (!newData) return currentTotal;
    // Note: Cast is needed if return type strictness varies, but with same type it should be fine.
    if (!currentTotal) {
        // Deep copy to avoid side effects
        return JSON.parse(JSON.stringify(newData));
    }
    // 0. Merge Raw Transaction Details
    if (newData.transactionDetails && Array.isArray(newData.transactionDetails)) {
        if (!currentTotal.transactionDetails) currentTotal.transactionDetails = [];
        currentTotal.transactionDetails = [
            ...currentTotal.transactionDetails,
            ...newData.transactionDetails
        ];
    }
    // 1. Merge Core Metrics
    currentTotal.coreMetrics = aggregateCoreMetrics(currentTotal.coreMetrics, newData.coreMetrics);
    // 2. Merge Project Ranking
    if (newData.projectRanking && Array.isArray(newData.projectRanking)) {
        currentTotal.projectRanking = [
            ...currentTotal.projectRanking,
            ...newData.projectRanking
        ];
    }
    // 3. Merge Price Band Analysis
    currentTotal.priceBandAnalysis = aggregatePriceBandAnalysis(currentTotal.priceBandAnalysis, newData.priceBandAnalysis);
    // 4. Merge Unit Price Analysis
    currentTotal.unitPriceAnalysis = aggregateUnitPriceAnalysis(currentTotal.unitPriceAnalysis, newData.unitPriceAnalysis);
    // Recalculate medians if transactions exist
    if (currentTotal.transactionDetails && currentTotal.transactionDetails.length > 0) {
        recalculateUnitPriceStats(currentTotal.unitPriceAnalysis, currentTotal.transactionDetails);
    }
    // 5. Merge Parking Analysis
    currentTotal.parkingAnalysis = aggregateParkingAnalysis(currentTotal.parkingAnalysis, newData.parkingAnalysis);
    // 6. Merge Sales Velocity Analysis
    currentTotal.salesVelocityAnalysis = aggregateSalesVelocityAnalysis(currentTotal.salesVelocityAnalysis, newData.salesVelocityAnalysis);
    // 7. Merge Price Grid Analysis
    currentTotal.priceGridAnalysis = aggregatePriceGridAnalysis(currentTotal.priceGridAnalysis, newData.priceGridAnalysis);
    // 8. Merge Area Distribution Analysis
    currentTotal.areaDistributionAnalysis = aggregateAreaDistributionAnalysis(currentTotal.areaDistributionAnalysis, newData.areaDistributionAnalysis);
    return currentTotal;
}
function aggregateCoreMetrics(metricsA, metricsB) {
    if (!metricsB) return metricsA;
    if (!metricsA) return metricsB;
    const totalSaleAmount = (metricsA.totalSaleAmount || 0) + (metricsB.totalSaleAmount || 0);
    const totalHouseArea = (metricsA.totalHouseArea || 0) + (metricsB.totalHouseArea || 0);
    const transactionCount = (metricsA.transactionCount || 0) + (metricsB.transactionCount || 0);
    const overallAveragePrice = totalHouseArea > 0 ? totalSaleAmount / totalHouseArea : 0;
    return {
        totalSaleAmount,
        totalHouseArea,
        overallAveragePrice,
        transactionCount,
        medianPrice: 0,
        q1Price: 0,
        q3Price: 0,
        minPrice: Math.min(metricsA.minPrice || Infinity, metricsB.minPrice || Infinity),
        maxPrice: Math.max(metricsA.maxPrice || 0, metricsB.maxPrice || 0)
    };
}
function aggregatePriceBandAnalysis(bandsA, bandsB) {
    if (!bandsB) return bandsA;
    // Normalize: Handle both array format (legacy) and object format
    const detailsA = Array.isArray(bandsA) ? bandsA : bandsA?.details || [];
    const detailsB = Array.isArray(bandsB) ? bandsB : bandsB?.details || [];
    const crossTableA = bandsA?.locationCrossTable || {};
    const crossTableB = bandsB?.locationCrossTable || {};
    const districtsA = bandsA?.allDistricts || [];
    const districtsB = bandsB?.allDistricts || [];
    const roomTypesA = bandsA?.allRoomTypes || [];
    const roomTypesB = bandsB?.allRoomTypes || [];
    const bandMap = new Map();
    const addToMap = (item)=>{
        // Robust Key Generation: Ensure bathrooms is treated consistently
        const baths = item.bathrooms !== null && item.bathrooms !== undefined ? String(item.bathrooms) : 'null';
        // Normalize roomType: remove all whitespace to match frontend 'selectedRoomTypes'
        const normalizedRoomType = (item.roomType || '').replace(/\s+/g, '');
        const key = `${normalizedRoomType}-${baths}`;
        // Ensure numeric values
        const itemCount = Number(item.count) || 0;
        const itemAvg = Number(item.avgPrice) || 0;
        const itemMin = Number(item.minPrice) || 0;
        const itemMax = Number(item.maxPrice) || 0;
        if (!bandMap.has(key)) {
            bandMap.set(key, {
                ...item,
                roomType: normalizedRoomType,
                count: itemCount,
                avgPrice: itemAvg,
                minPrice: itemMin,
                maxPrice: itemMax,
                projectNames: item.projectNames ? [
                    ...item.projectNames
                ] : [],
                byDistrict: item.byDistrict ? {
                    ...item.byDistrict
                } : {}
            });
        } else {
            const existing = bandMap.get(key);
            const existingCount = Number(existing.count) || 0;
            const existingAvg = Number(existing.avgPrice) || 0;
            const totalAmountA = existingAvg * existingCount;
            const totalAmountB = itemAvg * itemCount;
            const newCount = existingCount + itemCount;
            const newAvgPrice = newCount > 0 ? (totalAmountA + totalAmountB) / newCount : 0;
            existing.count = newCount;
            existing.avgPrice = parseFloat(newAvgPrice.toFixed(2));
            existing.minPrice = Math.min(existing.minPrice, itemMin);
            existing.maxPrice = Math.max(existing.maxPrice, itemMax);
            if (item.projectNames) {
                const newProjectNames = new Set([
                    ...existing.projectNames,
                    ...item.projectNames
                ]);
                existing.projectNames = Array.from(newProjectNames);
            }
            if (item.byDistrict) {
                Object.entries(item.byDistrict).forEach(([district, count])=>{
                    existing.byDistrict[district] = (existing.byDistrict[district] || 0) + count;
                });
            }
        }
    };
    detailsA.forEach(addToMap);
    detailsB.forEach(addToMap);
    const mergedCrossTable = {
        ...crossTableA
    };
    Object.entries(crossTableB).forEach(([roomType, districtCounts])=>{
        if (!mergedCrossTable[roomType]) {
            mergedCrossTable[roomType] = {
                ...districtCounts
            };
        } else {
            Object.entries(districtCounts).forEach(([district, count])=>{
                mergedCrossTable[roomType][district] = (mergedCrossTable[roomType][district] || 0) + count;
            });
        }
    });
    const mergedDistricts = Array.from(new Set([
        ...districtsA,
        ...districtsB
    ])).sort();
    const mergedRoomTypes = Array.from(new Set([
        ...roomTypesA,
        ...roomTypesB
    ])).sort();
    return {
        details: Array.from(bandMap.values()),
        locationCrossTable: mergedCrossTable,
        allDistricts: mergedDistricts,
        allRoomTypes: mergedRoomTypes
    };
}
function aggregateUnitPriceAnalysis(unitA, unitB) {
    if (!unitB) return unitA;
    const mergeStats = (statsA, statsB)=>{
        if (!statsB) return statsA;
        if (!statsA) return statsB;
        const newCount = (statsA.count || 0) + (statsB.count || 0);
        if (newCount === 0) return statsA;
        const newAvgPrice = {
            arithmetic: 0,
            weighted: 0
        };
        // Helper to get price value safely
        const getPrice = (stats, type)=>{
            if (typeof stats.avgPrice === 'number') {
                // If pure number, it's typically the arithmetic mean. 
                // For weighted, we might fall back to it if weighted is missing, 
                // but ideally weighted should be present.
                // If weighted is missing in source, use the number as fallback.
                return stats.weightedAvgPrice || stats.avgPrice;
            }
            return stats.avgPrice?.[type] || 0;
        };
        [
            'arithmetic',
            'weighted'
        ].forEach((type)=>{
            const priceA = getPrice(statsA, type);
            const priceB = getPrice(statsB, type);
            // Weighted average logic: (P1*N1 + P2*N2) / (N1+N2)
            newAvgPrice[type] = (priceA * (statsA.count || 0) + priceB * (statsB.count || 0)) / newCount;
        });
        const newMinPrice = Math.min(statsA.minPrice, statsB.minPrice);
        const newMaxPrice = Math.max(statsA.maxPrice, statsB.maxPrice);
        let minPriceProject = statsA.minPrice < statsB.minPrice ? statsA.minPriceProject : statsB.minPriceProject;
        let maxPriceProject = statsA.maxPrice > statsB.maxPrice ? statsA.maxPriceProject : statsB.maxPriceProject;
        return {
            count: newCount,
            avgPrice: newAvgPrice,
            minPrice: newMinPrice,
            maxPrice: newMaxPrice,
            minPriceProject,
            maxPriceProject,
            medianPrice: 0,
            q1Price: 0,
            q3Price: 0
        };
    };
    const residentialStats = mergeStats(unitA.residentialStats, unitB.residentialStats);
    const officeStats = mergeStats(unitA.officeStats, unitB.officeStats);
    const storeStats = mergeStats(unitA.storeStats, unitB.storeStats);
    let typeComparison = [
        ...unitA.typeComparison || []
    ];
    if (unitB.typeComparison) {
        typeComparison = [
            ...typeComparison,
            ...unitB.typeComparison
        ];
    }
    return {
        residentialStats,
        officeStats,
        storeStats,
        typeComparison
    };
}
function recalculateUnitPriceStats(unitAnalysis, transactions) {
    if (!unitAnalysis || !transactions || transactions.length === 0) return;
    const residentialTx = [];
    const residentialSum = {
        price: 0,
        area: 0,
        count: 0
    };
    const officeTx = [];
    const officeSum = {
        price: 0,
        area: 0,
        count: 0
    };
    const storeTx = [];
    const storeSum = {
        price: 0,
        area: 0,
        count: 0
    };
    // Track min/max records
    const initialExtremes = ()=>({
            minPrice: Infinity,
            maxPrice: -Infinity,
            minRecord: null,
            maxRecord: null
        });
    const resExtremes = initialExtremes();
    const officeExtremes = initialExtremes();
    const storeExtremes = initialExtremes();
    transactions.forEach((record)=>{
        const type = record['建物型態'];
        const usage = record['主要用途'];
        const unitPrice = record['房屋單價(萬)'];
        const totalPrice = record['房屋總價(萬)'] || 0;
        const totalArea = record['建物移轉總面積'] || 0;
        if (typeof unitPrice !== 'number' || unitPrice <= 0) return;
        let targetTx = residentialTx;
        let targetSum = residentialSum;
        let targetExtremes = resExtremes;
        if (type?.includes('店') || usage === '商業用' || record['備註']?.includes('店')) {
            targetTx = storeTx;
            targetSum = storeSum;
            targetExtremes = storeExtremes;
        } else if (type?.includes('辦公') || type?.includes('廠辦') || type?.includes('事務所') || usage?.includes('辦公')) {
            targetTx = officeTx;
            targetSum = officeSum;
            targetExtremes = officeExtremes;
        }
        targetTx.push(unitPrice);
        targetSum.price += totalPrice;
        targetSum.area += totalArea;
        targetSum.count += 1;
        // Update extremes
        if (unitPrice > targetExtremes.maxPrice) {
            targetExtremes.maxPrice = unitPrice;
            targetExtremes.maxRecord = record;
        }
        if (unitPrice < targetExtremes.minPrice) {
            targetExtremes.minPrice = unitPrice;
            targetExtremes.minRecord = record;
        }
    });
    const updateStats = (statsObj, tx, sum, extremes)=>{
        if (!statsObj) return;
        updateQuantiles(statsObj, tx);
        statsObj.count = sum.count;
        statsObj.avgPrice = sum.count > 0 ? tx.reduce((a, b)=>a + b, 0) / sum.count : 0;
        statsObj.weightedAvgPrice = sum.area > 0 ? sum.price / sum.area : 0;
        // Update Extreme Details
        if (extremes.maxRecord) {
            statsObj.maxPrice = extremes.maxPrice;
            statsObj.maxPriceProject = extremes.maxRecord['建案名稱'];
            // Use '戶型' (Backend filtered unit name) if available, otherwise fallback to '戶別'
            statsObj.maxPriceUnit = extremes.maxRecord['戶型'] || extremes.maxRecord['戶別'];
            statsObj.maxPriceFloor = extremes.maxRecord['樓層'];
        }
        if (extremes.minRecord) {
            statsObj.minPrice = extremes.minPrice;
            statsObj.minPriceProject = extremes.minRecord['建案名稱'];
            statsObj.minPriceUnit = extremes.minRecord['戶型'] || extremes.minRecord['戶別'];
            statsObj.minPriceFloor = extremes.minRecord['樓層'];
        }
    };
    if (unitAnalysis.residentialStats) updateStats(unitAnalysis.residentialStats, residentialTx, residentialSum, resExtremes);
    if (unitAnalysis.officeStats) updateStats(unitAnalysis.officeStats, officeTx, officeSum, officeExtremes);
    if (unitAnalysis.storeStats) updateStats(unitAnalysis.storeStats, storeTx, storeSum, storeExtremes);
    // Rebuild Type Comparison Table from Transactions
    const projectMap = new Map();
    transactions.forEach((record)=>{
        const projectName = record['建案名稱'];
        if (!projectName) return;
        if (!projectMap.has(projectName)) {
            projectMap.set(projectName, {
                resSum: {
                    price: 0,
                    area: 0,
                    count: 0
                },
                shopSum: {
                    price: 0,
                    area: 0,
                    count: 0
                },
                officeSum: {
                    price: 0,
                    area: 0,
                    count: 0
                },
                county: record['縣市'],
                district: record['行政區']
            });
        }
        const stats = projectMap.get(projectName);
        const type = record['建物型態'];
        const usage = record['主要用途'];
        const unitPrice = record['房屋單價(萬)'];
        const totalPrice = record['房屋總價(萬)'] || 0;
        const totalArea = record['建物移轉總面積'] || 0;
        if (typeof unitPrice !== 'number' || unitPrice <= 0) return;
        if (type?.includes('店') || usage === '商業用' || record['備註']?.includes('店')) {
            stats.shopSum.price += totalPrice;
            stats.shopSum.area += totalArea;
            stats.shopSum.count += 1;
        } else if (type?.includes('辦公') || type?.includes('廠辦') || type?.includes('事務所') || usage?.includes('辦公')) {
            stats.officeSum.price += totalPrice;
            stats.officeSum.area += totalArea;
            stats.officeSum.count += 1;
        } else {
            stats.resSum.price += totalPrice;
            stats.resSum.area += totalArea;
            stats.resSum.count += 1;
        }
    });
    const newTypeComparison = [];
    projectMap.forEach((stats, projectName)=>{
        // Calculate Weighted Averages (or fall back to arithmetic if needed, but weighted is better for this)
        const residentialAvg = stats.resSum.area > 0 ? stats.resSum.price / stats.resSum.area : 0;
        const shopAvg = stats.shopSum.area > 0 ? stats.shopSum.price / stats.shopSum.area : 0;
        const officeAvg = stats.officeSum.area > 0 ? stats.officeSum.price / stats.officeSum.area : 0;
        if (residentialAvg > 0 && (shopAvg > 0 || officeAvg > 0)) {
            newTypeComparison.push({
                projectName,
                county: stats.county,
                district: stats.district,
                residentialAvg,
                shopAvg,
                officeAvg,
                shopMultiple: residentialAvg > 0 ? shopAvg / residentialAvg : 0,
                officeMultiple: residentialAvg > 0 ? officeAvg / residentialAvg : 0
            });
        }
    });
    // Sort by project name
    newTypeComparison.sort((a, b)=>a.projectName.localeCompare(b.projectName));
    unitAnalysis.typeComparison = newTypeComparison;
}
function updateQuantiles(statsObj, prices) {
    if (!prices || prices.length === 0) {
        statsObj.medianPrice = 0;
        statsObj.q1Price = 0;
        statsObj.q3Price = 0;
        return;
    }
    prices.sort((a, b)=>a - b);
    statsObj.medianPrice = calculateQuantile(prices, 0.5);
    statsObj.q1Price = calculateQuantile(prices, 0.25);
    statsObj.q3Price = calculateQuantile(prices, 0.75);
}
function calculateQuantile(sortedArr, q) {
    const pos = (sortedArr.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sortedArr[base + 1] !== undefined) {
        return parseFloat((sortedArr[base] + rest * (sortedArr[base + 1] - sortedArr[base])).toFixed(2));
    } else {
        return parseFloat(sortedArr[base].toFixed(2));
    }
}
function aggregateParkingAnalysis(parkA, parkB) {
    if (!parkB) return parkA;
    const ratioA = parkA.parkingRatio;
    const ratioB = parkB.parkingRatio;
    let newRatio = null;
    if (ratioA && ratioB) {
        const withA = ratioA.withParking.count;
        const withoutA = ratioA.withoutParking.count;
        const withB = ratioB.withParking.count;
        const withoutB = ratioB.withoutParking.count;
        const totalWith = withA + withB;
        const totalWithout = withoutA + withoutB;
        const total = totalWith + totalWithout;
        newRatio = {
            withParking: {
                count: totalWith,
                percentage: total > 0 ? totalWith / total * 100 : 0
            },
            withoutParking: {
                count: totalWithout,
                percentage: total > 0 ? totalWithout / total * 100 : 0
            }
        };
    } else {
        newRatio = ratioA || ratioB;
    }
    const typeMap = new Map();
    const mergeTypeItem = (item)=>{
        if (!typeMap.has(item.type)) {
            typeMap.set(item.type, {
                ...item
            });
        } else {
            const existing = typeMap.get(item.type);
            const totalCount = existing.count + item.count;
            const totalTx = existing.transactionCount + item.transactionCount;
            const priceA = existing.avgPrice;
            const priceB = item.avgPrice;
            const newAvg = totalTx > 0 ? (priceA * existing.transactionCount + priceB * item.transactionCount) / totalTx : 0;
            existing.count = totalCount;
            existing.transactionCount = totalTx;
            existing.avgPrice = newAvg;
        }
    };
    (parkA.avgPriceByType || []).forEach(mergeTypeItem);
    (parkB.avgPriceByType || []).forEach(mergeTypeItem);
    const newAvgPriceByType = Array.from(typeMap.values());
    const floorMap = new Map();
    const mergeFloorItem = (item)=>{
        if (!floorMap.has(item.floor)) {
            floorMap.set(item.floor, {
                ...item,
                rawRecords: item.rawRecords ? [
                    ...item.rawRecords
                ] : []
            });
        } else {
            const existing = floorMap.get(item.floor);
            const newCount = existing.count + item.count;
            if (item.rawRecords) {
                existing.rawRecords = [
                    ...existing.rawRecords || [],
                    ...item.rawRecords
                ];
            }
            const newAvg = newCount > 0 ? (existing.avgPrice * existing.count + item.avgPrice * item.count) / newCount : 0;
            existing.count = newCount;
            existing.avgPrice = newAvg;
            existing.minPrice = Math.min(existing.minPrice, item.minPrice);
            existing.maxPrice = Math.max(existing.maxPrice, item.maxPrice);
            if (item.maxPrice > existing.maxPrice) {
                existing.maxPriceProject = item.maxPriceProject;
                existing.maxPriceUnit = item.maxPriceUnit;
                existing.maxPriceFloor = item.maxPriceFloor;
            }
            if (item.minPrice < existing.minPrice) {
                existing.minPriceProject = item.minPriceProject;
                existing.minPriceUnit = item.minPriceUnit;
                existing.minPriceFloor = item.minPriceFloor;
            }
        }
    };
    (parkA.rampPlanePriceByFloor || []).forEach(mergeFloorItem);
    (parkB.rampPlanePriceByFloor || []).forEach(mergeFloorItem);
    const newRampByFloor = Array.from(floorMap.values());
    return {
        parkingRatio: newRatio,
        avgPriceByType: newAvgPriceByType,
        rampPlanePriceByFloor: newRampByFloor
    };
}
function aggregateSalesVelocityAnalysis(velA, velB) {
    if (!velB) return velA;
    const allRoomTypes = Array.from(new Set([
        ...velA.allRoomTypes || [],
        ...velB.allRoomTypes || []
    ]));
    const views = [
        'monthly',
        'quarterly',
        'yearly',
        'weekly'
    ];
    const mergedViews = {};
    views.forEach((view)=>{
        const viewDataA = velA[view] || {};
        const viewDataB = velB[view] || {};
        const mergedTimeKeys = {};
        const allTimeKeys = new Set([
            ...Object.keys(viewDataA),
            ...Object.keys(viewDataB)
        ]);
        allTimeKeys.forEach((timeKey)=>{
            const timeObjA = viewDataA[timeKey] || {};
            const timeObjB = viewDataB[timeKey] || {};
            const allRooms = new Set([
                ...Object.keys(timeObjA),
                ...Object.keys(timeObjB)
            ]);
            const mergedRooms = {};
            allRooms.forEach((room)=>{
                const dataA = timeObjA[room];
                const dataB = timeObjB[room];
                if (dataA && dataB) {
                    const totalCount = dataA.count + dataB.count;
                    const totalPriceSum = dataA.priceSum + dataB.priceSum;
                    const totalAreaSum = dataA.areaSum + dataB.areaSum;
                    mergedRooms[room] = {
                        count: totalCount,
                        priceSum: totalPriceSum,
                        areaSum: totalAreaSum,
                        avgPrice: totalAreaSum > 0 ? totalPriceSum / totalAreaSum : 0
                    };
                } else if (dataA) {
                    mergedRooms[room] = {
                        ...dataA
                    };
                } else if (dataB) {
                    mergedRooms[room] = {
                        ...dataB
                    };
                }
            });
            mergedTimeKeys[timeKey] = mergedRooms;
        });
        mergedViews[view] = mergedTimeKeys;
    });
    return {
        allRoomTypes,
        ...mergedViews
    };
}
function aggregateAreaDistributionAnalysis(distA, distB) {
    if (!distB) return distA;
    if (!distA) return distB;
    const merged = {
        ...distA
    };
    Object.keys(distB).forEach((room)=>{
        if (merged[room]) {
            merged[room] = [
                ...merged[room],
                ...distB[room]
            ];
        } else {
            merged[room] = [
                ...distB[room]
            ];
        }
    });
    return merged;
}
function aggregatePriceGridAnalysis(gridA, gridB) {
    if (!gridB) return gridA;
    const projectNames = [
        ...gridA.projectNames || [],
        ...gridB.projectNames || []
    ];
    const byProject = {
        ...gridA.byProject || {},
        ...gridB.byProject || {}
    };
    return {
        projectNames,
        byProject
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/vibe01/next-app/src/store/useFilterStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useFilterStore",
    ()=>useFilterStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
;
const DEFAULT_FILTERS = {
    counties: [],
    districts: [],
    transactionType: '預售交易',
    buildingType: '',
    projectNames: [],
    dateRange: '1y',
    startDate: '',
    endDate: '',
    excludeCommercial: false,
    floorPremium: 0.3,
    // UI Defaults
    rankingCurrentPage: 1,
    rankingPageSize: 10,
    currentSort: {
        key: 'saleAmountSum',
        order: 'desc'
    },
    currentAverageType: 'arithmetic',
    velocityView: 'monthly',
    velocityMetric: 'count'
};
const useFilterStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set)=>({
        ...DEFAULT_FILTERS,
        setCounties: (counties)=>set({
                counties,
                districts: []
            }),
        setDistricts: (districts)=>set({
                districts
            }),
        setTransactionType: (transactionType)=>set({
                transactionType
            }),
        setBuildingType: (buildingType)=>set({
                buildingType
            }),
        setProjectNames: (projectNames)=>set({
                projectNames
            }),
        setDateRange: (dateRange, startDate, endDate)=>set((plainState)=>{
                // Only update dates if provided, otherwise keep existing or require calc logic
                return {
                    dateRange,
                    startDate: startDate || plainState.startDate,
                    endDate: endDate || plainState.endDate
                };
            }),
        setCustomDate: (startDate, endDate)=>set({
                startDate,
                endDate,
                dateRange: 'custom'
            }),
        setExcludeCommercial: (excludeCommercial)=>set({
                excludeCommercial
            }),
        setFloorPremium: (floorPremium)=>set({
                floorPremium
            }),
        setRankingCurrentPage: (rankingCurrentPage)=>set({
                rankingCurrentPage
            }),
        setRankingPageSize: (rankingPageSize)=>set({
                rankingPageSize
            }),
        setCurrentSort: (currentSort)=>set({
                currentSort
            }),
        setCurrentAverageType: (currentAverageType)=>set({
                currentAverageType
            }),
        setVelocityView: (velocityView)=>set({
                velocityView
            }),
        setVelocityMetric: (velocityMetric)=>set({
                velocityMetric
            }),
        resetFilters: ()=>set(DEFAULT_FILTERS)
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/vibe01/next-app/src/hooks/useAnalysisData.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAnalysisData",
    ()=>useAnalysisData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/src/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$store$2f$useFilterStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/src/store/useFilterStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/src/lib/config.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$date$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/src/lib/date-utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$aggregator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/src/lib/aggregator.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
function useAnalysisData() {
    _s();
    const filters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$store$2f$useFilterStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFilterStore"])();
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [analysisData, setAnalysisData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const handleAnalyze = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useAnalysisData.useCallback[handleAnalyze]": async ()=>{
            setLoading(true);
            setError(null);
            setAnalysisData(null); // Clear previous data
            try {
                // Map county names to codes
                const countyCodes = filters.counties.map({
                    "useAnalysisData.useCallback[handleAnalyze].countyCodes": (name)=>__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COUNTY_CODE_MAP"][name] || name
                }["useAnalysisData.useCallback[handleAnalyze].countyCodes"]);
                if (countyCodes.length === 0) {
                    setError("請至少選擇一個縣市");
                    setLoading(false);
                    return;
                }
                // Date handling
                let { dateRange, startDate, endDate } = filters;
                // Ensure dates are populated if using a preset range but dates are empty
                if (dateRange !== 'custom' && (!startDate || !endDate)) {
                    const calculated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$date$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDateRangeDates"])(dateRange);
                    if (calculated.startDate && calculated.endDate) {
                        startDate = calculated.startDate;
                        endDate = calculated.endDate;
                    }
                }
                // Prepare common payload base
                const basePayload = {
                    districts: filters.districts,
                    transactionType: filters.transactionType,
                    type: filters.transactionType,
                    projectNames: filters.projectNames,
                    buildingType: filters.buildingType,
                    excludeCommercial: filters.excludeCommercial,
                    floorPremium: filters.floorPremium,
                    dateRange,
                    dateStart: startDate,
                    dateEnd: endDate
                };
                console.log("Analyzing with counties:", countyCodes);
                // Fetch data for all counties in parallel
                const promises = countyCodes.map({
                    "useAnalysisData.useCallback[handleAnalyze].promises": (countyCode)=>{
                        const payload = {
                            ...basePayload,
                            countyCode,
                            counties: [
                                countyCode
                            ]
                        };
                        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].analyzeProjectRanking(payload).catch({
                            "useAnalysisData.useCallback[handleAnalyze].promises": (err)=>{
                                console.error(`Failed to fetch data for ${countyCode}:`, err);
                                return null;
                            }
                        }["useAnalysisData.useCallback[handleAnalyze].promises"]);
                    }
                }["useAnalysisData.useCallback[handleAnalyze].promises"]);
                const results = await Promise.all(promises);
                // Aggregate results
                let totalResult = null;
                let successCount = 0;
                for (const result of results){
                    // Validate result has expected structure (at least projectRanking/coreMetrics)
                    if (result && result.projectRanking && result.coreMetrics) {
                        console.log("Merging result for county:", result.projectRanking?.[0]?.county);
                        totalResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$aggregator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["aggregateAnalysisData"])(totalResult, result);
                        successCount++;
                    }
                }
                console.log("Aggregation complete. Total Transaction Details:", totalResult?.transactionDetails?.length);
                if (successCount === 0) {
                    if (filters.projectNames.length > 0) {
                        throw new Error("這段時間 這個建案查詢不到資料");
                    }
                    throw new Error("無法取得任何縣市的分析數據");
                } else if (successCount < countyCodes.length) {
                    // Partial success
                    const failedCount = countyCodes.length - successCount;
                    setError(`注意：有 ${failedCount} 個縣市的資料載入失敗，分析結果可能不完整。`);
                }
                setAnalysisData(totalResult);
            } catch (err) {
                console.error("Analysis failed:", err);
                setError(err.message || "無法取得分析數據，請稍後再試。");
            } finally{
                setLoading(false);
            }
        }
    }["useAnalysisData.useCallback[handleAnalyze]"], [
        filters
    ]);
    return {
        loading,
        error,
        analysisData,
        handleAnalyze,
        setError,
        setLoading,
        setAnalysisData
    };
}
_s(useAnalysisData, "wWF3fQrFhPFxiLjVzYs9mJc+7yg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$store$2f$useFilterStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFilterStore"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DashboardPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$layout$2f$AppLayout$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/src/components/layout/AppLayout.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$features$2f$FilterBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/src/components/features/FilterBar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$reports$2f$RankingReport$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/src/components/reports/RankingReport.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$reports$2f$PriceBandReport$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/src/components/reports/PriceBandReport.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$reports$2f$SalesVelocityReport$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/src/components/reports/SalesVelocityReport.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$reports$2f$ParkingAnalysisReport$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/src/components/reports/ParkingAnalysisReport.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$reports$2f$UnitPriceAnalysisReport$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/src/components/reports/UnitPriceAnalysisReport.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$reports$2f$HeatmapReport$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/src/components/reports/HeatmapReport.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$reports$2f$DataListReport$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/src/components/reports/DataListReport.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$reports$2f$PolicyTimelineReport$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/src/components/reports/PolicyTimelineReport.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$store$2f$useFilterStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/src/store/useFilterStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/src/components/ui/tabs.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$hooks$2f$useAnalysisData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/src/hooks/useAnalysisData.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
function DashboardPage() {
    _s();
    const filters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$store$2f$useFilterStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFilterStore"])();
    const { loading, error, analysisData, handleAnalyze } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$hooks$2f$useAnalysisData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAnalysisData"])();
    // Initial load? Optional.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DashboardPage.useEffect": ()=>{
        // if (filters.counties.length > 0) handleAnalyze();
        }
    }["DashboardPage.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$layout$2f$AppLayout$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AppLayout"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "mb-6 sticky top-4 z-30",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$features$2f$FilterBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FilterBar"], {
                    onAnalyze: handleAnalyze,
                    isLoading: loading
                }, void 0, false, {
                    fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                    lineNumber: 42,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                lineNumber: 41,
                columnNumber: 13
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-6 flex items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                        size: 20
                    }, void 0, false, {
                        fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                        lineNumber: 47,
                        columnNumber: 21
                    }, this),
                    error
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                lineNumber: 46,
                columnNumber: 17
            }, this),
            loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col items-center justify-center py-20",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                        className: "h-10 w-10 animate-spin text-violet-500 mb-4"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                        lineNumber: 54,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-zinc-400",
                        children: "正在分析數據，請稍候..."
                    }, void 0, false, {
                        fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                        lineNumber: 55,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                lineNumber: 53,
                columnNumber: 17
            }, this),
            !loading && !analysisData && !error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col items-center justify-center py-20 glass-panel border-dashed border-2 border-zinc-800 rounded-xl",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-zinc-500 mb-2",
                        children: "尚未進行分析"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                        lineNumber: 61,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-zinc-600 text-sm",
                        children: "請選擇篩選條件並點擊「開始分析」"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                        lineNumber: 62,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                lineNumber: 60,
                columnNumber: 17
            }, this),
            !loading && analysisData && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-8 pb-20",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tabs"], {
                    defaultValue: "ranking",
                    className: "w-full",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "overflow-x-auto pb-2 scrollbar-hide",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsList"], {
                                className: "bg-zinc-900/50 border border-white/5 p-1 mb-6 inline-flex min-w-max",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                                        value: "ranking",
                                        children: "核心指標與排名"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                                        lineNumber: 72,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                                        value: "price-band",
                                        children: "總價帶分析"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                                        lineNumber: 73,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                                        value: "unit-price",
                                        children: "單價分析"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                                        lineNumber: 74,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                                        value: "heatmap",
                                        children: "調價熱力圖"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                                        lineNumber: 75,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                                        value: "timeline",
                                        children: "政策時光機"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                                        lineNumber: 76,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                                        value: "velocity",
                                        children: "銷售速度與房型"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                                        lineNumber: 77,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                                        value: "parking",
                                        children: "車位分析"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                                        lineNumber: 78,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                                        value: "data-list",
                                        children: "交易明細列表"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                                        lineNumber: 79,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                                lineNumber: 71,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                            lineNumber: 70,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsContent"], {
                            value: "ranking",
                            className: "focus-visible:outline-none focus-visible:ring-0",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$reports$2f$RankingReport$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RankingReport"], {
                                data: analysisData
                            }, void 0, false, {
                                fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                                lineNumber: 85,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                            lineNumber: 84,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsContent"], {
                            value: "price-band",
                            className: "focus-visible:outline-none focus-visible:ring-0",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$reports$2f$PriceBandReport$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PriceBandReport"], {
                                data: {
                                    ...analysisData.priceBandAnalysis,
                                    transactionDetails: analysisData.transactionDetails
                                }
                            }, void 0, false, {
                                fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                                lineNumber: 89,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                            lineNumber: 88,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsContent"], {
                            value: "unit-price",
                            className: "focus-visible:outline-none focus-visible:ring-0",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$reports$2f$UnitPriceAnalysisReport$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UnitPriceAnalysisReport"], {
                                data: analysisData
                            }, void 0, false, {
                                fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                                lineNumber: 96,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                            lineNumber: 95,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsContent"], {
                            value: "heatmap",
                            className: "focus-visible:outline-none focus-visible:ring-0",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$reports$2f$HeatmapReport$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HeatmapReport"], {
                                data: analysisData
                            }, void 0, false, {
                                fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                                lineNumber: 100,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                            lineNumber: 99,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsContent"], {
                            value: "timeline",
                            className: "focus-visible:outline-none focus-visible:ring-0",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$reports$2f$PolicyTimelineReport$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                data: analysisData.transactionDetails
                            }, void 0, false, {
                                fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                                lineNumber: 104,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                            lineNumber: 103,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsContent"], {
                            value: "velocity",
                            className: "focus-visible:outline-none focus-visible:ring-0",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$reports$2f$SalesVelocityReport$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SalesVelocityReport"], {
                                data: analysisData
                            }, void 0, false, {
                                fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                                lineNumber: 108,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                            lineNumber: 107,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsContent"], {
                            value: "parking",
                            className: "focus-visible:outline-none focus-visible:ring-0",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$reports$2f$ParkingAnalysisReport$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ParkingAnalysisReport"], {
                                data: analysisData
                            }, void 0, false, {
                                fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                                lineNumber: 112,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                            lineNumber: 111,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsContent"], {
                            value: "data-list",
                            className: "focus-visible:outline-none focus-visible:ring-0",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$components$2f$reports$2f$DataListReport$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DataListReport"], {
                                trigger: analysisData
                            }, void 0, false, {
                                fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                                lineNumber: 116,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                            lineNumber: 115,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                    lineNumber: 69,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
                lineNumber: 67,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/vibe01/next-app/src/app/dashboard/page.tsx",
        lineNumber: 40,
        columnNumber: 9
    }, this);
}
_s(DashboardPage, "lcbMeqywbfmwJmnVmlNrB5nP5OI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$store$2f$useFilterStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFilterStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$hooks$2f$useAnalysisData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAnalysisData"]
    ];
});
_c = DashboardPage;
var _c;
__turbopack_context__.k.register(_c, "DashboardPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Desktop_vibe01_next-app_src_1c5e0d17._.js.map