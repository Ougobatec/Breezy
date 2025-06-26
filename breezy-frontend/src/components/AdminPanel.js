"use client";
import { useState, useEffect } from "react";
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

    // Vérifier si l'utilisateur est admin ou modérateur
    const isAdmin = user?.role === 'admin';
    const isModerator = user?.role === 'moderator' || isAdmin;

    useEffect(() => {
        if (isModerator) {
            loadData();
        }
    }, [activeTab, isModerator]);

    const loadData = async () => {
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
    };

    const loadUsers = async () => {
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
    };

    const loadReportedPosts = async () => {
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
    };

    const loadStats = async () => {
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
    };

    const changeUserRole = async (userId, newRole) => {
        if (!window.confirm(`Changer le rôle de cet utilisateur en ${newRole} ?`)) return;
        
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
                alert('Rôle modifié avec succès');
                loadUsers();
            } else {
                const data = await response.json();
                alert(data.message || 'Erreur lors de la modification du rôle');
            }
        } catch (error) {
            alert('Erreur lors de la modification du rôle');
        }
    };

    const moderateUser = async (userId, action, reason = '') => {
        const actionText = {
            suspend: 'suspendre',
            unsuspend: 'lever la suspension de',
            ban: 'bannir',
            unban: 'lever le bannissement de'
        };
        
        if (!window.confirm(`Êtes-vous sûr de vouloir ${actionText[action]} cet utilisateur ?`)) return;
        
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
                alert('Action effectuée avec succès');
                loadUsers();
            } else {
                const data = await response.json();
                alert(data.message || 'Erreur lors de l\'action');
            }
        } catch (error) {
            alert('Erreur lors de l\'action');
        }
    };

    const resolveReport = async (postId, action) => {
        const actionText = action === 'delete' ? 'supprimer ce post' : 'ignorer les signalements';
        if (!window.confirm(`Êtes-vous sûr de vouloir ${actionText} ?`)) return;
        
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
                alert('Action effectuée avec succès');
                loadReportedPosts();
            } else {
                const data = await response.json();
                alert(data.message || 'Erreur lors de l\'action');
            }
        } catch (error) {
            alert('Erreur lors de l\'action');
        }
    };

    if (!isModerator) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Accès refusé</h1>
                    <p>Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Panel d&apos;Administration</h1>
            
            {/* Navigation */}
            <div className="flex space-x-4 mb-6 border-b">
                {isAdmin && (
                    <button
                        className={`pb-2 px-4 ${activeTab === 'users' ? 'border-b-2 border-blue-500' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Utilisateurs
                    </button>
                )}
                <button
                    className={`pb-2 px-4 ${activeTab === 'posts' ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={() => setActiveTab('posts')}
                >
                    Posts signalés
                </button>
                {isAdmin && (
                    <button
                        className={`pb-2 px-4 ${activeTab === 'stats' ? 'border-b-2 border-blue-500' : ''}`}
                        onClick={() => setActiveTab('stats')}
                    >
                        Statistiques
                    </button>
                )}
            </div>

            {loading && <div className="text-center py-4">Chargement...</div>}

            {/* Gestion des utilisateurs */}
            {activeTab === 'users' && isAdmin && (
                <div>
                    <div className="flex gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Rechercher un utilisateur..."
                            className="flex-1 px-4 py-2 border rounded"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select
                            className="px-4 py-2 border rounded"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                        >
                            <option value="">Tous les rôles</option>
                            <option value="user">Utilisateur</option>
                            <option value="moderator">Modérateur</option>
                            <option value="admin">Administrateur</option>
                        </select>
                        <button
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            onClick={loadUsers}
                        >
                            Rechercher
                        </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border p-2 text-left">Nom</th>
                                    <th className="border p-2 text-left">Username</th>
                                    <th className="border p-2 text-left">Email</th>
                                    <th className="border p-2 text-left">Rôle</th>
                                    <th className="border p-2 text-left">Statut</th>
                                    <th className="border p-2 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user._id}>
                                        <td className="border p-2">{user.name}</td>
                                        <td className="border p-2">@{user.username}</td>
                                        <td className="border p-2">{user.email}</td>
                                        <td className="border p-2">
                                            <select
                                                value={user.role}
                                                onChange={(e) => changeUserRole(user._id, e.target.value)}
                                                className="px-2 py-1 border rounded text-sm"
                                            >
                                                <option value="user">Utilisateur</option>
                                                <option value="moderator">Modérateur</option>
                                                <option value="admin">Administrateur</option>
                                            </select>
                                        </td>
                                        <td className="border p-2">
                                            {user.banned ? (
                                                <span className="text-red-600 font-semibold">Banni</span>
                                            ) : user.suspended ? (
                                                <span className="text-orange-600 font-semibold">Suspendu</span>
                                            ) : (
                                                <span className="text-green-600">Actif</span>
                                            )}
                                        </td>
                                        <td className="border p-2">
                                            <div className="flex gap-1">
                                                {!user.suspended && (
                                                    <button
                                                        className="px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
                                                        onClick={() => moderateUser(user._id, 'suspend')}
                                                    >
                                                        Suspendre
                                                    </button>
                                                )}
                                                {user.suspended && (
                                                    <button
                                                        className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                                        onClick={() => moderateUser(user._id, 'unsuspend')}
                                                    >
                                                        Lever suspension
                                                    </button>
                                                )}
                                                {!user.banned && (
                                                    <button
                                                        className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                                        onClick={() => moderateUser(user._id, 'ban')}
                                                    >
                                                        Bannir
                                                    </button>
                                                )}
                                                {user.banned && (
                                                    <button
                                                        className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                                                        onClick={() => moderateUser(user._id, 'unban')}
                                                    >
                                                        Lever bannissement
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Posts signalés */}
            {activeTab === 'posts' && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">Posts signalés</h2>
                    <div className="space-y-4">
                        {reportedPosts.map(post => (
                            <div key={post._id} className="border rounded p-4 bg-white">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <strong>@{post.user_id?.username || 'Utilisateur inconnu'}</strong>
                                        <span className="text-red-600 ml-2">
                                            ({post.reports?.length || 0} signalement{post.reports?.length > 1 ? 's' : ''})
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                            onClick={() => resolveReport(post._id, 'dismiss')}
                                        >
                                            Ignorer
                                        </button>
                                        <button
                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                            onClick={() => resolveReport(post._id, 'delete')}
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                                <p className="mb-2">{post.content}</p>
                                {post.media && (
                                    <Image
                                        src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${post.media}`} 
                                        alt="Post media" 
                                        className="max-w-xs rounded"
                                    />
                                )}
                                <div className="mt-2 text-sm text-gray-600">
                                    <strong>Raisons des signalements:</strong>
                                    <ul className="list-disc list-inside">
                                        {post.reports?.map((report, index) => (
                                            <li key={index}>
                                                {report.reason} - par @{report.user_id?.username || 'Utilisateur inconnu'}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                        {reportedPosts.length === 0 && (
                            <p className="text-center text-gray-500 py-8">Aucun post signalé</p>
                        )}
                    </div>
                </div>
            )}

            {/* Statistiques */}
            {activeTab === 'stats' && isAdmin && stats && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">Statistiques</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-blue-100 p-4 rounded">
                            <h3 className="font-semibold">Total Utilisateurs</h3>
                            <p className="text-2xl font-bold text-blue-600">{stats.users.total}</p>
                        </div>
                        <div className="bg-green-100 p-4 rounded">
                            <h3 className="font-semibold">Modérateurs</h3>
                            <p className="text-2xl font-bold text-green-600">{stats.users.moderators}</p>
                        </div>
                        <div className="bg-purple-100 p-4 rounded">
                            <h3 className="font-semibold">Administrateurs</h3>
                            <p className="text-2xl font-bold text-purple-600">{stats.users.admins}</p>
                        </div>
                        <div className="bg-yellow-100 p-4 rounded">
                            <h3 className="font-semibold">Utilisateurs suspendus</h3>
                            <p className="text-2xl font-bold text-yellow-600">{stats.users.suspended}</p>
                        </div>
                        <div className="bg-red-100 p-4 rounded">
                            <h3 className="font-semibold">Utilisateurs bannis</h3>
                            <p className="text-2xl font-bold text-red-600">{stats.users.banned}</p>
                        </div>
                        <div className="bg-indigo-100 p-4 rounded">
                            <h3 className="font-semibold">Total Posts</h3>
                            <p className="text-2xl font-bold text-indigo-600">{stats.posts.total}</p>
                        </div>
                        <div className="bg-orange-100 p-4 rounded">
                            <h3 className="font-semibold">Posts signalés</h3>
                            <p className="text-2xl font-bold text-orange-600">{stats.posts.reported}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
