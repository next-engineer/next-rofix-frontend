"use client";

import Header from "@/components/header";
import { useEffect, useState } from "react";
import {
  getWardrobe as readWardrobe,
  upsertWardrobe,
  deleteWardrobe,
} from "@/lib/storage";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";

/* === 이미지 압축 유틸 === */
async function compressImageFile(file, { maxWidth = 900, quality = 0.8 } = {}) {
  if (!file) return "";
  const img = await new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = URL.createObjectURL(file);
  });

  const scale = Math.min(1, maxWidth / (img.width || maxWidth));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round((img.width || maxWidth) * scale);
  canvas.height = Math.round((img.height || maxWidth) * scale);

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  URL.revokeObjectURL(img.src);
  return dataUrl;
}

export default function WardrobePage() {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState([]);

  // 폼 상태
  const [name, setName] = useState("");
  const [type, setType] = useState("상의");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("");
  const [image, setImage] = useState(""); // base64(압축본)

  useEffect(() => {
    setMounted(true);
    setItems(readWardrobe() || []);
  }, []);

  // 파일 -> "압축된" base64
  const handleImageFile = async (file) => {
    if (!file) {
      setImage("");
      return;
    }
    try {
      let dataUrl = await compressImageFile(file, { maxWidth: 900, quality: 0.8 });
      if (dataUrl.length > 4_000_000) {
        dataUrl = await compressImageFile(file, { maxWidth: 700, quality: 0.72 });
      }
      setImage(dataUrl);
    } catch (e) {
      console.warn("이미지 압축 실패:", e);
      setImage("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("이름을 입력해 주세요.");
      return;
    }

    // 로컬스토리지 한도 보호
    if (image && image.length > 4_500_000) {
      alert("이미지 용량이 커서 저장할 수 없어요. 더 작은 이미지로 다시 시도해 주세요.");
      return;
    }

    const next = upsertWardrobe({
      name: name.trim(),
      type: type.trim(),
      category: (category || "").trim(),
      color: (color || "").trim(),
      image: image || "",
      likes: 0,
    });

    setItems(next); // 오른쪽 즉시 반영
    setName(""); setCategory(""); setColor(""); setImage("");
  };

  const onDelete = (id) => {
    const next = deleteWardrobe(id);
    setItems(next);
  };

  return (
    <main className="min-h-screen bg-[#F2F2F2] dark:bg-neutral-900">
      <Header />

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-bold text-black dark:text-white mb-6">옷 등록</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 등록 폼 (기존 UI 유지) */}
          <Card className="bg-white dark:bg-neutral-800 border-black/10 dark:border-white/10">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">새 옷 등록</CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-300">
                이미지를 업로드하거나 정보 입력 후 등록하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={handleSubmit}>
                <label className="grid gap-1">
                  <span className="text-xs text-neutral-600 dark:text-neutral-300">사진 업로드</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFile(e.target.files?.[0])}
                    className="block text-sm"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs text-neutral-600 dark:text-neutral-300">이름</span>
                  <Input
                    placeholder="예: 화이트 티셔츠"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>

                <div className="grid grid-cols-3 gap-3">
                  <div className="grid gap-1">
                    <span className="text-xs text-neutral-600 dark:text-neutral-300">카테고리</span>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="상의">상의</SelectItem>
                        <SelectItem value="하의">하의</SelectItem>
                        <SelectItem value="아우터">아우터</SelectItem>
                        <SelectItem value="신발">신발</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-1">
                    <span className="text-xs text-neutral-600 dark:text-neutral-300">색상</span>
                    <Input
                      placeholder="white/black/..."
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-1">
                    <span className="text-xs text-neutral-600 dark:text-neutral-300">세부 카테고리</span>
                    <Input
                      placeholder="티셔츠/슬랙스..."
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                  </div>
                </div>

                <Button type="submit" className="mt-2">등록</Button>
              </form>
            </CardContent>
          </Card>

          {/* 내 옷장 미리보기 (기존 UI 유지 + 휴지통 오버레이) */}
          <Card className="bg-white dark:bg-neutral-800 border-black/10 dark:border-white/10">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">내 옷장</CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-300" suppressHydrationWarning>
                {mounted ? <>총 {items.length}개</> : <>총 —개</>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!mounted ? (
                <div className="text-sm text-neutral-600 dark:text-neutral-300">불러오는 중…</div>
              ) : items.length === 0 ? (
                <div className="text-sm text-neutral-600 dark:text-neutral-300">등록된 옷이 없습니다.</div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {items.map((i) => (
                    <Card key={i.id} className="bg-white dark:bg-neutral-800 border-black/10 dark:border-white/10">
                      <CardContent className="pt-4">
                        <div className="relative w-full h-36 rounded-md border border-black/5 dark:border-white/10 bg-white/70 dark:bg-neutral-700 flex items-center justify-center overflow-hidden">
                          {i.image ? (
                            <img src={i.image} alt={i.name || "item"} className="w-full h-36 object-cover" />
                          ) : (
                            "이미지"
                          )}

                          {/* 휴지통(오버레이) */}
                          <button
                            type="button"
                            onClick={() => onDelete(i.id)}
                            className="absolute top-2 right-2 inline-flex items-center justify-center h-8 w-8 rounded-full bg-white/90 text-red-600 shadow hover:bg-white transition"
                            title="삭제"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-2 font-semibold">{i.name || "이름 없음"}</div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-300">
                          {[i.type, i.category, i.color].filter(Boolean).join(" · ")}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
