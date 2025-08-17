"use client"

import Header from "@/components/header"
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Link from "next/link"
import { getUser } from "@/lib/storage"
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react"
import ClothesManager from "@/lib/clothes-manager"
import { recommendOutfit, recommendOutfitApi } from "@/lib/recommend"

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
  const [wardrobe, setWardrobe] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [useApi, setUseApi] = useState(true) // API 우선 사용

  // 옷장 데이터 로드
  useEffect(() => {
    const loadWardrobe = async () => {
      if (!user?.userId) return

      try {
        const wardrobeData = await ClothesManager.getWardrobeByIdFromApi()
        setWardrobe(wardrobeData || [])
      } catch (error) {
        console.error("옷장 데이터 로드 실패:", error)
        setWardrobe([]) // 빈 배열로 설정하여 샘플 데이터 사용
      }
    }
    loadWardrobe()
  }, [user?.userId])

  const canProceed = step === 0 ? !!weatherKey : !!seasonKey
  const isComplete = step >= total

  // 추천 실행
  const performRecommendation = async () => {
    if (!weatherKey || !seasonKey) return

    setLoading(true)
    setError("")

    try {
      let result

      // API 우선 시도
      if (useApi && user?.userId) {
        try {
          result = await recommendOutfitApi({
            weather: weatherKey,
            personalColor: seasonKey,
            userId: user.userId,
            force: false,
          })

          if (result.success) {
            // API 성공 시 백엔드 응답 구조 처리
            const apiCombos =
              result.data?.recommendedCodys?.map((cody, index) => ({
                id: `api-${index}`,
                title: cody.title || "추천 코디",
                description: cody.description || "",
                items: cody.items || [],
                source: "api",
                codyId: cody.codyId,
              })) || []

            setCombos(apiCombos)
          } else {
            throw new Error(result.error || "API 추천 실패")
          }
        } catch (apiError) {
          console.warn("API 추천 실패, 로컬 추천으로 전환:", apiError)
          // API 실패 시 로컬 추천으로 폴백
          result = recommendOutfit({
            weather: weatherKey,
            personalColor: seasonKey,
            wardrobe: wardrobe,
          })

          if (result.success) {
            const localCombo = {
              id: "local-1",
              title: "로컬 추천 코디",
              description: result.note || "",
              items: Object.values(result.selected).filter((item) => item !== null),
              source: "local",
            }
            setCombos([localCombo])
          } else {
            throw new Error("로컬 추천도 실패했습니다.")
          }
        }
      } else {
        // 로컬 추천만 사용
        result = recommendOutfit({
          weather: weatherKey,
          personalColor: seasonKey,
          wardrobe: wardrobe,
        })

        if (result.success) {
          const localCombo = {
            id: "local-1",
            title: "로컬 추천 코디",
            description: result.note || "",
            items: Object.values(result.selected).filter((item) => item !== null),
            source: "local",
          }
          setCombos([localCombo])
        } else {
          throw new Error("추천에 실패했습니다.")
        }
      }

      setDone(true)
    } catch (error) {
      console.error("추천 실행 중 오류:", error)
      setError(error.message || "추천에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setLoading(false)
    }
  }

  const next = async () => {
    if (step < total - 1) {
      setStep(step + 1)
    } else if (step === total - 1) {
      await performRecommendation()
    }
  }

  const prev = () => {
    if (step > 0) setStep(step - 1)
  }

  const restart = () => {
    setStep(0)
    setDone(false)
    setCombos([])
    setError("")
    setWeatherKey("")
    setSeasonKey(defaultSeasonKey)
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
          조건: {weatherOptions.find((w) => w.key === weatherKey)?.emoji} {weatherOptions.find((w) => w.key === weatherKey)?.label} ·{" "}
          {seasonKeys.find((s) => s.key === seasonKey)?.emoji} {seasonKeys.find((s) => s.key === seasonKey)?.label}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        {combos.length === 0 ? (
          <div className="text-sm text-neutral-500 dark:text-neutral-400">결과를 불러올 수 없습니다.</div>
        ) : (
          <>
            <div className="grid gap-4">
              {combos.map((combo) => (
                <div key={combo.id} className="p-4 rounded-lg border bg-neutral-50 dark:bg-neutral-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{combo.title}</div>
                    <div className="text-xs rounded-full" style={{ backgroundColor: combo.color }}>
                      {combo.source === "api" ? "AI 추천" : "로컬 추천"}
                    </div>
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">{combo.description}</div>
                  <div className="flex flex-wrap gap-2">
                    {combo.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                        style={{
                          borderColor: item.color,
                          color: item.color,
                        }}
                      >
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.title}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={restart} className="bg-[#0B64FE] text-white hover:bg-[#0956da]">
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

  const progress = useMemo(
    () => Math.round((((weatherKey ? 1 : 0) + (seasonKey ? 1 : 0)) / total) * 100),
    [weatherKey, seasonKey],
  )

  if (done) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">추천 완료!</h1>
              <p className="text-gray-600">
                {weatherOptions.find((w) => w.key === weatherKey)?.label} 날씨와{" "}
                {seasonKeys.find((s) => s.key === seasonKey)?.label} 톤에 맞는 코디를 추천해드려요.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
              {combos.map((combo) => (
                <Card key={combo.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {combo.title}
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {combo.source === "api" ? "AI 추천" : "로컬 추천"}
                      </span>
                    </CardTitle>
                    <CardDescription>{combo.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {combo.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color || "#ccc" }}
                          ></span>
                          <span className="text-sm">{item.title || item.category}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-center gap-4">
              <Button onClick={restart} variant="outline">
                다시 추천받기
              </Button>
              <Link href="/wardrobe">
                <Button>내 옷장 보기</Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">추천을 생성하고 있어요...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-900">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-10">{!done ? <QuizCard /> : <ResultCard />}</section>
    </main>
  )
}