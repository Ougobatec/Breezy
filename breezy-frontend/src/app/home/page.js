"use client";
import { useEffect, useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import Layout from "@/components/Layout";
import PostCard from "@/components/PostCard";
import SuspendedUserMessage from "@/components/SuspendedUserMessage";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function HomePage() {
  const { user, token, loading } = useAuth();
  const { t } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPosts = async () => {
    setPostsLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/flow`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Erreur lors du chargement des posts");
      const data = await res.json();
      setPosts(data.posts || data || []);
    } catch (error) {
      setError("Impossible de charger les posts");
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleDeletePost = (postId) => {
    setPosts((prev) => prev.filter((p) => (p._id || p.id) !== postId));
  };

  const handleLikeUpdate = (postId, likes) => {
    setPosts((prev) =>
      prev.map((p) =>
        (p._id || p.id) === postId ? { ...p, likes } : p
      )
    );
  };

  useEffect(() => {
    if (loading || !user) return;
    fetchPosts();
  }, [loading, user]);

  if (!user) return null;
  if (loading || postsLoading) return <LoadingScreen text={t('loading')} />;

  return (
    <Layout headerProps={{ title: t('home') }}>
      <div className="p-4">
        <div className="text-xl font-bold mb-4">
          {t('welcomeMessage')} {user.name}
        </div>
        
        <SuspendedUserMessage />
        
        {error && (
          <div className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-xl">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-8" style={{ color: "var(--text-secondary)" }}>
              {t('noPostsMessage')}
            </div>
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
                  onLikeUpdate={(likes) => handleLikeUpdate(post._id || post.id, likes)}
                />
              ))
          )}
        </div>
      </div>
    </Layout>
  );
}