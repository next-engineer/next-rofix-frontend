// app/layout.tsx
import type { Metadata } from "next";
import { Inter, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["700","800","900"], variable: "--font-latin", display: "swap" });
const notoKR = Noto_Sans_KR({ subsets: ["latin"], weight: ["400","500","700"], variable: "--font-kr", display: "swap" });

export const metadata: Metadata = {
  title: { default: "FitSpot", template: "%s | FitSpot" },
  description: "퍼스널컬러와 날씨 기반 맞춤 코디 추천 서비스",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${notoKR.variable} antialiased min-h-screen flex flex-col bg-white dark:bg-neutral-900`}
        style={{
          // 🔁 Inter 먼저(라틴), 그다음 Noto KR(한글)
          fontFamily: "var(--font-latin), var(--font-kr), system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
