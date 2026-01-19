(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,3797,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"BailoutToCSR",{enumerable:!0,get:function(){return n}});let l=e.r(11319);function n({reason:e,children:t}){if("u"<typeof window)throw Object.defineProperty(new l.BailoutToCSRError(e),"__NEXT_ERROR_CODE",{value:"E394",enumerable:!1,configurable:!0});return t}},89938,(e,t,r)=>{"use strict";function l(e){return e.split("/").map(e=>encodeURIComponent(e)).join("/")}Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"encodeURIPath",{enumerable:!0,get:function(){return l}})},46577,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"PreloadChunks",{enumerable:!0,get:function(){return o}});let l=e.r(25191),n=e.r(1801),i=e.r(12424),a=e.r(89938),s=e.r(39534);function o({moduleIds:e}){if("u">typeof window)return null;let t=i.workAsyncStorage.getStore();if(void 0===t)return null;let r=[];if(t.reactLoadableManifest&&e){let l=t.reactLoadableManifest;for(let t of e){if(!l[t])continue;let e=l[t].files;r.push(...e)}}if(0===r.length)return null;let o=(0,s.getDeploymentIdQueryOrEmptyString)();return(0,l.jsx)(l.Fragment,{children:r.map(e=>{let r=`${t.assetPrefix}/_next/${(0,a.encodeURIPath)(e)}${o}`;return e.endsWith(".css")?(0,l.jsx)("link",{precedence:"dynamic",href:r,rel:"stylesheet",as:"style",nonce:t.nonce},e):((0,n.preload)(r,{as:"script",fetchPriority:"low",nonce:t.nonce}),null)})})}},67591,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"default",{enumerable:!0,get:function(){return d}});let l=e.r(25191),n=e.r(68524),i=e.r(3797),a=e.r(46577);function s(e){return{default:e&&"default"in e?e.default:e}}let o={loader:()=>Promise.resolve(s(()=>null)),loading:null,ssr:!0},d=function(e){let t={...o,...e},r=(0,n.lazy)(()=>t.loader().then(s)),d=t.loading;function c(e){let s=d?(0,l.jsx)(d,{isLoading:!0,pastDelay:!0,error:null}):null,o=!t.ssr||!!t.loading,c=o?n.Suspense:n.Fragment,u=t.ssr?(0,l.jsxs)(l.Fragment,{children:["u"<typeof window?(0,l.jsx)(a.PreloadChunks,{moduleIds:t.modules}):null,(0,l.jsx)(r,{...e})]}):(0,l.jsx)(i.BailoutToCSR,{reason:"next/dynamic",children:(0,l.jsx)(r,{...e})});return(0,l.jsx)(c,{...o?{fallback:s}:{},children:u})}return c.displayName="LoadableComponent",c}},67123,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"default",{enumerable:!0,get:function(){return n}});let l=e.r(79031)._(e.r(67591));function n(e,t){let r={};"function"==typeof e&&(r.loader=e);let n={...r,...t};return(0,l.default)({...n,modules:n.loadableGenerated?.modules})}("function"==typeof r.default||"object"==typeof r.default&&null!==r.default)&&void 0===r.default.__esModule&&(Object.defineProperty(r.default,"__esModule",{value:!0}),Object.assign(r.default,r),t.exports=r.default)},5467,e=>{"use strict";let t=(0,e.i(91568).default)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);e.s(["Check",()=>t],5467)},60459,e=>{"use strict";let t=(0,e.i(91568).default)("loader-circle",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]);e.s(["Loader2",()=>t],60459)},78841,e=>{"use strict";let t=(0,e.i(91568).default)("chevron-down",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);e.s(["ChevronDown",()=>t],78841)},80467,e=>{"use strict";let t=(0,e.i(91568).default)("trending-up",[["path",{d:"M16 7h6v6",key:"box55l"}],["path",{d:"m22 7-8.5 8.5-5-5L2 17",key:"1t1m79"}]]);e.s(["TrendingUp",()=>t],80467)},64328,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var l={cancelIdleCallback:function(){return a},requestIdleCallback:function(){return i}};for(var n in l)Object.defineProperty(r,n,{enumerable:!0,get:l[n]});let i="u">typeof self&&self.requestIdleCallback&&self.requestIdleCallback.bind(window)||function(e){let t=Date.now();return self.setTimeout(function(){e({didTimeout:!1,timeRemaining:function(){return Math.max(0,50-(Date.now()-t))}})},1)},a="u">typeof self&&self.cancelIdleCallback&&self.cancelIdleCallback.bind(window)||function(e){return clearTimeout(e)};("function"==typeof r.default||"object"==typeof r.default&&null!==r.default)&&void 0===r.default.__esModule&&(Object.defineProperty(r.default,"__esModule",{value:!0}),Object.assign(r.default,r),t.exports=r.default)},34111,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var l={default:function(){return y},handleClientScriptLoad:function(){return b},initScriptLoader:function(){return x}};for(var n in l)Object.defineProperty(r,n,{enumerable:!0,get:l[n]});let i=e.r(79031),a=e.r(63843),s=e.r(25191),o=i._(e.r(1801)),d=a._(e.r(68524)),c=e.r(30281),u=e.r(46220),f=e.r(64328),m=new Map,p=new Set,h=e=>{let{src:t,id:r,onLoad:l=()=>{},onReady:n=null,dangerouslySetInnerHTML:i,children:a="",strategy:s="afterInteractive",onError:d,stylesheets:c}=e,f=r||t;if(f&&p.has(f))return;if(m.has(t)){p.add(f),m.get(t).then(l,d);return}let h=()=>{n&&n(),p.add(f)},b=document.createElement("script"),x=new Promise((e,t)=>{b.addEventListener("load",function(t){e(),l&&l.call(this,t),h()}),b.addEventListener("error",function(e){t(e)})}).catch(function(e){d&&d(e)});i?(b.innerHTML=i.__html||"",h()):a?(b.textContent="string"==typeof a?a:Array.isArray(a)?a.join(""):"",h()):t&&(b.src=t,m.set(t,x)),(0,u.setAttributesFromProps)(b,e),"worker"===s&&b.setAttribute("type","text/partytown"),b.setAttribute("data-nscript",s),c&&(e=>{if(o.default.preinit)return e.forEach(e=>{o.default.preinit(e,{as:"style"})});if("u">typeof window){let t=document.head;e.forEach(e=>{let r=document.createElement("link");r.type="text/css",r.rel="stylesheet",r.href=e,t.appendChild(r)})}})(c),document.body.appendChild(b)};function b(e){let{strategy:t="afterInteractive"}=e;"lazyOnload"===t?window.addEventListener("load",()=>{(0,f.requestIdleCallback)(()=>h(e))}):h(e)}function x(e){e.forEach(b),[...document.querySelectorAll('[data-nscript="beforeInteractive"]'),...document.querySelectorAll('[data-nscript="beforePageRender"]')].forEach(e=>{let t=e.id||e.getAttribute("src");p.add(t)})}function g(e){let{id:t,src:r="",onLoad:l=()=>{},onReady:n=null,strategy:i="afterInteractive",onError:a,stylesheets:u,...m}=e,{updateScripts:b,scripts:x,getIsSsr:g,appDir:y,nonce:v}=(0,d.useContext)(c.HeadManagerContext);v=m.nonce||v;let j=(0,d.useRef)(!1);(0,d.useEffect)(()=>{let e=t||r;j.current||(n&&e&&p.has(e)&&n(),j.current=!0)},[n,t,r]);let w=(0,d.useRef)(!1);if((0,d.useEffect)(()=>{if(!w.current){if("afterInteractive"===i)h(e);else"lazyOnload"===i&&("complete"===document.readyState?(0,f.requestIdleCallback)(()=>h(e)):window.addEventListener("load",()=>{(0,f.requestIdleCallback)(()=>h(e))}));w.current=!0}},[e,i]),("beforeInteractive"===i||"worker"===i)&&(b?(x[i]=(x[i]||[]).concat([{id:t,src:r,onLoad:l,onReady:n,onError:a,...m,nonce:v}]),b(x)):g&&g()?p.add(t||r):g&&!g()&&h({...e,nonce:v})),y){if(u&&u.forEach(e=>{o.default.preinit(e,{as:"style"})}),"beforeInteractive"===i)if(!r)return m.dangerouslySetInnerHTML&&(m.children=m.dangerouslySetInnerHTML.__html,delete m.dangerouslySetInnerHTML),(0,s.jsx)("script",{nonce:v,dangerouslySetInnerHTML:{__html:`(self.__next_s=self.__next_s||[]).push(${JSON.stringify([0,{...m,id:t}])})`}});else return o.default.preload(r,m.integrity?{as:"script",integrity:m.integrity,nonce:v,crossOrigin:m.crossOrigin}:{as:"script",nonce:v,crossOrigin:m.crossOrigin}),(0,s.jsx)("script",{nonce:v,dangerouslySetInnerHTML:{__html:`(self.__next_s=self.__next_s||[]).push(${JSON.stringify([r,{...m,id:t}])})`}});"afterInteractive"===i&&r&&o.default.preload(r,m.integrity?{as:"script",integrity:m.integrity,nonce:v,crossOrigin:m.crossOrigin}:{as:"script",nonce:v,crossOrigin:m.crossOrigin})}return null}Object.defineProperty(g,"__nextScript",{value:!0});let y=g;("function"==typeof r.default||"object"==typeof r.default&&null!==r.default)&&void 0===r.default.__esModule&&(Object.defineProperty(r.default,"__esModule",{value:!0}),Object.assign(r.default,r),t.exports=r.default)},91505,(e,t,r)=>{t.exports=e.r(34111)},96971,e=>{"use strict";var t=e.i(25191),r=e.i(68524),l=e.i(91505),n=e.i(21643),i=e.i(14302),a=e.i(78885),s=e.i(14897),o=e.i(60459),d=e.i(91568);let c=(0,d.default)("file-down",[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",key:"1oefj6"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}],["path",{d:"M12 18v-6",key:"17g6i2"}],["path",{d:"m9 15 3 3 3-3",key:"1npd3o"}]]),u=(0,d.default)("square-check-big",[["path",{d:"M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344",key:"2acyp4"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]),f=(0,d.default)("square",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}]]);var m=e.i(50294),p=e.i(78841),h=e.i(74614),b=e.i(98264),x=e.i(65145),g=e.i(12885),y=e.i(65787),v=e.i(87373),j=e.i(15866),w=e.i(59264);let k=[{id:"ranking",label:"核心指標與排名",component:b.RankingReport,modules:[{id:"metrics",label:"核心指標看板"},{id:"chart",label:"建案分析圖表"},{id:"table",label:"區域建案排行列表"}]},{id:"price-band",label:"總價帶分析",component:x.PriceBandReport,modules:[{id:"chart",label:"總價帶分佈圖"},{id:"table",label:"總價帶詳細數據"},{id:"location-table",label:"區域房型成交分佈表"},{id:"location-chart",label:"區域成交佔比圖表"}]},{id:"unit-price",label:"單價分析",component:g.UnitPriceAnalysisReport,modules:[{id:"stats",label:"各用途單價統計"},{id:"comparison",label:"建案產品類型比較"},{id:"chart",label:"單價分佈泡泡圖"}]},{id:"heatmap",label:"調價熱力圖",component:y.HeatmapReport,modules:[{id:"all",label:"完整熱力圖報告"}]},{id:"velocity",label:"銷售速度與房型",component:v.SalesVelocityReport,modules:[{id:"all",label:"完整銷售速度報告"}]},{id:"parking",label:"車位分析",component:j.ParkingAnalysisReport,modules:[{id:"all",label:"完整車位分析報告"}]},{id:"timeline",label:"政策時光機",component:w.default,modules:[{id:"all",label:"完整政策影響分析"}]}];function N(){let{loading:e,error:d,analysisData:b,handleAnalyze:x}=(0,i.useAnalysisData)(),g=(0,a.useFilterStore)(),[y,v]=(0,r.useState)({}),[j,w]=(0,r.useState)(!1),[N,z]=(0,r.useState)(["ranking","price-band"]),[_,C]=(0,r.useState)(!1);(0,r.useEffect)(()=>{let e={};k.forEach(t=>{e[t.id]=t.modules.map(e=>e.id)}),v(e),!b&&g.counties.length>0&&x()},[]);let P=e=>{z(t=>t.includes(e)?t.filter(t=>t!==e):[...t,e])},O=async()=>{w(!0);try{console.log("Starting PDF generation (Simple Screenshot Method)...");let e=document.getElementById("report-preview-container");if(!e)throw Error("Element #report-preview-container not found!");let t=window.open("","_blank","width=800,height=600");if(!t)throw Error("Could not open print window. Please allow popups.");let r=e=>{if(!e||"transparent"===e||"rgba(0, 0, 0, 0)"===e||e.startsWith("#")||e.startsWith("rgb"))return e;try{let t=document.createElement("canvas");t.width=1,t.height=1;let r=t.getContext("2d");if(r){r.fillStyle=e,r.fillRect(0,0,1,1);let[t,l,n,i]=r.getImageData(0,0,1,1).data;return`rgba(${t}, ${l}, ${n}, ${(i/255).toFixed(2)})`}}catch(t){console.warn("Color conversion failed for:",e)}return e},l=e=>{let t=document.createElement(e.tagName.toLowerCase());Array.from(e.attributes).forEach(e=>{"style"!==e.name&&"class"!==e.name&&t.setAttribute(e.name,e.value)});let n=window.getComputedStyle(e),i=["color","background-color","border-color","border-top-color","border-bottom-color","border-left-color","border-right-color","outline-color","fill","stroke"],a="";for(let e=0;e<n.length;e++){let t=n[e],l=n.getPropertyValue(t);i.includes(t)&&(l=r(l)),a+=`${t}:${l};`}return t.setAttribute("style",a),Array.from(e.childNodes).forEach(e=>{e.nodeType===Node.TEXT_NODE?t.appendChild(document.createTextNode(e.textContent||"")):e.nodeType===Node.ELEMENT_NODE&&t.appendChild(l(e))}),t};console.log("Creating styled clone...");let n=l(e);t.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>平米內參 - 報表</title>
                    <style>
                        /* A4 Page Setup */
                        @page {
                            size: A4 portrait;
                            margin: 15mm 10mm;
                        }
                        
                        /* Reset & Base */
                        * { 
                            margin: 0; 
                            padding: 0; 
                            box-sizing: border-box; 
                        }
                        
                        html {
                            font-size: 11px; /* Smaller base for A4 */
                        }
                        
                        body { 
                            background: #09090b; 
                            color: #fafafa;
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans TC', sans-serif;
                            padding: 0;
                            width: 100%;
                            max-width: 190mm; /* A4 minus margins */
                            margin: 0 auto;
                        }
                        
                        /* Scale down content to fit A4 */
                        #report-content {
                            transform-origin: top left;
                            width: 100%;
                        }
                        
                        /* Typography adjustments for print */
                        h1, h2, h3, h4, h5, h6 {
                            page-break-after: avoid;
                            font-size: 1.2em;
                        }
                        
                        h1 { font-size: 1.5em; margin-bottom: 0.5em; }
                        h2 { font-size: 1.3em; margin-bottom: 0.4em; }
                        h3 { font-size: 1.1em; margin-bottom: 0.3em; }
                        
                        p, li, td, th {
                            font-size: 0.95em;
                            line-height: 1.4;
                        }
                        
                        /* Table optimizations */
                        table {
                            width: 100% !important;
                            border-collapse: collapse;
                            font-size: 0.85em;
                            page-break-inside: auto;
                        }
                        
                        tr {
                            page-break-inside: avoid;
                            page-break-after: auto;
                        }
                        
                        th, td {
                            padding: 4px 6px !important;
                            border: 1px solid rgba(255,255,255,0.1);
                        }
                        
                        thead {
                            display: table-header-group;
                        }
                        
                        /* Section page breaks */
                        .report-section {
                            page-break-inside: avoid;
                            margin-bottom: 15px;
                        }
                        
                        /* Keep charts together */
                        .chart-container, 
                        [class*="chart"], 
                        svg {
                            page-break-inside: avoid;
                            max-width: 100%;
                            height: auto !important;
                        }
                        
                        /* Cards and panels */
                        [class*="card"],
                        [class*="panel"],
                        [class*="glass"] {
                            page-break-inside: avoid;
                            margin-bottom: 10px;
                        }
                        
                        /* Force backgrounds to print */
                        @media print {
                            html, body {
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                                color-adjust: exact !important;
                            }
                            
                            body {
                                background: #09090b !important;
                            }
                            
                            /* Hide scrollbars */
                            ::-webkit-scrollbar {
                                display: none;
                            }
                            
                            /* Ensure all content visible */
                            * {
                                overflow: visible !important;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div id="report-content"></div>
                </body>
                </html>
            `),t.document.close();let i=t.document.getElementById("report-content");i?i.appendChild(n):t.document.body.appendChild(n),await new Promise(e=>setTimeout(e,1e3)),console.log("Opening print dialog..."),t.print(),console.log("Print dialog opened successfully!"),alert("列印對話框已開啟！\n\n請在列印對話框中：\n1. 選擇「儲存為 PDF」或「另存新檔」\n2. 確保「背景圖形」選項已勾選\n3. 點擊「儲存」或「列印」")}catch(e){console.error("PDF Generation failed:",e),alert(`PDF 生成失敗: ${e.message||e}
請截圖此畫面給工程師。`)}finally{w(!1)}};return(0,t.jsxs)(n.AppLayout,{children:[(0,t.jsx)(l.default,{src:"https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js",strategy:"lazyOnload",onLoad:()=>console.log("html2pdf loaded")}),(0,t.jsxs)("div",{className:"lg:hidden flex items-center justify-between p-4 bg-zinc-900/80 border-b border-white/5",children:[(0,t.jsxs)("h2",{className:"font-semibold text-white flex items-center gap-2",children:[(0,t.jsx)(c,{className:"h-5 w-5 text-violet-400"}),"報表生成器"]}),(0,t.jsx)(s.Button,{variant:"outline",size:"sm",onClick:()=>C(!_),className:"border-zinc-700",children:_?"收起設定":"報表設定"})]}),(0,t.jsxs)("div",{className:"flex flex-col lg:flex-row h-[calc(100vh-theme(spacing.20))] lg:gap-6",children:[(0,t.jsxs)("aside",{className:(0,h.cn)("lg:w-80 flex-shrink-0 bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden flex flex-col","lg:flex",_?"flex":"hidden"),children:[(0,t.jsxs)("div",{className:"p-4 border-b border-white/5 bg-zinc-900",children:[(0,t.jsxs)("h2",{className:"font-semibold text-white flex items-center gap-2",children:[(0,t.jsx)(c,{className:"h-5 w-5 text-violet-400"}),"報表內容設定"]}),(0,t.jsx)("p",{className:"text-xs text-zinc-500 mt-1",children:"勾選欲輸出的分析模塊"})]}),(0,t.jsx)("div",{className:"flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar",children:k.map(e=>{let r=(y[e.id]||[]).length,l=e.modules.length,n=N.includes(e.id);return(0,t.jsxs)("div",{className:"bg-zinc-950/50 rounded-lg border border-white/5 overflow-hidden",children:[(0,t.jsxs)("div",{className:"flex items-center gap-2 p-3 hover:bg-zinc-800/50 transition-colors",children:[(0,t.jsx)("button",{onClick:()=>P(e.id),className:"p-1 hover:bg-zinc-700 rounded text-zinc-400",children:n?(0,t.jsx)(p.ChevronDown,{size:14}):(0,t.jsx)(m.ChevronRight,{size:14})}),(0,t.jsx)("div",{className:"flex-1 font-medium text-sm text-zinc-200 cursor-pointer",onClick:()=>P(e.id),children:e.label}),(0,t.jsx)("button",{onClick:()=>{var t;let r;return t=e.id,void((r=k.find(e=>e.id===t))&&v(e=>(e[t]||[]).length===r.modules.length?{...e,[t]:[]}:{...e,[t]:r.modules.map(e=>e.id)}))},className:"text-zinc-400 hover:text-white",children:r===l?(0,t.jsx)(u,{size:16,className:"text-violet-500"}):r>0&&r<l?(0,t.jsxs)("div",{className:"relative",children:[(0,t.jsx)(f,{size:16}),(0,t.jsx)("div",{className:"absolute inset-0 flex items-center justify-center",children:(0,t.jsx)("div",{className:"w-2 h-2 bg-violet-500 rounded-sm"})})]}):(0,t.jsx)(f,{size:16})})]}),n&&(0,t.jsx)("div",{className:"pl-9 pr-3 pb-3 space-y-1",children:e.modules.map(r=>{let l=(y[e.id]||[]).includes(r.id);return(0,t.jsxs)("div",{className:"flex items-center gap-2 py-1.5 px-2 rounded hover:bg-zinc-800/30 cursor-pointer group",onClick:()=>{var t,l;return t=e.id,l=r.id,void v(e=>{let r=e[t]||[],n=r.includes(l)?r.filter(e=>e!==l):[...r,l];return{...e,[t]:n}})},children:[(0,t.jsx)("div",{className:(0,h.cn)("text-zinc-500 group-hover:text-zinc-300 transition-colors",l&&"text-violet-400"),children:l?(0,t.jsx)(u,{size:14}):(0,t.jsx)(f,{size:14})}),(0,t.jsx)("span",{className:(0,h.cn)("text-xs text-zinc-400 group-hover:text-zinc-200",l&&"text-zinc-200"),children:r.label})]},r.id)})})]},e.id)})}),(0,t.jsx)("div",{className:"p-4 border-t border-white/5 bg-zinc-900 text-center",children:(0,t.jsx)(s.Button,{onClick:O,disabled:e||!b||j,className:"w-full bg-violet-600 hover:bg-violet-700",children:j?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(o.Loader2,{className:"mr-2 h-4 w-4 animate-spin"}),"生成中..."]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(c,{className:"mr-2 h-4 w-4"}),"下載 PDF 報表"]})})})]}),(0,t.jsxs)("main",{className:"flex-1 bg-zinc-900/30 border border-white/5 rounded-xl overflow-hidden flex flex-col relative min-h-[400px]",children:[(0,t.jsxs)("div",{className:"h-12 border-b border-white/5 flex items-center justify-between px-3 lg:px-4 bg-zinc-900/80",children:[(0,t.jsx)("span",{className:"text-xs lg:text-sm font-medium text-zinc-400",children:"預覽模式 (Preview)"}),(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[!b&&!e&&(0,t.jsx)("span",{className:"text-xs text-amber-500 hidden sm:inline",children:"請先至儀表板進行分析"}),(0,t.jsxs)(s.Button,{onClick:O,disabled:e||!b||j,size:"sm",className:"lg:hidden bg-violet-600 hover:bg-violet-700 text-xs",children:[(0,t.jsx)(c,{className:"h-3 w-3 mr-1"}),j?"生成中...":"下載 PDF"]})]})]}),(0,t.jsxs)("div",{className:"flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar relative bg-zinc-950",children:[e&&(0,t.jsxs)("div",{className:"absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 z-20",children:[(0,t.jsx)(o.Loader2,{className:"h-10 w-10 animate-spin text-violet-500 mb-4"}),(0,t.jsx)("p",{className:"text-zinc-400",children:"正在生成報表數據..."})]}),!b&&!e&&(0,t.jsxs)("div",{className:"flex flex-col items-center justify-center h-full text-zinc-500",children:[(0,t.jsx)("p",{children:"無分析數據"}),(0,t.jsx)(s.Button,{variant:"link",className:"text-violet-400",onClick:x,children:"嘗試重新載入"})]}),(0,t.jsxs)("div",{id:"report-preview-container",className:"space-y-10 min-h-[1000px] max-w-4xl mx-auto bg-zinc-950 p-8 text-zinc-100",children:[(0,t.jsxs)("div",{className:"border-b-2 border-violet-500 pb-4 mb-8",children:[(0,t.jsxs)("h1",{className:"text-3xl font-bold flex items-center gap-2",children:[(0,t.jsx)("span",{className:"bg-violet-600 w-8 h-8 flex items-center justify-center rounded text-white text-lg",children:"P"}),"平米內參 - 房市分析報告"]}),(0,t.jsxs)("div",{className:"mt-4 flex flex-wrap gap-4 text-sm text-zinc-400",children:[(0,t.jsxs)("div",{className:"flex items-center gap-1",children:[(0,t.jsx)("span",{className:"font-semibold text-zinc-300",children:"區域:"}),g.counties.join("、")," ",g.districts.length>0?`(${g.districts.join("、")})`:"(全區)"]}),(0,t.jsxs)("div",{className:"flex items-center gap-1",children:[(0,t.jsx)("span",{className:"font-semibold text-zinc-300",children:"日期:"}),g.startDate||"不限"," ~ ",g.endDate||"不限"]}),(0,t.jsxs)("div",{className:"flex items-center gap-1",children:[(0,t.jsx)("span",{className:"font-semibold text-zinc-300",children:"類型:"}),"preload"===g.transactionType?"預售屋":"成屋"]})]})]}),b&&k.map(e=>{if(0===(y[e.id]||[]).length)return null;let r=e.component,l=(e=>{if(!b)return null;let t=y[e]||[];if(0===t.length)return null;switch(e){case"ranking":return{data:b,visibleSections:t};case"price-band":return{data:{...b.priceBandAnalysis,transactionDetails:b.transactionDetails},visibleSections:t};case"unit-price":case"heatmap":case"velocity":case"parking":return{data:b};case"timeline":return{data:b.transactionDetails};default:return null}})(e.id);return l?(0,t.jsxs)("section",{className:"break-inside-avoid mb-12",children:[(0,t.jsx)("h2",{className:"text-2xl font-bold text-white mb-6 border-l-4 border-violet-500 pl-4",children:e.label}),(0,t.jsx)(r,{...l})]},e.id):null}),(0,t.jsxs)("div",{className:"mt-20 pt-8 border-t border-zinc-800 text-center text-zinc-600 text-xs",children:[(0,t.jsx)("p",{children:"本報告由 平米內參 自動生成。數據來源：內政部實價登錄。"}),(0,t.jsxs)("p",{children:["© ",new Date().getFullYear()," Vibe Coding. All rights reserved."]})]})]})]})]})]})]})}e.s(["default",()=>N],96971)},31593,e=>{e.v(t=>Promise.all(["static/chunks/00d2e2f779ad883f.js"].map(t=>e.l(t))).then(()=>t(94861)))}]);