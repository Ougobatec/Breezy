"use client";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Layout from "@/components/Layout";
import LoadingScreen from "@/components/LoadingScreen";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const NotificationItem = ({ notification, onDelete, onMarkAsRead, t, language }) => {
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

  return (
    <div 
      className={`flex items-start p-3 mb-2 rounded-xl ${
        notification.status === 'unread' ? 'bg-blue-50' : 'bg-white'
      }`}
      onClick={handleMarkAsRead}
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
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-lg">{getNotificationIcon()}</span>
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {notification.type === 'follow' ? t('newFollower') : 
               notification.type === 'like' ? t('newLike') :
               notification.type === 'comment' ? t('newComment') :
               t('newMention')} 
              <span className="font-normal text-gray-600 ml-1">
                @{notification.from_user_id?.username || t('user')}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {getNotificationText()}
            </p>
            {notification.from_post_id?.content && (
              <p className="text-xs text-gray-400 mt-1 truncate">
                &ldquo;{notification.from_post_id.content.substring(0, 50)}&hellip;&rdquo;
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {new Date(notification.created_at).toLocaleString(language === 'fr' ? "fr-FR" : "en-US")}
            </p>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification._id);
            }}
            className="ml-2 p-1 text-gray-400 hover:text-red-500"
            aria-label={t('deleteNotification')}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {notification.status === 'unread' && (
          <div className="w-2 h-2 bg-blue-500 rounded-full absolute right-2 top-2"></div>
        )}
      </div>
    </div>
  );
};

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const { t, language } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState({ total: 0, like: 0, follow: 0, mention: 0 });

  useEffect(() => {
    if (loading || !user) return;
    fetchNotifications();
    fetchUnreadCount();
  }, [loading, user, activeFilter]);

  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const url = activeFilter === 'all' 
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications?type=${activeFilter}`;
        
      const res = await fetch(url, {
        credentials: "include",
      });
      
      if (!res.ok) throw new Error(t('loadingNotifications'));
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur:", error);
      setNotifications([]);
    }
    setNotificationsLoading(false);
  };

  const fetchUnreadCount = async () => {
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
  };

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

  const getFilteredNotifications = () => {
    if (activeFilter === 'all') return notifications;
    return notifications.filter(n => n.type === activeFilter);
  };

  if (loading) return <LoadingScreen text={t('connectingText')} />;
  if (!user) return null;
  if (notificationsLoading) return <LoadingScreen text={t('loadingNotifications')} />;

  return (
    <Layout headerProps={{ title: t('notifications') }}>
      {/* Header avec bouton marquer tout comme lu */}
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-xl font-bold">{t('notifications')}</h1>
        {unreadCount.total > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-blue-600 hover:underline"
          >
            {t('markAllAsRead')}
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex gap-2 p-4 bg-gray-50">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1 rounded-full text-sm ${
            activeFilter === 'all'
              ? 'bg-red-500 text-white'
              : 'bg-white text-gray-600 border'
          }`}
        >
          {t('all')} {unreadCount.total > 0 && `(${unreadCount.total})`}
        </button>
        <button
          onClick={() => setActiveFilter('follow')}
          className={`px-3 py-1 rounded-full text-sm ${
            activeFilter === 'follow'
              ? 'bg-red-500 text-white'
              : 'bg-white text-gray-600 border'
          }`}
        >
          {t('followers')} {unreadCount.follow > 0 && `(${unreadCount.follow})`}
        </button>
        <button
          onClick={() => setActiveFilter('like')}
          className={`px-3 py-1 rounded-full text-sm ${
            activeFilter === 'like'
              ? 'bg-red-500 text-white'
              : 'bg-white text-gray-600 border'
          }`}
        >
          {t('likes')} {unreadCount.like > 0 && `(${unreadCount.like})`}
        </button>
        <button
          onClick={() => setActiveFilter('mention')}
          className={`px-3 py-1 rounded-full text-sm ${
            activeFilter === 'mention'
              ? 'bg-red-500 text-white'
              : 'bg-white text-gray-600 border'
          }`}
        >
          {t('mentions')} {unreadCount.mention > 0 && `(${unreadCount.mention})`}
        </button>
      </div>

      {/* Liste des notifications */}
      <div className="p-4">
        {getFilteredNotifications().length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            {activeFilter === 'all' ? t('noNotifications') : `${t('noNotificationsOfType')} ${activeFilter}`}
          </div>
        ) : (
          getFilteredNotifications().map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onDelete={handleDeleteNotification}
              onMarkAsRead={handleMarkAsRead}
              t={t}
              language={language}
            />
          ))
        )}
      </div>
    </Layout>
  );
}