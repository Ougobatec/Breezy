"use client";
import Layout from "@/components/Layout";
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
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/password-forget`,
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
        <Layout headerProps={{ title: "Mot de passe oublié", showButtons: false }} showNav={false}>
            <div className="flex flex-col justify-center gap-4 flex-1 p-4">
                <div className="text-2xl font-bold text-center">
                    Retrouvez votre mot de passe
                </div>
                <Link href="/auth/login" className="text-blue-600 text-sm hover:underline">
                    Retour à la connexion
                </Link>
                <AuthForm
                    fields={fields}
                    onSubmit={handleForget}
                    submitLabel={loading ? "Envoi..." : "Envoyer"}
                />
                {error && <div className="text-red-600 text-sm">{error}</div>}
                {success && <div className="text-green-600 text-sm">{success}</div>}
            </div>
        </Layout>
    );
}