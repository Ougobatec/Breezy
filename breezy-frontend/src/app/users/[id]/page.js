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
    const { user: currentUser, token } = useAuth();
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
                    setProfileUser(prev => ({
                        ...prev,
                        followersCount: prev.followersCount - 1
                    }));
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
                    setProfileUser(prev => ({
                        ...prev,
                        followersCount: prev.followersCount + 1
                    }));
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
                <div className="flex items-center">
                    <div className="relative w-20 h-20">
                        {profileUser.avatar ? (
                            <Image
                                src={
                                    profileUser.avatar.startsWith("http")
                                        ? profileUser.avatar
                                        : `${process.env.NEXT_PUBLIC_BACKEND_URL}${profileUser.avatar}`
                                }
                                alt="Avatar"
                                width={80}
                                height={80}
                                className="w-20 h-20 rounded-full object-cover bg-gray-100"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                                <Image
                                    src="/avatar.svg"
                                    alt="Avatar temporaire"
                                    width={48}
                                    height={48}
                                    className="w-12 h-12"
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 flex flex-col justify-center ml-4">
                        <span className="font-bold text-base text-gray-800">{profileUser.name || "Name"}</span>
                        <span className="text-xs text-gray-400">@{profileUser.username || "username"}</span>
                        <p className="text-xs text-gray-600 mt-2">
                            {profileUser.biography || t('addBio')}
                        </p>
                    </div>
                    {currentUser && currentUser._id !== userId && (
                        <button
                            onClick={handleFollowToggle}
                            disabled={followLoading}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold ml-2 ${
                                isFollowing
                                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    : 'bg-red-500 text-white hover:bg-red-600'
                            }`}
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
                <div className="flex justify-around mt-4 text-center text-xs text-gray-600">
                    <div>
                        <div className="font-semibold text-gray-800">{profileUser.postsCount ?? posts.length ?? 0}</div>
                        <div>{t('posts')}</div>
                    </div>
                    <button
                        onClick={() => router.push(`/users/${userId}/followers`)}
                        className="hover:bg-gray-50 rounded p-1"
                    >
                        <div className="font-semibold text-gray-800">{profileUser.followersCount ?? 0}</div>
                        <div>{t('followers')}</div>
                    </button>
                    <button
                        onClick={() => router.push(`/users/${userId}/following`)}
                        className="hover:bg-gray-50 rounded p-1"
                    >
                        <div className="font-semibold text-gray-800">{profileUser.followingCount ?? 0}</div>
                        <div>{t('following')}</div>
                    </button>
                </div>
            </div>
            <div className="text-xl font-bold p-4">
                {t('posts')}
            </div>
            <div className="space-y-4 px-4 pb-4">
                {postsLoading ? (
                    <div className="text-center text-gray-400">{t('loadingPosts')}</div>
                ) : posts.length === 0 ? (
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
        </Layout>
    );
}
