"use client";

import Header from "@/components/header";
import { useEffect, useState, useRef } from "react";
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
import ClothesManager from "@/lib/clothes-manager"; // clothes api 연동

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
import { useRouter } from "next/navigation";

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

const weathers = [
  { key: "hot", label: "더움", emoji: "🔥" },
  { key: "cold", label: "추움", emoji: "❄️" },
  { key: "sunny", label: "맑음", emoji: "☀️" },
  { key: "cloudy", label: "흐림", emoji: "☁️" },
  { key: "rainy", label: "비", emoji: "🌧️" },
];

const getColorLabel = (value) =>
  colors.find((c) => c.value === value)?.label || value;

const getWeatherLabel = (key) => {
  const w = weathers.find((w) => w.key === key);
  return w ? `${w.label} ${w.emoji}` : key;
};

export default function WardrobePage() {
  const [list, setList] = useState([]);
  const router = useRouter();
  const calledRef = useRef(false);

  // 폼 초기값
  const [form, setForm] = useState({
    name: "",
    type: "상의", // backend category와 매핑
    color: "white",
    weather: "hot",
    description: "",
  });

  const [images, setImages] = useState([]);

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

    if (file) {
      // 1. 파일 타입(확장자) 검증
      if (!allowedTypes.includes(file.type)) {
        alert("JPEG, PNG, GIF 형식의 이미지 파일만 업로드할 수 있습니다.");
        e.target.value = "";
        return;
      }

      // 2. 파일 크기 검증
      if (file.size > maxSizeBytes) {
        alert("이미지 크기는 5MB 이하여야 합니다."); // 사용자에게 경고 메시지 표시
        e.target.value = ""; // 파일 선택 초기화 (선택된 파일 없앰)
        return; // 함수 실행 중단
      }

      // 모든 검증 통과 시 setImage
      setImages([
        {
          id: Date.now() + Math.random(),
          file,
          url: URL.createObjectURL(file),
        },
      ]);
    }
  };

  const removeImage = (imageId) => {
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  // 옷장 데이터를 가져오는 비동기 함수
  const fetchWardrobe = async () => {
    try {
      const wardrobeList = await ClothesManager.getWardrobeByIdFromApi();
      setList(wardrobeList);
    } catch (error) {
      // 알림창 띄우고 → 확인 누르면 메인으로 이동
      alert(error.message);
      router.replace("/");
    }
  };

  useEffect(() => {
    if (calledRef.current) return; // 이미 호출했으면 종료
    calledRef.current = true;
    fetchWardrobe();
  }, []);

  // 삭제 핸들러
  const handleDelete = async (clothingId) => {
    if (!clothingId) return;
    if (confirm("정말 삭제할까요?")) {
      try {
        await ClothesManager.deleteWardrobeFromApi(clothingId);
        alert("옷이 성공적으로 삭제되었습니다.");
        fetchWardrobe(); // 삭제 후 목록 새로고침
      } catch (error) {
        alert(error.message);
      }
    }
  };

  // 등록 핸들러 - 옷 등록 api 사용
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("옷 이름을 입력해주세요.");
      return;
    }

    try {
      // 서버에 전송할 옷 정보 데이터
      const clothingData = {
        title: form.name,
        category: form.type, // 백엔드 DTO에 맞게 'type'을 'category'로 보냄
        color: form.color,
        weather: form.weather,
        description: form.description,
      };

      const file = images.length > 0 ? images[0].file : null;

      // ClothesManager를 사용하여 API 호출
      const newClothing = await ClothesManager.createClothing(
        clothingData,
        file
      );
      alert("옷이 성공적으로 등록되었습니다!");

      fetchWardrobe(); // 등록 후 목록 새로고침

      // 폼 리셋
      setForm({
        name: "",
        type: "상의",
        color: "white",
        weather: "hot",
        description: "",
      });
      setImages([]);
      const inputEl = document.getElementById("image-upload");
      if (inputEl) inputEl.value = "";
    } catch (error) {
      alert(error.message);
    }
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
                  이미지 파일을 첨부해 등록할 수 있어요.
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
                        accept=".jpg, .jpeg, .png, .gif"
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

                  <div className="flex flex-wrap gap-4">
                    <div className="grid gap-2 flex-shrink-0">
                      <Label className="text-[#0B64FE]">카테고리</Label>
                      <Select
                        value={form.type}
                        onValueChange={(v) => setForm({ ...form, type: v })}
                      >
                        <SelectTrigger className="bg-white dark:bg-neutral-800 w-22">
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
                        <SelectTrigger className="bg-white dark:bg-neutral-800 w-22">
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
                        <SelectTrigger className="bg-white dark:bg-neutral-800 w-22">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {weathers.map((s) => (
                            <SelectItem key={s.key} value={s.key}>
                              {s.label} {s.emoji}
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
              <CardTitle className="text-black dark:text-white">
                내 옷장
              </CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-300">
                등록한 옷과 예시 이미지를 확인할 수 있어요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.map((i) => (
                  <Card
                    key={i.clothingId}
                    className="bg-white dark:bg-neutral-800 border-black/10 dark:border-white/10"
                  >
                    <CardContent className="pt-4">
                      <div className="relative w-full h-40 rounded-md overflow-hidden border border-black/5 dark:border-white/10 bg-white/70 dark:bg-neutral-700">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={i.imageUrl || fallbackImageFor(i.type)}
                          alt={i.name}
                          className="w-full h-40 object-cover"
                        />
                        {/* 삭제 버튼 */}
                        <button
                          type="button"
                          onClick={() => handleDelete(i.clothingId)}
                          className="absolute top-2 right-2 inline-flex items-center justify-center rounded-md border border-red-300/60 bg-white/80 dark:bg-neutral-800 px-2 py-1 text-xs text-red-600 hover:bg-white shadow-sm"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-2 font-semibold text-black dark:text-white">
                        {i.title}
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-300">
                        {i.category} · {getColorLabel(i.color)} ·{" "}
                        {getWeatherLabel(i.weather)}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {list.length === 0 && (
                  <div className="text-sm text-neutral-600 dark:text-neutral-300">
                    아직 등록된 옷이 없어요.
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
