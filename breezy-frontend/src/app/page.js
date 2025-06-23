"use client";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";

export default function HomePage() {
    const { user, loading, logout } = useAuth();
    if (loading) return <LoadingScreen />;
    if (!user) return null;

    return (
        <>
            <Header title="Breezy" showButtons={true} />
            <div>Bienvenue {user.username}</div>
            <button onClick={logout}>Déconnexion</button>
        </>
    );
}