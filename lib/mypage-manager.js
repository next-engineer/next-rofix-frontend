const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + "/users";

class UserManager {
  /**
   * 현재 로그인된 사용자의 정보를 가져옵니다.
   * @returns {Promise<object>} 사용자 정보
   * @throws {Error} API 호출 실패 시 에러
   */
  static async getMyInfo() {
    const response = await fetch(`${API_BASE_URL}/me`, {
      method: "GET",
      credentials: "include", // 쿠키를 포함하여 요청 (세션 인증에 필요)
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("로그인이 필요합니다.");
      }
      // 이미 읽은 data 변수를 사용
      throw new Error(
        `사용자 정보를 불러오는 데 실패했습니다: ${
          data.message || JSON.stringify(data)
        }`
      );
    }

    return data;
  }

  /**
   * 현재 로그인된 사용자의 정보를 수정합니다.
   * @param {{email: string, nickname: string, personalColor: string}} updateData 업데이트할 사용자 정보
   * @returns {Promise<object>} 업데이트된 사용자 정보
   * @throws {Error} API 호출 실패 시 에러
   */
  static async updateMyInfo(updateData) {
    const response = await fetch(`${API_BASE_URL}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
      credentials: "include",
    });

    const data = await response.json().catch(() => response.text());

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("로그인이 필요합니다.");
      }
      throw new Error(
        `사용자 정보 수정에 실패했습니다: ${
          typeof data === "string" ? data : data.message
        }`
      );
    }
    return data;
  }

  /**
   * 현재 로그인된 사용자의 회원 탈퇴를 요청합니다.
   * @returns {Promise<string>} 성공 메시지
   * @throws {Error} API 호출 실패 시 에러
   */
  static async deleteMyInfo() {
    const response = await fetch(`${API_BASE_URL}`, {
      method: "DELETE",
      credentials: "include",
    });

    const message = await response.text();

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("로그인이 필요합니다.");
      }
      throw new Error(`회원 탈퇴에 실패했습니다: ${message}`);
    }

    return message;
  }
}

// 브라우저 환경에서 전역으로 사용 가능하게 합니다.
if (typeof window !== "undefined") {
  window.UserManager = UserManager;
}

// Next.js에서 모듈로 import 할 수 있도록 export 합니다.
export default UserManager;
