"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/authenticate`,
                    { credentials: "include" }
                );
                if (!res.ok) {
                    setUser(null);
                    setLoading(false);
                    router.replace("/auth/login");
                    return;
                }
                const data = await res.json();
                setUser(data.user);
            } catch {
                setUser(null);
                router.replace("/auth/login");
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, [router]);

    const login = async () => {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/authenticate`, { credentials: "include" })
            .then(res => res.ok ? res.json() : null)
            .then(data => setUser(data?.user || null));
    };

    const logout = async () => {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, { credentials: "include" });
        setUser(null);
        router.replace("/auth/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}