// lib/api.js

const API_BASE_URL = "http://localhost:8080/api/clothes";

// 모든 옷장 아이템 가져오기
export async function getWardrobeFromApi() {
  const response = await fetch(`${API_BASE_URL}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('옷장 목록을 불러오는 데 실패했습니다.');
  }

  return response.json();
}

// 모든 옷장 아이템 가져오기
export async function getWardrobeByIdFromApi(userId) {
    const response = await fetch(`${API_BASE_URL}/${userId}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('개인 옷장 목록을 불러오는 데 실패했습니다.');
    }

    return response.json();
  }

// 옷장 아이템 삭제
export async function deleteWardrobeFromApi(userId) {
  const response = await fetch(`${API_BASE_URL}/${userId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('옷을 삭제하는 데 실패했습니다.');
  }

  return response.text(); // 성공 메시지를 반환한다고 가정
}

// 파일 업로드를 처리하는 별도 함수 (필요한 경우)
// 백엔드에서 이미지 파일을 직접 받는 엔드포인트가 있을 때 사용
export async function uploadImageToApi(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('이미지 업로드에 실패했습니다.');
    }

    return response.json(); // 업로드된 이미지 URL을 반환한다고 가정
}

// 코디 검색 API

// 코디 검색용 베이스 URL (기존과 다름)
const CODY_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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
 * @param {string} params.category - 카테고리 필터
 * @param {string} params.sortBy - 정렬 기준 (latest, likes, alphabetical)
 */
export const searchCodies = async ({
  searchText = '',
  searchScope = 'both',
  category = '',
  sortBy = 'latest'
}) => {
  const params = new URLSearchParams();

  if (searchText) params.append('searchText', searchText);
  if (searchScope) params.append('searchScope', searchScope);
  if (category && category !== 'all') params.append('category', category);
  if (sortBy) params.append('sortBy', sortBy);

  const url = `/api/cody/search?${params.toString()}`;
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
 * 사용 가능한 카테고리 목록 조회
 */
export const getAvailableCategories = async () => {
  return await apiRequest('/api/cody/search/categories');
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