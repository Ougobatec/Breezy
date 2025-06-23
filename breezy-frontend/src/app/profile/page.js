"use client";
import { useEffect, useState } from "react";
import UserProfile from "@/components/UserProfile";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";

export default function ProfilePage() {
    const { user, token, login } = useAuth();
    const [biography, setBiography] = useState("");
    const [loading, setLoading] = useState(true);

    // Charger la biography depuis le backend au chargement
    useEffect(() => {
        const fetchBio = async () => {
            if (!token) return;
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/user/profile`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setBiography(data.biography || "");
            }
            setLoading(false);
        };
        fetchBio();
    }, [token]);

    // Fonction pour mettre à jour la biography côté backend
    const handleBioUpdate = async (newBio) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/user/profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ biography: newBio }),
        });
        if (!res.ok) throw new Error("Erreur lors de la mise à jour");
        setBiography(newBio);
        // Met à jour le contexte utilisateur si besoin
        if (user && login) {
            login(token, { ...user, biography: newBio });
        }
    };

    return (
        <main className="min-h-screen bg-gray-50">
            <Header title="Mon profil" showButtons={false} />
            <section className="flex flex-col items-center justify-center">
                <UserProfile user={{ ...user, bio: biography }} onBioUpdate={handleBioUpdate} />
            </section>
        </main>
    );
}
