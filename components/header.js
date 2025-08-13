"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import useAuth from "@/hooks/useAuth"; 

/* =======================================
 * 로컬 스토리지용 커스텀 훅 + 테마 토글 
 * ======================================= */

function useLocalStorage(key, initialValue) {
  // SSR 환경에서 window 객체에 접근하지 않도록 안전하게 처리
  const [storedValue, setStoredValue] = useState(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error("로컬 스토리지 읽기 실패:", error);
    }
  }, [key]);

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error("로컬 스토리지 쓰기 실패:", error);
    }
  };

  return [storedValue, setValue];
}

function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage("fitspot_theme", "light");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
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

/* =======================================
 * 세션 상태를 확인하는 커스텀 훅 
 * ======================================= */

export default function Header() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth(); 

  const onLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  // 로그인 처리 함수: 이메일을 사용하여 백엔드 로그인 API를 호출
  const handleLogin = async () => {
    try {
        // 예시 이메일. 실제로는 로그인 폼에서 입력값을 받아야 합니다.
        const email = "testuser@example.com"; 
        
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
            credentials: 'include'
        });

        if (res.ok) {
            // 로그인 성공 후, 다시 세션 상태를 확인하여 user 정보를 업데이트
            const data = await res.json();
            console.log("로그인 성공:", data);
            // useAuth의 상태를 업데이트하는 로직이 필요.
            // 여기서는 새로고침을 통해 useAuth 훅이 다시 실행되도록 처리할 수 있음.
            // 또는 useAuth 훅에 로그인 성공 후 상태를 직접 업데이트하는 함수를 추가해야 함.
            window.location.reload(); 
        } else {
            console.error("로그인 실패:", await res.text());
        }
    } catch (error) {
        console.error("로그인 API 호출 실패:", error);
    }
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
            {isLoading ? (
              // 로딩 중일 때 표시
              <div className="h-8 w-[150px] flex items-center justify-center rounded-md border border-neutral-200 dark:border-neutral-700 animate-pulse bg-neutral-100 dark:bg-neutral-800">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-gray-200"></div>
              </div>
            ) : user ? (
              <div className="flex items-center gap-2">
                <Link href="/mypage" passHref>
                  <Button asChild className="h-8 px-3 rounded-md bg-[#0B64FE] text-white hover:bg-[#0956da]">
                    <span>마이페이지</span>
                  </Button>
                </Link>
                <Button onClick={onLogout} variant="outline" className="h-8 px-3 rounded-md">
                  로그아웃
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/signup" passHref>
                  <Button onClick={handleLogin} asChild className="h-8 px-3 rounded-md bg-[#0B64FE] text-white hover:bg-[#0956da]">
                    <span>로그인</span>
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
