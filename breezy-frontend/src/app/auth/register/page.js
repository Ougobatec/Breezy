"use client";
import Layout from "@/components/Layout";
import AuthForm from "@/components/AuthForm";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import Image from "next/image";
import googlesvg from "@/app/google.svg"; // Assurez-vous que le chemin est correct

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const { login } = useAuth();

    const fields = [
        { name: "name", label: "Nom", type: "text" },
        { name: "username", label: "Nom d'utilisateur", type: "text" },
        { name: "email", label: "Email", type: "email" },
        { name: "password", label: "Mot de passe", type: "password" },
        { name: "confirmPassword", label: "Confirmer le mot de passe", type: "password" },
    ];

    const handleRegister = async (values) => {
        setError("");
        if (values.password !== values.confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: values.name,
                        username: values.username,
                        email: values.email,
                        password: values.password,
                    }),
                    credentials: "include",
                }
            );
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Erreur lors de l'inscription.");
            } else {
                login(data.token, data.user);
                router.replace("/auth/login");
            }
        } catch (e) {
            setError("Une erreur est survenue lors de l'inscription.");
        } finally {
            setLoading(false);
        }
    };

    // Ajoute la fonction de login Google
    const handleGoogleRegister = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
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

                // Appelle ton backend
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
                        credentials: "include", // Important pour les cookies
                    }
                );
                const data = await backendRes.json();
                if (!backendRes.ok) {
                    setError(data.message || "Erreur lors de l'inscription Google.");
                } else {
                    login(null, data.user); // Pas de token car il est dans le cookie
                    router.replace("/home");
                }
            } catch (e) {
                console.error("Erreur Google register:", e);
                setError("Erreur lors de l'inscription avec Google.");
            } finally {
                setLoading(false);
            }
        },
        onError: () => setError("Connexion Google échouée."),
    });

    return (
        <Layout headerProps={{ title: "Inscription", showButtons: false }} showNav={false}>
            <div className="flex flex-col justify-center gap-4 flex-1 p-4">
                <div className="text-2xl font-bold text-center">
                    Créer un compte
                </div>
                
                <button
                    onClick={() => handleGoogleRegister()}
                    disabled={loading}
                    className="w-full border rounded-lg py-3 px-4 flex items-center justify-center gap-3 font-medium transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                        color: "var(--text-primary)"
                    }}
                >
                    <Image src={googlesvg} alt="Google" width={20} height={20} className="w-5 h-5" />
                    {loading ? "Inscription..." : "S'inscrire avec Google"}
                </button>
                
                <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }}></div>
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>ou</span>
                    <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }}></div>
                </div>
                <Link href="/auth/login" className="text-blue-600 text-sm hover:underline">
                    Vous avez déjà un compte ? Connectez-vous !
                </Link>
                <AuthForm
                    fields={fields}
                    onSubmit={handleRegister}
                    submitLabel={loading ? "Inscription..." : "S'inscrire"}
                    disabled={loading}
                />
                {error && <div className="text-red-600 text-sm">{error}</div>}
            </div>
        </Layout>
    );
}