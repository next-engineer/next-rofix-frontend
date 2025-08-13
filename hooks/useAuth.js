// hooks/useAuth.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const useAuth = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // 세션 유효성 확인
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/auth/check`, { credentials: 'include' });

                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                } else {
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

    // 로그인 함수 추가
    const login = async (email) => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
                credentials: 'include'
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                // 로그인 성공 후 마이페이지로 이동하거나 상태를 업데이트합니다.
                router.push('/mypage');
            } else {
                console.error("로그인 실패:", await res.text());
                setUser(null);
            }
        } catch (error) {
            console.error("로그인 API 호출 실패:", error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    // 로그아웃 함수
    const logout = async () => {
        try {
            await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
        } catch (error) {
            console.error("로그아웃 실패:", error);
        }
        setUser(null);
        setIsLoading(false);
    };

    return { user, isLoading, login, logout };
};

export default useAuth;
