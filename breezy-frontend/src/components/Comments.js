import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export default function Comments({ postId, token, user, onClose }) {
  const { t, language } = useLanguage();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  // Ajouter le CSS pour l'animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideUp {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    const fetchComments = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/comments/${postId}/comments`,
        { credentials: "include" }
      );
      const data = await res.json();
      setComments(data);
    };
    fetchComments();
  }, [postId, token]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    setLoading(true);
    await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/comments/${postId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ content }),
      }
    );
    setContent("");
    setLoading(false);
    refreshComments();
  };

  const handleReply = async (e, commentId) => {
    e.preventDefault();
    setLoading(true);
    await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/comments/${postId}/comments/${commentId}/replies`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ content: replyContent }),
      }
    );
    setReplyContent("");
    setReplyTo(null);
    setLoading(false);
    refreshComments();
  };

  const refreshComments = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/comments/${postId}/comments`,
      { credentials: "include" }
    );
    const data = await res.json();
    setComments(data);
  };

  const renderComments = (commentsList, level = 0) =>
    commentsList.map((comment) => (
      <div key={comment._id} className="relative mb-4">
        {level > 0 && (
          <div
            className="absolute left-0 top-0 h-full"
            style={{
              width: 2,
              backgroundColor: "var(--border)",
              left: level * 20 - 12,
              opacity: 0.4,
            }}
          />
        )}
        <div style={{ marginLeft: level * 20 }}>
          <div className="flex items-start gap-2 py-2">
            {comment.user_id?.avatar ? (
              <Image
                src={comment.user_id.avatar.startsWith("http") ? comment.user_id.avatar : `${process.env.NEXT_PUBLIC_BACKEND_URL}${comment.user_id.avatar}`}
                alt="Avatar"
                width={24}
                height={24}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--input)" }}>
                <Image
                  src="/avatar.svg"
                  alt="Avatar temporaire"
                  width={24}
                  height={24}
                  className="w-3 h-3"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-xs" style={{ color: "var(--text-primary)" }}>
                    {comment.user_id?.name || "Utilisateur"}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    @{comment.user_id?.username || "username"}
                  </span>
                </div>
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {new Date(comment.created_at).toLocaleString(language === 'fr' ? "fr-FR" : "en-US")}
                </span>
              </div>
              <div className="text-sm leading-relaxed mb-2" style={{ color: "var(--text-primary)" }}>
                {comment.content}
              </div>
              {level === 0 && (
                <button
                  className="text-xs px-0 py-1 hover:opacity-70 transition-all duration-200 font-medium"
                  style={{ color: "var(--text-action)" }}
                  onClick={() => {
                    setReplyTo(comment._id);
                    setReplyContent("");
                  }}
                >
                  {t('reply')}
                </button>
              )}
            </div>
          </div>
          {replyTo === comment._id && (
            <div className="mt-3 ml-8">
              <form
                onSubmit={(e) => handleReply(e, comment._id)}
                className="flex items-center gap-2"
              >
                <input
                  className="flex-1 border px-3 py-2 text-xs rounded-lg transition-all duration-200 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: "var(--input)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                    focusRingColor: "var(--text-action)",
                  }}
                  placeholder={t('yourReply')}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--text-action)",
                    color: "white",
                  }}
                  disabled={loading || !replyContent}
                >
                  {t('publish')}
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 hover:opacity-70"
                  style={{
                    color: "var(--text-secondary)",
                    backgroundColor: "var(--input)",
                  }}
                  onClick={() => setReplyTo(null)}
                >
                  {t('cancel')}
                </button>
              </form>
            </div>
          )}
          {comment.replies && comment.replies.length > 0 && (
            <div>{renderComments(comment.replies, level + 1)}</div>
          )}
        </div>
      </div>
    ));

    return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[100] flex flex-col animate-slide-up"
      style={{
        height: "70vh",
        minHeight: "400px",
        maxHeight: "90vh",
        backgroundColor: "var(--card)",
        borderTopLeftRadius: "1rem",
        borderTopRightRadius: "1rem",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
        animation: "slideUp 0.3s ease-out",
      }}
    >
      {/* Bouton fermer en haut */}
      <div className="border-b flex-shrink-0" style={{ borderColor: "var(--border)" }}>
        <div className="w-full max-w-xl mx-auto flex justify-between items-center p-3">
          <h3 className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>Commentaires</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-opacity-80 transition-colors"
            style={{ backgroundColor: "var(--input)" }}
            aria-label={t('closeComments')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      
      {/* Zone de commentaires avec scroll */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-xl mx-auto px-3 py-3">
          {comments.length === 0 ? (
            <div className="text-center py-8" style={{ color: "var(--text-secondary)" }}>
              Aucun commentaire pour le moment
            </div>
          ) : (
            renderComments(comments)
          )}
        </div>
      </div>
      
      {/* BARRE DE PUBLICATION FIXE EN BAS */}
      <div
        className="border-t flex-shrink-0"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--card)",
        }}
      >
        <div className="w-full max-w-xl mx-auto p-3">
          <form
            onSubmit={handleAddComment}
            className="flex items-center gap-2"
          >
          {user?.avatar ? (
            <Image
              src={user.avatar.startsWith("http") ? user.avatar : `${process.env.NEXT_PUBLIC_BACKEND_URL}${user.avatar}`}
              alt="Votre avatar"
              width={28}
              height={28}
              className="w-7 h-7 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--input)" }}>
              <Image
                src="/avatar.svg"
                alt="Avatar temporaire"
                width={28}
                height={28}
                className="w-4 h-4"
              />
            </div>
          )}
          <input
            className="flex-1 border px-4 py-3 text-sm rounded-xl transition-all duration-200 focus:outline-none focus:ring-2"
            style={{
              backgroundColor: "var(--input)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
              focusRingColor: "var(--text-action)",
            }}
            placeholder={t('addComment')}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="px-4 py-3 text-sm flex-shrink-0 rounded-xl font-medium transition-all duration-200 hover:opacity-90 disabled:opacity-50"
            style={{
              backgroundColor: "var(--text-action)",
              color: "white",
            }}
            disabled={loading || !content}
          >
            {loading ? "..." : t('publish')}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}