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
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/users/profile`, {
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

    // Rafraîchir l'utilisateur à chaque affichage de la page profil
    useEffect(() => {
        const fetchUser = async () => {
            if (!token || !login) return;
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/auth/authenticate`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                login(token, data.user);
            }
        };
        fetchUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fonction pour mettre à jour la biography côté backend
    const handleBioUpdate = async (newBio) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/users/profile`, {
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
                <UserProfile
                    user={{ ...user, bio: biography, avatar: user?.avatar }}
                    onBioUpdate={handleBioUpdate}
                    onAvatarUpdate={async (formData) => {
                        // Envoi du fichier avatar au backend
                        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/users/profile/avatar`, {
                            method: "PUT",
                            headers: { Authorization: `Bearer ${token}` },
                            body: formData,
                        });
                        if (!res.ok) throw new Error("Erreur lors de la mise à jour de l'avatar");
                        const data = await res.json();
                        // Met à jour le contexte utilisateur si besoin
                        if (user && login) {
                            login(token, { ...user, avatar: data.user.avatar });
                        }
                    }}
                />
                <a href="/home" className="mt-6 px-6 py-2 bg-gray-200 text-black rounded hover:bg-gray-300 transition">Retour à l&#39;accueil</a>
            </section>
        </main>
    );
}
