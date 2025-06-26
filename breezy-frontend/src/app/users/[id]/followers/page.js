"use client";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import LoadingScreen from "@/components/LoadingScreen";
import Layout from "@/components/Layout";
import SkeletonAvatar from "@/components/SkeletonAvatar";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function UserFollowersPage() {
    const { user: currentUser, loading } = useAuth();
    const { t } = useLanguage();
    const params = useParams();
    const router = useRouter();
    const userId = params.id;
    
    const [profileUser, setProfileUser] = useState(null);
    const [followers, setFollowers] = useState([]);
    const [followersLoading, setFollowersLoading] = useState(true);

    // Récupération du profil utilisateur pour le titre
    useEffect(() => {
        if (!userId) return;
        
        const fetchUserProfile = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}`,
                    { credentials: "include" }
                );
                if (res.ok) {
                    const userData = await res.json();
                    setProfileUser(userData);
                }
            } catch (error) {
                console.error("Erreur lors du chargement du profil:", error);
            }
        };

        fetchUserProfile();
    }, [userId]);

    // Récupération des followers - Pour l'instant on utilise l'API existante et on filtrera plus tard
    useEffect(() => {
        if (loading || !currentUser) return;
        
        const fetchFollowers = async () => {
            setFollowersLoading(true);
            try {
                // Pour l'instant, utiliser l'API existante (qui retourne les followers de l'utilisateur connecté)
                // TODO: Modifier l'API backend pour supporter /users/:id/followers
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/sub/follower`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: "include",
                    }
                );
                if (!res.ok) throw new Error("Erreur lors du chargement des abonnés");
                const data = await res.json();
                setFollowers(Array.isArray(data) ? data : [data]);
            } catch (error) {
                console.error("Erreur lors du chargement des followers:", error);
                setFollowers([]);
            }
            setFollowersLoading(false);
        };

        fetchFollowers();
    }, [loading, currentUser, userId]);

    const handleRemoveFollower = async (followerUserId) => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/sub/remove-follower`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ followerUserId }),
                }
            );
            if (!res.ok) throw new Error("Erreur lors de la suppression");
            setFollowers((prev) =>
                prev.filter((f) => (f._id || f.id) !== followerUserId)
            );
        } catch (error) {
            console.error("Erreur lors de la suppression:", error);
        }
    };

    if (loading) return <LoadingScreen text={t('loading')} />;
    if (!currentUser) return null;
    if (followersLoading) return <LoadingScreen text={t('loadingFollowers')} />;

    // Vérifier si c'est notre propre profil ou celui d'un autre utilisateur
    const isOwnProfile = currentUser && (currentUser._id === userId || currentUser.id === userId);

    return (
        <Layout headerProps={{ 
            title: `${profileUser?.name || t('user')} - ${t('followers')}`, 
            showButtons: true 
        }}>
            <div className="px-4 py-2">
                <input
                    type="text"
                    placeholder={t('search')}
                    className="w-full mb-4 rounded-xl bg-gray-100 px-4 py-2 text-gray-500 outline-none"
                />
                <div className="space-y-3">
                    {followers.length === 0 ? (
                        <div className="text-center text-gray-400">{t('noFollowers')}</div>
                    ) : (
                        followers.map((follower, idx) => (
                            <div
                                key={follower._id || idx}
                                className="flex items-center bg-white rounded-xl shadow p-3"
                            >
                                <SkeletonAvatar />
                                <div 
                                    className="ml-4 flex-1 cursor-pointer hover:bg-gray-50"
                                    onClick={() => router.push(`/users/${follower._id || follower.id}`)}
                                >
                                    <div className="font-medium text-gray-700">
                                        {follower.name || follower.username || "Nom"}{" "}
                                        <span className="text-gray-400">
                                            @{follower.username || "username"}
                                        </span>
                                    </div>
                                </div>
                                {/* Afficher le bouton de suppression seulement si c'est notre profil */}
                                {isOwnProfile && (
                                    <button onClick={() => handleRemoveFollower(follower._id || follower.id)}>
                                        <svg
                                            className="w-6 h-6 text-gray-500"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
            <div className="fixed bottom-0 left-0 w-full">
                <div className="flex bg-white rounded-t-xl shadow">
                    <button 
                        className="flex-1 py-3 font-semibold text-orange-600 bg-gray-100 rounded-tl-xl"
                        onClick={() => router.push(`/users/${userId}/followers`)}
                    >
                        {t('followers')}
                    </button>
                    <button 
                        className="flex-1 py-3 text-gray-500"
                        onClick={() => router.push(`/users/${userId}/following`)}
                    >
                        {t('following')}
                    </button>
                </div>
            </div>
        </Layout>
    );
}
