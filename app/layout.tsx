// app/layout.js
import { Inter, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { ThemeProvider as NextThemesProvider } from "next-themes";

const inter = Inter({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-latin",
  display: "swap",
});

const notoKR = Noto_Sans_KR({
  subsets: ["latin"], // 이 폰트는 'latin'만 지원
  weight: ["400", "500", "700"],
  variable: "--font-kr",
  display: "swap",
  // preload: false,
});

export const metadata = {
  title: { default: "FitSpot", template: "%s | FitSpot" },
  description: "퍼스널컬러와 날씨 기반 맞춤 코디 추천 서비스",
};

export default function RootLayout({ children }) {
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
