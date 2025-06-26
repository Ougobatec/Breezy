"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LoadingScreen from "@/components/LoadingScreen";
import Layout from "@/components/Layout";
import PostCard from "@/components/PostCard";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function ProfilePage() {
    const { user, token, login, loading } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const fileInputRef = useRef(null);
    
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ name: "", bio: "" });
    const [posts, setPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [removeAvatar, setRemoveAvatar] = useState(false);
    const [error, setError] = useState("");
    const [updateLoading, setUpdateLoading] = useState(false);
    const [stats, setStats] = useState({
        postsCount: 0,
        followersCount: 0,
        followingCount: 0
    });

    // Fonction pour récupérer les followers (ceux qui ME suivent)
    useEffect(() => {
        if (loading || !user) return;
        const fetchFollowers = async () => {
            try {
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
                const followers = Array.isArray(data) ? data : [data];
                setStats(prev => ({ ...prev, followersCount: followers.length }));
            } catch (error) {
                console.error("Erreur lors du chargement des followers:", error);
                setStats(prev => ({ ...prev, followersCount: 0 }));
            }
        };
        fetchFollowers();
    }, [loading, user]);

    // Fonction pour récupérer les abonnements (ceux que JE suis)
    useEffect(() => {
        if (loading || !user) return;
        const fetchSubscriptions = async () => {
            try {
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
                if (!res.ok) throw new Error("Erreur lors du chargement des abonnements");
                const data = await res.json();
                const subscriptions = Array.isArray(data) ? data : [data];
                setStats(prev => ({ ...prev, followingCount: subscriptions.length }));
            } catch (error) {
                console.error("Erreur lors du chargement des abonnements:", error);
                setStats(prev => ({ ...prev, followingCount: 0 }));
            }
        };
        fetchSubscriptions();
    }, [loading, user]);

    // Fonction pour récupérer le profil
    const fetchProfile = useCallback(async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/profile`, {
                credentials: "include",
            });
            if (!res.ok) throw new Error("Erreur lors du chargement du profil");
            const data = await res.json();
            setForm({
                name: data.name || user?.name || "",
                bio: data.biography || user?.biography || ""
            });
        } catch (error) {
            setForm({ 
                name: user?.name || "", 
                bio: user?.biography || "" 
            });
        }
    }, [user]);

    // Fonction pour récupérer les posts
    const fetchPosts = useCallback(async () => {
        setPostsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts?userId=${user._id || user.id}`, {
                credentials: "include",
            });
            if (!res.ok) throw new Error("Erreur lors du chargement des posts");
            const data = await res.json();
            
            let postsArray = data.posts || data || [];
            if (Array.isArray(postsArray) && postsArray.length > 0 && postsArray[0].user_id) {
                postsArray = postsArray.filter((post) =>
                    (typeof post.user_id === "string" && post.user_id === (user._id || user.id)) ||
                    (typeof post.user_id === "object" && post.user_id?._id === (user._id || user.id))
                );
            }
            setPosts(postsArray);
            
            // Mettre à jour le nombre de posts dans les statistiques
            setStats(prev => ({ ...prev, postsCount: postsArray.length }));
        } catch (error) {
            setPosts([]);
            setStats(prev => ({ ...prev, postsCount: 0 }));
        } finally {
            setPostsLoading(false);
        }
    }, [user]);

    // Gestion de l'avatar
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAvatarPreview(URL.createObjectURL(file));
        setRemoveAvatar(false);
    };

    const handleAvatarDelete = () => {
        setAvatarPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setRemoveAvatar(true);
    };

    // Mise à jour du profil
    const handleProfileUpdate = async () => {
        setError("");
        setUpdateLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("bio", form.bio);
            if (fileInputRef.current && fileInputRef.current.files[0]) {
                formData.append("avatar", fileInputRef.current.files[0]);
            }
            formData.append("removeAvatar", removeAvatar ? "true" : "false");
            
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/profile`, {
                method: "PUT",
                body: formData,
                credentials: "include",
            });
            
            if (!res.ok) throw new Error("Erreur lors de la mise à jour du profil");
            
            await login(); // Rafraîchir les données utilisateur
            await fetchProfile(); // Rafraîchir les données du profil
            
            setEditing(false);
            setAvatarPreview(null);
            setRemoveAvatar(false);
        } catch (error) {
            setError("Erreur lors de la mise à jour du profil");
        } finally {
            setUpdateLoading(false);
        }
    };

    // Annuler l'édition
    const handleCancel = () => {
        setEditing(false);
        setError("");
        fetchProfile();
        setAvatarPreview(null);
        setRemoveAvatar(false);
    };

    // Supprimer un post
    const handleDeletePost = (postId) => {
        setPosts((prev) => {
            const newPosts = prev.filter((p) => p._id !== postId);
            // Mettre à jour le nombre de posts dans les statistiques
            setStats(prevStats => ({ ...prevStats, postsCount: newPosts.length }));
            return newPosts;
        });
    };

    // Gérer les likes
    const handleLikeUpdate = (postId, likes) => {
        setPosts((prev) =>
            prev.map((p) => (p._id === postId ? { ...p, likes } : p))
        );
    };

    // Fonction utilitaire pour actualiser les statistiques de followers/following
    const refreshStats = useCallback(async () => {
        if (loading || !user) return;
        
        try {
            // Refresh followers
            const followersRes = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/sub/follower`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                }
            );
            
            // Refresh subscriptions
            const subscriptionsRes = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/sub/subscriptions`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                }
            );
            
            let followersCount = stats.followersCount;
            let followingCount = stats.followingCount;
            
            if (followersRes.ok) {
                const followersData = await followersRes.json();
                followersCount = Array.isArray(followersData) ? followersData.length : 0;
            }
            
            if (subscriptionsRes.ok) {
                const subscriptionsData = await subscriptionsRes.json();
                followingCount = Array.isArray(subscriptionsData) ? subscriptionsData.length : 0;
            }
            
            setStats(prev => ({
                ...prev,
                followersCount,
                followingCount
            }));
        } catch (error) {
            console.error("Erreur lors de l'actualisation des statistiques:", error);
        }
    }, [loading, user, stats.followersCount, stats.followingCount]);

    // Effets
    useEffect(() => {
        if (!token || !user) return;
        fetchProfile();
    }, [token, user, fetchProfile]);

    useEffect(() => {
        if (!user) return;
        fetchPosts();
    }, [user, fetchPosts]);

    // Rendu conditionnel
    if (!user) return null;
    if (loading) return <LoadingScreen text={t('loading')} />;

    // Avatar à afficher
    const avatarSrc = avatarPreview
        || (user.avatar && !removeAvatar && (user.avatar.startsWith("http") ? user.avatar : `${process.env.NEXT_PUBLIC_BACKEND_URL}${user.avatar}`))
        || null;

    return (
        <Layout headerProps={{ title: user.name || t('profile'), showButtons: true }}>
            <div className="p-4">
                {/* Section Profil */}
                <div className="mb-6">
                    <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="relative w-24 h-24">
                            <div 
                                className={`w-24 h-24 rounded-full flex items-center justify-center relative overflow-hidden ${editing ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                                style={{ backgroundColor: avatarSrc ? "var(--card)" : "var(--input)" }}
                                onClick={editing ? () => fileInputRef.current?.click() : undefined}
                                title={editing ? t('changeAvatar') : undefined}
                            >
                                {avatarSrc ? (
                                    <Image
                                        src={avatarSrc}
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
                                
                                {editing && (
                                    <div className="absolute inset-0 bg-black bg-opacity-20 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2a2.828 2.828 0 11-4-4 2.828 2.828 0 014 4z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            
                            {editing && (
                                <>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleAvatarChange}
                                    />
                                    
                                    {(user.avatar || avatarPreview) && !removeAvatar && (
                                        <button
                                            type="button"
                                            className="absolute top-0 right-0 border rounded-full p-1 shadow cursor-pointer hover:opacity-80"
                                            style={{ backgroundColor: "var(--card)", zIndex: 10 }}
                                            title={t('deletePhoto')}
                                            onClick={handleAvatarDelete}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                        
                        {/* Informations utilisateur et bouton d'action */}
                        <div className="flex-1 flex justify-between items-start">
                            {/* Informations utilisateur */}
                            <div className="flex-1 mr-4">
                                {editing ? (
                                    <div className="space-y-3">
                                        <input
                                            className="w-full p-2 rounded-xl border text-sm font-bold"
                                            style={{
                                                backgroundColor: "var(--input)",
                                                borderColor: "var(--border)",
                                                color: "var(--text-primary)"
                                            }}
                                            value={form.name}
                                            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                                            maxLength={32}
                                            placeholder="Nom"
                                        />
                                        <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                            @{user.username}
                                        </div>
                                        <textarea
                                            className="w-full p-2 rounded-xl border text-sm min-h-[60px] resize-none"
                                            style={{
                                                backgroundColor: "var(--input)",
                                                borderColor: "var(--border)",
                                                color: "var(--text-primary)",
                                                wordWrap: "break-word",
                                                overflowWrap: "break-word"
                                            }}
                                            value={form.bio}
                                            onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))}
                                            maxLength={200}
                                            placeholder="Biographie"
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <div className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                                            {user.name}
                                        </div>
                                        <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                                            @{user.username}
                                        </div>
                                        <p className="text-sm mt-3" style={{ 
                                            color: "var(--text-primary)",
                                            wordWrap: "break-word",
                                            overflowWrap: "break-word",
                                            wordBreak: "break-word"
                                        }}>
                                            {user.biography || "Aucune biographie"}
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Boutons d'action */}
                            <div className="flex-shrink-0">
                                {editing ? (
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={handleProfileUpdate}
                                            disabled={updateLoading}
                                            className="px-4 py-2 rounded-xl text-white text-sm font-semibold transition-colors"
                                            style={{ backgroundColor: "var(--primary)" }}
                                        >
                                            {updateLoading ? "Sauvegarde..." : t('save')}
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            className="px-4 py-2 rounded-xl border text-sm transition-colors"
                                            style={{
                                                backgroundColor: "var(--card)",
                                                borderColor: "var(--border)",
                                                color: "var(--text-primary)"
                                            }}
                                        >
                                            {t('cancel')}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setForm({
                                                name: user.name || "",
                                                bio: user.biography || ""
                                            });
                                            setEditing(true);
                                        }}
                                        className="px-3 py-2 rounded-xl text-sm font-semibold border transition-colors hover:opacity-80"
                                        style={{
                                            backgroundColor: "var(--card)",
                                            borderColor: "var(--border)",
                                            color: "var(--text-primary)"
                                        }}
                                    >
                                        {t('edit')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {error && (
                        <div className="mt-4 p-3 rounded-xl text-sm text-red-600" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}>
                            {error}
                        </div>
                    )}
                    
                    {/* Statistiques */}
                    <div className="flex mt-6 text-center gap-2">
                        <div className="flex-1 p-3 rounded-xl border" style={{ 
                            backgroundColor: "var(--card)",
                            borderColor: "var(--border)"
                        }}>
                            <div className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
                                {stats.postsCount}
                            </div>
                            <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                                {t('posts')}
                            </div>
                        </div>
                        <button
                            onClick={() => router.push('/followers')}
                            className="flex-1 p-3 rounded-xl border transition-colors hover:opacity-80"
                            style={{ 
                                backgroundColor: "var(--card)",
                                borderColor: "var(--border)"
                            }}
                        >
                            <div className="font-semibold text-base" style={{ color: "var(--primary)" }}>
                                {stats.followersCount}
                            </div>
                            <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                                {t('followers')}
                            </div>
                        </button>
                        <button
                            onClick={() => router.push('/subscription')}
                            className="flex-1 p-3 rounded-xl border transition-colors hover:opacity-80"
                            style={{ 
                                backgroundColor: "var(--card)",
                                borderColor: "var(--border)"
                            }}
                        >
                            <div className="font-semibold text-base" style={{ color: "var(--primary)" }}>
                                {stats.followingCount}
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
                                        currentUser={user}
                                        showDeleteOption={true}
                                        onDeletePost={handleDeletePost}
                                        onLikeUpdate={(likes) => handleLikeUpdate(post._id || post.id, likes)}
                                    />
                                ))
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
}