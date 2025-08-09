"use client"

import Header from "@/components/header"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getWardrobe, upsertWardrobe } from "@/lib/storage"

const fallbackByType = {
  상의: "/images/outfit-hot.png",
  하의: "/images/outfit-casual.png",
  아우터: "/images/outfit-cold.png",
  신발: "/images/outfit-office.png",
}
function fallbackImageFor(type = "") {
  return fallbackByType[type] || "/images/outfit-casual.png"
}

export default function WardrobePage() {
  const [list, setList] = useState([])
  const [form, setForm] = useState({ name: "", type: "상의", category: "티셔츠", color: "화이트", image: "" })

  useEffect(() => {
    setList(getWardrobe())
  }, [])

  const onSubmit = (e) => {
    e.preventDefault()
    if (!form.name) return
    const updated = upsertWardrobe(form)
    setList(updated)
    setForm({ name: "", type: "상의", category: "티셔츠", color: "화이트", image: "" })
  }

  return (
    <main className="min-h-screen bg-[#F2F2F2] dark:bg-neutral-900">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-bold text-black dark:text-white mb-6">옷 등록</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 등록 폼 */}
          <Card className="bg-white dark:bg-neutral-800 border-black/10 dark:border-white/10 md:col-span-1">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">새 옷 등록</CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-300">
                내 옷장을 디지털로 관리하세요. 이미지 URL이 없으면 예시 사진이 자동으로 보입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label className="text-[#0B64FE]">이름</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="예: 화이트 티셔츠"
                    className="bg-white dark:bg-neutral-800"
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="text-[#0B64FE]">타입</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger className="bg-white dark:bg-neutral-800">
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

                <div className="grid gap-2">
                  <Label className="text-[#0B64FE]">카테고리</Label>
                  <Input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="예: 티셔츠, 슬랙스, 코트"
                    className="bg-white dark:bg-neutral-800"
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="text-[#0B64FE]">색상</Label>
                  <Input
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    placeholder="예: 화이트, 블랙, 네이비"
                    className="bg-white dark:bg-neutral-800"
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="text-[#0B64FE]">이미지 URL (선택)</Label>
                  <Input
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="https://... (비워두면 예시 사진 표시)"
                    className="bg-white dark:bg-neutral-800"
                  />
                </div>

                <Button type="submit" className="bg-[#0B64FE] text-white hover:bg-[#0a59e5]">
                  등록
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* 목록 */}
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
                  <Card key={i.id} className="bg-white dark:bg-neutral-800 border-black/10 dark:border-white/10">
                    <CardContent className="pt-4">
                      <div className="w-full h-40 rounded-md overflow-hidden border border-black/5 dark:border-white/10 bg-white/70 dark:bg-neutral-700">
                        <img
                          src={i.image || fallbackImageFor(i.type)}
                          alt={i.name}
                          className="w-full h-40 object-cover"
                        />
                      </div>
                      <div className="mt-2 font-semibold text-black dark:text-white">{i.name}</div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-300">
                        {i.type} · {i.category} · {i.color}
                      </div>
                      <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">좋아요 {i.likes}</div>
                    </CardContent>
                  </Card>
                ))}
                {list.length === 0 && (
                  <div className="text-sm text-neutral-600 dark:text-neutral-300">
                    아직 등록된 옷이 없어요. 아래 예시 이미지는 등록 후에 표시됩니다.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
