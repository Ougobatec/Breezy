"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import Layout from "../../components/Layout";
import LoadingScreen from "../../components/LoadingScreen";
import PostCard from "../../components/PostCard";
import SkeletonAvatar from "../../components/SkeletonAvatar";
import { useRouter } from "next/navigation";

export default function SearchPage() {
    const { user, token, loading } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState({
        users: [],
        posts: []
    });
    const [searchLoading, setSearchLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("all"); // all, users, posts, mentions
    const [hasSearched, setHasSearched] = useState(false);
    const router = useRouter();

    // Debounce pour éviter trop de requêtes
    const [debouncedQuery, setDebouncedQuery] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300); // Debounce de 300ms

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fonction de recherche
    const performSearch = useCallback(async (query, type = "all") => {
        console.log("Recherche en cours pour :", query, "Type :", type);
        if (!query || query.trim().length < 2) {
            setSearchResults({ users: [], posts: [] });
            setHasSearched(false);
            return;
        }

        setSearchLoading(true);
        try {
            const endpoint = type === "mentions" 
                ? `/search/mentions?query=${encodeURIComponent(query)}`
                : type === "users"
                    ? `/search/users?query=${encodeURIComponent(query)}`
                    : `/search?query=${encodeURIComponent(query)}&type=${type}`;

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}${endpoint}`,
                {
                    credentials: "include",
                }
            );

            if (!res.ok) throw new Error("Erreur lors de la recherche");
            
            const data = await res.json();
            
            if (type === "users" || type === "mentions") {
                setSearchResults({
                    users: type === "users" ? data : [],
                    posts: type === "mentions" ? data : []
                });
            } else {
                setSearchResults({
                    users: data.users || [],
                    posts: data.posts || []
                });
            }
            
            setHasSearched(true);
        } catch (error) {
            console.error("Erreur de recherche:", error);
            setSearchResults({ users: [], posts: [] });
        }
        setSearchLoading(false);
    }, []);

    // Recherche immédiate (appelée par Entrée ou bouton)
    const handleImmediateSearch = useCallback(() => {
        if (searchQuery && searchQuery.trim().length >= 2) {
            performSearch(searchQuery, activeTab);
        }
    }, [searchQuery, activeTab, performSearch]);

    // Gestion de la touche Entrée
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleImmediateSearch();
        }
    };

    // Effectuer la recherche quand la query debounced change (seulement si pas de recherche manuelle récente)
    useEffect(() => {
        if (debouncedQuery) {
            performSearch(debouncedQuery, activeTab);
        } else {
            setSearchResults({ users: [], posts: [] });
            setHasSearched(false);
        }
    }, [debouncedQuery, activeTab, performSearch]);

    // Gérer le changement d'onglet
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (searchQuery && searchQuery.trim().length >= 2) {
            performSearch(searchQuery, tab);
        }
    };

    // Naviguer vers le profil d'un utilisateur
    const handleUserClick = (userId) => {
        router.push(`/users/${userId}`);
    };

    if (loading) return <LoadingScreen text="Connexion en cours..." />;
    if (!user) return null;

    return (
        <Layout headerProps={{ title: "Recherche" }}>
            <div className="p-4 space-y-4">
                {/* Barre de recherche */}
                <div className="relative flex gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Rechercher des utilisateurs ou du contenu... (Entrée pour rechercher)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                        {searchLoading && (
                            <div className="absolute right-3 top-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            </div>
                        )}
                    </div>
                    
                    {/* Bouton de recherche */}
                    <button
                        onClick={handleImmediateSearch}
                        disabled={searchLoading || !searchQuery || searchQuery.trim().length < 2}
                        className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center min-w-[52px]"
                    >
                        {searchLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <span className="text-xl">🔍</span>
                        )}
                    </button>
                </div>

                {/* Indicateur de recherche automatique */}
                {searchQuery && searchQuery.trim().length >= 2 && !searchLoading && (
                    <div className="text-xs text-gray-500 text-center">
                        Recherche automatique dans {Math.max(0, 300 - (Date.now() % 300))}ms ou appuyez sur Entrée
                    </div>
                )}

                {/* Onglets de filtre */}
                <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
                {[
                        { key: "all", label: "Tout" },
                        { key: "users", label: "Utilisateurs" },
                        { key: "posts", label: "Posts" },
                        { key: "mentions", label: "Mentions" }
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => handleTabChange(tab.key)}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                                activeTab === tab.key
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-gray-600 hover:text-gray-800"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Résultats */}
                {!hasSearched ? (
                    <div className="text-center py-12 text-gray-500">
                        <div className="text-6xl mb-4">🔍</div>
                        <p>Recherchez des utilisateurs ou du contenu</p>
                        <p className="text-sm mt-2">Tapez au moins 2 caractères et appuyez sur Entrée ou attendez 300ms</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Résultats utilisateurs */}
                        {(activeTab === "all" || activeTab === "users") && searchResults.users.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                    Utilisateurs ({searchResults.users.length})
                                </h3>
                                <div className="space-y-3">
                                    {searchResults.users.map((user) => (
                                        <div
                                            key={user._id}
                                            onClick={() => handleUserClick(user._id)}
                                            className="flex items-center bg-white rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
                                        >
                                            <SkeletonAvatar />
                                            <div className="ml-4 flex-1">
                                                <div className="font-medium text-gray-800">
                                                    {user.name}
                                                </div>
                                                <div className="text-gray-500 text-sm">
                                                    @{user.username}
                                                </div>
                                                {user.biography && (
                                                    <div className="text-gray-600 text-sm mt-1 line-clamp-2">
                                                        {user.biography}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Résultats posts */}
                        {(activeTab === "all" || activeTab === "posts" || activeTab === "mentions") && searchResults.posts.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                    {activeTab === "mentions" ? "Posts avec mentions" : "Posts"} ({searchResults.posts.length})
                                </h3>
                                <div className="space-y-4">
                                    {searchResults.posts.map((post) => (
                                        <PostCard
                                            key={post._id}
                                            post={post}
                                            token={token}
                                            currentUser={user}
                                            onLikeUpdate={() => {}}
                                            onDeletePost={() => {}}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Aucun résultat */}
                        {hasSearched && searchResults.users.length === 0 && searchResults.posts.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <div className="text-6xl mb-4">😞</div>
                                <p>Aucun résultat trouvé pour "{searchQuery}"</p>
                                <p className="text-sm mt-2">Essayez avec d'autres mots-clés</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
}