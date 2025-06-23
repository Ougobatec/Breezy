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
    <div className="space-y-6 px-4 md:px-0 pl-6 pr-6">
        {posts.map((post) => (
            // Carte du post, centrée et stylisée
            <div
                key={post._id || post.id}
                className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden"
            >
                {/* En-tête du post : avatar, nom, username, date, menu */}
                <div className="flex items-center px-4 pt-4">
                    {/* Avatar (placeholder rond gris) */}
                    <div className="w-10 h-10 rounded-full bg-gray-200 mr-3" />
                    <div>
                        {/* Nom d'utilisateur et username */}
                        <div className="font-semibold text-sm">
                            {post.user_id?.username || post.user_id || "Name"}
                            <Link href={`/users/${post.user_id?._id || post.user_id}`}>
                            <span className="text-gray-400 text-xs ml-1">
                            
                                @{post.user_id?.username || "username"}
                            </span>
                        </Link>
                    </div>
                    {/* Date de création du post */}
                        <div className="text-xs text-gray-400">
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
                    {/* Menu (icône trois points) */}
                    <div className="ml-auto text-gray-400 text-xl cursor-pointer">
                        <Image
                            src="/dots.svg"
                            alt="Dots"
                            width={24}
                            height={24}
                            className="w-6 h-6"
                        />
                    </div>
                </div>
                {/* Image du post si disponible */}
                {post.image && (
                    <img
                        src={post.image}
                        alt="post"
                        className="w-full h-56 object-cover mt-4"
                    />
                )}
                {/* Contenu textuel du post */}
                <div className="px-4 py-2 text-gray-800 text-sm">
                    {post.content ||
                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
                </div>
                {/* Tags du post */}
                <div className="px-4 pb-2 text-xs text-gray-400">
                    {(post.tags || ["tag", "tag", "tag", "tag"]).map((tag, i) => (
                        <span key={i} className="mr-2">
                            {tag}
                        </span>
                    ))}
                </div>
                {/* Barre d'actions : like, commentaire, partage */}
                <div className="flex items-center px-4 pb-4 text-gray-400 text-xl">
                    <Link href={`/posts/${post._id || post.id}/likes`}>
                        <button className="p-2" aria-label="Likes">
                            <Image src="/like.svg" alt="Like" width={20} height={20} className="w-5 h-5" />
                        </button>
                    </Link>
                    <Link href={`/posts/${post._id || post.id}/comments`}>
                        <button className="p-2" aria-label="Comments">
                            <Image src="/comment.svg" alt="Comment" width={20} height={20} className="w-5 h-5" />
                        </button>
                    </Link>
                    <Link href={`/posts/${post._id || post.id}/shares`}>
                        <button className="p-2" aria-label="Shares">
                            <Image src="/share.svg" alt="Share" width={20} height={20} className="w-5 h-5" />
                        </button>
                    </Link>
                </div>
            </div>
        ))}
    </div>
);
}