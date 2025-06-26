"use client";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import LoadingScreen from "@/components/LoadingScreen";
import Layout from "@/components/Layout";
import Avatar from "@/components/Avatar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function FollowersPage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [followers, setFollowers] = useState([]);
  const [followersLoading, setFollowersLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (loading || !user) return;
    const fetchFollowers = async () => {
      setFollowersLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/sub/follower`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("Erreur lors du chargement des abonnés");
        const data = await res.json();
        setFollowers(Array.isArray(data) ? data : [data]);
      } catch (error) {
        setFollowers([]);
      }
      setFollowersLoading(false);
    };
    fetchFollowers();
  }, [loading, user]);

  const handleRemoveFollower = async (followerUserId) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/sub/remove-follower`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ followerUserId }),
        }
      );
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      setFollowers((prev) =>
        prev.filter((f) => (f._id || f.id) !== followerUserId)
      );
    } catch (error) {
      // Optionnel : afficher une erreur à l’utilisateur
    }
  };

  // Filtrer les followers selon la recherche
  const filteredFollowers = followers.filter((f) => {
    if (!searchQuery) return true;
    const name = f.name || f.username || "";
    const username = f.username || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) return <LoadingScreen text={t('loading')} />;
  if (!user) return null;
  if (followersLoading) return <LoadingScreen text={t('loadingFollowers')} />;

  return (
    <Layout headerProps={{ title: t('followers') }}>
      <div className="p-4">
        {/* Barre de recherche */}
        <input
          type="text"
          placeholder={t('search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full mb-4 rounded-xl border px-4 py-3 text-sm outline-none"
          style={{ 
            backgroundColor: "var(--input)", 
            borderColor: "var(--border)",
            color: "var(--text-primary)"
          }}
        />
        
        {/* Liste des followers */}
        <div className="space-y-3">
          {filteredFollowers.length === 0 ? (
            <div className="text-center py-8" style={{ color: "var(--text-secondary)" }}>
              {searchQuery ? t('noSearchResults') : t('noFollowers')}
            </div>
          ) : (
            filteredFollowers.map((f, idx) => (
              <div
                key={f._id || idx}
                className="flex items-center rounded-xl overflow-hidden border p-4 hover:opacity-80 cursor-pointer"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                onClick={() => router.push(`/users/${f._id || f.id}`)}
              >
                <Avatar user={f} size={48} />
                <div className="ml-3 flex-1">
                  <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                    {f.name || f.username || "Nom"}
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    @{f.username || "username"}
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFollower(f._id || f.id);
                  }}
                  className="ml-2 p-2 hover:opacity-70"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Navigation en bas */}
      <div className="fixed bottom-0 left-0 w-full" style={{ backgroundColor: "var(--background)" }}>
        <div className="flex rounded-t-xl overflow-hidden border-t" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          <button 
            className="flex-1 py-4 font-semibold text-sm rounded-tl-xl"
            style={{ 
              backgroundColor: "var(--primary)", 
              color: "white"
            }}
            onClick={() => router.push('/followers')}
          >
            {t('followers')}
          </button>
          <button 
            className="flex-1 py-4 text-sm"
            style={{ 
              backgroundColor: "var(--card)",
              color: "var(--text-secondary)"
            }}
            onClick={() => router.push('/subscription')}
          >
            {t('following')}
          </button>
        </div>
      </div>
    </Layout>


  );
}