import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoSansTC = Noto_Sans_TC({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-noto-sans-tc",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#09090b",
};

export const metadata: Metadata = {
  title: "平米內參 - 預售屋數據儀表板 | 實價登錄與銷控表分析",
  description: "獨家預售屋銷控表與調價熱力圖分析。透過視覺化數據，精準掌握房市趨勢與建案真實價值。提供最新實價登錄解析、房地產大數據。",
  keywords: ["預售屋", "實價登錄", "房地產", "大數據", "銷控表", "調價熱力圖", "平米內參"],
  authors: [{ name: "平米內參" }],
  openGraph: {
    title: "平米內參 - 預售屋數據儀表板",
    description: "獨家預售屋銷控表與調價熱力圖分析。透過視覺化數據，精準掌握房市趨勢與建案真實價值。",
    url: "https://www.sqmtalk.com",
    siteName: "平米內參",
    locale: "zh_TW",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "平米內參 - 預售屋數據儀表板",
    description: "獨家預售屋銷控表與調價熱力圖分析。透過視覺化數據，精準掌握房市趨勢與建案真實價值。",
  },
  icons: {
    icon: "/icon.png",  // Explicitly reference the file in public/
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" className={`${inter.variable} ${notoSansTC.variable}`}>
      <body className="antialiased bg-dark-bg text-text-primary font-sans">
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}
