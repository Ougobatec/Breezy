"use client";
import Link from "next/link";
import Image from "next/image";
import React from "react";

// Composant Posts qui affiche une liste de posts sous forme de cartes
export default function Posts({ posts }) {
  // Si aucun post n'est disponible, affiche un message
  if (!posts || posts.length === 0) {
    return <div>Aucun post à afficher.</div>;
  }

return (
    // Conteneur principal avec espacement vertical entre les posts et padding horizontal
    <div className="space-y-2 px-4 py-2">
        {posts.map((post) => (
            // Carte du post, centrée et stylisée
            <div
                key={post._id || post.id}
                className="rounded-xl overflow-hidden"
                style={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)"
                }}
            >
                {/* En-tête du post : avatar, nom, username, date, menu */}
                <div className="flex items-center">
                    {/* Avatar (placeholder rond gris) */}
                    <div className="p-2">
                        <div className="w-10 h-10 rounded-full" style={{ backgroundColor: "var(--input)" }} />
                    </div>
                    <div className="py-2 space-y-0.5">
                        {/* Nom d'utilisateur et username */}
                        <div className="font-semibold text-sm">
                            {post.user_id?.name || post.user_id || "Name"}
                            <Link href={`/users/${post.user_id?._id || post.user_id}`}>
                                <span className="text-xs ml-1" style={{ color: "var(--text-secondary)" }}>
                                    @{post.user_id?.username || "username"}
                                </span>
                            </Link>
                        </div>
                        {/* Date de création du post */}
                        <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                            {post.created_at
                            ? new Date(post.created_at).toLocaleString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit",
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                })
                                : "Date inconnue"
                            }
                        </div>
                    </div>
                    {/* Menu (icône trois points) */}
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
                    {(post.tags && post.tags.length > 0) && (
                        <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
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
                    <Link href={`/posts/${post._id || post.id}/likes`}>
                        <button className="p-1" aria-label="Likes">
                            <Image src="/like.svg" alt="Like" width={20} height={20} className="w-5 h-5" />
                        </button>
                    </Link>
                    <Link href={`/posts/${post._id || post.id}/comments`}>
                        <button className="p-1" aria-label="Comments">
                            <Image src="/comment.svg" alt="Comment" width={20} height={20} className="w-5 h-5" />
                        </button>
                    </Link>
                    <Link href={`/posts/${post._id || post.id}/shares`}>
                        <button className="p-1" aria-label="Shares">
                            <Image src="/share.svg" alt="Share" width={20} height={20} className="w-5 h-5" />
                        </button>
                    </Link>
                </div>
            </div>
        ))}
    </div>
);
}