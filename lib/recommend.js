"use client"

// 날씨(더움, 추움, 맑음, 흐림, 비) + 퍼스널컬러 기반 규칙 추천 (AI 미사용)
export function recommendOutfit({ weather, personalColor, wardrobe }) {
  const items = wardrobe && wardrobe.length ? wardrobe : sampleWardrobe()

  const tops = items.filter((i) => i.type === "상의")
  const bottoms = items.filter((i) => i.type === "하의")
  const outers = items.filter((i) => i.type === "아우터")
  const shoes = items.filter((i) => i.type === "신발")

  // 날씨 규칙
  const fitByWeather = {
    더움: {
      tops: ["티셔츠", "셔츠", "민소매"],
      outers: [],
      shoes: ["샌들", "스니커즈"],
    },
    추움: {
      tops: ["니트", "후디", "맨투맨", "셔츠"],
      outers: ["코트", "자켓", "패딩"],
      shoes: ["부츠", "스니커즈"],
    },
    맑음: {
      tops: ["티셔츠", "셔츠", "니트"],
      outers: ["자켓", "가디건"],
      shoes: ["스니커즈", "로퍼"],
    },
    흐림: {
      tops: ["셔츠", "맨투맨", "니트"],
      outers: ["자켓", "코트"],
      shoes: ["스니커즈", "로퍼"],
    },
    비: {
      tops: ["셔츠", "맨투맨"],
      outers: ["바람막이", "자켓", "코트"],
      shoes: ["부츠", "스니커즈", "러버"],
    },
  }

  const allow = fitByWeather[weather] || fitByWeather["맑음"]

  const filtered = {
    tops: filterByCategory(tops, allow.tops),
    bottoms,
    outers: filterByCategory(outers, allow.outers),
    shoes: filterByCategory(shoes, allow.shoes),
  }

  const palette = seasonPalette(personalColor)
  const pick = (arr) => {
    if (!arr.length) return null
    return arr
      .map((i) => ({ i, s: (palette.includes(i.color) ? 2 : 1) + (i.categoryBoost ? 0.5 : 0) }))
      .sort((a, b) => b.s - a.s)[0].i
  }

  return {
    selected: {
      top: pick(filtered.tops),
      bottom: pick(filtered.bottoms),
      outer: pick(filtered.outers),
      shoes: pick(filtered.shoes),
    },
    note: personalColor ? `${personalColor} 톤 팔레트를 우선 적용했어요.` : "퍼스널컬러를 설정하면 더 정교해져요.",
  }
}

function filterByCategory(list, allow) {
  if (!allow || allow.length === 0) return list
  return list.filter((i) => allow.includes(i.category))
}

export function seasonPalette(season) {
  switch (season) {
    case "봄 웜":
      return ["크림", "베이지", "코랄", "라이트그린", "카멜", "화이트", "라이트블루"]
    case "여름 쿨":
      return ["라벤더", "딥블루", "모브", "그레이", "화이트", "스카이블루"]
    case "가을 웜":
      return ["브라운", "애쉬그린", "머스타드", "버건디", "카멜", "아이보리"]
    case "겨울 쿨":
      return ["블랙", "화이트", "로얄블루", "버건디", "푸시아", "차콜"]
    default:
      return ["화이트", "블랙", "네이비", "그레이"]
  }
}

function sampleWardrobe() {
  return [
    { id: "d1", type: "상의", category: "티셔츠", color: "화이트", name: "화이트 티셔츠" },
    { id: "d2", type: "상의", category: "셔츠", color: "라이트블루", name: "라이트블루 셔츠" },
    { id: "d3", type: "상의", category: "니트", color: "그레이", name: "그레이 니트" },
    { id: "d4", type: "아우터", category: "자켓", color: "네이비", name: "네이비 자켓" },
    { id: "d5", type: "아우터", category: "코트", color: "카멜", name: "카멜 코트" },
    { id: "d6", type: "하의", category: "슬랙스", color: "블랙", name: "블랙 슬랙스" },
    { id: "d7", type: "하의", category: "데님", color: "블루", name: "블루 데님" },
    { id: "d8", type: "신발", category: "스니커즈", color: "화이트", name: "화이트 스니커즈" },
    { id: "d9", type: "신발", category: "부츠", color: "블랙", name: "블랙 부츠" },
  ]
}
