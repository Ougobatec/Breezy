"use client";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";
import React, { useEffect, useState } from "react";
import Posts from "@/components/Posts";

export default function HomePage() {
  const { user, token, loading, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    if (loading || !user || !token) return;
    async function fetchPosts() {
      setPostsLoading(true);
      try {
        const res = await fetch("http://localhost:5000/posts", {
          headers: {
            
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Erreur lors du chargement des posts");
        const data = await res.json();
        setPosts(data.posts || data || []);
      } catch (error) {
        setPosts([]);
      }
      setPostsLoading(false);
    }
    fetchPosts();
  }, [loading, user, token]);

  if (loading) return <LoadingScreen />;
  if (!user) return null;

  return (
    <>
      <Header title="Breezy" showButtons={true} />
      <div>Bienvenue {user.username}</div>
      <button onClick={logout}>Déconnexion</button>
      {postsLoading ? <LoadingScreen /> : <Posts posts={posts} />}
    </>
  );
}