"use client";
import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

// Composant Posts qui affiche une liste de posts sous forme de cartes
export default function Posts({ posts }) {
  const { token, user } = useAuth();
  const [postsState, setPostsState] = useState(posts);

  const handleLike = async (postId) => {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/posts/${postId}/like`;
    console.log("Envoi requête PUT like à :", url);

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Réponse status:", response.status);
      const data = await response.json();
      if (!response.ok) {
        console.log("Erreur backend:", data);
      } else {
        console.log("Réponse backend:", data);
        // Met à jour le tableau des likes du post avec les nouveaux IDs reçus du backend
        setPostsState((prevPosts) =>
          prevPosts.map((p) =>
            (p._id || p.id) === postId ? { ...p, likes: data.post.likes } : p
          )
        );
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
        // On récupère bien les IDs des utilisateurs ayant liké ce post
        // post.likes doit être un tableau d'IDs (strings ou numbers)
        const isLiked =
          Array.isArray(post.likes) && user
            ? post.likes.includes(user.id) || post.likes.includes(user._id)
            : false;

        return (
          <div
            key={postId}
            className="rounded-xl overflow-hidden"
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
                  className="w-5 h-5"
                />
              </button>
              <Link href={`/posts/${postId}/comments`}>
                <button className="p-1" aria-label="Comments">
                  <Image
                    src="/comment.svg"
                    alt="Comment"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                </button>
              </Link>
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
        );
      })}
    </div>
  );
}