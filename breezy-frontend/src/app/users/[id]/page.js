"use client";
import Image from "next/image";
import LoadingScreen from "@/components/LoadingScreen";
import Layout from "@/components/Layout";
import PostCard from "@/components/PostCard";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function UserProfilePage() {
    const { user: currentUser, token, loading: authLoading } = useAuth();
    const { t } = useLanguage();
    const params = useParams();
    const router = useRouter();
    const userId = params.id;
    
    const [profileUser, setProfileUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [userStats, setUserStats] = useState({
        followersCount: 0,
        followingCount: 0
    });

    // Récupération du profil utilisateur
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
                    // Utiliser la propriété isFollowing retournée par l'API
                    if (userData.isFollowing !== undefined) {
                        setIsFollowing(userData.isFollowing);
                    }
                }
            } catch (error) {
                console.error("Erreur lors du chargement du profil:", error);
            }
            setLoading(false);
        };

        fetchUserProfile();
    }, [userId, currentUser]);

    // Récupération des followers pour obtenir le nombre exact
    useEffect(() => {
        if (authLoading || !currentUser || !userId) return;
        
        const fetchFollowers = async () => {
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
                if (res.ok) {
                    const data = await res.json();
                    const followers = Array.isArray(data) ? data : [data];
                    // Si c'est notre propre profil, utiliser le compte direct
                    if (currentUser._id === userId || currentUser.id === userId) {
                        setUserStats(prev => ({ ...prev, followersCount: followers.length }));
                    } else {
                        // Pour un autre utilisateur, utiliser les données du profil
                        setUserStats(prev => ({ ...prev, followersCount: profileUser?.followersCount || 0 }));
                    }
                } else {
                    setUserStats(prev => ({ ...prev, followersCount: profileUser?.followersCount || 0 }));
                }
            } catch (error) {
                console.error("Erreur lors du chargement des followers:", error);
                setUserStats(prev => ({ ...prev, followersCount: profileUser?.followersCount || 0 }));
            }
        };

        fetchFollowers();
    }, [authLoading, currentUser, userId, profileUser]);

    // Récupération des abonnements pour obtenir le nombre exact
    useEffect(() => {
        if (authLoading || !currentUser || !userId) return;
        
        const fetchSubscriptions = async () => {
            try {
                // Pour l'instant, utiliser l'API existante (qui retourne les abonnements de l'utilisateur connecté)
                // TODO: Modifier l'API backend pour supporter /users/:id/following
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/sub/subscriptions`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: "include",
                    }
                );
                if (res.ok) {
                    const data = await res.json();
                    const subscriptions = Array.isArray(data) ? data : [data];
                    // Si c'est notre propre profil, utiliser le compte direct
                    if (currentUser._id === userId || currentUser.id === userId) {
                        setUserStats(prev => ({ ...prev, followingCount: subscriptions.length }));
                    } else {
                        // Pour un autre utilisateur, utiliser les données du profil
                        setUserStats(prev => ({ ...prev, followingCount: profileUser?.followingCount || 0 }));
                    }
                } else {
                    setUserStats(prev => ({ ...prev, followingCount: profileUser?.followingCount || 0 }));
                }
            } catch (error) {
                console.error("Erreur lors du chargement des abonnements:", error);
                setUserStats(prev => ({ ...prev, followingCount: profileUser?.followingCount || 0 }));
            }
        };

        fetchSubscriptions();
    }, [authLoading, currentUser, userId, profileUser]);

    // Récupération des posts de l'utilisateur
    useEffect(() => {
        if (!userId) return;
        
        const fetchUserPosts = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts?userId=${userId}`,
                    { credentials: "include" }
                );
                if (res.ok) {
                    const data = await res.json();
                    let postsArray = data.posts || data || [];
                    // Filtrer pour s'assurer qu'on a bien les posts de cet utilisateur
                    if (Array.isArray(postsArray)) {
                        postsArray = postsArray.filter((post) =>
                            (typeof post.user_id === "string" && post.user_id === userId) ||
                            (typeof post.user_id === "object" && post.user_id?._id === userId)
                        );
                    }
                    setPosts(postsArray);
                }
            } catch (error) {
                console.error("Erreur lors du chargement des posts:", error);
            }
            setPostsLoading(false);
        };

        fetchUserPosts();
    }, [userId]);

    // Fonction pour actualiser les statistiques après un follow/unfollow
    const refreshUserStats = async () => {
        try {
            const updatedRes = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}`,
                { credentials: "include" }
            );
            if (updatedRes.ok) {
                const updatedUserData = await updatedRes.json();
                setProfileUser(updatedUserData);
                setUserStats({
                    followersCount: updatedUserData.followersCount || 0,
                    followingCount: updatedUserData.followingCount || 0
                });
            }
        } catch (error) {
            console.error("Erreur lors de l'actualisation des statistiques:", error);
        }
    };

    // Gestion du follow/unfollow
    const handleFollowToggle = async () => {
        if (!currentUser || followLoading) return;
        
        setFollowLoading(true);
        try {
            if (isFollowing) {
                // Se désabonner
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/sub/unsubscribe`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ unfollowUserId: userId }),
                });
                
                if (res.ok) {
                    setIsFollowing(false);
                    // Actualiser les statistiques
                    await refreshUserStats();
                }
            } else {
                // S'abonner
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/sub/subscribe`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ targetId: userId }),
                });
                
                if (res.ok) {
                    setIsFollowing(true);
                    // Actualiser les statistiques
                    await refreshUserStats();
                }
            }
        } catch (error) {
            console.error("Erreur lors du follow/unfollow:", error);
        }
        setFollowLoading(false);
    };

    if (loading) return <LoadingScreen text={t('loadingProfile')} />;
    if (!profileUser) {
        return (
            <Layout headerProps={{ title: t('profile'), showButtons: true }}>
                <div className="p-4 text-center">
                    <p style={{ color: "var(--text-secondary)" }}>{t('userNotFound')}</p>
                </div>
            </Layout>
        );
    }

    // Si c'est notre propre profil, rediriger vers la page profile normale
    if (currentUser && (currentUser._id === userId || currentUser.id === userId)) {
        window.location.href = '/profile';
        return null;
    }

    return (
        <Layout headerProps={{ title: profileUser.name || t('profile'), showButtons: true }}>
            <div className="p-4">
                {/* Section Profil */}
                <div className="mb-6">
                    <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="relative w-24 h-24">
                            <div 
                                className="w-24 h-24 rounded-full flex items-center justify-center relative overflow-hidden"
                                style={{ backgroundColor: profileUser.avatar ? "var(--card)" : "var(--input)" }}
                            >
                                {profileUser.avatar ? (
                                    <Image
                                        src={
                                            profileUser.avatar.startsWith("http")
                                                ? profileUser.avatar
                                                : `${process.env.NEXT_PUBLIC_BACKEND_URL}${profileUser.avatar}`
                                        }
                                        alt="Avatar"
                                        width={96}
                                        height={96}
                                        className="w-24 h-24 rounded-full object-cover"
                                    />
                                ) : (
                                    <Image
                                        src="/avatar.svg"
                                        alt="Avatar"
                                        width={56}
                                        height={56}
                                        className="w-14 h-14"
                                    />
                                )}
                            </div>
                        </div>
                        
                        {/* Informations utilisateur et bouton d'action */}
                        <div className="flex-1 flex justify-between items-start">
                            {/* Informations utilisateur */}
                            <div className="flex-1 mr-4">
                                <div>
                                    <div className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                                        {profileUser.name || "Name"}
                                    </div>
                                    <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                                        @{profileUser.username || "username"}
                                    </div>
                                    <p className="text-sm mt-3" style={{ 
                                        color: "var(--text-primary)",
                                        wordWrap: "break-word",
                                        overflowWrap: "break-word",
                                        wordBreak: "break-word"
                                    }}>
                                        {profileUser.biography || t('addBio')}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Bouton d'action */}
                            <div className="flex-shrink-0">
                                {currentUser && currentUser._id !== userId && (
                                    <button
                                        onClick={handleFollowToggle}
                                        disabled={followLoading}
                                        className="px-3 py-2 rounded-xl text-sm font-semibold border transition-colors hover:opacity-80"
                                        style={{
                                            backgroundColor: isFollowing ? "var(--card)" : "var(--primary)",
                                            borderColor: isFollowing ? "var(--border)" : "var(--primary)",
                                            color: isFollowing ? "var(--text-primary)" : "white"
                                        }}
                                    >
                                        {followLoading 
                                            ? t('loading') 
                                            : isFollowing 
                                                ? t('unsubscribe') 
                                                : t('subscribe')
                                        }
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Statistiques */}
                    <div className="flex mt-6 text-center gap-2">
                        <div className="flex-1 p-3 rounded-xl border" style={{ 
                            backgroundColor: "var(--card)",
                            borderColor: "var(--border)"
                        }}>
                            <div className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
                                {profileUser.postsCount ?? posts.length ?? 0}
                            </div>
                            <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                                {t('posts')}
                            </div>
                        </div>
                        <button
                            onClick={() => router.push(`/users/${userId}/followers`)}
                            className="flex-1 p-3 rounded-xl border transition-colors hover:opacity-80"
                            style={{ 
                                backgroundColor: "var(--card)",
                                borderColor: "var(--border)"
                            }}
                        >
                            <div className="font-semibold text-base" style={{ color: "var(--primary)" }}>
                                {userStats.followersCount}
                            </div>
                            <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                                {t('followers')}
                            </div>
                        </button>
                        <button
                            onClick={() => router.push(`/users/${userId}/following`)}
                            className="flex-1 p-3 rounded-xl border transition-colors hover:opacity-80"
                            style={{ 
                                backgroundColor: "var(--card)",
                                borderColor: "var(--border)"
                            }}
                        >
                            <div className="font-semibold text-base" style={{ color: "var(--primary)" }}>
                                {userStats.followingCount}
                            </div>
                            <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                                {t('following')}
                            </div>
                        </button>
                    </div>
                </div>
                
                {/* Section Posts */}
                <div className="mb-4">
                    <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                        {t('posts')}
                    </h2>
                </div>
                
                {postsLoading ? (
                    <LoadingScreen text={t('loading')} />
                ) : (
                    <div className="space-y-4">
                        {posts.length === 0 ? (
                            <div className="text-center py-8" style={{ color: "var(--text-secondary)" }}>
                                {t('noPostsMessage')}
                            </div>
                        ) : (
                            posts
                                .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))
                                .map((post) => (
                                    <PostCard
                                        key={post._id || post.id}
                                        post={post}
                                        token={token}
                                        currentUser={currentUser}
                                        showDeleteOption={false}
                                        onLikeUpdate={(likes) => {
                                            setPosts(prev => prev.map(p => 
                                                p._id === post._id ? { ...p, likes } : p
                                            ));
                                        }}
                                    />
                                ))
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
}
