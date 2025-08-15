"use client"

import Header from "@/components/header"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Thermometer, Palette, Search, Shirt } from "lucide-react"

/* ====== 프리뷰에서 쓰던 컴팩트 Footer 그대로 이식 ====== */
function LiteFooter() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black">
      <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3">
        {/* About */}
        <div className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400 max-w-2xl">
          <div className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">About Us</div>
          <p className="mt-1">
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">👕 Team Rofix</span>는
            당신에게 가장 어울리는 룩을 추천합니다. 코디 고민은 이제 저희가 <span className="font-semibold">픽</span>해 드릴게요.
          </p>
        </div>
        {/* Team */}
        <div className="text-[13px] text-neutral-600 dark:text-neutral-400">
          <div className="font-medium text-neutral-900 dark:text-neutral-100">Team Rofix People</div>
          <div className="mt-0.5">김아람 · 윤병창 · 이승연 · 박광훈 · 장성현</div>
        </div>
      </div>
    </footer>
  )
}

/* ====== 카드: 프리뷰와 동일한 호버 인터랙션 적용 ====== */
function FeatureCard({ href, icon, title, desc, gradient = "from-[#6aa5ff] to-[#1c7dff]" }) {
  return (
    <Link href={href} className="block group">
      <Card
        className="h-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800
                   shadow-sm transition-all rounded-2xl
                   motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:shadow-lg"
      >
        <div className="flex flex-col items-center text-center px-8 py-8">
          <div
            className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full
                        bg-gradient-to-br ${gradient} shadow-sm
                        transition-transform motion-safe:group-hover:scale-110`}
          >
            {icon}
          </div>
          <div className="mt-1 font-semibold text-neutral-900 dark:text-white">{title}</div>
          <div className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">{desc}</div>
        </div>
      </Card>
    </Link>
  )
}

export default function HomePage() {
  return (
    // 본문을 flex-1로 채우고 푸터를 하단에 고정되듯 보이게 하기 위해 flex-col 적용
    <main className="min-h-screen bg-white dark:bg-neutral-900 flex flex-col">
      <Header />

      {/* 본문이 남은 높이를 차지하게 해서 푸터가 아래로 내려가도록 */}
      <section className="mx-auto max-w-6xl px-4 py-12 flex-1">
        <div className="text-center">
          <h1 className="text-[44px] md:text-[56px] font-extrabold tracking-tight text-neutral-900 dark:text-white">
            FitSpot
          </h1>
          <p className="mt-2 text-[20px] text-neutral-700 dark:text-neutral-300">당신의 스타일 스팟.</p>
          <p className="mt-6 text-neutral-500 dark:text-neutral-400">
            퍼스널컬러와 날씨를 기반으로 한 맞춤형 패션 추천 서비스
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            href="/recommend"
            gradient="from-[#6aa5ff] to-[#1c7dff]"
            icon={<Thermometer className="h-5 w-5 text-white" />}
            title="날씨별 추천"
            desc="오늘 날씨에 맞는 코디 추천"
          />
        {/* 나머지 카드들도 동일 */}
          <FeatureCard
            href="/personal-color"
            gradient="from-[#f09ad9] to-[#b476ff]"
            icon={<Palette className="h-5 w-5 text-white" />}
            title="퍼스널컬러"
            desc="나의 퍼스널컬러 진단"
          />
          <FeatureCard
            href="/search"
            gradient="from-[#5fd1ff] to-[#2a9dff]"
            icon={<Search className="h-5 w-5 text-white" />}
            title="코디 검색"
            desc="다른 사람 코디 구경"
          />
          <FeatureCard
            href="/wardrobe"
            gradient="from-[#63e6a8] to-[#3ccf87]"
            icon={<Shirt className="h-5 w-5 text-white" />}
            title="옷 등록"
            desc="내 옷장 관리"
          />
        </div>

        <div className="mt-10 flex justify-center">
          <Link href="/recommend" className="group">
            <Button
              className="h-10 px-6 rounded-md bg-[#0B64FE] text-white
                         transition-transform hover:bg-[#0956da]
                         motion-safe:group-hover:-translate-y-0.5"
            >
              지금 추천받기
            </Button>
          </Link>
        </div>
      </section>

      {/* 프리뷰의 LiteFooter 추가 */}
      <LiteFooter />
    </main>
  )
}
