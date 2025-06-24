"use client";
import { useEffect, useState } from "react";
import UserProfile from "@/components/UserProfile";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

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

    // Affichage du loader si besoin
    if (loading || !user) {
        return (
            <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <Header title="Mon profil" showButtons={false} />
                <div className="mt-20 text-gray-500">Chargement...</div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            <Header title="Mon profil" showButtons={false} />
            <section className="flex flex-col items-center w-full max-w-md mx-auto bg-white border-b border-gray-200">
                {/* Avatar et infos */}
                <div className="flex flex-col items-center w-full py-6">
                    <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-2 border-gray-300">
                        {user.avatar ? (
                            <img
                                src={user.avatar.startsWith("http") ? user.avatar : `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}${user.avatar.startsWith("/") ? user.avatar : "/" + user.avatar}`}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <svg className="w-full h-full text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="8" r="4" strokeWidth="2" /><path strokeWidth="2" d="M4 20c0-4 8-4 8-4s8 0 8 4" /></svg>
                        )}
                    </div>
                    <div className="flex items-center mt-4 w-full justify-center">
                        <div className="flex flex-col items-center flex-1">
                            <span className="font-semibold text-lg">{user.name || "Nom"}</span>
                            <span className="text-gray-500 text-sm">@{user.username || "username"}</span>
                        </div>
                        <button className="text-red-600 font-semibold text-sm px-2 py-1 hover:underline">Modifier</button>
                    </div>
                    <p className="text-center text-gray-700 text-sm mt-2 px-4">
                        {biography || "Ajoutez une bio à votre profil."}
                    </p>
                    <div className="flex justify-center gap-8 mt-4 w-full">
                        <div className="flex flex-col items-center">
                            <span className="font-semibold">{user.postsCount ?? 100}</span>
                            <span className="text-xs text-gray-500">Posts</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="font-semibold">{user.followersCount ?? "10K"}</span>
                            <span className="text-xs text-gray-500">Abonnés</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="font-semibold">{user.followingCount ?? "10K"}</span>
                            <span className="text-xs text-gray-500">Abonnements</span>
                        </div>
                    </div>
                </div>
            </section>
            {/* Section Posts */}
            <section className="w-full max-w-md mx-auto mt-4">
                <h2 className="text-xl font-bold text-gray-800 mb-2 px-4">Posts</h2>
                {/* Ici vous pouvez intégrer la liste des posts de l'utilisateur */}
                {/* <Posts userId={user._id} /> */}
                <div className="bg-white rounded-xl shadow p-4 mb-4">
                    <div className="flex items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 mr-2" />
                        <div>
                            <span className="font-semibold text-sm">Name</span>
                            <span className="text-gray-400 text-xs ml-1">@username</span>
                            <div className="text-xs text-gray-400">12/06/2025 22:00</div>
                        </div>
                        <div className="ml-auto text-gray-400 cursor-pointer">•••</div>
                    </div>
                    <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb" alt="post" className="w-full h-48 object-cover rounded-lg mb-2" />
                    <p className="text-gray-700 text-sm mb-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                        <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded">Tag tag</span>
                        <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded">tag tag</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-500 text-xl">
                        <button className="hover:text-red-500"><i className="far fa-heart"></i></button>
                        <button className="hover:text-blue-500"><i className="far fa-comment"></i></button>
                        <button className="hover:text-gray-700"><i className="far fa-share-square"></i></button>
                    </div>
                </div>
            </section>
            <BottomNav />
        </main>
    );
}
