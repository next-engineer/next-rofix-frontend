"use client";

import dynamic from "next/dynamic";
const Header = dynamic(() => import("@/components/header"), { ssr: false });

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// storage 헬퍼 사용
import { signUpWithEmail, getUser } from "@/lib/storage";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  // 유효한 로그인만 접근 차단, 예전 게스트는 정리
  useEffect(() => {
    try {
      const u = getUser();
      if (u && typeof u.email === "string" && u.email.includes("@")) {
        router.replace("/");
      } else if (u && (!u.email || !u.email.includes("@"))) {
        localStorage.removeItem("fitspot_user"); // 게스트 값 정리
      }
    } catch {}
  }, [router]);

  const onSubmit = (e) => {
    e.preventDefault();
    const v = email.trim();
    if (!v || !v.includes("@")) {
      alert("이메일을 정확히 입력해 주세요.");
      return;
    }

    // 계정 없으면 생성, 있으면 덮어쓰기(로그인처럼 사용)
    signUpWithEmail(v);

    router.push("/");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-[#F2F2F2] dark:bg-neutral-900">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-16 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold text-neutral-900 dark:text-white">
              로그인
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm text-neutral-700 dark:text-neutral-300">E-mail</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Button type="submit" className="h-9 px-4 rounded-md bg-[#4DA3FF] hover:bg-[#3E96F3] text-white">
                  로그인
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 px-4 rounded-md"
                  onClick={() => router.back()}
                >
                  닫기
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
