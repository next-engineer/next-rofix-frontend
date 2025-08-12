"use client"

import Header from "@/components/header"
import { getUser, getWardrobe } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function MyPage() {
  const user = getUser() || { name: "게스트", personalColor: "" }
  const wardrobe = getWardrobe()

  return (
    <main className="min-h-screen bg-[#F2F2F2] dark:bg-neutral-900">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-bold text-black dark:text-white mb-6">마이 페이지</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white dark:bg-neutral-800 border-black/10 dark:border-white/10">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">내 정보</CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-300">
                FitSpot 회원 정보 확인
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-black dark:text-white">
              <div className="grid gap-1">
                <div>이름: {user.name}</div>
                <div>퍼스널컬러: {user.personalColor || "미설정"}</div>
              </div>
            </CardContent>

            <div className="mt-3 flex items-center justify-between px-6 pb-6">
              <Link href="/personal-color">
                <Button variant="outline" className="h-8 px-3">정보 수정</Button>
              </Link>
            </div>
          </Card>

          <Card className="bg-white dark:bg-neutral-800 border-black/10 dark:border-white/10 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">내 코디</CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-300">
                내가 등록한 아이템을 확인하고, 좋아요 수는 숫자로만 제공합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wardrobe.map((i) => (
                  <Card key={i.id} className="bg-white dark:bg-neutral-800 border-black/10 dark:border-white/10">
                    <CardContent className="pt-4">
                      <div className="w-full h-40 rounded-md border border-black/5 dark:border-white/10 bg-white/70 dark:bg-neutral-700 flex items-center justify-center text-neutral-400 dark:text-neutral-300">
                        {i.image ? (
                          <img
                            src={i.image || "/placeholder.svg"}
                            alt={i.name}
                            className="w-full h-40 object-cover rounded-md"
                          />
                        ) : (
                          "이미지"
                        )}
                      </div>
                      <div className="mt-2 font-semibold text-black dark:text-white">{i.name}</div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-300">
                        {i.type} · {i.category} · {i.color}
                      </div>
                      <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">좋아요 {i.likes}</div>
                    </CardContent>
                  </Card>
                ))}
                {wardrobe.length === 0 && (
                  <div className="text-sm text-neutral-600 dark:text-neutral-300">
                    등록된 코디가 없습니다. 옷 등록에서 추가해보세요.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 flex justify-center">
          <Button
            onClick={() => {
              if (window.confirm('정말로 탈퇴하시겠어요? 저장된 옷/정보가 모두 삭제됩니다.')) {
                try {
                  window.localStorage.removeItem('fitspot_user')
                  window.localStorage.removeItem('fitspot_wardrobe')
                } catch {}
                window.location.href = '/'
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
  )
}
