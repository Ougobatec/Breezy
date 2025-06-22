"use client";
import Header from "@/components/Header";
import AuthForm from "@/components/AuthForm";
import Link from "next/link";
import { useState } from "react";

export default function PasswordForgetPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fields = [
        { name: "username", label: "Nom d'utilisateur", type: "text" }
    ];

    const handleForget = async (values) => {
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/auth/password-forget`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: values.username
                    }),
                }
            );
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Erreur lors de la demande.");
            } else {
                setSuccess("Un email de réinitialisation a été envoyé si le compte existe.");
            }
        } catch (e) {
            setError("Une erreur est survenue lors de la demande.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header title="Mot de passe oublié" showButtons={false} />

            {/* Contenu central */}
            <div className="flex-1 flex flex-col justify-center px-4">
                <div className="mb-6">
                    <div className="text-2xl font-bold text-center">
                        Retrouvez votre mot de passe
                    </div>
                </div>
                <div className="mb-4">
                    <Link href="/auth/login" className="text-blue-600 text-sm hover:underline">
                        Retour à la connexion
                    </Link>
                </div>
                <AuthForm
                    fields={fields}
                    onSubmit={handleForget}
                    submitLabel={loading ? "Envoi..." : "Envoyer"}
                />
                {error && <div className="text-red-600 text-sm mt-4">{error}</div>}
                {success && <div className="text-green-600 text-sm mt-4">{success}</div>}
            </div>
        </div>
    );
}