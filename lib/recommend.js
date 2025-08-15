"use client"

// 백엔드 API를 통한 코디 추천 함수
export async function getCodyRecommendationByWeather(params) {
  try {
    const { weather, userId, personalColor, force = false } = params;

    const queryParams = new URLSearchParams({
      userId: userId,
      force: force
    });

    if (personalColor) {
      queryParams.append("personalColor", personalColor);
    }

    const response = await fetch(
      `/api/cody/weather/${weather}?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`서버 오류 발생: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("코디 추천 API 호출 중 오류:", error);
    return { success: false, error: error.message };
  }
}

// 프론트엔드의 weather 키를 백엔드 포맷으로 변환
export function mapWeatherKeyToBackend(weatherKey) {
  const weatherMap = {
    "hot": "HOT",
    "cold": "COLD",
    "sunny": "SUNNY",
    "cloudy": "CLOUDY",
    "rainy": "RAIN"
  };
  return weatherMap[weatherKey] || "SUNNY";
}

// 프론트엔드의 시즌 키를 퍼스널 컬러 값으로 변환
export function mapSeasonKeyToPersonalColor(seasonKey) {
  const seasonMap = {
    "spring": "WARM",
    "autumn": "WARM",
    "summer": "COOL",
    "winter": "COOL"
  };
  return seasonMap[seasonKey] || "";
}

// 백엔드 응답을 프론트엔드 형식으로 변환
export function transformBackendResponse(response) {
  if (!response.codys || response.codys.length === 0) {
    return [];
  }

  return response.codys.map(cody => {
    // 아이템 및 색상 추출
    const items = cody.items.map(item => item.category);
    const colors = cody.items.map(item => item.color);

    return {
      codyId: cody.codyId,
      name: cody.title,
      description: cody.description,
      weather: cody.weather,
      items: items,
      colors: colors,
      likeCount: cody.likeCount || 0,
      createdAt: cody.createdAt
    };
  });
}

// 기존 로컬 코디 추천 함수 (백엔드 API 호출 실패 시 폴백으로 사용)
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
      return ["화이트", "블랙", "그레이", "네이비", "브라운", "베이지", "레드", "블루"]
    case "여름 쿨":
      return ["화이트", "블랙", "그레이", "네이비", "블루", "그린", "퍼플"]
    case "가을 웜":
      return ["브라운", "베이지", "그린", "옐로우", "레드", "네이비"]
    case "겨울 쿨":
      return ["블랙", "화이트", "그레이", "네이비", "블루", "퍼플", "레드"]
    default:
      return ["화이트", "블랙", "네이비", "그레이"]  // 기본 무난한 색상
  }
}

function sampleWardrobe() {
  return [
    { id: "d1", type: "상의", category: "티셔츠", color: "화이트", name: "화이트 티셔츠" },
    { id: "d2", type: "상의", category: "셔츠", color: "블루", name: "블루 셔츠" },
    { id: "d3", type: "상의", category: "니트", color: "그레이", name: "그레이 니트" },
    { id: "d4", type: "아우터", category: "자켓", color: "네이비", name: "네이비 자켓" },
    { id: "d5", type: "아우터", category: "코트", color: "베이지", name: "베이지 코트" },
    { id: "d6", type: "하의", category: "슬랙스", color: "블랙", name: "블랙 슬랙스" },
    { id: "d7", type: "하의", category: "데님", color: "블루", name: "블루 데님" },
    { id: "d8", type: "신발", category: "스니커즈", color: "화이트", name: "화이트 스니커즈" },
    { id: "d9", type: "신발", category: "부츠", color: "블랙", name: "블랙 부츠" },
  ]
}