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