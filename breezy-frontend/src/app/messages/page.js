"use client";
import Layout from "@/components/Layout";

export default function MessagesPage() {
    return (
        <Layout headerProps={{ title: "Messages" }}>
            <div className="flex flex-col items-center justify-center flex-1 min-h-full p-8">
                <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--primary)" }}>
                    Fonctionnalité indisponible
                </h1>
                <p className="text-center max-w-md" style={{ color: "var(--text-secondary)" }}>
                    La messagerie n&apos;est pas encore disponible. Cette fonctionnalité sera ajoutée dans une prochaine version de Breezy.
                </p>
            </div>
        </Layout>
    );
}