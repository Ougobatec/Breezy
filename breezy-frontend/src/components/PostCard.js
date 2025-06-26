"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import IconButton from "@/components/IconButton";
import Comments from "@/components/Comments";
import { useLanguage } from "@/context/LanguageContext";

export default function PostCard({ post, token, currentUser, onLikeUpdate, onDeletePost, showDeleteOption = false }) {
    const { t, language } = useLanguage();
    const [pop, setPop] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showComments, setShowComments] = useState(false);

    const postId = post._id || post.id;
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
    const canDeletePost = showDeleteOption && currentUser && (
        currentUser.id === post.user_id?._id || 
        currentUser._id === post.user_id?._id ||
        currentUser.id === post.user_id ||
        currentUser._id === post.user_id
    );

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
                    <Link href={`/users/${post.user_id._id}`} className="flex items-center gap-1 font-semibold text-sm">
                        <span>{post.user_id.name}</span>
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                            @{post.user_id.username}
                        </span>
                    </Link>
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
                        onClick={canDeletePost ? toggleMenu : undefined}
                        style={{ cursor: canDeletePost ? 'pointer' : 'default' }}
                    />
                    {showMenu && canDeletePost && (
                        <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow z-10" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                            <button
                                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-800 text-sm"
                                onClick={handleDeletePost}
                                disabled={isDeleting}
                            >
                                {isDeleting ? `${t('delete')}...` : t('delete')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Image du post */}
            {post.media && (
                <Image
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${post.media}`}
                    alt="post"
                    className="w-full aspect-[16/9] object-cover mb-2"
                    width={600}
                    height={224}
                />
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
                    href={`/posts/${postId}/shares`}
                    icon="share.svg"
                    alt="Share"
                    size={24}
                    className="p-1"
                />
            </div>

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
        </div>
    );
}