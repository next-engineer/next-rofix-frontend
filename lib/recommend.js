"use client";

/**
 * 코디 추천 시스템
 * - 로컬 추천: wardrobe 기반 규칙 추천
 * - API 추천: 백엔드 서버와 연동한 추천
 */

// ===== 상수 정의 =====
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const WEATHER_MAP = {
  hot: "HOT",
  cold: "COLD",
  sunny: "SUNNY",
  cloudy: "CLOUDY",
  rainy: "RAIN"
};

const PERSONAL_COLOR_MAP = {
  spring: "봄 웜",
  summer: "여름 쿨",
  autumn: "가을 웜",
  winter: "겨울 쿨"
};

const WEATHER_RULES = {
  HOT: { requiredOuter: false, allowedCategories: ["TOP", "BOTTOM", "SHOES"] },
  COLD: { requiredOuter: true, allowedCategories: ["TOP", "BOTTOM", "OUTER", "SHOES"] },
  SUNNY: { requiredOuter: false, allowedCategories: ["TOP", "BOTTOM", "OUTER", "SHOES"] },
  CLOUDY: { requiredOuter: false, allowedCategories: ["TOP", "BOTTOM", "OUTER", "SHOES"] },
  RAIN: { requiredOuter: true, allowedCategories: ["TOP", "BOTTOM", "OUTER", "SHOES"] }
};

// ===== 메인 추천 함수 =====

/**
 * 로컬 추천 시스템 (규칙 기반)
 */
export function recommendOutfit({ weather, personalColor, wardrobe }) {
  try {
    const items = wardrobe && wardrobe.length > 0 ? wardrobe : getSampleWardrobe();
    const backendWeather = convertWeather(weather);
    const backendPersonalColor = convertPersonalColor(personalColor);

    const categorizedItems = categorizeClothes(items);
    const filteredItems = filterByWeatherRules(categorizedItems, backendWeather);
    const colorPalette = getSeasonPalette(backendPersonalColor);

    const selectedOutfit = selectOptimalOutfit(filteredItems, colorPalette);

    return {
      success: true,
      selected: selectedOutfit,
      note: generateRecommendationNote(backendPersonalColor),
      source: "local"
    };
  } catch (error) {
    console.error("로컬 추천 중 오류:", error);
    return createFallbackResponse();
  }
}

/**
 * 백엔드 API 추천 시스템
 */
export async function recommendOutfitApi({ weather, personalColor, userId, force = false }) {
  try {
    if (!userId) {
      throw new Error("사용자 ID가 필요합니다.");
    }

    const apiResponse = await callRecommendationApi({
      weather: convertWeather(weather),
      personalColor: convertPersonalColor(personalColor),
      userId,
      force
    });

    return {
      success: true,
      data: apiResponse,
      source: "api",
      message: apiResponse.isFallback
        ? "충분한 옷이 없어 기본 추천을 제공합니다."
        : "추천이 완료되었습니다."
    };
  } catch (error) {
    console.error("API 추천 중 오류:", error);

    // API 실패 시 로컬 추천으로 폴백
    const localResult = recommendOutfit({ weather, personalColor, wardrobe: [] });
    return {
      ...localResult,
      success: false,
      error: formatApiError(error),
      isLocalFallback: true
    };
  }
}

// ===== 유틸리티 함수 =====

/**
 * 날씨 형식 변환
 */
function convertWeather(weather) {
  return WEATHER_MAP[weather] || weather.toUpperCase();
}

/**
 * 퍼스널컬러 형식 변환
 */
function convertPersonalColor(personalColor) {
  return PERSONAL_COLOR_MAP[personalColor] || personalColor;
}

/**
 * 옷 카테고리별 분류
 */
function categorizeClothes(items) {
  return {
    tops: items.filter(item => item.category === "TOP"),
    bottoms: items.filter(item => item.category === "BOTTOM"),
    outers: items.filter(item => item.category === "OUTER"),
    shoes: items.filter(item => item.category === "SHOES")
  };
}

/**
 * 날씨 규칙에 따른 필터링
 */
function filterByWeatherRules(categorizedItems, weather) {
  const rules = WEATHER_RULES[weather] || WEATHER_RULES.SUNNY;

  return {
    tops: categorizedItems.tops,
    bottoms: categorizedItems.bottoms,
    outers: rules.requiredOuter ? categorizedItems.outers : [],
    shoes: categorizedItems.shoes
  };
}

/**
 * 최적 옷 선택
 */
function selectOptimalOutfit(filteredItems, colorPalette) {
  const pickBestItem = (items) => {
    if (!items || items.length === 0) return null;

    return items
      .map(item => ({
        item,
        score: calculateItemScore(item, colorPalette)
      }))
      .sort((a, b) => b.score - a.score)[0].item;
  };

  return {
    top: pickBestItem(filteredItems.tops),
    bottom: pickBestItem(filteredItems.bottoms),
    outer: pickBestItem(filteredItems.outers),
    shoes: pickBestItem(filteredItems.shoes)
  };
}

/**
 * 아이템 점수 계산
 */
function calculateItemScore(item, colorPalette) {
  let score = 1; // 기본 점수

  // 퍼스널컬러 매칭 보너스
  if (colorPalette.includes(item.color)) {
    score += 2;
  }

  // 카테고리 부스트 보너스
  if (item.categoryBoost) {
    score += 0.5;
  }

  return score;
}

/**
 * API 호출
 */
async function callRecommendationApi({ weather, personalColor, userId, force }) {
  const params = new URLSearchParams({
    userId: userId.toString(),
    force: force.toString()
  });

  if (personalColor) {
    params.append("personalColor", personalColor);
  }

  const response = await fetch(
    `${API_BASE_URL}/api/cody/weather/${weather}?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 요청 실패 (${response.status}): ${errorText}`);
  }

  return await response.json();
}

/**
 * API 에러 포맷팅
 */
function formatApiError(error) {
  if (error.message.includes("Failed to fetch")) {
    return "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.";
  }

  if (error.message.includes("401")) {
    return "로그인이 필요합니다.";
  }

  if (error.message.includes("404")) {
    return "추천 서비스를 찾을 수 없습니다.";
  }

  if (error.message.includes("500")) {
    return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }

  return error.message || "알 수 없는 오류가 발생했습니다.";
}

/**
 * 폴백 응답 생성
 */
function createFallbackResponse() {
  return {
    success: false,
    selected: {
      top: null,
      bottom: null,
      outer: null,
      shoes: null
    },
    note: "추천에 실패했습니다. 다시 시도해주세요.",
    source: "fallback"
  };
}

/**
 * 추천 노트 생성
 */
function generateRecommendationNote(personalColor) {
  return personalColor
    ? `${personalColor} 톤 팔레트를 우선 적용했어요.`
    : "퍼스널컬러를 설정하면 더 정교한 추천을 받을 수 있어요.";
}

// ===== 퍼스널컬러 팔레트 =====

export function getSeasonPalette(season) {
  const palettes = {
    "봄 웜": ["베이지", "옐로우", "그린", "화이트", "블루", "핑크"],
    "여름 쿨": ["블루", "화이트", "그레이", "네이비", "퍼플"],
    "가을 웜": ["브라운", "베이지", "레드", "블랙", "그린"],
    "겨울 쿨": ["블랙", "화이트", "네이비", "퍼플", "그레이"]
  };

  return palettes[season] || [
    "블랙", "화이트", "그레이", "네이비", "브라운",
    "베이지", "레드", "블루", "그린", "옐로우", "핑크", "퍼플"
  ];
}

// ===== 샘플 데이터 =====

function getSampleWardrobe() {
  return [
    { id: "s1", category: "TOP", color: "블랙", title: "블랙 티셔츠" },
    { id: "s2", category: "TOP", color: "화이트", title: "화이트 셔츠" },
    { id: "s3", category: "TOP", color: "그레이", title: "그레이 니트" },
    { id: "s4", category: "OUTER", color: "네이비", title: "네이비 자켓" },
    { id: "s5", category: "OUTER", color: "브라운", title: "브라운 코트" },
    { id: "s6", category: "BOTTOM", color: "블랙", title: "블랙 슬랙스" },
    { id: "s7", category: "BOTTOM", color: "블루", title: "블루 데님" },
    { id: "s8", category: "SHOES", color: "블랙", title: "블랙 스니커즈" },
    { id: "s9", category: "SHOES", color: "브라운", title: "브라운 로퍼" }
  ];
}
