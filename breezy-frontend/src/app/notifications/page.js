"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LoadingScreen from "@/components/LoadingScreen";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

const NotificationItem = ({ notification, onDelete, onMarkAsRead, onNavigate, t, language }) => {
  const getNotificationText = () => {
    switch (notification.type) {
      case 'follow':
        return t('newFollowerText');
      case 'like':
        return t('likeText');
      case 'comment':
        return t('commentText');
      case 'mention':
        return t('mentionText');
      default:
        return notification.content;
    }
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'follow':
        return '👤';
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'mention':
        return '@';
      default:
        return '🔔';
    }
  };

  const handleMarkAsRead = () => {
    if (notification.status === 'unread') {
      onMarkAsRead(notification._id);
    }
  };

  const handleNotificationClick = () => {
    handleMarkAsRead();
    onNavigate(notification);
  };

  return (
    <div 
      className={`flex items-start p-4 rounded-xl overflow-hidden border cursor-pointer hover:opacity-80 relative ${
        notification.status === 'unread' ? 'ring-2' : ''
      }`}
      style={{
        backgroundColor: "var(--card)",
        borderColor: notification.status === 'unread' ? 'var(--primary)' : 'var(--border)'
      }}
      onClick={handleNotificationClick}
    >
      <div className="flex-shrink-0 mr-3">
        {notification.from_user_id?.avatar ? (
          <Image
            src={
              notification.from_user_id.avatar.startsWith("http")
                ? notification.from_user_id.avatar
                : `${process.env.NEXT_PUBLIC_BACKEND_URL}${notification.from_user_id.avatar}`
            }
            alt="Avatar"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full flex items-center justify-center"
               style={{ backgroundColor: "var(--input)" }}>
            <span className="text-lg">{getNotificationIcon()}</span>
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {notification.type === 'follow' ? t('newFollower') : 
               notification.type === 'like' ? t('newLike') :
               notification.type === 'comment' ? t('newComment') :
               t('newMention')} 
              <span className="font-normal ml-1" style={{ color: "var(--text-secondary)" }}>
                @{notification.from_user_id?.username || t('user')}
              </span>
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              {getNotificationText()}
            </p>
            {notification.from_post_id?.content && (
              <p className="text-xs mt-1 truncate" style={{ color: "var(--text-secondary)" }}>
                &ldquo;{notification.from_post_id.content.substring(0, 50)}&hellip;&rdquo;
              </p>
            )}
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              {new Date(notification.created_at).toLocaleString(language === 'fr' ? "fr-FR" : "en-US")}
            </p>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification._id);
            }}
            className="ml-2 p-1 hover:opacity-70"
            style={{ color: "var(--text-secondary)" }}
            aria-label={t('deleteNotification')}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {notification.status === 'unread' && (
          <div className="w-2 h-2 rounded-full absolute right-2 top-2" 
               style={{ backgroundColor: "var(--primary)" }}></div>
        )}
      </div>
    </div>
  );
};

export default function NotificationsPage() {
    const { user, loading } = useAuth();
    const { t, language } = useLanguage();
    const router = useRouter();
    
    // États
    const [notifications, setNotifications] = useState([]);
    const [notificationsLoading, setNotificationsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [unreadCount, setUnreadCount] = useState({ total: 0, like: 0, follow: 0, mention: 0, comment: 0 });
    const [error, setError] = useState("");

    // Fonction pour récupérer les notifications
    const fetchNotifications = useCallback(async () => {
        setNotificationsLoading(true);
        setError("");
        try {
            const url = activeFilter === 'all' 
                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications`
                : `${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications?type=${activeFilter}`;
                
            const res = await fetch(url, {
                credentials: "include",
            });
            
            if (!res.ok) throw new Error("Erreur lors du chargement des notifications");
            const data = await res.json();
            setNotifications(Array.isArray(data) ? data : []);
        } catch (error) {
            setError("Impossible de charger les notifications");
            setNotifications([]);
        } finally {
            setNotificationsLoading(false);
        }
    }, [activeFilter]);

    // Fonction pour récupérer le nombre de notifications non lues
    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/unread-count`,
                { credentials: "include" }
            );
            if (res.ok) {
                const data = await res.json();
                setUnreadCount(data);
            }
        } catch (error) {
            console.error("Erreur lors du chargement du nombre de notifications:", error);
        }
    }, []);

    // Supprimer une notification
    const handleDeleteNotification = async (notificationId) => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/${notificationId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );
            
            if (res.ok) {
                setNotifications(prev => prev.filter(n => n._id !== notificationId));
                fetchUnreadCount();
            }
        } catch (error) {
            console.error("Erreur lors de la suppression:", error);
        }
    };

    // Marquer comme lu
    const handleMarkAsRead = async (notificationId) => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/${notificationId}/read`,
                {
                    method: "PUT",
                    credentials: "include",
                }
            );
            
            if (res.ok) {
                setNotifications(prev => 
                    prev.map(n => 
                        n._id === notificationId ? { ...n, status: 'read' } : n
                    )
                );
                fetchUnreadCount();
            }
        } catch (error) {
            console.error("Erreur lors du marquage comme lu:", error);
        }
    };

    // Marquer tout comme lu
    const handleMarkAllAsRead = async () => {
        try {
            const body = activeFilter === 'all' ? {} : { type: activeFilter };
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/mark-all-read`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                    credentials: "include",
                }
            );
            
            if (res.ok) {
                fetchNotifications();
                fetchUnreadCount();
            }
        } catch (error) {
            console.error("Erreur lors du marquage global:", error);
        }
    };

    // Navigation vers la notification
    const handleNavigateToNotification = (notification) => {
        switch (notification.type) {
            case 'follow':
                if (notification.from_user_id?._id) {
                    router.push(`/users/${notification.from_user_id._id}`);
                }
                break;
            default:
                break;
        }
    };

    // Filtrer les notifications
    const getFilteredNotifications = () => {
        if (activeFilter === 'all') return notifications;
        return notifications.filter(n => n.type === activeFilter);
    };

    // Effets
    useEffect(() => {
        if (loading || !user) return;
        fetchNotifications();
        fetchUnreadCount();
    }, [loading, user, activeFilter, fetchNotifications, fetchUnreadCount]);

    // Rendu conditionnel
    if (!user) return null;
    if (loading) return <LoadingScreen text={t('loading')} />;

    return (
        <Layout headerProps={{ title: t('notifications') }}>
            <div className="p-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                        {t('notifications')}
                    </h1>
                    {unreadCount.total > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="text-sm hover:underline"
                            style={{ color: "var(--primary)" }}
                        >
                            {t('markAllAsRead')}
                        </button>
                    )}
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-xl text-sm text-red-600" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}>
                        {error}
                    </div>
                )}

                {/* Filtres */}
                <div className="flex gap-2 mb-6 overflow-x-auto">
                    <button
                        onClick={() => setActiveFilter('all')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${
                            activeFilter === 'all'
                                ? 'text-white'
                                : 'border'
                        }`}
                        style={{
                            backgroundColor: activeFilter === 'all' ? 'var(--primary)' : 'var(--card)',
                            borderColor: activeFilter === 'all' ? 'var(--primary)' : 'var(--border)',
                            color: activeFilter === 'all' ? 'white' : 'var(--text-primary)'
                        }}
                    >
                        {t('all')} {unreadCount.total > 0 && `(${unreadCount.total})`}
                    </button>
                    <button
                        onClick={() => setActiveFilter('follow')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${
                            activeFilter === 'follow'
                                ? 'text-white'
                                : 'border'
                        }`}
                        style={{
                            backgroundColor: activeFilter === 'follow' ? 'var(--primary)' : 'var(--card)',
                            borderColor: activeFilter === 'follow' ? 'var(--primary)' : 'var(--border)',
                            color: activeFilter === 'follow' ? 'white' : 'var(--text-primary)'
                        }}
                    >
                        {t('followers')} {unreadCount.follow > 0 && `(${unreadCount.follow})`}
                    </button>
                    <button
                        onClick={() => setActiveFilter('like')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${
                            activeFilter === 'like'
                                ? 'text-white'
                                : 'border'
                        }`}
                        style={{
                            backgroundColor: activeFilter === 'like' ? 'var(--primary)' : 'var(--card)',
                            borderColor: activeFilter === 'like' ? 'var(--primary)' : 'var(--border)',
                            color: activeFilter === 'like' ? 'white' : 'var(--text-primary)'
                        }}
                    >
                        {t('likes')} {unreadCount.like > 0 && `(${unreadCount.like})`}
                    </button>
                    <button
                        onClick={() => setActiveFilter('comment')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${
                            activeFilter === 'comment'
                                ? 'text-white'
                                : 'border'
                        }`}
                        style={{
                            backgroundColor: activeFilter === 'comment' ? 'var(--primary)' : 'var(--card)',
                            borderColor: activeFilter === 'comment' ? 'var(--primary)' : 'var(--border)',
                            color: activeFilter === 'comment' ? 'white' : 'var(--text-primary)'
                        }}
                    >
                        {t('comments')} {unreadCount.comment > 0 && `(${unreadCount.comment})`}
                    </button>
                </div>

                {/* Liste des notifications */}
                {notificationsLoading ? (
                    <LoadingScreen text={t('loading')} />
                ) : (
                    <div className="space-y-3">
                        {getFilteredNotifications().length === 0 ? (
                            <div className="text-center py-8" style={{ color: "var(--text-secondary)" }}>
                                {activeFilter === 'all' ? t('noNotifications') : `${t('noNotificationsOfType')} ${activeFilter}`}
                            </div>
                        ) : (
                            getFilteredNotifications().map((notification) => (
                                <NotificationItem
                                    key={notification._id}
                                    notification={notification}
                                    onDelete={handleDeleteNotification}
                                    onMarkAsRead={handleMarkAsRead}
                                    onNavigate={handleNavigateToNotification}
                                    t={t}
                                    language={language}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
}