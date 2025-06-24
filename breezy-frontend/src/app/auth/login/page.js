"use client";
import Header from "@/components/Header";
import AuthForm from "@/components/AuthForm";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

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

    return (
        <div className="min-h-screen flex flex-col">
            <Header title="Connexion" showButtons={false} />

            {/* Contenu central */}
            <div className="flex-1 flex flex-col justify-center px-4">
                <div className="mb-6">
                    <div className="text-2xl font-bold text-center">
                        Connectez-vous à votre compte
                    </div>
                </div>
                <div className="mb-4">
                    <Link href="/auth/register" className="text-blue-600 text-sm hover:underline">
                        Vous n’avez pas encore de compte ? Inscrivez-vous !
                    </Link>
                </div>
                <AuthForm
                    fields={fields}
                    onSubmit={handleLogin}
                    submitLabel={loading ? "Connexion..." : "Se connecter"}
                />
                {error && <div className="text-red-600 text-sm mt-4">{error}</div>}
                <div className="flex justify-end mt-4">
                    <Link href="/auth/password-forget" className="text-blue-600 text-sm hover:underline">
                        Mot de passe oublié ?
                    </Link>
                </div>
            </div>
        </div>
    );
}