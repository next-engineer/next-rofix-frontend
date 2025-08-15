"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  imageSrc?: string;
  imageAlt?: string;
  cta?: { label: string; href: string } | null;
  className?: string;
};

export default function BrandHero({
  imageSrc = "/images/brand-hero.jpg", // ← 여기에 1장만 넣어 쓰면 됩니다
  imageAlt = "FitSpot 브랜드 이미지",
  cta = { label: "시작하기", href: "/recommend" },
  className = "",
}: Props) {
  return (
    <section className={`w-full ${className}`}>
      {/* 배경은 페이지와 동일: light=white, dark=neutral-900 */}
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-16 md:py-20 bg-transparent">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center">
          {/* 이미지 한 장 */}
          <div
            className="relative w-full h-[22rem] md:h-[32rem] overflow-hidden
                       rounded-[2rem] md:rounded-[2.5rem]
                       ring-1 ring-black/5 dark:ring-white/10 bg-neutral-100 dark:bg-neutral-800"
            // 아치 느낌 살짝 주는 마스크(지원 안 되면 자동 무시됨)
            style={{
              WebkitMaskImage:
                "radial-gradient(180% 100% at 50% 0, black 52%, transparent 53%)",
              maskImage:
                "radial-gradient(180% 100% at 50% 0, black 52%, transparent 53%)",
            }}
          >
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* 텍스트(한국어로 변환) */}
          <div>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 leading-tight">
              당신에게 딱 맞는<br className="hidden sm:block" />
              코디를 발견하세요
            </h2>

            <p className="mt-6 text-base md:text-[17px] leading-7 text-neutral-700 dark:text-neutral-300">
              FitSpot은 당신만의 색감과 날씨 정보를 바탕으로 맞춤형 코디를 추천합니다.
              매일 더 멋지고 편안한 하루를 보낼 수 있도록 도와드려요. 로그인 또는
              회원가입 후 나만의 스타일 여정을 시작해 보세요.
            </p>
            <p className="mt-4 text-base md:text-[17px] leading-7 text-neutral-700 dark:text-neutral-300">
              간편한 인터페이스로 개인 취향에 꼭 맞춘 코디를 쉽게 찾을 수 있으며,
              날씨 변화에 따라 추천도 자동으로 달라집니다. 지금 FitSpot과 함께 옷장을
              한 단계 업그레이드해 보세요.
            </p>

            {cta && (
              <div className="mt-8">
                <Link href={cta.href}>
                  <Button className="rounded-2xl px-5">
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
