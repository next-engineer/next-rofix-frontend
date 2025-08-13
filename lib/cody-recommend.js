// lib/cody-recommend.js

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

/**
 * 날씨 기반 코디 추천 API 호출 (GET 방식)
 * @param {Object} params - 추천 요청 파라미터
 * @param {string} params.weather - 날씨 (HOT, COLD, SUNNY, CLOUDY, RAINY)
 * @param {number} params.userId - 사용자 ID
 * @param {string} params.personalColor - 퍼스널 컬러 (WARM, COOL)
 * @param {boolean} params.force - 강제 새 조합 생성 여부
 * @returns {Promise<Object>} 추천 결과
 */
export async function getCodyRecommendationByWeather({ weather, userId, personalColor, force = false }) {
  try {
    const params = new URLSearchParams({
      userId: userId.toString(),
      force: force.toString()
    });

    if (personalColor) {
      params.append('personalColor', personalColor);
    }

    const response = await fetch(`${API_BASE_URL}/api/cody/weather/${weather}?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('코디 추천 API 호출 실패:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 코디 추천 API 호출 (POST 방식)
 * @param {Object} request - 추천 요청 객체
 * @param {string} request.weather - 날씨
 * @param {number} request.userId - 사용자 ID
 * @param {string} request.personalColor - 퍼스널 컬러
 * @param {boolean} request.force - 강제 새 조합 생성 여부
 * @returns {Promise<Object>} 추천 결과
 */
export async function getCodyRecommendation(request) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cody/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('코디 추천 API 호출 실패:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 프론트엔드 날씨 키를 백엔드 형식으로 변환
 */
export function mapWeatherKeyToBackend(frontendWeatherKey) {
  const weatherMapping = {
    'hot': 'HOT',
    'cold': 'COLD',
    'sunny': 'SUNNY',
    'cloudy': 'CLOUDY',
    'rainy': 'RAIN'
  };

  return weatherMapping[frontendWeatherKey] || frontendWeatherKey.toUpperCase();
}

/**
 * 프론트엔드 시즌 키를 백엔드 퍼스널 컬러 형식으로 변환
 */
export function mapSeasonKeyToPersonalColor(frontendSeasonKey) {
  const seasonMapping = {
    'spring': 'WARM',
    'summer': 'COOL',
    'autumn': 'WARM',
    'winter': 'COOL'
  };

  return seasonMapping[frontendSeasonKey] || 'WARM';
}

/**
 * 백엔드 응답을 프론트엔드 형식으로 변환
 */
export function transformBackendResponse(backendData) {
  if (!backendData || !backendData.codys) {
    return [];
  }

  return backendData.codys.map(cody => ({
    name: cody.title,
    items: cody.items.map(item => item.title),
    colors: cody.items.map(item => item.color),
    description: cody.description,
    codyId: cody.codyId,
    weather: cody.weather,
    likeCount: cody.likeCount,
    createdAt: cody.createdAt,
    itemDetails: cody.items.map(item => ({
      clothingId: item.clothingId,
      category: item.category,
      title: item.title,
      color: item.color,
      imageUrl: item.imageUrl,
      brand: item.brand
    }))
  }));
}