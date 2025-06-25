"use client";
import Layout from "@/components/Layout";
import AuthForm from "@/components/AuthForm";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { GoogleLogin } from '@react-oauth/google';
import axios from "axios";

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
    const responseMessage = async (response) => {
        setError("");
        setLoading(true);
        try {
            const backendRes = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id_token: response.credential,
                    }),
                    credentials: "include", // Ajoutez cette ligne
                }
            );
            const data = await backendRes.json();
            if (!backendRes.ok) {
                setError(data.message || "Erreur lors de la connexion Google.");
            } else {
                login(null, data.user); // Pas de token car il est dans le cookie
                router.replace("/home");
            }
        } catch (e) {
            console.error("Erreur Google login:", e);
            setError("Erreur lors de la connexion avec Google.");
        } finally {
            setLoading(false);
        }
    };
    const errorMessage = (error) => {
        console.log(error);
    };

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
                <GoogleLogin onSuccess={responseMessage} onError={errorMessage} />
                <Link href="/auth/password-forget" className="flex justify-end text-blue-600 text-sm hover:underline">
                    Mot de passe oublié ?
                </Link>
            </div>
        </Layout>
    );
}