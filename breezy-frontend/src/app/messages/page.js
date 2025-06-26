"use client";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import LoadingScreen from "@/components/LoadingScreen";

export default function MessagesPage() {
    const { user, loading } = useAuth();
    const { t } = useLanguage();

    if (loading) return <LoadingScreen text={t('loading')} />;
    if (!user) return null;

    return (
        <Layout headerProps={{ title: t('messages') || "Messages" }}>
            <div className="flex flex-col items-center justify-center flex-1 min-h-full p-8">
                <div className="text-center max-w-md">
                    <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--primary)" }}>
                        Fonctionnalité indisponible
                    </h1>
                    <p className="text-center" style={{ color: "var(--text-secondary)" }}>
                        La messagerie n&apos;est pas encore disponible. Cette fonctionnalité sera ajoutée dans une prochaine version de Breezy.
                    </p>
                </div>
            </div>
        </Layout>
    );
}