"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";

export default function AdminPanel() {
    const { user, token } = useAuth();
    const { t } = useLanguage();
    
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [reportedPosts, setReportedPosts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [mutedVideos, setMutedVideos] = useState({});

    // Vérifier si l'utilisateur est admin ou modérateur
    const isAdmin = user?.role === 'admin';
    const isModerator = user?.role === 'moderator' || isAdmin;

    const loadUsers = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (selectedRole) params.append('role', selectedRole);
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/users?${params}`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users || []);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des utilisateurs:', error);
        }
    }, [searchTerm, selectedRole]);

    const loadReportedPosts = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/posts/reported`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                setReportedPosts(data.posts || []);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des posts signalés:', error);
        }
    }, []);

    const loadStats = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/stats`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
        }
    }, []);

    const loadData = useCallback(async () => {
        if (!isModerator) return;
        
        setLoading(true);
        try {
            switch (activeTab) {
                case 'users':
                    if (isAdmin) {
                        await loadUsers();
                    }
                    break;
                case 'posts':
                    await loadReportedPosts();
                    break;
                case 'stats':
                    if (isAdmin) {
                        await loadStats();
                    }
                    break;
            }
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        }
        setLoading(false);
    }, [activeTab, isModerator, isAdmin, loadUsers, loadReportedPosts, loadStats]);

    useEffect(() => {
        if (isModerator) {
            loadData();
        }
    }, [loadData, isModerator]);

    const changeUserRole = async (userId, newRole) => {
        if (!window.confirm(t('admin.confirmChangeRole', { role: newRole }))) return;
        
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ role: newRole })
            });
            
            if (response.ok) {
                alert(t('admin.roleChangedSuccess'));
                loadUsers();
            } else {
                const data = await response.json();
                alert(data.message || t('admin.roleChangeError'));
            }
        } catch (error) {
            alert(t('admin.roleChangeError'));
        }
    };

    const moderateUser = async (userId, action, reason = '') => {
        const actionText = {
            suspend: t('admin.actions.suspend'),
            unsuspend: t('admin.actions.unsuspend'),
            ban: t('admin.actions.ban'),
            unban: t('admin.actions.unban')
        };
        
        if (!window.confirm(t('admin.confirmAction', { action: actionText[action] }))) return;
        
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/users/${userId}/moderate`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ action, reason })
            });
            
            if (response.ok) {
                alert(t('admin.actionSuccess'));
                loadUsers();
            } else {
                const data = await response.json();
                alert(data.message || t('admin.actionError'));
            }
        } catch (error) {
            alert(t('admin.actionError'));
        }
    };

    const resolveReport = async (postId, action) => {
        const actionText = action === 'delete' ? t('admin.deletePost') : t('admin.ignoreReports');
        if (!window.confirm(t('admin.confirmAction', { action: actionText }))) return;
        
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/posts/${postId}/resolve`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ action })
            });
            
            if (response.ok) {
                alert(t('admin.actionSuccess'));
                loadReportedPosts();
            } else {
                const data = await response.json();
                alert(data.message || t('admin.actionError'));
            }
        } catch (error) {
            alert(t('admin.actionError'));
        }
    };

    const toggleVideoMute = (postId) => {
        setMutedVideos(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    if (!isModerator) {
        return (
            <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "var(--background)" }}>
                <div className="text-center p-8 rounded-xl border" style={{ 
                    backgroundColor: "var(--card)", 
                    borderColor: "var(--border)" 
                }}>
                    <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                        {t('admin.accessDenied')}
                    </h1>
                    <p style={{ color: "var(--text-secondary)" }}>
                        {t('admin.noPermissions')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
            <div className="max-w-6xl mx-auto p-2 sm:p-6">
                <div className="mb-4 sm:mb-8">
                    <h1 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2" style={{ color: "var(--text-primary)" }}>
                        {t('admin.title')}
                    </h1>
                    <p className="text-xs sm:text-base" style={{ color: "var(--text-secondary)" }}>
                        {t('admin.description')}
                    </p>
                </div>
                
                {/* Navigation */}
                <div className="bg-card rounded-lg border shadow-sm mb-3 sm:mb-6" 
                    style={{ 
                        backgroundColor: "var(--card)", 
                        borderColor: "var(--border)" 
                    }}>
                    <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-4 p-1">
                        {isAdmin && (
                            <button
                                className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 rounded-md font-medium transition-all text-xs sm:text-base ${activeTab === 'users' ? 'shadow-sm' : ''}`}
                                style={{
                                    backgroundColor: activeTab === 'users' ? "var(--primary)" : "transparent",
                                    color: activeTab === 'users' ? "white" : "var(--text-primary)"
                                }}
                                onClick={() => setActiveTab('users')}
                            >
                                <span className="hidden sm:inline">{t('admin.tabs.users')}</span>
                                <span className="sm:hidden text-xs">{t('admin.tabs.users')}</span>
                            </button>
                        )}
                        <button
                            className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 rounded-md font-medium transition-all text-xs sm:text-base ${activeTab === 'posts' ? 'shadow-sm' : ''}`}
                            style={{
                                backgroundColor: activeTab === 'posts' ? "var(--primary)" : "transparent",
                                color: activeTab === 'posts' ? "white" : "var(--text-primary)"
                            }}
                            onClick={() => setActiveTab('posts')}
                        >
                            <span className="hidden sm:inline">{t('admin.tabs.reportedPosts')}</span>
                            <span className="sm:hidden text-xs">{t('admin.tabs.reportedPosts')}</span>
                        </button>
                        {isAdmin && (
                            <button
                                className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 rounded-md font-medium transition-all text-xs sm:text-base ${activeTab === 'stats' ? 'shadow-sm' : ''}`}
                                style={{
                                    backgroundColor: activeTab === 'stats' ? "var(--primary)" : "transparent",
                                    color: activeTab === 'stats' ? "white" : "var(--text-primary)"
                                }}
                                onClick={() => setActiveTab('stats')}
                            >
                                <span className="hidden sm:inline">{t('admin.tabs.statistics')}</span>
                                <span className="sm:hidden text-xs">{t('admin.tabs.statistics')}</span>
                            </button>
                        )}
                    </div>
                </div>

                {loading && (
                    <div className="text-center py-6">
                        <div className="inline-flex items-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-b-transparent" 
                                style={{ borderColor: "var(--primary)" }}></div>
                            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{t('admin.loading')}</span>
                        </div>
                    </div>
                )}                {/* Gestion des utilisateurs */}
                {activeTab === 'users' && isAdmin && (
                    <div className="space-y-4">
                        {/* Filtres de recherche */}
                        <div className="bg-card rounded-lg border shadow-sm p-3 sm:p-6" 
                            style={{ 
                                backgroundColor: "var(--card)", 
                                borderColor: "var(--border)" 
                            }}>
                            <h2 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-4" style={{ color: "var(--text-primary)" }}>
                                {t('admin.searchUsers')}
                            </h2>
                            <div className="space-y-2 sm:space-y-0 sm:flex sm:gap-4">
                                <input
                                    type="text"
                                    placeholder={t('admin.searchPlaceholder')}
                                    className="w-full sm:flex-1 px-2 sm:px-4 py-2 sm:py-3 border rounded-md outline-none focus:ring-2 transition-all text-xs sm:text-base"
                                    style={{
                                        backgroundColor: "var(--input)",
                                        borderColor: "var(--border)",
                                        color: "var(--text-primary)",
                                        "--tw-ring-color": "var(--primary)"
                                    }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <select
                                        className="flex-1 sm:w-auto sm:min-w-[140px] px-2 sm:px-4 py-2 sm:py-3 border rounded-md outline-none focus:ring-2 transition-all text-xs sm:text-base"
                                        style={{
                                            backgroundColor: "var(--input)",
                                            borderColor: "var(--border)",
                                            color: "var(--text-primary)",
                                            "--tw-ring-color": "var(--primary)"
                                        }}
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                    >
                                        <option value="">{t('admin.allRoles')}</option>
                                        <option value="user">{t('admin.roles.user')}</option>
                                        <option value="moderator">{t('admin.roles.moderator')}</option>
                                        <option value="admin">{t('admin.roles.admin')}</option>
                                    </select>
                                    <button
                                        className="flex-1 sm:w-auto px-3 sm:px-6 py-2 sm:py-3 text-white rounded-md font-medium transition-all hover:scale-105 hover:shadow-lg text-xs sm:text-base"
                                        style={{ backgroundColor: "var(--primary)" }}
                                        onClick={loadUsers}
                                    >
                                        {t('admin.search')}
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Liste des utilisateurs */}
                        <div className="bg-card rounded-lg border shadow-sm overflow-hidden" 
                            style={{ 
                                backgroundColor: "var(--card)", 
                                borderColor: "var(--border)" 
                            }}>
                            {/* Vue cartes pour tous les écrans */}
                            <div className="space-y-3 p-3 sm:p-6">
                                {users.map((userItem, index) => (
                                    <div key={userItem._id} className="border rounded-lg p-3 sm:p-4 shadow-sm" 
                                        style={{ 
                                            backgroundColor: "var(--input)", 
                                            borderColor: "var(--border)" 
                                        }}>
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                            {/* Informations utilisateur */}
                                            <div className="flex-1 space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold text-sm sm:text-base" style={{ color: "var(--text-primary)" }}>
                                                            {userItem.name}
                                                        </h3>
                                                        <p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
                                                            @{userItem.username}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        {userItem.banned ? (
                                                            <span className="px-2 py-1 text-xs font-semibold rounded-full" 
                                                                style={{ backgroundColor: "#fef2f2", color: "#dc2626" }}>
                                                                {t('admin.status.banned')}
                                                            </span>
                                                        ) : userItem.suspended ? (
                                                            <span className="px-2 py-1 text-xs font-semibold rounded-full" 
                                                                style={{ backgroundColor: "#fef3c7", color: "#d97706" }}>
                                                                {t('admin.status.suspended')}
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-1 text-xs font-semibold rounded-full" 
                                                                style={{ backgroundColor: "#f0fdf4", color: "#16a34a" }}>
                                                                {t('admin.status.active')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
                                                        {userItem.email}
                                                    </p>
                                                </div>

                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                                            {t('admin.table.role')}:
                                                        </span>
                                                        <select
                                                            value={userItem.role}
                                                            onChange={(e) => changeUserRole(userItem._id, e.target.value)}
                                                            className="text-xs px-2 py-1 border rounded-md outline-none focus:ring-2 transition-all"
                                                            style={{
                                                                backgroundColor: "var(--card)",
                                                                borderColor: "var(--border)",
                                                                color: "var(--text-primary)",
                                                                "--tw-ring-color": "var(--primary)"
                                                            }}
                                                        >
                                                            <option value="user">{t('admin.roles.user')}</option>
                                                            <option value="moderator">{t('admin.roles.moderator')}</option>
                                                            <option value="admin">{t('admin.roles.admin')}</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-wrap gap-1.5 sm:flex-col sm:gap-2">
                                                {!userItem.suspended && (
                                                    <button
                                                        className="px-2 py-1 text-white text-xs rounded-md font-medium transition-all hover:scale-105"
                                                        style={{ backgroundColor: "#f59e0b" }}
                                                        onClick={() => moderateUser(userItem._id, 'suspend')}
                                                    >
                                                        {t('admin.actions.suspend')}
                                                    </button>
                                                )}
                                                {userItem.suspended && (
                                                    <button
                                                        className="px-2 py-1 text-white text-xs rounded-md font-medium transition-all hover:scale-105"
                                                        style={{ backgroundColor: "#10b981" }}
                                                        onClick={() => moderateUser(userItem._id, 'unsuspend')}
                                                    >
                                                        {t('admin.actions.unsuspend')}
                                                    </button>
                                                )}
                                                {!userItem.banned && (
                                                    <button
                                                        className="px-2 py-1 text-white text-xs rounded-md font-medium transition-all hover:scale-105"
                                                        style={{ backgroundColor: "#ef4444" }}
                                                        onClick={() => moderateUser(userItem._id, 'ban')}
                                                    >
                                                        {t('admin.actions.ban')}
                                                    </button>
                                                )}
                                                {userItem.banned && (
                                                    <button
                                                        className="px-2 py-1 text-white text-xs rounded-md font-medium transition-all hover:scale-105"
                                                        style={{ backgroundColor: "var(--primary)" }}
                                                        onClick={() => moderateUser(userItem._id, 'unban')}
                                                    >
                                                        {t('admin.actions.unban')}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {users.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" 
                                            style={{ backgroundColor: "var(--input)" }}>
                                            <svg className="w-8 h-8" style={{ color: "var(--text-secondary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                            </svg>
                                        </div>
                                        <p style={{ color: "var(--text-secondary)" }}>{t('admin.noUsersFound')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}                {/* Posts signalés */}
                {activeTab === 'posts' && (
                    <div className="space-y-4">
                        <div className="bg-card rounded-lg border shadow-sm p-3 sm:p-6" 
                            style={{ 
                                backgroundColor: "var(--card)", 
                                borderColor: "var(--border)" 
                            }}>
                            <h2 className="text-sm sm:text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                                {t('admin.reportedPosts')}
                            </h2>
                            <p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
                                {t('admin.moderateContent')}
                            </p>
                        </div>
                        
                        <div className="space-y-2 sm:space-y-4">
                            {reportedPosts.map(post => (
                            <div 
                                key={post._id} 
                                className="border rounded-lg p-2 sm:p-4 shadow-sm"
                                style={{ 
                                    backgroundColor: "var(--card)", 
                                    borderColor: "var(--border)" 
                                }}
                            >
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 space-y-1 sm:space-y-0">
                                    <div className="flex-1">
                                        <strong className="text-xs sm:text-base" style={{ color: "var(--text-primary)" }}>
                                            @{post.user_id?.username || t('admin.unknownUser')}
                                        </strong>
                                        <div className="mt-0.5">
                                            <span className="inline-block px-1.5 py-0.5 text-xs rounded-full font-medium" 
                                                style={{ 
                                                    backgroundColor: "#fef2f2", 
                                                    color: "#dc2626",
                                                    border: "1px solid #fecaca"
                                                }}>
                                                {post.reports?.length || 0} {(post.reports?.length || 0) > 1 ? t('admin.reportsPlural') : t('admin.reportsSingular')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5 w-full sm:w-auto">
                                        <button
                                            className="flex-1 sm:flex-none px-2 py-1.5 text-white text-xs sm:text-sm rounded-md font-medium transition-all hover:scale-105 hover:shadow-sm"
                                            style={{ backgroundColor: "#10b981" }}
                                            onClick={() => resolveReport(post._id, 'dismiss')}
                                        >
                                            {t('admin.ignore')}
                                        </button>
                                        <button
                                            className="flex-1 sm:flex-none px-2 py-1.5 text-white text-xs sm:text-sm rounded-md font-medium transition-all hover:scale-105 hover:shadow-sm"
                                            style={{ backgroundColor: "#ef4444" }}
                                            onClick={() => resolveReport(post._id, 'delete')}
                                        >
                                            {t('admin.delete')}
                                        </button>
                                    </div>
                                </div>
                                <p className="mb-2 text-xs sm:text-base" style={{ color: "var(--text-primary)" }}>
                                    {post.content}
                                </p>
                                {post.media && (
                                    <div className="mb-2">
                                        {post.media.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                                            <div className="relative max-w-full sm:max-w-xs">
                                                <video
                                                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${post.media}`}
                                                    autoPlay
                                                    muted={mutedVideos[post._id] !== false}
                                                    loop
                                                    playsInline
                                                    className="w-full aspect-square object-cover rounded-md border"
                                                    style={{ borderColor: "var(--border)" }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => toggleVideoMute(post._id)}
                                                    className="absolute bottom-1 right-1 bg-black bg-opacity-60 rounded-full p-1 z-10"
                                                    style={{ outline: 'none', border: 'none' }}
                                                >
                                                    <Image
                                                        src={mutedVideos[post._id] !== false ? "/volume-off.svg" : "/volume-on.svg"}
                                                        alt={mutedVideos[post._id] !== false ? "Activer le son" : "Couper le son"}
                                                        width={16}
                                                        height={16}
                                                    />
                                                </button>
                                            </div>
                                        ) : (
                                            <Image
                                                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${post.media}`}
                                                alt="Post media"
                                                className="max-w-full sm:max-w-xs rounded-md border"
                                                style={{ borderColor: "var(--border)" }}
                                                width={300}
                                                height={300}
                                                unoptimized
                                            />
                                        )}
                                    </div>
                                )}
                                <div className="mt-2 p-2 rounded-md" style={{ backgroundColor: "var(--input)" }}>
                                    <strong className="text-xs sm:text-sm" style={{ color: "var(--text-primary)" }}>
                                        {t('admin.reportReasons')}:
                                    </strong>
                                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                                        {post.reports?.map((report, index) => (
                                            <li key={index} className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
                                                <span style={{ color: "var(--text-primary)" }}>{report.reason}</span> - {t('admin.by')} @{report.user_id?.username || t('admin.unknownUser')}
                                            </li>
                                        ))}
                                    </ul>
                                </div>                                </div>
                            ))}
                            {reportedPosts.length === 0 && (
                                <div className="text-center py-8">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3" 
                                        style={{ backgroundColor: "var(--input)" }}>
                                        <svg className="w-6 h-6" style={{ color: "var(--text-secondary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t('admin.noReportedPosts')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}                {/* Statistiques */}
                {activeTab === 'stats' && isAdmin && stats && (
                    <div className="space-y-4">
                        <div className="bg-card rounded-lg border shadow-sm p-3 sm:p-6" 
                            style={{ 
                                backgroundColor: "var(--card)", 
                                borderColor: "var(--border)" 
                            }}>
                            <h2 className="text-sm sm:text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                                {t('admin.platformStats')}
                            </h2>
                            <p className="text-xs sm:text-base" style={{ color: "var(--text-secondary)" }}>
                                {t('admin.keyMetrics')}
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <div className="p-3 sm:p-6 rounded-lg border shadow-sm" 
                            style={{ 
                                backgroundColor: "var(--card)", 
                                borderColor: "var(--border)" 
                            }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-xs" style={{ color: "var(--text-secondary)" }}>
                                        {t('admin.stats.totalUsers')}
                                    </h3>
                                    <p className="text-lg sm:text-3xl font-bold mt-1" style={{ color: "var(--primary)" }}>
                                        {stats.users.total}
                                    </p>
                                </div>
                                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center" 
                                    style={{ backgroundColor: "var(--input)" }}>
                                    <svg className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: "var(--primary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-3 sm:p-6 rounded-lg border shadow-sm" 
                            style={{ 
                                backgroundColor: "var(--card)", 
                                borderColor: "var(--border)" 
                            }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-xs" style={{ color: "var(--text-secondary)" }}>
                                        {t('admin.stats.moderators')}
                                    </h3>
                                    <p className="text-lg sm:text-3xl font-bold mt-1" style={{ color: "#10b981" }}>
                                        {stats.users.moderators}
                                    </p>
                                </div>
                                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center" 
                                    style={{ backgroundColor: "var(--input)" }}>
                                    <svg className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: "#10b981" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-3 sm:p-6 rounded-lg border shadow-sm" 
                            style={{ 
                                backgroundColor: "var(--card)", 
                                borderColor: "var(--border)" 
                            }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-xs" style={{ color: "var(--text-secondary)" }}>
                                        {t('admin.stats.administrators')}
                                    </h3>
                                    <p className="text-lg sm:text-3xl font-bold mt-1" style={{ color: "#8b5cf6" }}>
                                        {stats.users.admins}
                                    </p>
                                </div>
                                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center" 
                                    style={{ backgroundColor: "var(--input)" }}>
                                    <svg className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: "#8b5cf6" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-3 sm:p-6 rounded-lg border shadow-sm" 
                            style={{ 
                                backgroundColor: "var(--card)", 
                                borderColor: "var(--border)" 
                            }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-xs" style={{ color: "var(--text-secondary)" }}>
                                        {t('admin.stats.suspendedUsers')}
                                    </h3>
                                    <p className="text-lg sm:text-3xl font-bold mt-1" style={{ color: "#f59e0b" }}>
                                        {stats.users.suspended}
                                    </p>
                                </div>
                                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center" 
                                    style={{ backgroundColor: "var(--input)" }}>
                                    <svg className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: "#f59e0b" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-3 sm:p-6 rounded-lg border shadow-sm" 
                            style={{ 
                                backgroundColor: "var(--card)", 
                                borderColor: "var(--border)" 
                            }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-xs" style={{ color: "var(--text-secondary)" }}>
                                        {t('admin.stats.bannedUsers')}
                                    </h3>
                                    <p className="text-lg sm:text-3xl font-bold mt-1" style={{ color: "#ef4444" }}>
                                        {stats.users.banned}
                                    </p>
                                </div>
                                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center" 
                                    style={{ backgroundColor: "var(--input)" }}>
                                    <svg className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: "#ef4444" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-3 sm:p-6 rounded-lg border shadow-sm" 
                            style={{ 
                                backgroundColor: "var(--card)", 
                                borderColor: "var(--border)" 
                            }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-xs" style={{ color: "var(--text-secondary)" }}>
                                        {t('admin.stats.totalPosts')}
                                    </h3>
                                    <p className="text-lg sm:text-3xl font-bold mt-1" style={{ color: "#6366f1" }}>
                                        {stats.posts.total}
                                    </p>
                                </div>
                                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center" 
                                    style={{ backgroundColor: "var(--input)" }}>
                                    <svg className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: "#6366f1" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-3 sm:p-6 rounded-lg border shadow-sm" 
                            style={{ 
                                backgroundColor: "var(--card)", 
                                borderColor: "var(--border)" 
                            }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-xs" style={{ color: "var(--text-secondary)" }}>
                                        {t('admin.stats.reportedPosts')}
                                    </h3>
                                    <p className="text-lg sm:text-3xl font-bold mt-1" style={{ color: "#f97316" }}>
                                        {stats.posts.reported}
                                    </p>
                                </div>
                                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center" 
                                    style={{ backgroundColor: "var(--input)" }}>
                                    <svg className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: "#f97316" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}
