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
    const [posts, setPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [bioDraft, setBioDraft] = useState("");

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

    // Récupérer les posts de l'utilisateur
    useEffect(() => {
        const fetchPosts = async () => {
            if (!token) return;
            setPostsLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/posts`, {
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
        <main className="min-h-screen bg-gray-50 pb-20">
            <Header title="Mon profil" showButtons={false} />
            <section className="flex flex-col items-center w-full max-w-md mx-auto bg-white border-b border-gray-200">
                {/* Avatar et infos */}
                <div className="flex flex-col items-center w-full py-6">
                    <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-2 border-gray-300">
                        {user && user.avatar ? (
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
                            <span className="font-semibold text-lg">{user?.name || "Nom"}</span>
                            <span className="text-gray-500 text-sm">@{user?.username || "username"}</span>
                        </div>
                    </div>
                    <p className="text-center text-gray-700 text-sm mt-2 px-4">
                        {editMode ? (
                            <>
                                <textarea
                                    className="w-full border rounded p-2 text-sm mb-2"
                                    value={bioDraft}
                                    onChange={e => setBioDraft(e.target.value)}
                                    rows={3}
                                    maxLength={200}
                                    autoFocus
                                />
                                <div className="flex gap-2 justify-center">
                                    <button
                                        className="px-4 py-1 rounded bg-gray-200 text-black hover:bg-gray-300 transition"
                                        onClick={() => setEditMode(false)}
                                    >Annuler</button>
                                    <button
                                        className="px-4 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition"
                                        onClick={async () => {
                                            await handleBioUpdate(bioDraft);
                                            setEditMode(false);
                                        }}
                                    >Enregistrer</button>
                                </div>
                            </>
                        ) : (
                            biography || "Ajoutez une bio à votre profil."
                        )}
                    </p>
                    {!editMode && (
                        <button
                            className="mt-2 text-red-600 font-semibold text-sm px-2 py-1 hover:underline"
                            onClick={() => {
                                setBioDraft(biography);
                                setEditMode(true);
                            }}
                        >Modifier</button>
                    )}
                    <div className="flex justify-center gap-8 mt-4 w-full">
                        <div className="flex flex-col items-center">
                            <span className="font-semibold">{user?.postsCount ?? posts.length}</span>
                            <span className="text-xs text-gray-500">Posts</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="font-semibold">{user?.followersCount ?? "10K"}</span>
                            <span className="text-xs text-gray-500">Abonnés</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="font-semibold">{user?.followingCount ?? "10K"}</span>
                            <span className="text-xs text-gray-500">Abonnements</span>
                        </div>
                    </div>
                </div>
            </section>
            {/* Section Posts */}
            <section className="w-full max-w-md mx-auto mt-4">
                <h2 className="text-xl font-bold text-gray-800 mb-2 px-4">Posts</h2>
                {postsLoading ? (
                    <div className="text-center text-gray-400">Chargement des posts...</div>
                ) : posts.length === 0 ? (
                    <div className="text-center text-gray-400">Aucun post trouvé.</div>
                ) : (
                    posts.map((post) => (
                        <div key={post._id} className="bg-white rounded-xl shadow p-4 mb-4">
                            <div className="flex items-center mb-2">
                                <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 overflow-hidden">
                                    {user && user.avatar ? (
                                        <img src={user.avatar.startsWith("http") ? user.avatar : `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}${user.avatar.startsWith("/") ? user.avatar : "/" + user.avatar}`}
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
                                <div className="ml-auto text-gray-400 cursor-pointer">•••</div>
                            </div>
                            {post.media && post.media !== "" && (
                                <img src={post.media.startsWith("http") ? post.media : `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}${post.media.startsWith("/") ? post.media : "/" + post.media}`}
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
            </section>
            <BottomNav />
        </main>
    );
}
