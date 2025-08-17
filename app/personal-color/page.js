// 퍼스널컬러 (배경만 변경: bg-white → bg-[#F2F2F2])

"use client";

import Header from "@/components/header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMemo, useRef, useState } from "react";
import PersonalColorAnalyzer from "@/lib/personal-color-analyzer";
import { setUserPersonalColor } from "@/lib/storage";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const seasonLabel = {
  spring: "봄 웜",
  summer: "여름 쿨",
  autumn: "가을 웜",
  winter: "겨울 쿨",
};

export default function PersonalColorWizardPage() {
  const analyzerRef = useRef(new PersonalColorAnalyzer());
  const analyzer = analyzerRef.current;
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [done, setDone] = useState(false);
  const router = useRouter();

  const total = analyzer.questions.length;
  const current = analyzer.questions[step];
  const progress = Math.round((Object.keys(answers).length / total) * 100);

  const choose = (val) => {
    setAnswers((p) => ({ ...p, [current.id]: val }));
  };

  const next = () => {
    if (step < total - 1) setStep((s) => s + 1);
    else finalize();
  };
  const prev = () => setStep((s) => Math.max(0, s - 1));

  const finalize = () => {
    const ordered = analyzer.questions.map((q) => answers[q.id] || "");
    const res = analyzer.analyzeAnswers(ordered);
    setResult(res);
    setDone(true);
  };

  const typeInfo = useMemo(
    () => (result ? analyzer.getColorTypeInfo(result) : null),
    [result, analyzer]
  );
  const save = async () => {
    if (!result) return;

    const seasonName = seasonLabel[result]; // "봄 웜" 같은 라벨
    const userConfirmed = confirm(
      `"${seasonName}"으로 퍼스널컬러를 저장하시겠습니까?`
    );

    if (!userConfirmed) return; // 사용자가 취소하면 저장하지 않음

    try {
      const updatedUser = await PersonalColorAnalyzer.updatePersonalColor(
        seasonName
      );

      // 백엔드 저장 성공 후 로컬에도 반영
      setUserPersonalColor(seasonName);

      alert("퍼스널컬러가 저장되었습니다!");
    } catch (err) {
      if (err.message.includes("로그인이 필요합니다")) {
        alert("로그인이 필요합니다. 메인페이지로 이동합니다.");
        router.push("/");
        return;
      }
      alert(err.message || "저장 중 오류가 발생했습니다.");
    }
  };

  const QuizView = () => (
    <Card className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-neutral-900 dark:text-white">
          퍼스널 컬러 진단
        </CardTitle>
        <CardDescription className="text-neutral-600 dark:text-neutral-300">
          체크하고 다음으로 넘어가세요. 마지막 화면에서 결과가 표시됩니다.
        </CardDescription>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-neutral-600 dark:text-neutral-300">
            단계 {step + 1} / {total}
          </div>
          <div className="h-2 w-40 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-[#0B64FE] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2">
          <Label className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
            {current.question}
          </Label>
          <RadioGroup
            value={answers[current.id] || ""}
            onValueChange={choose}
            className="grid gap-2"
          >
            {current.options.map((op) => (
              <label
                key={op.value}
                className={`flex items-center gap-2 rounded-md border px-3 py-2 transition ${
                  answers[current.id] === op.value
                    ? "border-[#0B64FE] bg-[#0B64FE]/5 dark:bg-[#0B64FE]/10"
                    : "border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800/80"
                }`}
              >
                <RadioGroupItem
                  value={op.value}
                  id={`${current.id}-${op.value}`}
                />
                <span className="text-neutral-900 dark:text-neutral-100">
                  {op.label}
                </span>
              </label>
            ))}
          </RadioGroup>
        </div>

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
          <Button
            onClick={next}
            disabled={!answers[current.id]}
            className="bg-[#0B64FE] text-white hover:bg-[#0956da]"
          >
            {step < total - 1 ? (
              <>
                다음
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            ) : (
              <>
                결과 확인
                <CheckCircle2 className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const ResultView = () => (
    <Card className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
      <CardHeader>
        <CardTitle className="text-neutral-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-[#0B64FE]" />
          진단 결과
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        {typeInfo ? (
          <>
            <div className="text-lg font-semibold text-neutral-900 dark:text-white">
              {typeInfo.name}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-300">
              {typeInfo.description}
            </div>
            <div>
              <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-2">
                추천 색상
              </div>
              <div className="flex flex-wrap gap-2">
                {typeInfo.colors.map((c) => (
                  <span
                    key={c}
                    className="px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={save}
                className="bg-[#0B64FE] text-white hover:bg-[#0956da]"
              >
                결과 저장
              </Button>
              <Link href="/recommend">
                <Button
                  variant="outline"
                  className="border-neutral-300 dark:border-neutral-700 bg-transparent"
                >
                  추천받기 이동
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  setAnswers({});
                  setStep(0);
                  setResult(null);
                  setDone(false);
                }}
                className="border-neutral-300 dark:border-neutral-700"
              >
                다시 하기
              </Button>
            </div>
          </>
        ) : (
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            결과를 계산할 수 없습니다.
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <main className="min-h-screen bg-[#F2F2F2] dark:bg-neutral-900">
      <Header />
      <section className="mx-auto max-w-4xl px-4 py-10">
        {!done ? <QuizView /> : <ResultView />}
      </section>
    </main>
  );
}
