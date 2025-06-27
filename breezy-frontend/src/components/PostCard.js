"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import IconButton from "@/components/IconButton";
import Comments from "@/components/Comments";
import { useLanguage } from "@/context/LanguageContext";
import { useActiveVideo } from "@/context/ActiveVideoContext";

export default function PostCard({ post, token, currentUser, onLikeUpdate, onDeletePost, showDeleteOption = false }) {
    const { t, language } = useLanguage();
    
    // États
    const { activeVideoId, setActiveVideoId } = useActiveVideo();
    const [pop, setPop] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [showShareMessage, setShowShareMessage] = useState(false);
    const [showReportDialog, setShowReportDialog] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [isReporting, setIsReporting] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [commentsCount, setCommentsCount] = useState(0);
    const [showErrorMessage, setShowErrorMessage] = useState("");
    const videoRef = useRef(null);
    // Variables dérivées
    const postId = post._id || post.id;

    useEffect(() => {
        if (!videoRef.current) return;
        const video = videoRef.current;
        let observer;
        if (video) {
            observer = new window.IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        video.play();
                    } else {
                        video.pause();
                    }
                },
                { threshold: 0.5 }
            );
            observer.observe(video);
        }
        return () => {
            if (observer && video) observer.unobserve(video);
        };
    }, [videoRef]);

    useEffect(() => {
        if (!videoRef.current) return;
        const video = videoRef.current;
        const handle = () => {
            if (!videoRef.current) return;
            const rect = videoRef.current.getBoundingClientRect();
            const viewportCenter = window.innerHeight / 2;
            const videoCenter = rect.top + rect.height / 2;
            const distance = Math.abs(viewportCenter - videoCenter);
            setActiveVideoId((prev) => {
                // On ne set que si la vidéo est au moins à moitié visible
                if (
                    rect.top < window.innerHeight &&
                    rect.bottom > 0 &&
                    rect.height > 0 &&
                    rect.top + rect.height * 0.5 < window.innerHeight &&
                    rect.bottom - rect.height * 0.5 > 0
                ) {
                    return postId;
                }
                return prev;
            });
        };
        window.addEventListener("scroll", handle, { passive: true });
        window.addEventListener("resize", handle);
        handle();
        return () => {
            window.removeEventListener("scroll", handle);
            window.removeEventListener("resize", handle);
        };
    }, [videoRef, postId, setActiveVideoId]);

    // Récupérer le nombre de commentaires
    useEffect(() => {
        const fetchCommentsCount = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/comments/${postId}/comments`,
                    { credentials: "include" }
                );
                const data = await response.json();
                if (Array.isArray(data)) {
                    // Compter tous les commentaires + leurs réponses
                    const totalCount = data.reduce((total, comment) => {
                        return total + 1 + (comment.replies ? comment.replies.length : 0);
                    }, 0);
                    setCommentsCount(totalCount);
                }
            } catch (error) {
                console.error("Erreur lors du chargement des commentaires:", error);
            }
        };
        
        fetchCommentsCount();
    }, [postId]);

    const isLiked = Array.isArray(post.likes) && currentUser
        ? post.likes.includes(currentUser.id) || post.likes.includes(currentUser._id)
        : false;
    
    const canDeletePost = currentUser && post.user_id && (
        currentUser.id === post.user_id?._id || 
        currentUser._id === post.user_id?._id ||
        currentUser.id === post.user_id ||
        currentUser._id === post.user_id ||
        (showDeleteOption && (currentUser.role === 'moderator' || currentUser.role === 'admin'))
    );

    const isOwnPost = currentUser && (
        currentUser.id === post.user_id?._id || 
        currentUser._id === post.user_id?._id ||
        currentUser.id === post.user_id ||
        currentUser._id === post.user_id
    );

    // Gestion des likes
    const handleLike = useCallback(async () => {
        if (isLiking) return;
        setIsLiking(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${postId}/like`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            const data = await response.json();
            if (response.ok && data.post && onLikeUpdate) {
                onLikeUpdate(data.post.likes);
                setPop(true);
                setTimeout(() => setPop(false), 300);
            }
        } catch (error) {
            console.error("Erreur lors du like:", error);
        } finally {
            setIsLiking(false);
        }
    }, [isLiking, postId, onLikeUpdate]);

    // Suppression du post
    const handleDeletePost = useCallback(async () => {
        if (isDeleting) return;
        
        setIsDeleting(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${postId}`, {
                method: "DELETE",
                credentials: "include",
            });
            
            if (response.ok && onDeletePost) {
                onDeletePost(postId);
            } else {
                setShowErrorMessage(t('deleteError') || 'Erreur lors de la suppression');
                setTimeout(() => setShowErrorMessage(""), 3000);
            }
        } catch (error) {
            setShowErrorMessage(t('deleteError') || 'Erreur lors de la suppression');
            setTimeout(() => setShowErrorMessage(""), 3000);
        } finally {
            setIsDeleting(false);
            setShowMenu(false);
        }
    }, [isDeleting, postId, onDeletePost, t]);

    // Partage
    const handleShare = useCallback(() => {
        setShowShareMessage(true);
        setTimeout(() => setShowShareMessage(false), 3000);
    }, []);

    // Signalement
    const handleReportPost = useCallback(() => {
        setShowReportDialog(true);
        setShowMenu(false);
    }, []);

    const submitReport = useCallback(async () => {
        if (!reportReason.trim()) {
            setShowErrorMessage('Veuillez sélectionner une raison pour le signalement');
            setTimeout(() => setShowErrorMessage(""), 3000);
            return;
        }

        setIsReporting(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${postId}/report`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ reason: reportReason })
            });
            
            if (response.ok) {
                setShowReportDialog(false);
                setReportReason("");
            } else {
                const data = await response.json();
                setShowErrorMessage(data.message || t('reportError') || 'Erreur lors du signalement');
                setTimeout(() => setShowErrorMessage(""), 3000);
            }
        } catch (error) {
            setShowErrorMessage(t('reportError') || 'Erreur lors du signalement');
            setTimeout(() => setShowErrorMessage(""), 3000);
        } finally {
            setIsReporting(false);
        }
    }, [reportReason, postId, t]);

    // Fonction pour rafraîchir le compteur de commentaires
    const refreshCommentsCount = useCallback(async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/comments/${postId}/comments`,
                { credentials: "include" }
            );
            const data = await response.json();
            if (Array.isArray(data)) {
                const totalCount = data.reduce((total, comment) => {
                    return total + 1 + (comment.replies ? comment.replies.length : 0);
                }, 0);
                setCommentsCount(totalCount);
            }
        } catch (error) {
            console.error("Erreur lors du rafraîchissement des commentaires:", error);
        }
    }, [postId]);

    // Gestion du menu
    const toggleMenu = useCallback(() => {
        setShowMenu(!showMenu);
    }, [showMenu]);

    // Effet pour fermer le menu
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.post-menu')) {
                setShowMenu(false);
            }
        };
        
        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showMenu]);

    return (
        <div className="relative rounded-xl overflow-hidden border" 
             style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            
            {/* En-tête du post */}
            <div className="flex items-center p-4">
                {/* Avatar */}
                <div className="flex-shrink-0 mr-3">
                    {post.user_id?.avatar ? (
                        <Image
                            src={post.user_id.avatar.startsWith("http") 
                                ? post.user_id.avatar 
                                : `${process.env.NEXT_PUBLIC_BACKEND_URL}${post.user_id.avatar}`}
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
                    {post.user_id?._id ? (
                        <Link href={`/users/${post.user_id._id}`} 
                              className="flex items-center gap-2 hover:opacity-80">
                            <span className="font-semibold text-sm truncate" 
                                  style={{ color: "var(--text-primary)" }}>
                                {post.user_id?.name || "Utilisateur"}
                            </span>
                            <span className="text-xs flex-shrink-0" 
                                  style={{ color: "var(--text-secondary)" }}>
                                @{post.user_id?.username || "unknown"}
                            </span>
                        </Link>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm" 
                                  style={{ color: "var(--text-primary)" }}>
                                {post.user_id?.name || "Utilisateur inconnu"}
                            </span>
                            <span className="text-xs" 
                                  style={{ color: "var(--text-secondary)" }}>
                                @{post.user_id?.username || "unknown"}
                            </span>
                        </div>
                    )}
                    <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                        {post.created_at
                            ? new Date(post.created_at).toLocaleString(language === 'fr' ? "fr-FR" : "en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                            })
                            : t('unknownDate')}
                    </div>
                </div>

                {/* Menu d'options */}
                {currentUser && (
                    <div className="relative post-menu">
                        <IconButton 
                            icon="dots.svg" 
                            alt="Options" 
                            size={20} 
                            className="p-2 hover:opacity-70"
                            onClick={toggleMenu}
                        />
                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg z-10 border"
                                 style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                                {canDeletePost && (
                                    <button
                                        className="w-full text-left px-4 py-3 text-red-600 hover:opacity-80 text-sm border-b"
                                        style={{ borderColor: "var(--border)" }}
                                        onClick={handleDeletePost}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? `${t('delete')}...` : `🗑️ ${t('delete')}`}
                                    </button>
                                )}
                                {!isOwnPost && (
                                    <button
                                        className="w-full text-left px-4 py-3 text-orange-600 hover:opacity-80 text-sm"
                                        onClick={handleReportPost}
                                    >
                                        🚨 {t('report') || 'Signaler'}
                                    </button>
                                )}
                                {isOwnPost && !canDeletePost && (
                                    <div className="px-4 py-3 text-sm text-center" 
                                         style={{ color: "var(--text-secondary)" }}>
                                        Votre post
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Image ou vidéo du post */}
            {post.media && (
                post.media.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                    <div className="relative">
                        <div className="w-full aspect-[1/1] mb-2" style={{ position: 'relative' }}>
                            <video
                                ref={videoRef}
                                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${post.media}`}
                                autoPlay
                                muted={isMuted}
                                loop
                                playsInline
                                className="w-full h-full object-cover"
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                            />
                            <button
                                type="button"
                                onClick={() => setIsMuted((m) => !m)}
                                className="absolute bottom-2 right-2 bg-black bg-opacity-60 rounded-full p-1 z-10"
                                style={{ outline: 'none', border: 'none' }}
                                tabIndex={0}
                            >
                                <Image
                                    src={isMuted ? "/volume-off.svg" : "/volume-on.svg"}
                                    alt={isMuted ? "Activer le son" : "Couper le son"}
                                    width={18}
                                    height={18}
                                />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full">
                        <Image
                            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${post.media}`}
                            alt="Post"
                            className="w-full aspect-square object-cover"
                            width={600}
                            height={600}
                            unoptimized
                        />
                    </div>
                )
            )}

            {/* Contenu du post */}
            <div className="p-3 pt-2">
                {post.content && (
                    <p className="text-sm mb-2 whitespace-pre-line break-words" 
                       style={{ color: "var(--text-primary)" }}>
                        {post.content}
                    </p>
                )}
                
                {/* Tags */}
                {post.tags?.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-2">
                        {post.tags.map((tag, i) => (
                            <span key={i} 
                                  className="text-xs px-2 py-1 rounded-full border"
                                  style={{ 
                                      borderColor: "var(--border)", 
                                      color: "var(--text-secondary)",
                                      backgroundColor: "var(--input)"
                                  }}>
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1">
                    {/* Like */}
                    <IconButton
                        icon="like.svg"
                        activeIcon="like-active.svg"
                        alt="Like"
                        size={24}
                        className={`p-1${pop ? " pop-animation" : ""}`}
                        onClick={handleLike}
                        isActive={isLiked}
                        disabled={isLiking}
                    />
                    <span className="text-xs mr-3" style={{ color: "var(--text-secondary)" }}>
                        {Array.isArray(post.likes) ? post.likes.length : 0}
                    </span>
                    
                    {/* Comment */}
                    <IconButton
                        onClick={() => setShowComments(!showComments)}
                        icon={showComments ? "comment-active.svg" : "comment.svg"}
                        alt="Comment"
                        size={24}
                        className="p-1"
                    />
                    <span className="text-xs mr-3" style={{ color: "var(--text-secondary)" }}>
                        {commentsCount}
                    </span>
                    
                    {/* Share */}
                    <IconButton
                        onClick={handleShare}
                        icon="share.svg"
                        alt="Share"
                        size={24}
                        className="p-1"
                    />
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        0
                    </span>
                </div>
            </div>

            {/* Message d'erreur */}
            {showErrorMessage && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
                    <div className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm cursor-pointer max-w-xs text-center"
                         onClick={() => setShowErrorMessage("")}>
                        {showErrorMessage}
                    </div>
                </div>
            )}

            {/* Message temporaire pour le partage */}
            {showShareMessage && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
                    <div className="bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-sm cursor-pointer"
                         onClick={() => setShowShareMessage(false)}>
                        Cette fonctionnalité n&apos;est pas disponible pour le moment
                    </div>
                </div>
            )}

            {/* Commentaires */}
            {showComments && (
                <Comments
                    postId={postId}
                    token={token}
                    user={currentUser}
                    onClose={() => {
                        setShowComments(false);
                        refreshCommentsCount();
                    }}
                />
            )}

            {/* Dialog de signalement */}
            {showReportDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
                    <div className="w-full max-w-md rounded-xl p-6 border"
                         style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                        <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                            Signaler ce post
                        </h3>
                        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                            Pourquoi signalez-vous ce post ?
                        </p>
                        
                        <div className="space-y-3 mb-6">
                            {[
                                "Contenu inapproprié",
                                "Spam ou contenu commercial", 
                                "Harcèlement ou intimidation",
                                "Discours de haine",
                                "Violence ou contenu violent",
                                "Fausses informations",
                                "Autre raison"
                            ].map((reason) => (
                                <label key={reason} className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="reportReason"
                                        value={reason}
                                        checked={reportReason === reason}
                                        onChange={(e) => setReportReason(e.target.value)}
                                        style={{ accentColor: "var(--primary)" }}
                                    />
                                    <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                                        {reason}
                                    </span>
                                </label>
                            ))}
                        </div>
                        
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowReportDialog(false);
                                    setReportReason("");
                                }}
                                className="px-4 py-2 text-sm rounded-xl border hover:opacity-80"
                                style={{ 
                                    borderColor: "var(--border)",
                                    backgroundColor: "var(--card)",
                                    color: "var(--text-primary)"
                                }}
                                disabled={isReporting}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={submitReport}
                                disabled={!reportReason.trim() || isReporting}
                                className="px-4 py-2 text-sm text-white rounded-xl hover:opacity-80 disabled:opacity-50"
                                style={{ backgroundColor: "var(--primary)" }}
                            >
                                {isReporting ? 'Signalement...' : 'Signaler'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}