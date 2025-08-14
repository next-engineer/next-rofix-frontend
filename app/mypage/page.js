"use client";

import Header from "@/components/header";
import { useEffect, useState } from "react";
import {
  getUserSafe,
  saveUser,
  getWardrobe as readWardrobe,
  PERSONAL_COLOR_OPTIONS,
} from "@/lib/storage";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PC_ALIAS = { "봄웜": "봄 웜", "여름쿨": "여름 쿨", "가을웜": "가을 웜", "겨울쿨": "겨울 쿨" };
const normalizePC = (v) => (PC_ALIAS[String(v || "").trim()] ?? String(v || "").trim());

// ✅ 이모지 매핑 + 표시용 헬퍼
const PC_EMOJI = { "봄 웜": "🌸", "여름 쿨": "🏖️", "가을 웜": "🍂", "겨울 쿨": "❄️" };
const withEmoji = (label) => {
  const l = normalizePC(label || "");
  return l ? `${PC_EMOJI[l] ?? ""} ${l}`.trim() : "";
};

export default function MyPage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState({ nickname: "게스트", email: "", personalColor: "" });
  const [wardrobe, setWardrobe] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(user);

  useEffect(() => {
    setMounted(true);
    const u = getUserSafe() || {};
    const pc = normalizePC(u.personalColor || "");
    setUser({ nickname: u.nickname || "게스트", email: u.email || "", personalColor: pc });
    setForm({ nickname: u.nickname || "게스트", email: u.email || "", personalColor: pc });
    setWardrobe(readWardrobe() || []);
  }, []);

  const handleSave = () => {
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      alert("이메일 형식이 올바르지 않습니다.");
      return;
    }
    const next = saveUser({
      nickname: (form.nickname || "").trim() || "게스트",
      email: (form.email || "").trim(),
      // 저장 값은 이모지 없이 라벨만
      personalColor: normalizePC(form.personalColor || ""),
    });
    setUser({ ...next, personalColor: normalizePC(next.personalColor) });
    setEditing(false);
  };

  return (
    <main className="min-h-screen bg-[#F2F2F2] dark:bg-neutral-900">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-bold text-black dark:text-white mb-6">마이 페이지</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 내 정보 */}
          <Card className="bg-white dark:bg-neutral-800 border-black/10 dark:border-white/10">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">내 정보</CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-300">
                FitSpot 회원 정보 확인 및 수정
              </CardDescription>
            </CardHeader>

            {!editing ? (
              <>
                <CardContent className="text-sm text-black dark:text-white" suppressHydrationWarning>
                  <div className="grid gap-1">
                    <div>닉네임: {mounted ? (user.nickname || "게스트") : "—"}</div>
                    <div>이메일: {mounted ? (user.email || "미등록") : "—"}</div>
                    <div>
                      퍼스널컬러: {mounted ? (user.personalColor ? withEmoji(user.personalColor) : "미설정") : "—"}
                    </div>
                  </div>
                </CardContent>
                <div className="mt-3 flex items-center justify-between px-6 pb-6">
                  <Button variant="outline" className="h-8 px-3" onClick={() => setEditing(true)}>정보 수정</Button>
                </div>
              </>
            ) : (
              <>
                <CardContent className="text-sm text-black dark:text-white">
                  <div className="grid gap-4">
                    <label className="grid gap-1">
                      <span className="text-xs text-neutral-600 dark:text-neutral-300">닉네임</span>
                      <input
                        className="h-9 rounded-md border border-black/10 dark:border-white/10 bg-transparent px-3 outline-none"
                        value={form.nickname}
                        onChange={(e) => setForm(f => ({ ...f, nickname: e.target.value }))}
                      />
                    </label>

                    <label className="grid gap-1">
                      <span className="text-xs text-neutral-600 dark:text-neutral-300">이메일</span>
                      <input
                        type="email"
                        className="h-9 rounded-md border border-black/10 dark:border-white/10 bg-transparent px-3 outline-none"
                        value={form.email}
                        onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                      />
                    </label>

                    <label className="grid gap-1">
                      <span className="text-xs text-neutral-600 dark:text-neutral-300">퍼스널컬러</span>
                      <Select
                        value={form.personalColor}
                        onValueChange={(v) => setForm(f => ({ ...f, personalColor: v }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {PERSONAL_COLOR_OPTIONS.map((label) => (
                            <SelectItem key={label} value={label}>
                              {withEmoji(label)} {/* ← 이모지 + 라벨 */}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>
                  </div>
                </CardContent>
                <div className="mt-3 flex items-center justify-end gap-2 px-6 pb-6">
                  <Button variant="outline" className="h-8 px-3" onClick={() => setEditing(false)}>취소</Button>
                  <Button className="h-8 px-3" onClick={handleSave}>저장</Button>
                </div>
              </>
            )}
          </Card>

          {/* 내 코디 (필요하면 '내 옷장'으로 바꿔도 됨) */}
          <Card className="bg-white dark:bg-neutral-800 border-black/10 dark:border-white/10 md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-black dark:text-white">내 코디</CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-300" suppressHydrationWarning>
                  {mounted ? <>내가 등록한 옷을 한눈에 확인할 수 있습니다. 총 {wardrobe.length}개</> : <>내가 등록한 옷을 한눈에 확인할 수 있습니다. 총 —개</>}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              {!mounted ? (
                <div className="text-sm text-neutral-600 dark:text-neutral-300">불러오는 중…</div>
              ) : wardrobe.length === 0 ? (
                <div className="text-sm text-neutral-600 dark:text-neutral-300">
                  등록된 옷이 없습니다. <b>옷 등록하기</b> 버튼을 눌러 추가해 주세요.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wardrobe.map((i) => (
                    <Card key={i.id} className="bg-white dark:bg-neutral-800 border-black/10 dark:border-white/10">
                      <CardContent className="pt-4">
                        <div className="w-full h-40 rounded-md border border-black/5 dark:border-white/10 bg-white/70 dark:bg-neutral-700 flex items-center justify-center text-neutral-400 dark:text-neutral-300 overflow-hidden">
                          {i.image ? (
                            <img src={i.image || "/placeholder.svg"} alt={i.name || "item"} className="w-full h-40 object-cover rounded-md" />
                          ) : ("이미지")}
                        </div>
                        <div className="mt-2 font-semibold text-black dark:text-white">{i.name || "이름 없음"}</div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-300">
                          {[i.type, i.category, i.color].filter(Boolean).join(" · ")}
                        </div>
                        <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">좋아요 {i.likes ?? 0}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 회원탈퇴 */}
        <div className="mt-12 flex justify-center">
          <Button
            onClick={() => {
              if (window.confirm("정말로 탈퇴하시겠어요? 저장된 옷/정보가 모두 삭제됩니다.")) {
                try {
                  window.localStorage.removeItem("fitspot_user");
                  window.localStorage.removeItem("fitspot_wardrobe");
                } catch {}
                window.location.href = "/";
              }
            }}
            className="px-6 h-10 rounded-md
                       bg-neutral-300 text-neutral-900 hover:bg-neutral-400
                       dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700
                       border border-neutral-300 dark:border-neutral-700"
          >
            회원탈퇴
          </Button>
        </div>
      </section>
    </main>
  );
}
