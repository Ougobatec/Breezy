"use client";
import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Comments from "./Comments";

// Composant Posts qui affiche une liste de posts sous forme de cartes
export default function Posts({ posts, token: propToken, user: propUser }) {
  const { token: ctxToken, user: ctxUser } = useAuth();
  const token = propToken || ctxToken;
  const user = propUser || ctxUser;
  const [postsState, setPostsState] = useState(posts);
  const [popStates, setPopStates] = useState({}); // postId: bool
  const [openComments, setOpenComments] = useState(null); // postId ou null

  // Pour swipe down sur le drawer
  const [touchStartY, setTouchStartY] = useState(null);
  const [touchDeltaY, setTouchDeltaY] = useState(0);

  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length === 1) {
      setTouchStartY(e.touches[0].clientY);
      setTouchDeltaY(0);
    }
  };

  const handleTouchMove = (e) => {
    if (touchStartY !== null && e.touches && e.touches.length === 1) {
      const deltaY = e.touches[0].clientY - touchStartY;
      setTouchDeltaY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (touchDeltaY > 80) { // 80px de swipe vers le bas pour fermer
      setOpenComments(null);
    }
    setTouchStartY(null);
    setTouchDeltaY(0);
  };

  const handleLike = async (postId) => {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/posts/${postId}/like`;
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setPostsState((prevPosts) =>
          prevPosts.map((p) =>
            (p._id || p.id) === postId ? { ...p, likes: data.post.likes } : p
          )
        );
        setPopStates((prev) => ({ ...prev, [postId]: true }));
        setTimeout(() => {
          setPopStates((prev) => ({ ...prev, [postId]: false }));
        }, 300);
      }
    } catch (e) {
      console.error("Erreur lors de la requête PUT like :", e);
    }
  };

  if (!postsState || postsState.length === 0) {
    return <div>Aucun post à afficher.</div>;
  }

  return (
    <div className="space-y-2 px-4 py-2">
      {postsState.map((post) => {
        const postId = post._id || post.id;
        const isLiked =
          Array.isArray(post.likes) && user
            ? post.likes.includes(user.id) || post.likes.includes(user._id)
            : false;

        return (
          <React.Fragment key={postId}>
            <div
              className="rounded-xl overflow-hidden relative"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              {/* En-tête du post */}
              <div className="flex items-center">
                <div className="p-2">
                  <div
                    className="w-10 h-10 rounded-full"
                    style={{ backgroundColor: "var(--input)" }}
                  />
                </div>
                <div className="py-2 space-y-0.5">
                  <div className="font-semibold text-sm">
                    {post.user_id?.name || post.user_id || "Name"}
                    <Link href={`/users/${post.user_id?._id || post.user_id}`}>
                      <span
                        className="text-xs ml-1"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        @{post.user_id?.username || "username"}
                      </span>
                    </Link>
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {post.created_at
                      ? new Date(post.created_at).toLocaleString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                      : "Date inconnue"}
                  </div>
                </div>
                <div className="p-2 ml-auto">
                  <div className="p-1 cursor-pointer">
                    <Image
                      src="/dots.svg"
                      alt="Dots"
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                  </div>
                </div>
              </div>
              {/* Image du post si disponible */}
              {post.image && (
                <Image
                  src={post.image}
                  alt="post"
                  className="w-full h-56 object-cover mt-4"
                  unoptimized
                />
              )}

              <div className="flex flex-col gap-2 px-4 py-2 text-sm">
                <p className="px-4 py-2 text-gray-800 text-sm break-words whitespace-pre-line">
                  {post.content}
                </p>
                {post.tags && post.tags.length > 0 && (
                  <div
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {post.tags.map((tag, i) => (
                      <span key={i} className="mr-2">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {/* Barre d'actions : like, commentaire, partage */}
              <div className="flex items-center px-2 pb-2">
                <button
                  className="p-1"
                  aria-label="Likes"
                  onClick={() => handleLike(postId)}
                >
                  <Image
                    src={isLiked ? "/like-active.svg" : "/like.svg"}
                    alt="Like"
                    width={20}
                    height={20}
                    className={`w-5 h-5${popStates[postId] ? " pop-animation" : ""}`}
                  />
                </button>
                <button
                  className="p-1"
                  aria-label="Comments"
                  onClick={() =>
                    setOpenComments(openComments === postId ? null : postId)
                  }
                >
                  <Image
                    src={
                      openComments === postId
                        ? "/comment-active.svg"
                        : "/comment.svg"
                    }
                    alt="Comment"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                </button>
                <Link href={`/posts/${postId}/shares`}>
                  <button className="p-1" aria-label="Shares">
                    <Image
                      src="/share.svg"
                      alt="Share"
                      width={20}
                      height={20}
                      className="w-5 h-5"
                    />
                  </button>
                </Link>
              </div>
            </div>

            {/* Drawer des commentaires */}
            <div
              className={`fixed left-0 right-0 bottom-0 z-50 transition-transform duration-300 ${
                openComments === postId
                  ? "translate-y-0"
                  : "translate-y-full pointer-events-none"
              }`}
              style={{
                background: "white",
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                boxShadow: "0 -2px 16px rgba(0,0,0,0.08)",
                minHeight: "40vh",
                maxHeight: "70vh",
                overflowY: "auto",
                touchAction: "pan-y",
                paddingBottom: "80px",
                transform:
                  openComments === postId && touchDeltaY > 0
                    ? `translateY(${touchDeltaY}px)`
                    : undefined,
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="flex justify-center py-2">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>
              <Comments postId={postId} token={token} user={user} />
              <div className="flex justify-center py-2 sticky bottom-0 bg-white ">
                <button
                  className="text-gray-500 text-sm"
                  onClick={() => setOpenComments(null)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}