"use client";
import Layout from "@/components/Layout";
import AuthForm from "@/components/AuthForm";
import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function PasswordResetContent() {
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
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/password-reset`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        token,
                        newPassword: values.password,
                    }),
                    credentials: "include",
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
        <Layout headerProps={{ title: "Réinitialiser le mot de passe", showButtons: false }} showNav={false}>
            <div className="flex flex-col justify-center gap-4 flex-1 p-4">
                <div className="text-2xl font-bold text-center">
                    Modifiez votre mot de passe
                </div>
                <Link href="/auth/login" className="text-blue-600 text-sm hover:underline">
                    Retour à la connexion
                </Link>
                <AuthForm
                    fields={fields}
                    onSubmit={handleReset}
                    submitLabel={loading ? "Enregistrement..." : "Enregistrer"}
                />
                {error && <div className="text-red-600 text-sm">{error}</div>}
                {success && <div className="text-green-600 text-sm">{success}</div>}
            </div>
        </Layout>
    );
}

export default function Page() {
  return (
    <Suspense>
      <PasswordResetContent />
    </Suspense>
  );
}