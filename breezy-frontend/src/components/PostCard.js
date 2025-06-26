"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import IconButton from "@/components/IconButton";
import Comments from "@/components/Comments";
import { useLanguage } from "@/context/LanguageContext";
import { useActiveVideo } from "@/context/ActiveVideoContext";

export default function PostCard({ post, token, currentUser, onLikeUpdate, onDeletePost, showDeleteOption = false }) {
    const { t, language } = useLanguage();
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
    const videoRef = useRef(null);
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

    const isLiked =
        Array.isArray(post.likes) && currentUser
            ? post.likes.includes(currentUser.id) || post.likes.includes(currentUser._id)
            : false;

    const handleLike = async () => {
        if (isLiking) return;
        setIsLiking(true);
        try {
            const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${postId}/like`;
            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
            const data = await response.json();
            if (response.ok && data.post && onLikeUpdate) {
                onLikeUpdate(data.post.likes);
                setPop(true);
                setTimeout(() => setPop(false), 300);
            }
        } catch { }
        setIsLiking(false);
    };

    const handleDeletePost = async () => {
        if (isDeleting) return;
        if (!window.confirm(t('deletePostConfirm'))) return;
        
        setIsDeleting(true);
        try {
            const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${postId}`;
            const response = await fetch(url, {
                method: "DELETE",
                credentials: "include",
            });
            
            if (response.ok && onDeletePost) {
                onDeletePost(postId);
            } else {
                alert(t('deleteError'));
            }
        } catch (error) {
            alert(t('deleteError'));
        }
        setIsDeleting(false);
        setShowMenu(false);
    };

    const toggleMenu = () => {
        setShowMenu(!showMenu);
    };

    const handleShare = () => {
        setShowShareMessage(true);
        // Faire disparaître le message après 3 secondes
        setTimeout(() => {
            setShowShareMessage(false);
        }, 3000);
    };

    // Fermer le menu si on clique ailleurs
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.post-menu')) {
                setShowMenu(false);
            }
        };
        
        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMenu]);

    // Vérifier si l'utilisateur actuel peut supprimer ce post
    const canDeletePost = currentUser && post.user_id && (
        // Propriétaire du post
        currentUser.id === post.user_id?._id || 
        currentUser._id === post.user_id?._id ||
        currentUser.id === post.user_id ||
        currentUser._id === post.user_id ||
        // Modérateur ou admin (si showDeleteOption est activé)
        (showDeleteOption && (currentUser.role === 'moderator' || currentUser.role === 'admin'))
    );

    const handleReportPost = () => {
        setShowReportDialog(true);
        setShowMenu(false);
    };

    const submitReport = async () => {
        if (!reportReason.trim()) {
            alert('Veuillez sélectionner une raison pour le signalement');
            return;
        }

        setIsReporting(true);
        try {
            const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${postId}/report`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ reason: reportReason })
            });
            
            if (response.ok) {
                alert(t('reportSuccess') || 'Post signalé avec succès');
                setShowReportDialog(false);
                setReportReason("");
            } else {
                const data = await response.json();
                alert(data.message || t('reportError') || 'Erreur lors du signalement');
            }
        } catch (error) {
            alert(t('reportError') || 'Erreur lors du signalement');
        }
        setIsReporting(false);
    };

    return (
        <div className="relative rounded-xl overflow-hidden border" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            {/* En-tête */}
            <div className="flex items-center p-3.5">
                {post.user_id?.avatar ? (
                    <Image
                        src={post.user_id.avatar.startsWith("http") ? post.user_id.avatar : `${process.env.NEXT_PUBLIC_BACKEND_URL}${post.user_id.avatar}`}
                        alt="Avatar"
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full mr-2 object-cover"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full mr-2 flex items-center justify-center" style={{ backgroundColor: "var(--input)" }}>
                        <Image
                            src="/avatar.svg"
                            alt="Avatar temporaire"
                            width={40}
                            height={40}
                            className="w-6 h-6 rounded-full object-cover"
                        />
                    </div>
                )}
                <div className="flex flex-col flex-1 gap-0.5">
                    {post.user_id?._id ? (
                        <Link href={`/users/${post.user_id._id}`} className="flex items-center gap-1 font-semibold text-sm">
                            <span>{post.user_id?.name || "Utilisateur"}</span>
                            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                @{post.user_id?.username || "unknown"}
                            </span>
                        </Link>
                    ) : (
                        <div className="flex items-center gap-1 font-semibold text-sm">
                            <span>{post.user_id?.name || "Utilisateur inconnu"}</span>
                            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                @{post.user_id?.username || "unknown"}
                            </span>
                        </div>
                    )}
                    <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
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
                <div className="relative post-menu">
                    <IconButton 
                        icon="dots.svg" 
                        alt="Options" 
                        size={24} 
                        className="p-1"
                        onClick={currentUser ? toggleMenu : undefined}
                        style={{ cursor: currentUser ? 'pointer' : 'default' }}
                    />
                    {showMenu && currentUser && (
                        <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-10" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                            {canDeletePost && (
                                <button
                                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-800 text-sm border-b"
                                    style={{ borderColor: "var(--border)" }}
                                    onClick={handleDeletePost}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? `${t('delete')}...` : t('delete')}
                                </button>
                            )}
                            {/* Option de signalement pour tous les utilisateurs connectés (sauf sur leurs propres posts) */}
                            {!(currentUser.id === post.user_id?._id || 
                               currentUser._id === post.user_id?._id ||
                               currentUser.id === post.user_id ||
                               currentUser._id === post.user_id) && (
                                <button
                                    className="w-full text-left px-4 py-2 text-orange-600 hover:bg-orange-50 hover:text-orange-800 text-sm"
                                    onClick={handleReportPost}
                                >
                                    🚨 {t('report') || 'Signaler'}
                                </button>
                            )}
                            {/* Si l'utilisateur ne peut ni supprimer ni signaler, afficher un message */}
                            {!canDeletePost && (currentUser.id === post.user_id?._id || 
                                                currentUser._id === post.user_id?._id ||
                                                currentUser.id === post.user_id ||
                                                currentUser._id === post.user_id) && (
                                <div className="px-4 py-2 text-sm text-gray-500 text-center">
                                    Votre post
                                </div>
                            )}
                        </div>
                    )}
                </div>
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
                    <Image
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${post.media}`}
                    alt="post"
                    className="w-full aspect-[1/1] object-cover mb-2"
                    width={600}
                    height={600}
                    unoptimized
                    />
                )
            )}

            {/* Contenu */}
            <div className="flex flex-col gap-2 px-2 text-sm">
                <p className="px-1.5 break-words whitespace-pre-line" style={{ color: "var(--text-primary)" }}>
                    {post.content}
                </p>
                {post.tags?.length > 0 && (
                    <div className="flex gap-1 flex-wrap text-xs" style={{ color: "var(--text-secondary)" }}>
                        {post.tags.map((tag, i) => (
                            <span key={i} className="border rounded-full px-2 py-1" style={{ borderColor: "var(--border)" }}>
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center p-2">
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
                <IconButton
                    onClick={() => setShowComments((v) => !v)}
                    icon={showComments ? "comment-active.svg" : "comment.svg"}
                    alt="Comment"
                    size={24}
                    className="p-1"
                />
                <IconButton
                    onClick={handleShare}
                    icon="share.svg"
                    alt="Share"
                    size={24}
                    className="p-1"
                />
            </div>

            {/* Message temporaire pour le partage */}
            {showShareMessage && (
                <div 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-sm z-50 cursor-pointer"
                    onClick={() => setShowShareMessage(false)}
                >
                    Cette fonctionnalité n&apos;est pas disponible pour le moment
                </div>
            )}

            {/* Drawer des commentaires : slide up depuis sous la carte */}
           <div
                className={`fixed left-0 right-0 bottom-0 z-[100] transition-transform duration-200 ${
                    showComments ? "translate-y-0" : "translate-y-full pointer-events-none"
                }`}
                style={{
                    background: "var(--card)",
                    borderTopLeftRadius: "1rem",
                    borderTopRightRadius: "1rem",
                    boxShadow: "0 -2px 16px #0002",
                    maxHeight: "70vh",
                    minHeight: "10vh",
                    overflowY: "auto",
                }}
            >
                
                <Comments
                    postId={postId}
                    token={token}
                    user={currentUser}
                    onClose={() => setShowComments(false)}
                />
            </div>

            {/* Dialog de signalement */}
            {showReportDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
                    <div 
                        className="bg-white rounded-lg p-6 w-full max-w-md"
                        style={{ backgroundColor: "var(--card)", color: "var(--text-primary)" }}
                    >
                        <h3 className="text-lg font-semibold mb-4">Signaler ce post</h3>
                        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                            Pourquoi signalez-vous ce post ?
                        </p>
                        
                        <div className="space-y-2 mb-6">
                            {[
                                { value: "Contenu inapproprié", label: "Contenu inapproprié" },
                                { value: "Spam", label: "Spam ou contenu commercial" },
                                { value: "Harcèlement", label: "Harcèlement ou intimidation" },
                                { value: "Discours de haine", label: "Discours de haine" },
                                { value: "Violence", label: "Violence ou contenu violent" },
                                { value: "Désinformation", label: "Fausses informations" },
                                { value: "Autre", label: "Autre raison" }
                            ].map((reason) => (
                                <label key={reason.value} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="reportReason"
                                        value={reason.value}
                                        checked={reportReason === reason.value}
                                        onChange={(e) => setReportReason(e.target.value)}
                                        className="text-red-500"
                                    />
                                    <span className="text-sm">{reason.label}</span>
                                </label>
                            ))}
                        </div>
                        
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowReportDialog(false);
                                    setReportReason("");
                                }}
                                className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
                                style={{ borderColor: "var(--border)" }}
                                disabled={isReporting}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={submitReport}
                                disabled={!reportReason.trim() || isReporting}
                                className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
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