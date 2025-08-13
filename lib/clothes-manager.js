// Clothes management (from your attachment)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + "/clothes";

class ClothesManager {
  constructor() {
    this.clothes = this.loadClothes();
  }

  /** local storage 관련 로직 삭제 
  loadClothes() {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem("myClothes")
      return saved ? JSON.parse(saved) : []
    }
    return []
  }

  saveClothes() {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("myClothes", JSON.stringify(this.clothes))
    }
  }

  addClothing(clothingData) {
    const newClothing = {
      id: Date.now(),
      ...clothingData,
      dateAdded: new Date().toISOString(),
    }
    this.clothes.push(newClothing)
    this.saveClothes()
    return newClothing
  }

  removeClothing(id) {
    this.clothes = this.clothes.filter((item) => item.id !== id)
    this.saveClothes()
  }

  updateClothing(id, updates) {
    const idx = this.clothes.findIndex((i) => i.id === id)
    if (idx > -1) {
      this.clothes[idx] = { ...this.clothes[idx], ...updates }
      this.saveClothes()
      return this.clothes[idx]
    }
    return null
  }
  */

  // 모든 옷장 아이템 가져오기
  static async getWardrobeFromApi() {
    const response = await fetch(`${API_BASE_URL}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("옷장 목록을 불러오는 데 실패했습니다.");
    }
    return response.json();
  }

  // 특정 사용자의 옷장 아이템 가져오기
  static async getWardrobeByIdFromApi() {
    const response = await fetch(`${API_BASE_URL}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("개인 옷장 목록을 불러오는 데 실패했습니다.");
    }
    return response.json();
  }

  // 옷장 아이템 삭제
  static async deleteWardrobeFromApi(clothingId) {
    const response = await fetch(`${API_BASE_URL}/${clothingId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("옷을 삭제하는 데 실패했습니다.");
    }
    return response.text();
  }

  /**
   * 옷 정보와 이미지 파일을 함께 서버에 전송하여 새로운 옷을 생성
   * @param {object} clothingData - 옷 이름, 색상, 카테고리 등 텍스트 데이터
   * @param {File} file - 업로드할 이미지 파일 객체
   * @returns {Promise<object>} 생성된 옷 데이터 (ClothingDTO)
   */
  static async createClothing(clothingData, file) {
    const formData = new FormData();

    // 텍스트 데이터인 clothingData를 JSON 문자열로 변환하여 "clothing" 파트에 추가
    formData.append(
      "clothing",
      new Blob([JSON.stringify(clothingData)], { type: "application/json" })
    );

    // 이미지 파일이 존재하면 "file" 파트에 추가
    if (file) {
      formData.append("file", file);
    }

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
      // credentials: "include",
    });

    if (!response.ok) {
      // 서버에서 반환한 에러 메시지를 포함하여 에러를 던집니다.
      const errorText = await response.text();
      throw new Error(`옷 생성에 실패했습니다: ${errorText}`);
    }

    return response.json(); // 생성된 옷 정보를 JSON 형태로 반환
  }
}

if (typeof window !== "undefined") {
  window.ClothesManager = ClothesManager;
}
export default ClothesManager;
