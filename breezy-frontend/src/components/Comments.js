import React, { useEffect, useState } from "react";

export default function Comments({ postId, token, user, onClose }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");

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
      <div key={comment._id} className="relative mt-2">
        {level > 0 && (
          <div
            className="absolute left-0 top-0 h-full"
            style={{
              width: 12,
              backgroundColor: "var(--border)",
              left: -16,
            }}
          />
        )}
        <div style={{ marginLeft: level * 24 }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: "var(--input)" }} />
            <div>
              <span className="font-bold text-xs" style={{ color: "var(--text-primary)" }}>
                {comment.user_id?.name || "Name"}
              </span>
              <span className="text-xs ml-1" style={{ color: "var(--text-secondary)" }}>
                @{comment.user_id?.username || "username"}
              </span>
              <span className="text-xs ml-2" style={{ color: "var(--text-secondary)" }}>
                {new Date(comment.created_at).toLocaleString("fr-FR")}
              </span>
            </div>
            <button
              className="ml-2 text-xs hover:underline"
              style={{ color: "var(--text-action)" }}
              onClick={() => {
                setReplyTo(comment._id);
                setReplyContent("");
              }}
            >
              Répondre
            </button>
          </div>
          <div className="ml-10 text-xs" style={{ color: "var(--text-primary)" }}>
            {comment.content}
          </div>
          {replyTo === comment._id && (
            <form
              onSubmit={(e) => handleReply(e, comment._id)}
              className="flex items-center mt-1 ml-10"
            >
              <input
                className="flex-1 rounded-xl border px-2 py-1 text-xs"
                style={{
                  backgroundColor: "var(--input)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
                placeholder="Votre réponse..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                disabled={loading}
                autoFocus
              />
              <button
                type="submit"
                className="ml-2 px-2 py-1 rounded-xl text-xs"
                style={{
                  backgroundColor: "var(--card)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border)",
                }}
                disabled={loading || !replyContent}
              >
                Publier
              </button>
              <button
                type="button"
                className="ml-1 px-2 py-1 rounded-xl text-xs"
                style={{
                  color: "var(--text-secondary)",
                  background: "transparent",
                }}
                onClick={() => setReplyTo(null)}
              >
                Annuler
              </button>
            </form>
          )}
          {comment.replies && comment.replies.length > 0 && (
            <div>{renderComments(comment.replies, level + 1)}</div>
          )}
        </div>
      </div>
    ));

    return (
    <div
      className="rounded-xl shadow mt-2 relative flex flex-col h-full"
      style={{
        background: "var(--card)",
        color: "var(--text-primary)",
        margin: "24px 12px 0 12px", // Ajoute un espace avec les bords de l'écran et le haut
      }}
    >
      <div
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: 112 }}
      >
        {renderComments(comments)}
      </div>
      {/* BARRE DE PUBLICATION ET BOUTON FERMER FIXES EN BAS DE L'ÉCRAN */}
      <div
        className="sticky z-[110] border-t flex flex-col items-center"
        style={{
          background: "var(--card)",
          borderColor: "var(--border)",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <form
          onSubmit={handleAddComment}
          className="flex px-4 py-3 w-full max-w-md mx-auto"
          style={{ justifyContent: "center" }}
        >
          <input
            className="flex-1 rounded-xl border px-3 py-2 text-sm"
            style={{
              backgroundColor: "var(--input)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
            placeholder="Ajouter un commentaire"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="ml-2 px-3 py-2 rounded-xl text-sm"
            style={{
              backgroundColor: "var(--card)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
            disabled={loading || !content}
          >
            Publier
          </button>
        </form>
        <div className="flex justify-center pb-2 w-full">
          <button
            onClick={onClose}
            className="text-sm px-4 py-2 rounded-xl "
            style={{  
              color: "var(--text-secondary)",
              width: "100%",
              maxWidth: "320px",
              margin: "0 auto",
              display: "block",
            }}
            aria-label="Fermer les commentaires"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}