// Based on your analyzer, with hazel removed and UMD-friendly export
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + "/users";
class PersonalColorAnalyzer {
  constructor() {
    this.questions = [
      {
        id: "skin_tone",
        question: "당신의 피부톤은 어떤가요?",
        options: [
          {
            value: "warm",
            label: "노란빛이 도는 따뜻한 톤",
            weight: { warm: 2, cool: 0 },
          },
          {
            value: "cool",
            label: "핑크빛이 도는 차가운 톤",
            weight: { warm: 0, cool: 2 },
          },
          { value: "neutral", label: "중간톤", weight: { warm: 1, cool: 1 } },
        ],
      },
      {
        id: "eye_color",
        question: "당신의 눈동자 색깔은?",
        options: [
          { value: "brown", label: "갈색 계열", weight: { warm: 1, cool: 0 } },
          { value: "black", label: "검은색", weight: { warm: 0, cool: 1 } },
        ],
      },
      {
        id: "hair_color",
        question: "당신의 머리카락 색깔은?",
        options: [
          { value: "black", label: "검은색", weight: { warm: 0, cool: 1 } },
          { value: "brown", label: "갈색", weight: { warm: 1, cool: 0 } },
          { value: "light", label: "밝은 갈색", weight: { warm: 2, cool: 0 } },
        ],
      },
      {
        id: "metal_preference",
        question: "어떤 색상이 더 잘 어울린다고 생각하시나요?",
        options: [
          { value: "gold", label: "골드 계열", weight: { warm: 2, cool: 0 } },
          { value: "silver", label: "실버 계열", weight: { warm: 0, cool: 2 } },
          {
            value: "both",
            label: "둘 다 괜찮음",
            weight: { warm: 1, cool: 1 },
          },
        ],
      },
    ];

    this.colorTypes = {
      spring: {
        name: "봄 웜톤",
        description: "밝고 화사한 색상이 잘 어울리는 타입",
        colors: ["코랄", "피치", "아이보리", "라이트 그린", "스카이 블루"],
        characteristics: ["밝고 선명한 색상", "따뜻한 톤", "높은 채도"],
      },
      summer: {
        name: "여름 쿨톤",
        description: "부드럽고 우아한 색상이 잘 어울리는 타입",
        colors: ["라벤더", "로즈", "소프트 블루", "민트", "그레이"],
        characteristics: ["부드러운 색상", "차가운 톤", "중간 채도"],
      },
      autumn: {
        name: "가을 웜톤",
        description: "깊고 풍부한 색상이 잘 어울리는 타입",
        colors: ["러스트", "올리브", "머스타드", "브라운", "버건디"],
        characteristics: ["깊고 진한 색상", "따뜻한 톤", "낮은 채도"],
      },
      winter: {
        name: "겨울 쿨톤",
        description: "선명하고 강렬한 색상이 잘 어울리는 타입",
        colors: ["로얄 블루", "에메랄드", "퓨어 화이트", "블랙", "레드"],
        characteristics: ["선명하고 강렬한 색상", "차가운 톤", "높은 대비"],
      },
    };
  }

  analyzeAnswers(answers) {
    let warm = 0;
    let cool = 0;
    answers.forEach((ans, i) => {
      const q = this.questions[i];
      const opt = q.options.find((o) => o.value === ans);
      if (opt) {
        warm += opt.weight.warm;
        cool += opt.weight.cool;
      }
    });
    if (warm > cool) return warm >= 6 ? "spring" : "autumn";
    return cool >= 6 ? "winter" : "summer";
  }

  getColorTypeInfo(type) {
    return this.colorTypes[type] || null;
  }

  static async updatePersonalColor(newColor) {
    const response = await fetch(`${API_BASE_URL}/personalColor`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // 세션 쿠키 포함
      body: JSON.stringify({ personalColor: newColor }),
    });

    const data = await response.json().catch(() => response.text());

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("로그인이 필요합니다.");
      }
      throw new Error(
        `퍼스널컬러 수정에 실패했습니다: ${
          typeof data === "string" ? data : data.message
        }`
      );
    }
    return data;
  }
}

if (typeof window !== "undefined")
  window.PersonalColorAnalyzer = PersonalColorAnalyzer;
export default PersonalColorAnalyzer;
