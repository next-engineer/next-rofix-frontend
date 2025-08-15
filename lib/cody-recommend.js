/**
 * 백엔드 API에서 날씨 기반 코디 추천 받기
 * @param {Object} params 요청 파라미터
 * @returns {Promise<Object>} 응답 객체
 */
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

/**
 * 프론트엔드의 weather 키를 백엔드 포맷으로 변환
 */
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

/**
 * 프론트엔드의 시즌 키를 퍼스널 컬러 값으로 변환
 */
export function mapSeasonKeyToPersonalColor(seasonKey) {
  const seasonMap = {
    "spring": "WARM",
    "autumn": "WARM",
    "summer": "COOL",
    "winter": "COOL"
  };
  return seasonMap[seasonKey] || "";
}

/**
 * 백엔드 응답을 프론트엔드 형식으로 변환
 */
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