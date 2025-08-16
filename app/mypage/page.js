"use client";

import Header from "@/components/header";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PERSONAL_COLOR_OPTIONS } from "@/lib/storage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import UserManager from "@/lib/mypage-manager";
import ClothesManager from "@/lib/clothes-manager";
import useAuth from "@/hooks/useAuth";

const PC_ALIAS = {
  봄웜: "봄 웜",
  여름쿨: "여름 쿨",
  가을웜: "가을 웜",
  겨울쿨: "겨울 쿨",
};
const normalizePC = (v) =>
  PC_ALIAS[String(v || "").trim()] ?? String(v || "").trim();

const PC_EMOJI = {
  "봄 웜": "🌸",
  "여름 쿨": "🏖️",
  "가을 웜": "🍂",
  "겨울 쿨": "❄️",
};
const withEmoji = (label) => {
  const l = normalizePC(label || "");
  return l ? `${PC_EMOJI[l] ?? ""} ${l}`.trim() : "";
};

export default function MyPage() {
  const router = useRouter();
  const { deleteAccount } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState({
    nickname: "게스트",
    email: "",
    personalColor: "",
  });
  const [wardrobe, setWardrobe] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(user);

  const fetchData = async () => {
    try {
      const myInfo = await UserManager.getMyInfo();
      setUser({
        nickname: myInfo.nickname || "게스트",
        email: myInfo.email || "",
        personalColor: normalizePC(myInfo.personalColor || ""),
      });
      setForm({
        nickname: myInfo.nickname || "게스트",
        email: myInfo.email || "",
        personalColor: normalizePC(myInfo.personalColor || ""),
      });
      setMounted(true);
    } catch (err) {
      console.error("사용자 정보 불러오기 실패:", err);
      const shouldRedirect = confirm(
        "사용자 정보를 불러오는 데 실패했습니다. 확인을 누르면 메인 페이지로 이동합니다."
      );
      if (shouldRedirect) {
        router.push("/");
      }
    }

    try {
      const myWardrobe = await ClothesManager.getWardrobeByIdFromApi();
      setWardrobe(myWardrobe);
    } catch (err) {
      console.error("옷장 정보 불러오기 실패:", err);
      setWardrobe([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      alert("이메일 형식이 올바르지 않습니다.");
      return;
    }
    try {
      const updatedUser = await UserManager.updateMyInfo({
        nickname: (form.nickname || "").trim() || "게스트",
        email: (form.email || "").trim(),
        personalColor: normalizePC(form.personalColor || ""),
      });
      setUser({
        ...updatedUser,
        personalColor: normalizePC(updatedUser.personalColor),
      });
      setEditing(false);
      alert("사용자 정보가 성공적으로 업데이트되었습니다.");
    } catch (err) {
      console.error("사용자 정보 업데이트 실패:", err);
      alert("사용자 정보 업데이트에 실패했습니다.");
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("정말로 탈퇴하시겠어요? 저장된 옷/정보가 모두 삭제됩니다.")) {
      try {
        await deleteAccount();
        alert("회원 탈퇴가 완료되었습니다.");
        router.push("/");
      } catch (err) {
        console.error("회원 탈퇴 실패:", err);
        alert("회원 탈퇴에 실패했습니다.");
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#F2F2F2] dark:bg-neutral-900">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
          마이 페이지
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white dark:bg-neutral-800 border-black/10 dark:border-white/10">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">
                내 정보
              </CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-300">
                FitSpot 회원 정보 확인 및 수정
              </CardDescription>
            </CardHeader>

            {!editing ? (
              <>
                <CardContent
                  className="text-sm text-black dark:text-white"
                  suppressHydrationWarning
                >
                  <div className="grid gap-1">
                    <div>
                      닉네임: {mounted ? user.nickname || "게스트" : "—"}
                    </div>
                    <div>이메일: {mounted ? user.email || "미등록" : "—"}</div>
                    <div>
                      퍼스널컬러:{" "}
                      {mounted
                        ? user.personalColor
                          ? withEmoji(user.personalColor)
                          : "미설정"
                        : "—"}
                    </div>
                  </div>
                </CardContent>
                <div className="mt-3 flex items-center justify-between px-6 pb-6">
                  <Button
                    variant="outline"
                    className="h-8 px-3"
                    onClick={() => setEditing(true)}
                  >
                    정보 수정
                  </Button>
                </div>
              </>
            ) : (
              <>
                <CardContent className="text-sm text-black dark:text-white">
                  <div className="grid gap-4">
                    <label className="grid gap-1">
                      <span className="text-xs text-neutral-600 dark:text-neutral-300">
                        닉네임
                      </span>
                      <input
                        className="h-9 rounded-md border border-black/10 dark:border-white/10 bg-transparent px-3 outline-none"
                        value={form.nickname}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, nickname: e.target.value }))
                        }
                      />
                    </label>

                    <label className="grid gap-1">
                      <span className="text-xs text-neutral-600 dark:text-neutral-300">
                        이메일
                      </span>
                      <input
                        type="email"
                        className="h-9 rounded-md border border-black/10 dark:border-white/10 bg-transparent px-3 outline-none"
                        value={form.email}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, email: e.target.value }))
                        }
                      />
                    </label>

                    <label className="grid gap-1">
                      <span className="text-xs text-neutral-600 dark:text-neutral-300">
                        퍼스널컬러
                      </span>
                      <Select
                        value={form.personalColor}
                        onValueChange={(v) =>
                          setForm((f) => ({ ...f, personalColor: v }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {PERSONAL_COLOR_OPTIONS.map((label) => (
                            <SelectItem key={label} value={label}>
                              {withEmoji(label)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>
                  </div>
                </CardContent>
                <div className="mt-3 flex items-center justify-end gap-2 px-6 pb-6">
                  <Button
                    variant="outline"
                    className="h-8 px-3"
                    onClick={() => {
                      setEditing(false);
                      setForm(user); // 취소 시 원래 값으로 되돌리기
                    }}
                  >
                    취소
                  </Button>
                  <Button className="h-8 px-3" onClick={handleSave}>
                    저장
                  </Button>
                </div>
              </>
            )}
          </Card>

          <Card className="bg-white dark:bg-neutral-800 border-black/10 dark:border-white/10 md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-black dark:text-white">
                  내 코디
                </CardTitle>
                <CardDescription
                  className="text-neutral-600 dark:text-neutral-300"
                  suppressHydrationWarning
                >
                  {mounted ? (
                    <>
                      내가 등록한 옷을 한눈에 확인할 수 있습니다. 총{" "}
                      {wardrobe.length}개
                    </>
                  ) : (
                    <>내가 등록한 옷을 한눈에 확인할 수 있습니다. 총 —개</>
                  )}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              {!mounted ? (
                <div className="text-sm text-neutral-600 dark:text-neutral-300">
                  불러오는 중…
                </div>
              ) : wardrobe.length === 0 ? (
                <div className="text-sm text-neutral-600 dark:text-neutral-300">
                  등록된 옷이 없습니다. <b>옷 등록하기</b> 버튼을 눌러 추가해
                  주세요.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wardrobe.map((i) => (
                    <Card
                      key={i.id}
                      className="bg-white dark:bg-neutral-800 border-black/10 dark:border-white/10"
                    >
                      <CardContent className="pt-4">
                        <div className="w-full h-40 rounded-md border border-black/5 dark:border-white/10 bg-white/70 dark:bg-neutral-700 flex items-center justify-center text-neutral-400 dark:text-neutral-300 overflow-hidden">
                          {i.image ? (
                            <img
                              src={i.image || "/placeholder.svg"}
                              alt={i.title || "item"}
                              className="w-full h-40 object-cover rounded-md"
                            />
                          ) : (
                            "이미지"
                          )}
                        </div>
                        <div className="mt-2 font-semibold text-black dark:text-white">
                          {i.title || "이름 없음"}
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-300">
                          {[i.category, i.color, i.weather]
                            .filter(Boolean)
                            .join(" · ")}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 flex justify-center">
          <Button
            onClick={handleDeleteAccount}
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
