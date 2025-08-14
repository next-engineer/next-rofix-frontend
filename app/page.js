"use client"

import Header from "@/components/header"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Thermometer, Palette, Search, Shirt } from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-neutral-900">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-12">
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
          <Link href="/recommend">
            <Button className="h-10 px-6 rounded-md bg-[#0B64FE] text-white hover:bg-[#0956da]">지금 추천받기</Button>
          </Link>
        </div>
      </section>
    </main>
  )
}

function FeatureCard({ href, icon, title, desc, gradient = "from-[#6aa5ff] to-[#1c7dff]" }) {
  return (
    <Link href={href} className="block">
      <Card className="h-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition rounded-2xl">
        <div className="flex flex-col items-center text-center px-8 py-8">
          <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${gradient} shadow-sm`}>
            {icon}
          </div>
          <div className="mt-1 font-semibold text-neutral-900 dark:text-white">{title}</div>
          <div className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">{desc}</div>
        </div>
      </Card>
    </Link>
  )
}
