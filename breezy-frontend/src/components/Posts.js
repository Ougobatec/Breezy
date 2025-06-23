"use client";
import React from "react";

export default function Posts({ posts }) {
  if (!posts || posts.length === 0) {
    return <div>Aucun post à afficher.</div>;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post._id || post.id} className="p-4 border rounded shadow">
          <div className="font-bold">{post.user_id?.username || post.user_id || "Anonyme"}</div>
          <div>{post.content}</div>
        </div>
      ))}
    </div>
  );
}