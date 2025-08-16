// hooks/useAuth.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 세션 유효성 확인
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/auth/check");
        setUser(res.data.user);
      } catch (error) {
        // 이 catch는 401 에러가 아닌, 네트워크 오류 등
        // 예상치 못한 에러만 잡아야 합니다.
        console.error("세션 확인 중 예상치 못한 에러:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  // 로그인 함수 추가
  const login = async (email) => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.post("/auth/login", { email });
      setUser(res.data.user);
      router.push("/mypage");
    } catch (error) {
      // 로그인 실패 시 에러 처리
      console.error(
        "로그인 실패:",
        error.response ? error.response.data : error.message
      );
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃 함수
  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
    setUser(null);
    setIsLoading(false);
  };

  const deleteAccount = async () => {
    try {
      await axiosInstance.delete("/users"); // 회원 탈퇴 API 호출
      await logout(); // 로그아웃 처리
      return true;
    } catch (error) {
      console.error("회원 탈퇴 실패:", error);
      throw error; // 에러를 호출자에게 다시 던짐
    }
  };

  return { user, isLoading, login, logout, deleteAccount };
};

export default useAuth;
