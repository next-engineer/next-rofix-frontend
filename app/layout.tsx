// app/layout.tsx
import type { Metadata } from "next";
import { Inter, Noto_Sans_KR } from "next/font/google";
import "../styles/globals.css";
import { ThemeProvider as NextThemesProvider } from "next-themes"; // 직접 사용

const inter = Inter({
  subsets: ["latin"],
  weight: ["700","800","900"],
  variable: "--font-latin",
  display: "swap",
});

const notoKR = Noto_Sans_KR({
  subsets: ["latin"],            // ✅ 반드시 지정(이 폰트는 'latin'만 지원)
  weight: ["400","500","700"],
  variable: "--font-kr",
  display: "swap",
  // 대안: subsets 지정이 어려우면 아래 주석 해제
  // preload: false,
});

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
          fontFamily:
            "var(--font-latin), var(--font-kr), system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="fitspot-theme"
        >
          <main className="flex-1">{children}</main>
        </NextThemesProvider>
      </body>
    </html>
  );
}