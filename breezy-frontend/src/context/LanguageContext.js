"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  fr: {
    // Navigation
    home: "Accueil",
    search: "Recherche",
    publish: "Publier",
    profile: "Profil",
    menu: "Menu",
    settings: "Paramètres",
    
    // Common
    loading: "Chargement...",
    cancel: "Annuler",
    save: "Sauvegarder",
    delete: "Supprimer",
    confirm: "Confirmer",
    edit: "Modifier",
    close: "Fermer",
    
    // Auth
    login: "Se connecter",
    register: "S'inscrire",
    logout: "Se déconnecter",
    email: "Email",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    username: "Nom d'utilisateur",
    name: "Nom",
    forgotPassword: "Mot de passe oublié ?",
    
    // Posts
    newPost: "Nouveau post",
    writePost: "Rédiger un post",
    addImage: "Ajouter une image",
    addTag: "Ajouter un tag",
    publish: "Publier",
    publishing: "Publication...",
    publishPost: "Publier un post",
    removeTag: "Supprimer le tag",
    publishError: "Erreur lors de la publication.",
    like: "J'aime",
    comment: "Commenter",
    share: "Partager",
    
    // Profile
    posts: "Posts",
    followers: "Abonnés",
    following: "Abonnements",
    editProfile: "Modifier le profil",
    biography: "Biographie",
    addBio: "Ajoutez une bio à votre profil.",
    changeAvatar: "Changer l'avatar",
    deletePhoto: "Supprimer la photo",
    loadingProfile: "Chargement de la page...",
    loadingPosts: "Chargement des posts...",
    
    // Settings
    language: "Langue",
    french: "Français",
    english: "English",
    selectLanguage: "Sélectionner une langue",
    theme: "Thème",
    light: "Clair",
    dark: "Sombre",
    system: "Système",
    
    // Messages
    welcomeMessage: "Bienvenue",
    noPostsMessage: "Aucun post à afficher.",
    deletePostConfirm: "Voulez-vous vraiment supprimer ce post ?",
    
    // Comments
    addComment: "Ajouter un commentaire",
    reply: "Répondre",
    yourReply: "Votre réponse...",
    
    // Subscriptions
    subscribe: "S'abonner",
    unsubscribe: "Se désabonner",
    subscriptions: "Abonnements",
    noSubscriptions: "Aucun abonnement",
    noFollowers: "Aucun abonné",
    
    // Notifications
    notifications: "Notifications",
    newFollower: "Nouveau follower",
    newLike: "Nouveau like",
    newComment: "Nouveau commentaire",
    newMention: "Nouvelle mention",
    newFollowerText: "Vous avez un nouvel abonné",
    likeText: "Quelqu'un a aimé votre post",
    commentText: "Quelqu'un a commenté votre post",
    mentionText: "Quelqu'un vous a mentionné dans son post",
    markAllAsRead: "Tout marquer comme lu",
    deleteNotification: "Supprimer la notification",
    all: "Toutes",
    likes: "Likes",
    mentions: "Mentions",
    connectingText: "Connexion en cours...",
    loadingNotifications: "Chargement des notifications...",
    noNotifications: "Aucune notification",
    noNotificationsOfType: "Aucune notification de type",
    user: "utilisateur"
  },
  en: {
    // Navigation
    home: "Home",
    search: "Search",
    publish: "Publish",
    profile: "Profile",
    menu: "Menu",
    settings: "Settings",
    
    // Common
    loading: "Loading...",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    confirm: "Confirm",
    edit: "Edit",
    close: "Close",
    
    // Auth
    login: "Login",
    register: "Register",
    logout: "Logout",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    username: "Username",
    name: "Name",
    forgotPassword: "Forgot password?",
    
    // Posts
    newPost: "New post",
    writePost: "Write a post",
    addImage: "Add an image",
    addTag: "Add a tag",
    publish: "Publish",
    publishing: "Publishing...",
    publishPost: "Publish a post",
    removeTag: "Remove tag",
    publishError: "Error publishing post.",
    like: "Like",
    comment: "Comment",
    share: "Share",
    
    // Profile
    posts: "Posts",
    followers: "Followers",
    following: "Following",
    editProfile: "Edit profile",
    biography: "Biography",
    addBio: "Add a bio to your profile.",
    changeAvatar: "Change avatar",
    deletePhoto: "Delete photo",
    loadingProfile: "Loading page...",
    loadingPosts: "Loading posts...",
    
    // Settings
    language: "Language",
    french: "Français",
    english: "English",
    selectLanguage: "Select a language",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",
    
    // Messages
    welcomeMessage: "Welcome",
    noPostsMessage: "No posts to display.",
    deletePostConfirm: "Do you really want to delete this post?",
    
    // Comments
    addComment: "Add a comment",
    reply: "Reply",
    yourReply: "Your reply...",
    
    // Subscriptions
    subscribe: "Subscribe",
    unsubscribe: "Unsubscribe",
    subscriptions: "Subscriptions",
    noSubscriptions: "No subscriptions",
    noFollowers: "No followers",
    
    // Notifications
    notifications: "Notifications",
    newFollower: "New follower",
    newLike: "New like",
    newComment: "New comment",
    newMention: "New mention",
    newFollowerText: "You have a new follower",
    likeText: "Someone liked your post",
    commentText: "Someone commented on your post",
    mentionText: "Someone mentioned you in their post",
    markAllAsRead: "Mark all as read",
    deleteNotification: "Delete notification",
    all: "All",
    likes: "Likes",
    mentions: "Mentions",
    connectingText: "Connecting...",
    loadingNotifications: "Loading notifications...",
    noNotifications: "No notifications",
    noNotificationsOfType: "No notifications of type",
    user: "user"
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('fr');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
