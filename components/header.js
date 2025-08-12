"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

// 저장된 사용자만 읽기 / 로그아웃
import { getUser, logoutUser } from "@/lib/storage";

/* =========================
 * simple localStorage hook (for theme)
 * ========================= */
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(undefined);

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(key);
      setValue(v ? JSON.parse(v) : initialValue);
    } catch {
      setValue(initialValue);
    }
  }, [key]);

  useEffect(() => {
    if (value === undefined) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  return [value, setValue];
}

function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage("fitspot_theme", "light");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800 transition"
      title="다크모드 전환"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export default function Header() {
  const router = useRouter();
  const [user, setUserState] = useState(null);

  // 저장된 사용자만 읽기 (자동 생성 없음)
  useEffect(() => {
    setUserState(getUser());
  }, []);

  const onLogout = () => {
    logoutUser();
    setUserState(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-3 h-14 items-center">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link href="/" className="font-semibold tracking-tight text-lg text-neutral-900 dark:text-white">
              FitSpot
            </Link>
          </div>

          {/* Center: Nav */}
          <nav className="flex items-center justify-center">
            <ul className="flex items-center gap-6 text-sm font-medium text-neutral-800 dark:text-neutral-200">
              <li>
                <Link href="/recommend" className="hover:text-neutral-500 dark:hover:text-neutral-400">
                  추천받기
                </Link>
              </li>
              <li>
                <Link href="/personal-color" className="hover:text-neutral-500 dark:hover:text-neutral-400">
                  퍼스널컬러
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-neutral-500 dark:hover:text-neutral-400">
                  코디 검색
                </Link>
              </li>
              <li>
                <Link href="/wardrobe" className="hover:text-neutral-500 dark:hover:text-neutral-400">
                  옷 등록
                </Link>
              </li>
            </ul>
          </nav>

          {/* Right: Theme + Auth */}
          <div className="ml-auto flex items-center gap-2 justify-end">
            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/mypage">
                  <Button className="h-8 px-3 rounded-md bg-[#0B64FE] text-white hover:bg-[#0956da]">
                    마이페이지
                  </Button>
                </Link>
                <Button onClick={onLogout} variant="outline" className="h-8 px-3 rounded-md">
                  로그아웃
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* ✅ 회원가입 버튼 제거, 로그인만 남김 → /signup 으로 이동 */}
                <Link href="/signup">
                  <Button className="h-8 px-3 rounded-md bg-[#0B64FE] text-white hover:bg-[#0956da]">
                    로그인
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
