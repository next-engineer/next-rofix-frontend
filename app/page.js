"use client";

import { useRef, useState } from "react";
import Header from "@/components/header";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Thermometer, Palette, Search, Shirt } from "lucide-react";

/* ====== 컴팩트 Footer ====== */
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
  );
}

/* ====== 카드 ====== */
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
  );
}

/* ====== 브랜드 히어로(이미지 1장 + 한국어 소개) ====== */
function BrandHero({
  id = "brand-intro",
  imageSrc = "/images/brand-hero.jpg",
  imageAlt = "FitSpot 룩북",
  cta = { label: "시작하기", href: "/recommend" },
  className = "",
}) {
  return (
    <section id={id} className={`w-full scroll-mt-28 md:scroll-mt-32 ${className}`}>
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center">
          {/* 이미지 */}
          <div
            className="relative w-full h-[22rem] md:h-[32rem] overflow-hidden
                       rounded-[2rem] md:rounded-[2.5rem]
                       ring-1 ring-black/5 dark:ring-white/10
                       bg-neutral-100 dark:bg-neutral-800"
          >
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-cover object-[center_30%]"
              sizes="(min-width: 768px) 50vw, 100vw"
              priority
            />
          </div>

          {/* 한국어 브랜드 소개 */}
          <div>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 leading-tight">
              당신에게 딱 맞는<br className="hidden sm:block" />
              코디를 발견하세요
            </h2>

            <p className="mt-6 text-base md:text-[17px] leading-7 text-neutral-700 dark:text-neutral-300">
              FitSpot은 당신의 고유한 컬러와 현재 날씨를 기반으로 코디를 개인화해 추천합니다.
              매일 더 멋지고 편안한 하루를 보낼 수 있도록, 로그인 또는 회원가입 후
              나만의 스타일 여정을 시작해 보세요.
            </p>
            <p
              className="mt-4 text-base md:text-[17px] leading-7 text-neutral-700 dark:text-neutral-300 max-w-[68ch]"
              style={{ wordBreak: "keep-all" }}
            >
              간편한 인터페이스로 취향에 맞는 코디를 쉽게 찾을 수 있으며, 날씨 변화에 따라 추천도 자연스럽게 바뀝니다.{" "}
              Rofix와 함께 옷장을
              {/* ⬇️ 모바일에서만 줄바꿈 */}
              <br className="sm:hidden" />
              {/* ⬇️ '가볍게 스타일은'을 한 줄로 묶음(모바일에서만 강제) */}
              <span className="whitespace-nowrap sm:whitespace-normal"> 가볍게 스타일은</span>{" "}
              더욱 업그레이드해 보세요.
            </p>


            {cta && (
              <div className="mt-8">
                <Link href={cta.href}>
                  <Button
                    className="rounded-2xl px-5
                               transition-transform duration-200
                               motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0
                               shadow-sm hover:shadow-md
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/20"
                  >
                    {cta.label}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ====== 페이지 ====== */
export default function HomePage() {
  const [showBrand, setShowBrand] = useState(false);
  const brandWrapRef = useRef(null); // ✅ JS에서는 제네릭 사용 금지

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-900 flex flex-col">
      <Header />

      <section className="mx-auto max-w-6xl px-4 py-12 flex-1">
        {/* 헤더 텍스트 */}
        <div className="text-center">
          <h1 className="text-[44px] md:text-[56px] font-extrabold tracking-tight text-neutral-900 dark:text-white">
            FitSpot
          </h1>
          <p className="mt-2 text-[20px] text-neutral-700 dark:text-neutral-300">당신의 스타일 스팟.</p>
          <p className="mt-6 text-neutral-500 dark:text-neutral-400">
            퍼스널컬러와 날씨를 기반으로 한 맞춤형 패션 추천 서비스
          </p>
        </div>

        {/* 기능 카드 */}
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

        {/* 브랜드 더 알아보기 (클릭 시 아래 섹션이 펼쳐짐) */}
        <div className="mt-16 md:mt-20 flex justify-center">
          <Button
            onClick={() => {
              if (!showBrand) {
                setShowBrand(true);
                setTimeout(() => brandWrapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
              } else {
                brandWrapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
            className="h-10 px-6 rounded-md bg-[#0B64FE] text-white hover:bg-[#0956da]
                       transition-transform duration-200
                       motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0
                       shadow-sm hover:shadow-md
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B64FE]/40"
          >
            브랜드 더 알아보기
          </Button>
        </div>

        {/* 펼침 컨테이너(부드러운 등장 애니메이션) */}
        <div
          ref={(el) => (brandWrapRef.current = el)} // ✅ 콜백 ref(안전)
          className={`overflow-hidden transition-all duration-500 ease-out
                     ${showBrand
                       ? "mt-16 md:mt-24 opacity-100 translate-y-0"
                       : "max-h-0 opacity-0 -translate-y-2 pointer-events-none"}`}
        >
          {showBrand && <BrandHero className="mt-0" />}
        </div>
      </section>

      <LiteFooter />
    </main>
  );
}
