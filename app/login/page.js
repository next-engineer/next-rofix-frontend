"use client";

import dynamic from "next/dynamic";
const Header = dynamic(() => import("@/components/header"), { ssr: false });

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const { login, isLoading } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = email.trim();
    if (!v || !v.includes("@")) {
      alert("이메일을 정확히 입력해 주세요.");
      return;
    }

    // useAuth 훅의 login 함수 호출
    await login(v);
    // login 함수 내부에서 성공시 /mypage 이동 처리됨
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
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Button
                  type="submit"
                  className="h-9 px-4 rounded-md bg-[#4DA3FF] hover:bg-[#3E96F3] text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "처리 중..." : "로그인"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 px-4 rounded-md"
                  onClick={() => history.back()}
                  disabled={isLoading}
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
