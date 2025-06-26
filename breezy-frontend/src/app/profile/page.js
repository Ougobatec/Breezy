"use client";
import Image from "next/image";
import LoadingScreen from "@/components/LoadingScreen";
import Layout from "@/components/Layout";
import PostCard from "@/components/PostCard";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const { user, token, login, loading } = useAuth();
    const { t } = useLanguage();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ name: "", bio: "" });
    const [posts, setPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [removeAvatar, setRemoveAvatar] = useState(false);
    const [profileRefresh, setProfileRefresh] = useState(0);
    const fileInputRef = useRef(null);
    const router = useRouter();

    // Initialisation du formulaire
    useEffect(() => {
        if (!token) return;
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/profile`, {
            credentials: "include",
        })
            .then(res => res.json())
            .then(data => setForm({
                name: data.name || user?.name || "",
                bio: data.biography || user?.biography || ""
            }))
            .catch(() => setForm({ name: user?.name || "", bio: user?.biography || "" }));
    }, [token, user?.name, user?.biography, profileRefresh]);

    // Récupération des posts (filtrage côté client si besoin, fallback si l'API ne supporte pas userId)
    useEffect(() => {
        if (!user) return;
        setPostsLoading(true);
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts?userId=${user._id || user.id}`, {
            credentials: "include",
        })
            .then(res => res.json())
            .then(data => {
                // Si l'API renvoie tous les posts, filtrer côté client
                let postsArray = data.posts || data || [];
                if (Array.isArray(postsArray) && postsArray.length > 0 && postsArray[0].user_id) {
                    postsArray = postsArray.filter((post) =>
                        (typeof post.user_id === "string" && post.user_id === (user._id || user.id)) ||
                        (typeof post.user_id === "object" && post.user_id?._id === (user._id || user.id))
                    );
                }
                setPosts(postsArray);
            })
            .catch(() => setPosts([]))
            .finally(() => setPostsLoading(false));
    }, [user]);

    // Gestion avatar
    const handleAvatarChange = e => {
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

    // Sauvegarde du profil (nom, bio, avatar)
    const handleProfileUpdate = async () => {
        try {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("bio", form.bio);
            if (fileInputRef.current && fileInputRef.current.files[0]) {
                formData.append("avatar", fileInputRef.current.files[0]);
            }
            formData.append("removeAvatar", removeAvatar ? "true" : "false");
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/profile`, {
                method: "PUT",
                body: formData,
                credentials: "include",
            });
            
            if (response.ok) {
                // Récupérer les données mises à jour
                const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/profile`, {
                    credentials: "include",
                });
                const profileData = await profileResponse.json();
                
                // Mettre à jour le formulaire avec les nouvelles données
                setForm({
                    name: profileData.name || "",
                    bio: profileData.biography || ""
                });
                
                // Rafraîchir les données utilisateur dans l'AuthContext
                await login();
                
                setEditing(false);
                setAvatarPreview(null);
                setRemoveAvatar(false);
                
                // Forcer le rechargement des données du profil
                setProfileRefresh(prev => prev + 1);
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour du profil:", error);
        }
    };

    // Suppression d'un post
    const handleDeletePost = (postId) => {
        setPosts((prev) => prev.filter((p) => p._id !== postId));
    };

    // Reset du formulaire
    const handleCancel = () => {
        setEditing(false);
        // Récupérer les données actuelles au lieu de remettre à vide
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/profile`, {
            credentials: "include",
        })
            .then(res => res.json())
            .then(data => setForm({
                name: data.name || user?.name || "",
                bio: data.biography || user?.biography || ""
            }))
            .catch(() => setForm({ name: user?.name || "", bio: user?.biography || "" }));
        setAvatarPreview(null);
        setRemoveAvatar(false);
    };

    if (!user) return null;
    if (loading) return <LoadingScreen text={t('loadingProfile')} />;
    if (postsLoading) return <LoadingScreen text={t('loadingPosts')} />;

    // Avatar à afficher
    const avatarSrc = avatarPreview
        || (user.avatar && !removeAvatar && (user.avatar.startsWith("http") ? user.avatar : `${process.env.NEXT_PUBLIC_BACKEND_URL}${user.avatar}`))
        || null;

    return (
        <Layout headerProps={{ title: user.name || t('profile'), showButtons: true }}>
            <div className="p-4">
                <div className="flex items-center">
                    <div className="relative w-20 h-20">
                        {avatarSrc ? (
                            <Image
                                src={avatarSrc}
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
                        {editing && (
                            <>
                                <label
                                    htmlFor="avatar-upload"
                                    className="absolute bottom-0 right-0 bg-white border rounded-full p-1 shadow cursor-pointer hover:bg-gray-100"
                                    title={t('changeAvatar')}
                                    style={{ lineHeight: 0 }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2a2.828 2.828 0 11-4-4 2.828 2.828 0 014 4z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7l-1.5 1.5M4 20h16" />
                                    </svg>
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleAvatarChange}
                                    />
                                </label>
                                {(user.avatar || avatarPreview) && !removeAvatar && (
                                    <button
                                        type="button"
                                        className="absolute top-0 right-0 bg-white border rounded-full p-1 shadow cursor-pointer hover:bg-gray-100"
                                        title={t('deletePhoto')}
                                        style={{ lineHeight: 0, zIndex: 10 }}
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
                    <div className="flex-1 flex flex-col justify-center ml-4">
                        {editing ? (
                            <>
                                <input
                                    className="border rounded p-2 w-full text-black text-xs font-bold mb-1"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    maxLength={32}
                                />
                                <span className="text-xs text-gray-400">@{user.username || "username"}</span>
                                <textarea
                                    className="border rounded p-2 w-full min-h-[60px] text-black text-xs mt-2"
                                    value={form.bio}
                                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                                    maxLength={200}
                                />
                            </>
                        ) : (
                            <>
                                <span className="font-bold text-base text-gray-800">{user.name || "Name"}</span>
                                <span className="text-xs text-gray-400">@{user.username || "username"}</span>
                                <p className="text-xs text-gray-600 mt-2">
                                    {user.biography || form.bio || "Ajoutez une bio à votre profil."}
                                </p>
                            </>
                        )}
                    </div>
                    {editing ? (
                        <div className="flex flex-col gap-2 ml-2">
                            <button
                                onClick={handleProfileUpdate}
                                className="px-3 py-1 bg-blue-500 text-white rounded text-xs"
                            >
                                {t('save')}
                            </button>
                            <button
                                onClick={handleCancel}
                                className="px-3 py-1 bg-gray-200 rounded text-xs"
                            >
                                {t('cancel')}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => {
                                // Initialiser le formulaire avec les valeurs actuelles avant d'entrer en mode édition
                                setForm({
                                    name: user.name || "",
                                    bio: user.biography || ""
                                });
                                setEditing(true);
                            }}
                            className="text-red-600 font-semibold text-sm ml-2"
                        >
                            {t('edit')}
                        </button>
                    )}
                </div>
                <div className="flex justify-around mt-4 text-center text-xs text-gray-600">
                    <div>
                        <div className="font-semibold text-gray-800">{user.postsCount ?? posts.length ?? 0}</div>
                        <div>{t('posts')}</div>
                    </div>
                    <button
                        onClick={() => router.push('/followers')}
                        className="hover:bg-gray-50 rounded p-1"
                    >
                        <div className="font-semibold text-gray-800">{user.followersCount ?? 0}</div>
                        <div>{t('followers')}</div>
                    </button>
                    <button
                        onClick={() => router.push('/subscription')}
                        className="hover:bg-gray-50 rounded p-1"
                    >
                        <div className="font-semibold text-gray-800">{user.followingCount ?? 0}</div>
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
                    <div className="text-center py-8" style={{ color: "var(--text-secondary)" }}>{t('noPostsMessage')}</div>
                ) : (
                    (Array.isArray(posts) ? posts : [])
                        .sort(
                            (a, b) =>
                                new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt)
                        )
                        .map((post) => (
                            <PostCard
                                key={post._id || post.id}
                                post={post}
                                token={token}
                                currentUser={user}
                                showDeleteOption={true}
                                onDeletePost={handleDeletePost}
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