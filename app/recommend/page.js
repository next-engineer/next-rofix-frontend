"use client"

import Header from "@/components/header"
import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Link from "next/link"
import OutfitRecommendationEngine from "@/lib/outfit-recommendation-engine"
import { getUser } from "@/lib/storage"
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react"

// 로컬 엔진을 백업용으로 유지
const engine = new OutfitRecommendationEngine()

const weatherOptions = [
  { key: "hot", label: "더움", emoji: "🔥" },
  { key: "cold", label: "추움", emoji: "❄️" },
  { key: "sunny", label: "맑음", emoji: "☀️" },
  { key: "cloudy", label: "흐림", emoji: "☁️" },
  { key: "rainy", label: "비", emoji: "🌧️" },
]

const seasonKeys = [
  { key: "spring", label: "봄 웜", emoji: "🌸" },
  { key: "summer", label: "여름 쿨", emoji: "🏖️" },
  { key: "autumn", label: "가을 웜", emoji: "🍂" },
  { key: "winter", label: "겨울 쿨", emoji: "❄️" },
]

function mapUserSeasonToKey(userLabel = "") {
  if (userLabel.includes("봄")) return "spring"
  if (userLabel.includes("여름")) return "summer"
  if (userLabel.includes("가을")) return "autumn"
  if (userLabel.includes("겨울")) return "winter"
  return ""
}

export default function RecommendWizardPage() {
  const user = getUser()
  const defaultSeasonKey = mapUserSeasonToKey(user?.personalColor || "")
  const [step, setStep] = useState(0) // 0=날씨, 1=퍼스널컬러, done=결과
  const total = 2

  const [weatherKey, setWeatherKey] = useState("")
  const [seasonKey, setSeasonKey] = useState(defaultSeasonKey)
  const [done, setDone] = useState(false)
  const [combos, setCombos] = useState([])
  const [summary, setSummary] = useState(null)

  const progress = useMemo(
    () => Math.round((((weatherKey ? 1 : 0) + (seasonKey ? 1 : 0)) / total) * 100),
    [weatherKey, seasonKey],
  )

  const canNext = step === 0 ? !!weatherKey : !!seasonKey
  const next = () => {
    if (step < total - 1 && canNext) setStep((s) => s + 1)
    if (step === total - 1 && canNext) finalize()
  }
  const prev = () => setStep((s) => Math.max(0, s - 1))

    const finalize = () => {
      const data = engine.getRecommendation(weatherKey, seasonKey)
      const c = engine.generateOutfitCombinations(weatherKey, seasonKey)
      setSummary(data)
      setCombos(c)
      setDone(true)
      }

  const resetAll = () => {
    setStep(0)
    setWeatherKey("")
    setSeasonKey(defaultSeasonKey)
    setDone(false)
    setCombos([])
    setSummary(null)
  }

  const StepWeather = () => (
    <div className="grid gap-4">
      <Label className="text-sm font-medium text-neutral-800 dark:text-neutral-200">오늘 날씨는 어떤가요?</Label>
      <RadioGroup value={weatherKey} onValueChange={setWeatherKey} className="grid gap-2">
        {weatherOptions.map((w) => (
          <label
            key={w.key}
            className={`flex items-center gap-2 rounded-md border px-3 py-2 transition ${
              weatherKey === w.key
                ? "border-[#0B64FE] bg-[#0B64FE]/5 dark:bg-[#0B64FE]/10"
                : "border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800/80"
            }`}
          >
            <RadioGroupItem value={w.key} id={`w-${w.key}`} />
            <span className="text-lg">{w.emoji}</span>
            <span className="text-neutral-900 dark:text-neutral-100">{w.label}</span>
          </label>
        ))}
      </RadioGroup>
    </div>
  )

  const StepSeason = () => (
    <div className="grid gap-4">
      <Label className="text-sm font-medium text-neutral-800 dark:text-neutral-200">퍼스널컬러를 선택해 주세요</Label>
      <RadioGroup value={seasonKey} onValueChange={setSeasonKey} className="grid gap-2">
        {seasonKeys.map((s) => (
          <label
            key={s.key}
            className={`flex items-center gap-2 rounded-md border px-3 py-2 transition ${
              seasonKey === s.key
                ? "border-[#0B64FE] bg-[#0B64FE]/5 dark:bg-[#0B64FE]/10"
                : "border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800/80"
            }`}
          >
            <RadioGroupItem value={s.key} id={`s-${s.key}`} />
            <span className="text-lg">{s.emoji}</span>
            <span className="text-neutral-900 dark:text-neutral-100">{s.label}</span>
          </label>
        ))}
      </RadioGroup>
      {!seasonKey && (
        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          퍼스널컬러를 모르시면{" "}
          <Link href="/personal-color" className="underline text-[#0B64FE]">
            퍼스널컬러 진단
          </Link>
          을 먼저 진행해 보세요.
        </div>
      )}
    </div>
  )

  const QuizCard = () => (
    <Card className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-neutral-900 dark:text-white">추천받기</CardTitle>
        <CardDescription className="text-neutral-600 dark:text-neutral-300">
          체크하고 다음으로 넘어가면 마지막 화면에서 추천 코디가 보여집니다.
        </CardDescription>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-neutral-600 dark:text-neutral-300">
            단계 {step + 1} / {total}
          </div>
          <div className="h-2 w-40 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
            <div className="h-full bg-[#0B64FE] transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">

        {step === 0 ? <StepWeather /> : <StepSeason />}

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prev}
            disabled={step === 0}
            className="border-neutral-300 dark:border-neutral-700 bg-transparent"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            이전
          </Button>
          {step < total - 1 ? (
          <Button onClick={next} disabled={!weatherKey} className="bg-[#0B64FE] text-white hover:bg-[#0956da]">
              다음
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
          <Button onClick={finalize} disabled={!seasonKey} className="bg-[#0B64FE] text-white hover:bg-[#0956da]">
                        결과 보기
                        <CheckCircle2 className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const ResultCard = () => (
    <Card className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-neutral-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-[#0B64FE]" />
          추천 코디
        </CardTitle>
        <CardDescription className="text-neutral-600 dark:text-neutral-300">
          조건: {weatherOptions.find((w) => w.key === weatherKey)?.emoji}{" "}
          {weatherOptions.find((w) => w.key === weatherKey)?.label} ·{" "}
          {seasonKeys.find((s) => s.key === seasonKey)?.emoji} {seasonKeys.find((s) => s.key === seasonKey)?.label}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        {!summary ? (
          <div className="text-sm text-neutral-500 dark:text-neutral-400">결과를 불러올 수 없습니다.</div>
        ) : (
          <>
            <div className="text-sm text-neutral-700 dark:text-neutral-300">
              {summary.description} 추천 아이템: {summary.items.join(", ")}
            </div>

            <div>
              <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-2">추천 색상</div>
              <div className="flex flex-wrap gap-2">
                {summary.recommendedColors.map((c) => (
                  <span
                    key={c}
                    className="px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-2">코디 조합</div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {combos.map((combo) => (
                  <Card
                    key={combo.name}
                    className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                  >
                    <CardContent className="pt-4">
                      <div className="font-semibold text-neutral-900 dark:text-white">{combo.name}</div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">
                        아이템: {combo.items.join(", ")}
                      </div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-300 mt-2">
                        컬러: {combo.colors.join(", ")}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={resetAll} className="bg-[#0B64FE] text-white hover:bg-[#0956da]">
                다시 추천받기
              </Button>
              <Link href="/personal-color">
                <Button variant="outline" className="border-neutral-300 dark:border-neutral-700 bg-transparent">
                  퍼스널컬러 설정
                </Button>
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-900">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-10">{!done ? <QuizCard /> : <ResultCard />}</section>
    </main>
  )
}