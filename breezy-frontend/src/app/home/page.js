"use client";
import LoadingScreen from "@/components/LoadingScreen";
import Layout from "@/components/Layout";
import PostCard from "@/components/PostCard";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { user, token, loading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    if (loading || !user) return;
      const fetchPosts = async () => {
        setPostsLoading(true);
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts`,
            {
              credentials: "include",
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
  }, [loading, user]);

  // Gestion de la suppression d'un post
  const handleDeletePost = (postId) => {
    setPosts((prev) => prev.filter((p) => (p._id || p.id) !== postId));
  };

  if (!user) return null;
  if (loading) return <LoadingScreen text="Chargement de la page..." />;
  if (postsLoading) return <LoadingScreen text="Chargement des posts..." />;

  return (
    <Layout headerProps={{ title: "Accueil" }}>
      <div className="text-xl font-bold p-4">
        Bienvenue {user.name}
      </div>
      <div className="space-y-4 px-4 pb-4">
        {posts.length === 0 ? (
          <div className="text-center py-8" style={{ color: "var(--text-secondary)" }}>Aucun post à afficher.</div>
        ) : (
          posts
            .sort(
              (a, b) =>
                new Date(b.created_at || b.createdAt) -
                new Date(a.created_at || a.createdAt)
            )
            .map((post) => (
              <PostCard
                key={post._id || post.id}
                post={post}
                token={token}
                currentUser={user}
                showDeleteOption={true}
                onDeletePost={handleDeletePost}
                onLikeUpdate={(likes) =>
                  setPosts((prev) =>
                    prev.map((p) =>
                      (p._id || p.id) === (post._id || post.id)
                        ? { ...p, likes }
                        : p
                    )
                  )
                }
              />
            ))
        )}
      </div>
    </Layout>
  );
}