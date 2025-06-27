"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LoadingScreen from "@/components/LoadingScreen";
import Layout from "@/components/Layout";
import PostCard from "@/components/PostCard";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function SearchPage() {
    const { user, token, loading } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState({
        users: [],
        posts: []
    });
    const [searchLoading, setSearchLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("all"); // all, users, posts, tags
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState("");

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
        if (!query || query.trim().length < 2) {
            setSearchResults({ users: [], posts: [] });
            setHasSearched(false);
            return;
        }

        setSearchLoading(true);
        setError("");
        try {
            const endpoint = type === "tags" 
                ? `/search/tags?query=${encodeURIComponent(query)}`
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
            
            if (type === "users" || type === "tags") {
                setSearchResults({
                    users: type === "users" ? data : [],
                    posts: type === "tags" ? data : []
                });
            } else {
                setSearchResults({
                    users: data.users || [],
                    posts: data.posts || []
                });
            }
            
            setHasSearched(true);
        } catch (error) {
            setError("Impossible d'effectuer la recherche");
            setSearchResults({ users: [], posts: [] });
        } finally {
            setSearchLoading(false);
        }
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

    // Effectuer la recherche quand la query debounced change
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

    // Rendu conditionnel
    if (!user) return null;
    if (loading) return <LoadingScreen text={t('loading')} />;

    return (
        <Layout headerProps={{ title: t('search') }}>
            <div className="p-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                        {t('search')}
                    </h1>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-xl text-sm text-red-600" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}>
                        {error}
                    </div>
                )}

                {/* Barre de recherche */}
                <div className="relative flex gap-2 mb-6">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2"
                            style={{
                                backgroundColor: "var(--input)",
                                borderColor: "var(--border)",
                                color: "var(--text-primary)",
                                borderWidth: "1px"
                            }}
                        />
                        {searchLoading && (
                            <div className="absolute right-3 top-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: "var(--primary)" }}></div>
                            </div>
                        )}
                    </div>
                    
                    {/* Bouton de recherche */}
                    <button
                        onClick={handleImmediateSearch}
                        disabled={searchLoading || !searchQuery || searchQuery.trim().length < 2}
                        className="px-4 py-3 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[52px]"
                        style={{ backgroundColor: "var(--primary)" }}
                    >
                        {searchLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Filtres */}
                <div className="flex gap-2 mb-6 overflow-x-auto">
                    <button
                        onClick={() => handleTabChange('all')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${
                            activeTab === 'all'
                                ? 'text-white'
                                : 'border'
                        }`}
                        style={{
                            backgroundColor: activeTab === 'all' ? 'var(--primary)' : 'var(--card)',
                            borderColor: activeTab === 'all' ? 'var(--primary)' : 'var(--border)',
                            color: activeTab === 'all' ? 'white' : 'var(--text-primary)'
                        }}
                    >
                        {t('all')}
                    </button>
                    <button
                        onClick={() => handleTabChange('users')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${
                            activeTab === 'users'
                                ? 'text-white'
                                : 'border'
                        }`}
                        style={{
                            backgroundColor: activeTab === 'users' ? 'var(--primary)' : 'var(--card)',
                            borderColor: activeTab === 'users' ? 'var(--primary)' : 'var(--border)',
                            color: activeTab === 'users' ? 'white' : 'var(--text-primary)'
                        }}
                    >
                        {t('users')}
                    </button>
                    <button
                        onClick={() => handleTabChange('posts')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${
                            activeTab === 'posts'
                                ? 'text-white'
                                : 'border'
                        }`}
                        style={{
                            backgroundColor: activeTab === 'posts' ? 'var(--primary)' : 'var(--card)',
                            borderColor: activeTab === 'posts' ? 'var(--primary)' : 'var(--border)',
                            color: activeTab === 'posts' ? 'white' : 'var(--text-primary)'
                        }}
                    >
                        {t('posts')}
                    </button>
                    <button
                        onClick={() => handleTabChange('tags')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${
                            activeTab === 'tags'
                                ? 'text-white'
                                : 'border'
                        }`}
                        style={{
                            backgroundColor: activeTab === 'tags' ? 'var(--primary)' : 'var(--card)',
                            borderColor: activeTab === 'tags' ? 'var(--primary)' : 'var(--border)',
                            color: activeTab === 'tags' ? 'white' : 'var(--text-primary)'
                        }}
                    >
                        {t('tags')}
                    </button>
                </div>

                {/* Résultats */}
                {!hasSearched ? (
                    <div className="text-center py-12" style={{ color: "var(--text-secondary)" }}>
                        <div className="text-6xl mb-4">🔍</div>
                        <p>{t('searchPrompt')}</p>
                        <p className="text-sm mt-2">
                            {t('searchHint')}
                        </p>
                        <p className="text-xs mt-1 opacity-75">
                            {t('searchTagHint')}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Résultats utilisateurs */}
                        {(activeTab === "all" || activeTab === "users") && searchResults.users.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                                    {t('users')} ({searchResults.users.length})
                                </h3>
                                <div className="space-y-3">
                                    {searchResults.users.map((user) => (
                                        <div
                                            key={user._id}
                                            onClick={() => handleUserClick(user._id)}
                                            className="flex items-start p-4 rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
                                            style={{ backgroundColor: "var(--card)" }}
                                        >
                                            {/* Avatar */}
                                            <div className="flex-shrink-0 mr-3">
                                                {user.avatar ? (
                                                    <Image
                                                        src={
                                                            user.avatar.startsWith("http")
                                                                ? user.avatar
                                                                : `${process.env.NEXT_PUBLIC_BACKEND_URL}${user.avatar}`
                                                        }
                                                        alt="Avatar"
                                                        width={40}
                                                        height={40}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                                                         style={{ backgroundColor: "var(--input)" }}>
                                                        <Image
                                                            src="/avatar.svg"
                                                            alt="Avatar"
                                                            width={24}
                                                            height={24}
                                                            className="w-6 h-6"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Informations utilisateur */}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                                                    {user.name}
                                                </div>
                                                <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                                                    @{user.username}
                                                </div>
                                                {user.biography && (
                                                    <div className="text-xs mt-1 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
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
                        {(activeTab === "all" || activeTab === "posts" || activeTab === "tags") && searchResults.posts.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                                    {activeTab === "tags" 
                                        ? t('tagsPosts') 
                                        : t('posts')} ({searchResults.posts.length})
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
                            <div className="text-center py-12" style={{ color: "var(--text-secondary)" }}>
                                <div className="text-6xl mb-4">😞</div>
                                <p>{t('noResults')} &quot;{searchQuery}&quot;</p>
                                <p className="text-sm mt-2">
                                    {t('tryOtherKeywords')}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
}