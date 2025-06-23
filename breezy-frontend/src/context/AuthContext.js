"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (!storedToken) {
                setUser(null);
                setToken(null);
                setLoading(false);
                return;
            }
            try {
                const payload = JSON.parse(atob(storedToken.split(".")[1]));
                if (payload.exp * 1000 < Date.now()) {
                    localStorage.removeItem("token");
                    setUser(null);
                    setToken(null);
                    setLoading(false);
                    router.replace("/auth/login");
                    return;
                }
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/authenticate`,
                    { headers: { Authorization: `Bearer ${storedToken}` } }
                );
                if (!res.ok) {
                    localStorage.removeItem("token");
                    setUser(null);
                    setToken(null);
                    setLoading(false);
                    router.replace("/auth/login");
                    return;
                }
                const data = await res.json();
                setUser(data.user);
                setToken(storedToken);
            } catch {
                localStorage.removeItem("token");
                setUser(null);
                setToken(null);
                router.replace("/auth/login");
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, [router]);

    const login = (token, user) => {
        localStorage.setItem("token", token);
        setToken(token);
        setUser(user);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        router.replace("/auth/login");
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}