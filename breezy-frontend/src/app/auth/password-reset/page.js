"use client";
import Header from "@/components/Header";
import AuthForm from "@/components/AuthForm";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";


export default function PasswordChangePage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();

    const fields = [
        { name: "password", label: "Nouveau mot de passe", type: "password" },
        { name: "confirmPassword", label: "Confirmer le mot de passe", type: "password" },
    ];

    const handleReset = async (values) => {
        setError("");
        setSuccess("");
        if (values.password !== values.confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }
        setLoading(true);
        try {
            const token = searchParams.get("token");
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/auth/password-reset`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        token,
                        newPassword: values.password,
                    }),
                }
            );
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Erreur lors de la réinitialisation.");
            } else {
                setSuccess("Mot de passe modifié avec succès !");
                setTimeout(() => {
                    router.replace("/auth/login");
                }, 1500);
            }
        } catch (e) {
            setError("Une erreur est survenue lors de la réinitialisation du mot de passe.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header title="Changer le mot de passe" showButtons={false} />

            {/* Contenu central */}
            <div className="flex-1 flex flex-col justify-center px-4">
                <div className="mb-6">
                    <div className="text-2xl font-bold text-center">
                        Modifiez votre mot de passe
                    </div>
                </div>
                <div className="mb-4">
                    <Link href="/auth/login" className="text-blue-600 text-sm hover:underline">
                        Retour à la connexion
                    </Link>
                </div>
                <AuthForm
                    fields={fields}
                    onSubmit={handleReset}
                    submitLabel={loading ? "Enregistrement..." : "Enregistrer"}
                />
                {error && <div className="text-red-600 text-sm mt-4">{error}</div>}
                {success && <div className="text-green-600 text-sm mt-4">{success}</div>}
            </div>
        </div>
    );
}