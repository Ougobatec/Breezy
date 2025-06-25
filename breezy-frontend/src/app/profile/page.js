"use client";
import Image from "next/image";
import LoadingScreen from "@/components/LoadingScreen";
import Layout from "@/components/Layout";
import PostCard from "@/components/PostCard";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const { user, token, login, loading } = useAuth();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ name: "", bio: "" });
    const [posts, setPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [removeAvatar, setRemoveAvatar] = useState(false);
    const [openMenuPostId, setOpenMenuPostId] = useState(null);
    const fileInputRef = useRef(null);
    const router = useRouter();

    // Initialisation du formulaire
    useEffect(() => {
        if (!token) return;
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => setForm({
                name: data.name || user?.name || "",
                bio: data.biography || ""
            }))
            .catch(() => setForm({ name: user?.name || "", bio: "" }));
    }, [token, user?.name]);

    // Récupérer les posts de l'utilisateur (filtrage côté client si besoin)
    useEffect(() => {
        const fetchPosts = async () => {
            if (!token || !user) return;
            setPostsLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                // Filtrer côté client pour ne garder que les posts de l'utilisateur connecté
                const userPosts = Array.isArray(data)
                    ? data.filter((post) => post.user_id === user._id || post.user_id?._id === user._id)
                    : [];
                setPosts(userPosts);
            } else {
                setPosts([]);
            }
            setPostsLoading(false);
        };
        fetchPosts();
    }, [token, user?._id]);

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
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("biography", form.bio);
        if (fileInputRef.current && fileInputRef.current.files[0]) {
            formData.append("avatar", fileInputRef.current.files[0]);
        }
        formData.append("removeAvatar", removeAvatar ? "true" : "false");
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/profile`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });
        setEditing(false);
        setAvatarPreview(null);
        setRemoveAvatar(false);
        router.replace(router.asPath); // Rafraîchit la page sans reload complet
    };

    // Suppression d'un post
    const handleDeletePost = async (postId) => {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${postId}`;
        if (!window.confirm("Voulez-vous vraiment supprimer ce post ?")) return;
        const res = await fetch(url, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
            setPosts((prev) => prev.filter((p) => p._id !== postId));
        } else {
            alert("Erreur lors de la suppression du post.");
        }
        setOpenMenuPostId(null);
    };

    // Fermer le menu contextuel si on clique ailleurs
    useEffect(() => {
        const handleClick = (e) => {
            if (!e.target.closest('.post-menu')) setOpenMenuPostId(null);
        };
        if (openMenuPostId !== null) {
            document.addEventListener('mousedown', handleClick);
        }
        return () => document.removeEventListener('mousedown', handleClick);
    }, [openMenuPostId]);

    // Reset du formulaire
    const handleCancel = () => {
        setEditing(false);
        setForm({ name: user.name || "", bio: "" });
        setAvatarPreview(null);
        setRemoveAvatar(false);
    };

    if (!user) return null;
    if (loading) return <LoadingScreen text="Chargement de la page..." />;
    if (postsLoading) return <LoadingScreen text="Chargement des posts..." />;

    // Avatar à afficher
    const avatarSrc = avatarPreview
        || (user.avatar && !removeAvatar && (user.avatar.startsWith("http") ? user.avatar : `${process.env.NEXT_PUBLIC_BACKEND_URL}${user.avatar}`))
        || null;

    return (
        <Layout headerProps={{ title: user.name || "Profil", showButtons: true }}>
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
                                    title="Changer l'avatar"
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
                                        title="Supprimer la photo"
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
                                    {form.bio || "Ajoutez une bio à votre profil."}
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
                                Sauvegarder
                            </button>
                            <button
                                onClick={handleCancel}
                                className="px-3 py-1 bg-gray-200 rounded text-xs"
                            >
                                Annuler
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setEditing(true)}
                            className="text-red-600 font-semibold text-sm ml-2"
                        >
                            Modifier
                        </button>
                    )}
                </div>
                <div className="flex justify-around mt-4 text-center text-xs text-gray-600">
                    <div>
                        <div className="font-semibold text-gray-800">{user.postsCount ?? posts.length ?? 0}</div>
                        <div>Posts</div>
                    </div>
                    <div>
                        <div className="font-semibold text-gray-800">{user.followersCount ?? "10K"}</div>
                        <div>Abonnés</div>
                    </div>
                    <div>
                        <div className="font-semibold text-gray-800">{user.followingCount ?? "10K"}</div>
                        <div>Abonnements</div>
                    </div>
                </div>
            </div>
            <div className="text-xl font-bold p-4">
                Posts
            </div>
            <div className="space-y-4 px-4 pb-4">
                {postsLoading ? (
                    <div className="text-center text-gray-400">Chargement des posts...</div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-8" style={{ color: "var(--text-secondary)" }}>Aucun post à afficher.</div>
                ) : (
                    posts
                        .sort(
                            (a, b) =>
                                new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt)
                        )
                        .map((post) => (
                            <div key={post._id || post.id} className="bg-white rounded-xl shadow p-4 mb-4">
                                <div className="flex items-center mb-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 overflow-hidden">
                                        {user && user.avatar ? (
                                            <img src={user.avatar.startsWith("http") ? user.avatar : `${process.env.NEXT_PUBLIC_BACKEND_URL}${user.avatar.startsWith("/") ? user.avatar : "/" + user.avatar}`}
                                                alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <svg className="w-full h-full text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="8" r="4" strokeWidth="2" /><path strokeWidth="2" d="M4 20c0-4 8-4 8-4s8 0 8 4" /></svg>
                                        )}
                                    </div>
                                    <div>
                                        <span className="font-semibold text-sm">{user?.name || "Nom"}</span>
                                        <span className="text-gray-400 text-xs ml-1">@{user?.username || "username"}</span>
                                        <div className="text-xs text-gray-400">{post.created_at ? new Date(post.created_at).toLocaleString() : ""}</div>
                                    </div>
                                    <div className="ml-auto text-gray-400 cursor-pointer relative post-menu">
                                        <span onClick={() => setOpenMenuPostId(post._id)}>•••</span>
                                        {openMenuPostId === post._id && (
                                            <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow z-10">
                                                <button
                                                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-800"
                                                    onClick={() => handleDeletePost(post._id)}
                                                >
                                                    Supprimer
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {post.media && post.media !== "" && (
                                    <img src={post.media.startsWith("http") ? post.media : `${process.env.NEXT_PUBLIC_BACKEND_URL}${post.media.startsWith("/") ? post.media : "/" + post.media}`}
                                        alt="post" className="w-full h-48 object-cover rounded-lg mb-2" />
                                )}
                                <p className="text-gray-700 text-sm mb-2">{post.content}</p>
                                {post.tags && post.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {post.tags.map((tag, idx) => (
                                            <span key={idx} className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded">{tag}</span>
                                        ))}
                                    </div>
                                )}
                                <div className="flex items-center gap-4 text-gray-500 text-xl">
                                    <button className="hover:text-red-500"><i className="far fa-heart"></i></button>
                                    <button className="hover:text-blue-500"><i className="far fa-comment"></i></button>
                                    <button className="hover:text-gray-700"><i className="far fa-share-square"></i></button>
                                </div>
                            </div>
                        ))
                )}
            </div>
        </Layout>
    );
}