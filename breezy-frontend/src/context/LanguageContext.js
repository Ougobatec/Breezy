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
    
    // Search
    searchPlaceholder: "Rechercher des utilisateurs, posts ou tags...",
    searchPrompt: "Recherchez des utilisateurs, posts ou tags",
    searchHint: "Saisissez au moins 2 caractères",
    searchTagHint: "Conseil : utilisez # pour les tags (#nature)",
    all: "Tout",
    users: "Utilisateurs",
    tags: "Tags",
    tagsPosts: "Posts avec tags",
    noResults: "Aucun résultat trouvé pour",
    tryOtherKeywords: "Essayez avec d'autres termes de recherche",
    
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
    userNotFound: "Utilisateur non trouvé",
    deleteError: "Erreur lors de la suppression du post.",
    unknownDate: "Date inconnue",
    
    // Comments
    addComment: "Ajouter un commentaire",
    reply: "Répondre",
    yourReply: "Votre réponse...",
    closeComments: "Fermer",
    
    // Subscriptions
    subscribe: "S'abonner",
    unsubscribe: "Se désabonner",
    subscriptions: "Abonnements",
    noSubscriptions: "Aucun abonnement",
    noFollowers: "Aucun abonné",
    noFollowing: "Aucun abonnement",
    loadingFollowers: "Chargement des abonnés...",
    loadingSubscriptions: "Chargement des abonnements...",
    loadingFollowing: "Chargement des abonnements...",
    userIdToFollow: "ID utilisateur à suivre",
    subscribeSuccess: "Abonnement réussi",
    subscribeError: "Erreur lors de l'abonnement",
    unsubscribeError: "Erreur lors du désabonnement",
    
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
    comments: "Commentaires",
    connectingText: "Connexion en cours...",
    loadingNotifications: "Chargement des notifications...",
    noNotifications: "Aucune notification",
    noNotificationsOfType: "Aucune notification de type",
    user: "utilisateur",
    
    // Admin
    admin: {
      title: "Panel d'Administration",
      description: "Gérez les utilisateurs, modérez le contenu et consultez les statistiques de la plateforme",
      accessDenied: "Accès refusé",
      noPermissions: "Vous n'avez pas les permissions nécessaires pour accéder à cette page.",
      loading: "Chargement...",
      
      // Tabs
      tabs: {
        users: "Utilisateurs",
        reportedPosts: "Posts signalés",
        statistics: "Statistiques"
      },
      
      // Users section
      searchUsers: "Rechercher des utilisateurs",
      searchPlaceholder: "Rechercher par nom ou username...",
      search: "Rechercher",
      allRoles: "Tous les rôles",
      noUsersFound: "Aucun utilisateur trouvé",
      
      // Roles
      roles: {
        user: "Utilisateur",
        moderator: "Modérateur",
        admin: "Administrateur"
      },
      
      // Table headers
      table: {
        name: "Nom",
        username: "Username",
        email: "Email",
        role: "Rôle",
        status: "Statut",
        actions: "Actions"
      },
      
      // Status
      status: {
        active: "Actif",
        suspended: "Suspendu",
        banned: "Banni"
      },
      
      // Actions
      actions: {
        suspend: "Suspendre",
        unsuspend: "Lever suspension",
        ban: "Bannir",
        unban: "Lever bannissement"
      },
      
      // Confirmations and messages
      confirmChangeRole: "Changer le rôle de cet utilisateur en {{role}} ?",
      confirmAction: "Êtes-vous sûr de vouloir {{action}} cet utilisateur ?",
      roleChangedSuccess: "Rôle modifié avec succès",
      roleChangeError: "Erreur lors de la modification du rôle",
      actionSuccess: "Action effectuée avec succès",
      actionError: "Erreur lors de l'action",
      
      // Posts section
      reportedPosts: "Posts signalés",
      moderateContent: "Modérez les contenus signalés par la communauté",
      reportsSingular: "signalement",
      reportsPlural: "signalements",
      unknownUser: "Utilisateur inconnu",
      ignore: "Ignorer",
      delete: "Supprimer",
      deletePost: "supprimer ce post",
      ignoreReports: "ignorer les signalements",
      reportReasons: "Raisons des signalements",
      by: "par",
      noReportedPosts: "Aucun post signalé",
      
      // Statistics
      platformStats: "Statistiques de la plateforme",
      keyMetrics: "Aperçu des métriques clés de votre communauté",
      stats: {
        totalUsers: "Total Utilisateurs",
        moderators: "Modérateurs",
        administrators: "Administrateurs",
        suspendedUsers: "Utilisateurs suspendus",
        bannedUsers: "Utilisateurs bannis",
        totalPosts: "Total Posts",
        reportedPosts: "Posts signalés"
      }
    }
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
    
    // Search
    searchPlaceholder: "Search for users, posts or tags...",
    searchPrompt: "Search for users, posts or tags",
    searchHint: "Enter at least 2 characters",
    searchTagHint: "Tip: use # for tags (#nature)",
    all: "All",
    users: "Users",
    tags: "Tags",
    tagsPosts: "Posts with tags",
    noResults: "No results found for",
    tryOtherKeywords: "Try with other search terms",
    
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
    userNotFound: "User not found",
    deleteError: "Error deleting post.",
    unknownDate: "Unknown date",
    
    // Comments
    addComment: "Add a comment",
    reply: "Reply",
    yourReply: "Your reply...",
    closeComments: "Close",
    
    // Subscriptions
    subscribe: "Subscribe",
    unsubscribe: "Unsubscribe",
    subscriptions: "Subscriptions",
    noSubscriptions: "No subscriptions",
    noFollowers: "No followers",
    noFollowing: "No following",
    loadingFollowers: "Loading followers...",
    loadingSubscriptions: "Loading subscriptions...",
    loadingFollowing: "Loading following...",
    userIdToFollow: "User ID to follow",
    subscribeSuccess: "Successfully subscribed",
    subscribeError: "Error subscribing",
    unsubscribeError: "Error unsubscribing",
    
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
    comments: "Comments",
    connectingText: "Connecting...",
    loadingNotifications: "Loading notifications...",
    noNotifications: "No notifications",
    noNotificationsOfType: "No notifications of type",
    user: "user",
    
    // Admin
    admin: {
      title: "Administration Panel",
      description: "Manage users, moderate content and view platform statistics",
      accessDenied: "Access denied",
      noPermissions: "You don't have the necessary permissions to access this page.",
      loading: "Loading...",
      
      // Tabs
      tabs: {
        users: "Users",
        reportedPosts: "Reported Posts",
        statistics: "Statistics"
      },
      
      // Users section
      searchUsers: "Search users",
      searchPlaceholder: "Search by name or username...",
      search: "Search",
      allRoles: "All roles",
      noUsersFound: "No users found",
      
      // Roles
      roles: {
        user: "User",
        moderator: "Moderator",
        admin: "Administrator"
      },
      
      // Table headers
      table: {
        name: "Name",
        username: "Username",
        email: "Email",
        role: "Role",
        status: "Status",
        actions: "Actions"
      },
      
      // Status
      status: {
        active: "Active",
        suspended: "Suspended",
        banned: "Banned"
      },
      
      // Actions
      actions: {
        suspend: "Suspend",
        unsuspend: "Lift suspension",
        ban: "Ban",
        unban: "Lift ban"
      },
      
      // Confirmations and messages
      confirmChangeRole: "Change this user's role to {{role}}?",
      confirmAction: "Are you sure you want to {{action}} this user?",
      roleChangedSuccess: "Role changed successfully",
      roleChangeError: "Error changing role",
      actionSuccess: "Action completed successfully",
      actionError: "Error performing action",
      
      // Posts section
      reportedPosts: "Reported Posts",
      moderateContent: "Moderate content reported by the community",
      reportsSingular: "report",
      reportsPlural: "reports",
      unknownUser: "Unknown user",
      ignore: "Ignore",
      delete: "Delete",
      deletePost: "delete this post",
      ignoreReports: "ignore the reports",
      reportReasons: "Report reasons",
      by: "by",
      noReportedPosts: "No reported posts",
      
      // Statistics
      platformStats: "Platform Statistics",
      keyMetrics: "Overview of your community's key metrics",
      stats: {
        totalUsers: "Total Users",
        moderators: "Moderators",
        administrators: "Administrators",
        suspendedUsers: "Suspended Users",
        bannedUsers: "Banned Users",
        totalPosts: "Total Posts",
        reportedPosts: "Reported Posts"
      }
    }
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

  const t = (key, params = {}) => {
    // Gérer les clés imbriquées comme 'admin.title'
    const getValue = (obj, path) => {
      return path.split('.').reduce((o, p) => o && o[p], obj);
    };
    
    let value = getValue(translations[language], key) || key;
    
    // Gérer l'interpolation de variables {{variable}}
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      Object.keys(params).forEach(param => {
        const regex = new RegExp(`{{${param}}}`, 'g');
        value = value.replace(regex, params[param]);
      });
    }
    
    return value;
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
