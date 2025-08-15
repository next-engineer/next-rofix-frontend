"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Img = { src: string; alt?: string };
type CTA = { label: string; href: string };

type Props = {
  images?: Img[];
  heading?: string;
  description?: string;
  projectTitle?: string;
  projectPoints?: string[];
  primaryCta?: CTA;
  secondaryCta?: CTA;
  dark?: boolean;
  className?: string;
};

export default function BrandIntro({
  images = [
    { src: "/images/fitspot-1.jpg", alt: "룩북 1" },
    { src: "/images/fitspot-2.jpg", alt: "룩북 2" },
    { src: "/images/fitspot-3.jpg", alt: "룩북 3" },
  ],
  heading = "우리가 만든 FitSpot, 당신의 스타일 스팟.",
  description = "퍼스널컬러와 날씨를 함께 고려해 오늘 입기 좋은 코디를 제안합니다. 가볍게 옷장만 등록해도 충분히 똑똑한 추천을 받아보세요.",
  projectTitle = "Next.js 프로젝트",
  projectPoints = [
    "Next.js App Router · 다크 모드",
    "Tailwind CSS + shadcn/ui",
    "추천받기 · 퍼스널컬러 · 코디 검색 · 옷 등록",
    "로컬 저장 → API 연동/배포 준비",
  ],
  primaryCta = { label: "추천받기", href: "/recommend" },
  secondaryCta = { label: "옷 등록", href: "/wardrobe" },
  dark = false,
  className = "",
}: Props) {
  const base = dark ? "bg-black text-neutral-100" : "bg-[#F2F2F2] text-neutral-900";
  const border = dark ? "border-white/10" : "border-black/10";
  const ring = dark ? "ring-white/10" : "ring-black/10";
  const muted = dark ? "text-neutral-300" : "text-neutral-600";
  const cardBg = dark ? "bg-white/5 backdrop-blur" : "bg-white";

  const imgs = images.slice(0, 3);

  return (
    <section className={`rounded-3xl ${base} ${className}`}>
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-14 md:py-20">
        {/* 3열 이미지 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {imgs.map((im, i) => (
            <div key={i} className={`relative h-56 md:h-64 rounded-2xl overflow-hidden ring-1 ${ring}`}>
              <Image src={im.src} alt={im.alt || `brand-${i + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>

        {/* 본문 + 프로젝트 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">{heading}</h2>
            <p className={`mt-6 leading-relaxed ${muted}`}>{description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={primaryCta.href}>
                <Button className="rounded-2xl px-5 bg-[#0B64FE] text-white hover:opacity-90">
                  {primaryCta.label}
                </Button>
              </Link>
              <Link href={secondaryCta.href}>
                <Button variant="outline" className={`rounded-2xl ${dark ? "border-white/40 text-white hover:bg-white/10" : ""}`}>
                  {secondaryCta.label}
                </Button>
              </Link>
            </div>
          </div>

          <div className={`rounded-3xl border ${border} p-6 md:p-8 ${cardBg}`}>
            <h3 className="text-xl font-semibold">{projectTitle}</h3>
            <ul className={`mt-4 space-y-3 text-sm ${muted}`}>
              {projectPoints.map((pt, i) => (
                <li key={i}>• {pt}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
