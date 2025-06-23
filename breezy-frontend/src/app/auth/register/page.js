"use client";
import Header from "@/components/Header";
import AuthForm from "@/components/AuthForm";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

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
                `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/auth/register`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: values.name,
                        username: values.username,
                        email: values.email,
                        password: values.password,
                    }),
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

    return (
        <div className="min-h-screen flex flex-col">
            <Header title="Inscription" showButtons={false} />

            {/* Contenu central */}
            <div className="flex-1 flex flex-col justify-center px-4">
                <div className="mb-6">
                    <div className="text-2xl font-bold text-center">
                        Créer un compte
                    </div>
                </div>
                <AuthForm
                    fields={fields}
                    onSubmit={handleRegister}
                    submitLabel={loading ? "Inscription..." : "S'inscrire"}
                />
                {error && <div className="text-red-600 text-sm mt-4">{error}</div>}
                <div className="flex justify-end mt-4">
                    <Link href="/auth/login" className="text-blue-600 text-sm hover:underline">
                        Vous avez déjà un compte ? Connectez-vous !
                    </Link>
                </div>
            </div>
        </div>
    );
}