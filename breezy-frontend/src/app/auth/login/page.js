"use client";
import Layout from "@/components/Layout";
import AuthForm from "@/components/AuthForm";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGoogleLogin } from '@react-oauth/google';
import axios from "axios";
import Image from "next/image";
import googlesvg from "@/app/google.svg";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const { login } = useAuth();

    const fields = [
        { name: "username", label: "Nom d'utilisateur", type: "text" },
        { name: "password", label: "Mot de passe", type: "password" },
    ];

    const handleLogin = async (values) => {
        setError("");
        setLoading(true);
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: values.username,
                        password: values.password,
                    }),
                    credentials: "include",
                }
            );
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Identifiants invalides.");
            } else {
                login(data.token, data.user);
                router.replace("/home");
            }
        } catch (e) {
            setError("Une erreur est survenue lors de la connexion.");
        } finally {
            setLoading(false);
        }
    };
    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
                setError("");
                
                // Récupère les infos du profil Google
                const res = await axios.get(
                    `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenResponse.access_token}`,
                    {
                        headers: {
                            Authorization: `Bearer ${tokenResponse.access_token}`,
                            Accept: "application/json",
                        },
                    }
                );
                const profile = res.data;

                // Appelle le backend avec les données du profil
                const backendRes = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            name: profile.name,
                            email: profile.email,
                            avatar: profile.picture,
                            googleId: profile.id,
                        }),
                        credentials: "include",
                    }
                );
                const data = await backendRes.json();
                if (!backendRes.ok) {
                    setError(data.message || "Erreur lors de la connexion Google.");
                } else {
                    login(null, data.user);
                    router.replace("/home");
                }
            } catch (e) {
                console.error("Erreur Google login:", e);
                setError("Erreur lors de la connexion avec Google.");
            } finally {
                setLoading(false);
            }
        },
        onError: () => setError("Connexion Google échouée."),
    });

    return (
        <Layout headerProps={{ title: "Connexion", showButtons: false }} showNav={false}>
            <div className="flex flex-col justify-center gap-4 flex-1 p-4">
                <div className="text-2xl font-bold text-center">
                    Connectez-vous à votre compte
                </div>
                <Link href="/auth/register" className="text-blue-600 text-sm hover:underline">
                    Vous n’avez pas encore de compte ? Inscrivez-vous !
                </Link>
                <AuthForm
                    fields={fields}
                    onSubmit={handleLogin}
                    submitLabel={loading ? "Connexion..." : "Se connecter"}
                />
                {error && <div className="text-red-600 text-sm">{error}</div>}
                <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }}></div>
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>ou</span>
                    <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }}></div>
                </div>
                
                <button
                    onClick={() => handleGoogleLogin()}
                    disabled={loading}
                    className="w-full border rounded-lg py-3 px-4 flex items-center justify-center gap-3 font-medium transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                        color: "var(--text-primary)"
                    }}
                >
                    <Image src={googlesvg} alt="Google" width={20} height={20} className="w-5 h-5" />
                    {loading ? "Connexion..." : "Continuer avec Google"}
                </button>
                <Link href="/auth/password-forget" className="flex justify-end text-blue-600 text-sm hover:underline">
                    Mot de passe oublié ?
                </Link>
            </div>
        </Layout>
    );
}