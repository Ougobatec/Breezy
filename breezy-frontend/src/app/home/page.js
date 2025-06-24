"use client";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";
import React, { useEffect, useState } from "react";
import Posts from "@/components/Posts";
import BottomNav from "@/components/BottomNav";

export default function HomePage() {
  const { user, token, loading, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    if (loading || !user || !token) return;
    const fetchPosts = async () => {
      setPostsLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Erreur lors du chargement des posts");
        const data = await res.json();
        setPosts(data.posts || data || []);
      } catch (error) {
        setPosts([]);
      }
      setPostsLoading(false);
    };
    fetchPosts();
  }, [loading, user, token]);

  if (loading) return <LoadingScreen text="Connexion en cours..." />;
  if (!user) return null;
  if (postsLoading) return <LoadingScreen text="Chargement des posts" />;

  return (
    <>
      <Header title="Breezy" showButtons={true} />
      <div className="items-left justify-center px-4 py-2">
        <span className="text-xl font-bold">
          Bienvenue {user.name || user.username || ""}
        </span>
      </div>
      <button onClick={logout}>Déconnexion</button>
      <Posts
        posts={[...posts].sort(
          (a, b) =>
            new Date(b.created_at || b.createdAt) -
            new Date(a.created_at || a.createdAt)
        )}
      />
      <BottomNav />
    </>
  );
}