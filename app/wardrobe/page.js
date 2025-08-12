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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, Trash2 } from "lucide-react";
import { getWardrobe, upsertWardrobe, deleteWardrobe } from "@/lib/storage";

// 타입별 예시 이미지 (이미지 없을 때 사용)
const fallbackByType = {
  상의: "/images/outfit-hot.png",
  하의: "/images/outfit-casual.png",
  아우터: "/images/outfit-cold.png",
  신발: "/images/outfit-office.png",
};
function fallbackImageFor(type = "") {
  return fallbackByType[type] || "/images/outfit-casual.png";
}

// 파일을 base64로 변환 (로컬스토리지에 이미지 저장용)
const fileToBase64 = (file) =>
  new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });

export default function WardrobePage() {
  const [list, setList] = useState([]);

  // 폼 초기값
  const [form, setForm] = useState({
    name: "",
    type: "상의",
    category: "",
    color: "white",
    weather: "all",
    description: "",
    imageUrl: "", // 선택 입력
  });

  const [images, setImages] = useState([]);

  const colors = [
    { value: "black", label: "블랙" },
    { value: "white", label: "화이트" },
    { value: "gray", label: "그레이" },
    { value: "navy", label: "네이비" },
    { value: "brown", label: "브라운" },
    { value: "beige", label: "베이지" },
    { value: "red", label: "레드" },
    { value: "blue", label: "블루" },
    { value: "green", label: "그린" },
    { value: "yellow", label: "옐로우" },
    { value: "pink", label: "핑크" },
    { value: "purple", label: "퍼플" },
  ];

  const seasons = [
    { value: "spring", label: "봄" },
    { value: "summer", label: "여름" },
    { value: "autumn", label: "가을" },
    { value: "winter", label: "겨울" },
    { value: "all", label: "사계절" },
  ];

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (imageId) => {
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  useEffect(() => {
    setList(getWardrobe());
  }, []);

  // 삭제 핸들러
  const handleDelete = (id) => {
    if (!id) return;
    if (confirm("정말 삭제할까요?")) {
      const updated = deleteWardrobe(id);
      setList(updated);
    }
  };

  // 등록(로컬스토리지에 직접 저장)
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    // 이미지 결정: 파일 > URL > 타입별 예시
    let imageSrc = fallbackImageFor(form.type);
    if (images.length > 0 && images[0]?.file) {
      try {
        imageSrc = await fileToBase64(images[0].file);
      } catch (err) {
        console.error(err);
        alert("이미지 파일을 읽는 중 오류가 발생했어요.");
        return;
      }
    } else if (form.imageUrl?.trim()) {
      imageSrc = form.imageUrl.trim();
    }

    const newWardrobeItem = {
      ...form,
      image: imageSrc,
      likes: 0, // id는 storage에서 안전 발급
    };

    const updated = upsertWardrobe(newWardrobeItem);
    setList(updated);

    // 폼 리셋
    setForm({
      name: "",
      type: "상의",
      category: "",
      color: "white",
      weather: "all",
      description: "",
      imageUrl: "",
    });
    setImages([]);
    const inputEl = document.getElementById("image-upload");
    if (inputEl) inputEl.value = "";
  };

  return (
    <main className="min-h-screen bg-[#F2F2F2] dark:bg-neutral-900">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
          옷 등록
        </h2>

        {/* 항상 3열(모바일에선 1열). 왼쪽 칼럼의 폼만 중앙 정렬 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ⬇️ 왼쪽 칼럼을 flex로 감싸 폼 카드를 중앙 배치 */}
          <div className="md:col-span-1 flex justify-center">
            <Card className="w-full max-w-md bg-white dark:bg-neutral-800 border-black/10 dark:border-white/10">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">
                  새 옷 등록
                </CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-300">
                  이미지 URL을 입력하거나 파일을 첨부해 등록할 수 있어요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmit} className="grid gap-4">
                  {/* 이미지 업로드 */}
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-2 block">
                      사진 업로드
                    </Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-secondary/20">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          클릭하여 이미지를 업로드하세요
                        </p>
                      </label>
                    </div>

                    {images.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        {images.map((image) => (
                          <div key={image.id} className="relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={image.url || "/placeholder.svg"}
                              alt="Preview"
                              className="w-full h-20 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(image.id)}
                              className="absolute -top-2 -right-2 text-black dark:text-white bg-white/70 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 이미지 URL (선택) */}
                  <div className="grid gap-2">
                    <Label className="text-[#0B64FE]">이미지 URL (선택)</Label>
                    <Input
                      value={form.imageUrl}
                      onChange={(e) =>
                        handleInputChange("imageUrl", e.target.value)
                      }
                      placeholder="https://... (파일을 첨부하면 파일이 우선)"
                      className="bg-white dark:bg-neutral-800"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-[#0B64FE]">이름</Label>
                    <Input
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="예: 화이트 티셔츠"
                      className="bg-white dark:bg-neutral-800"
                    />
                  </div>

                  <div className="flex gap-4">
                    <div className="grid gap-2 flex-shrink-0">
                      <Label className="text-[#0B64FE]">카테고리</Label>
                      <Select
                        value={form.type}
                        onValueChange={(v) => setForm({ ...form, type: v })}
                      >
                        <SelectTrigger className="bg-white dark:bg-neutral-800 w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="상의">상의</SelectItem>
                          <SelectItem value="하의">하의</SelectItem>
                          <SelectItem value="아우터">아우터</SelectItem>
                          <SelectItem value="신발">신발</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2 flex-shrink-0">
                      <Label className="text-[#0B64FE]">색상</Label>
                      <Select
                        value={form.color}
                        onValueChange={(v) => handleInputChange("color", v)}
                      >
                        <SelectTrigger className="bg-white dark:bg-neutral-800 w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {colors.map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              {color.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2 flex-shrink-0">
                      <Label className="text-[#0B64FE]">계절</Label>
                      <Select
                        value={form.weather}
                        onValueChange={(v) => handleInputChange("weather", v)}
                      >
                        <SelectTrigger className="bg-white dark:bg-neutral-800 w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {seasons.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-[#0B64FE]">설명</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="아이템에 대한 설명을 입력하세요"
                      rows={3}
                      className="bg-white dark:bg-neutral-800"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="bg-[#0B64FE] text-white hover:bg-[#0a59e5]"
                  >
                    등록
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* ⬇️ 오른쪽: 내 옷장 (항상 보임) */}
          <Card className="bg-white dark:bg-neutral-800 border-black/10 dark:border-white/10 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">내 옷장</CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-300">
                등록한 옷과 예시 이미지를 확인할 수 있어요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.map((i) => (
                  <Card
                    key={i.id}
                    className="bg-white dark:bg-neutral-800 border-black/10 dark:border-white/10"
                  >
                    <CardContent className="pt-4">
                      <div className="relative w-full h-40 rounded-md overflow-hidden border border-black/5 dark:border-white/10 bg-white/70 dark:bg-neutral-700">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={i.image || fallbackImageFor(i.type)}
                          alt={i.name}
                          className="w-full h-40 object-cover"
                        />
                        {/* 삭제 버튼 */}
                        <button
                          type="button"
                          onClick={() => handleDelete(i.id)}
                          className="absolute top-2 right-2 inline-flex items-center justify-center rounded-md border border-red-300/60 bg-white/80 dark:bg-neutral-800 px-2 py-1 text-xs text-red-600 hover:bg-white shadow-sm"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-2 font-semibold text-black dark:text-white">
                        {i.name}
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-300">
                        {i.type} · {i.category} · {i.color}
                      </div>
                      <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                        좋아요 {i.likes ?? 0}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {list.length === 0 && (
                  <div className="text-sm text-neutral-600 dark:text-neutral-300">
                    아직 등록된 옷이 없어요. 등록하면 이 영역에 카드가 채워집니다.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
