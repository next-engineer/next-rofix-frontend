// hooks/useAuth.js
"use client";

import { useEffect, useState } from "react";

// 환경 변수에서 백엔드 API 기본 URL을 가져옵니다.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const useAuth = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // 환경 변수를 사용하여 백엔드 세션 확인 API를 호출합니다.
                const res = await fetch(`${API_BASE_URL}/auth/check`, { credentials: 'include' });

                if (res.ok) {
                    const data = await res.json();
                    // 백엔드 API에서 'isLoggedIn'과 같은 속성을 보낼 경우에 대비하여
                    // 데이터 구조를 확인하는 로직을 추가할 수 있습니다.
                    // 현재는 세션에 유저 객체를 직접 반환한다고 가정합니다.
                    setUser(data.user);
                } else {
                    // HTTP 상태 코드가 200 OK가 아닐 경우, 로그아웃 상태로 간주
                    setUser(null);
                }
            } catch (error) {
                console.error("세션 확인 실패:", error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    const logout = async () => {
        try {
            // 환경 변수를 사용하여 백엔드 로그아웃 API를 호출합니다.
            await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
        } catch (error) {
            console.error("로그아웃 실패:", error);
        }
        setUser(null); // 클라이언트 상태 초기화
    };

    return { user, isLoading, logout };
};

export default useAuth;
