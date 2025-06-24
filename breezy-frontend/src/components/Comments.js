import React, { useEffect, useState } from "react";

export default function Comments({ postId, token, user }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyTo, setReplyTo] = useState(null); // ID du commentaire auquel on répond
  const [replyContent, setReplyContent] = useState(""); // contenu de la réponse

  // Récupérer les commentaires du post
  useEffect(() => {
    const fetchComments = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/comments/${postId}/comments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setComments(data);
    };
    fetchComments();
  }, [postId, token]);

  // Ajouter un commentaire principal
  const handleAddComment = async (e) => {
    e.preventDefault();
    setLoading(true);
    await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/comments/${postId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      }
    );
    setContent("");
    setLoading(false);
    refreshComments();
  };

  // Ajouter une réponse à un commentaire
  const handleReply = async (e, commentId) => {
    e.preventDefault();
    setLoading(true);
    await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/comments/${postId}/comments/${commentId}/replies`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: replyContent }),
      }
    );
    setReplyContent("");
    setReplyTo(null);
    setLoading(false);
    refreshComments();
  };

  // Rafraîchir les commentaires
  const refreshComments = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/comments/${postId}/comments`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    setComments(data);
  };

  // Affichage récursif des commentaires et réponses
  const renderComments = (commentsList, level = 0) =>
    commentsList.map((comment) => (
      <div key={comment._id} className="relative mt-2">
        {level > 0 && (
          <div
            className="absolute left-0 top-0 h-full"
            style={{
              width: 12,
              borderLeft: "2px solid #e5e7eb",
              left: -16,
            }}
          />
        )}
        <div style={{ marginLeft: level * 24 }}>
          {/* Affichage du commentaire */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200" />
            <div>
              <span className="font-bold text-xs">{comment.user_id?.name || "Name"}</span>
              <span className="text-xs text-gray-400 ml-1">@{comment.user_id?.username || "username"}</span>
              <span className="text-xs text-gray-400 ml-2">
                {new Date(comment.created_at).toLocaleString("fr-FR")}
              </span>
            </div>
            <button
              className="ml-2 text-xs text-blue-500 hover:underline"
              onClick={() => {
                setReplyTo(comment._id);
                setReplyContent("");
              }}
            >
              Répondre
            </button>
          </div>
          <div className="ml-10 text-xs text-gray-800">{comment.content}</div>
          {/* Formulaire de réponse */}
          {replyTo === comment._id && (
            <form
              onSubmit={(e) => handleReply(e, comment._id)}
              className="flex items-center mt-1 ml-10"
            >
              <input
                className="flex-1 rounded-xl border px-2 py-1 text-xs"
                placeholder="Votre réponse..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                disabled={loading}
                autoFocus
              />
              <button
                type="submit"
                className="ml-2 px-2 py-1 rounded-xl bg-gray-200 text-gray-600 text-xs"
                disabled={loading || !replyContent}
              >
                Publier
              </button>
              <button
                type="button"
                className="ml-1 px-2 py-1 rounded-xl text-gray-400 text-xs"
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
    <div className="bg-white rounded-xl shadow p-2 mt-2">
      {renderComments(comments)}
      <form onSubmit={handleAddComment} className="flex mt-2 sticky bottom-0 bg-white p-2">
        <input
          className="flex-1 rounded-xl border px-3 py-2 text-sm"
          placeholder="Ajouter un commentaire"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="ml-2 px-3 py-2 rounded-xl bg-gray-200 text-gray-600 text-sm"
          disabled={loading || !content}
        >
          Publier
        </button>
      </form>
    </div>
  );
}