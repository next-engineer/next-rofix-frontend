// lib/cody-search.js

// 코디 검색용 베이스 URL (기존과 다름)
const CODY_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL";

/**
 * API 요청 기본 설정 (코디 검색용)
 */
const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(`${CODY_API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // 기존 설정과 동일하게 유지
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API 요청 실패:', error);
    throw error;
  }
};

/**
 * 코디 검색 (GET 방식)
 * @param {Object} params - 검색 파라미터
 * @param {string} params.searchText - 검색할 텍스트
 * @param {string} params.searchScope - 검색 범위 (title, description, both)
 * @param {string} params.weather - 날씨 카테고리 필터 (계절 정보)
 * @param {string} params.category - 일반 카테고리 필터 (사용하지 않음 - weather로 통합)
 * @param {string} params.sortBy - 정렬 기준 (latest, likes, alphabetical)
 */
export const searchCodies = async ({
  searchText = '',
  searchScope = 'both',
  weather = '',
  sortBy = 'latest'
}) => {
  const params = new URLSearchParams();

  if (searchText) params.append('searchText', searchText);
  if (searchScope) params.append('searchScope', searchScope);

  // category 파라미터 사용 (백엔드와 일치)
  // 'all'이 아니고 값이 있을 때만 추가
  if (weather && weather !== 'all') {
    params.append('category', weather);  // weather 값을 category 파라미터로 전송
  }

  if (sortBy) params.append('sortBy', sortBy);

  const url = `/api/cody/search?${params.toString()}`;
  console.log('검색 URL:', `${CODY_API_BASE_URL}${url}`);
  console.log('검색 파라미터:', { searchText, searchScope, weather: weather, category: weather, sortBy });

  return await apiRequest(url);
};

/**
 * 코디 검색 (POST 방식) - 복잡한 검색 조건용
 * @param {Object} searchRequest - 검색 요청 객체
 */
export const searchCodiesPost = async (searchRequest) => {
  return await apiRequest('/api/cody/search', {
    method: 'POST',
    body: JSON.stringify(searchRequest),
  });
};

/**
 * 코디 상세 정보 조회
 * @param {number} codyId - 코디 ID
 */
export const getCodyDetail = async (codyId) => {
  return await apiRequest(`/api/cody/${codyId}`);
};

/**
 * 에러 처리를 위한 유틸리티 함수
 */
export const handleApiError = (error) => {
  if (error.message.includes('Failed to fetch')) {
    return '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
  }

  if (error.message.includes('404')) {
    return '요청한 데이터를 찾을 수 없습니다.';
  }

  if (error.message.includes('500')) {
    return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }

  return '알 수 없는 오류가 발생했습니다.';
};