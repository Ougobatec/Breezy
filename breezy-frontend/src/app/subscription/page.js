"use client";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import LoadingScreen from "@/components/LoadingScreen";
import Layout from "@/components/Layout";
import Avatar from "@/components/Avatar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


export default function SubscriptionPage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (loading || !user) return;
    const fetchSubscriptions = async () => {
      setSubscriptionsLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/sub/subscriptions`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("Erreur lors du chargement des abonnements");
        const data = await res.json();
        setSubscriptions(Array.isArray(data) ? data : [data]);
      } catch (error) {
        setSubscriptions([]);
      }
      setSubscriptionsLoading(false);
    };
    fetchSubscriptions();
  }, [loading, user]);

  const handleUnsubscribe = async (unfollowUserId) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/sub/unsubscribe`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ unfollowUserId }),
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Erreur lors du désabonnement");
      // Met à jour la liste localement sans refetch
      setSubscriptions((subs) =>
        subs.filter((s) => (s._id || s.id) !== unfollowUserId)
      );
    } catch (error) {
      console.error("Erreur lors du désabonnement:", error);
    }
  };

  // Filtrer les abonnements selon la recherche
  const filteredSubscriptions = subscriptions.filter((s) => {
    if (!searchQuery) return true;
    const name = s.name || s.username || "";
    const username = s.username || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) return <LoadingScreen text={t('loading')} />;
  if (!user) return null;
  if (subscriptionsLoading)
    return <LoadingScreen text={t('loadingSubscriptions')} />;

  return (
    <Layout headerProps={{ title: t('following') }}>
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
        
        {/* Liste des abonnements */}
        <div className="space-y-3">
          {filteredSubscriptions.length === 0 ? (
            <div className="text-center py-8" style={{ color: "var(--text-secondary)" }}>
              {searchQuery ? t('noSearchResults') : t('noSubscriptions')}
            </div>
          ) : (
            filteredSubscriptions.map((s, idx) => (
              <div
                key={s._id || idx}
                className="flex items-center rounded-xl overflow-hidden border p-4 hover:opacity-80 cursor-pointer"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                onClick={() => router.push(`/users/${s._id || s.id}`)}
              >
                <Avatar user={s} size={48} />
                <div className="ml-3 flex-1">
                  <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                    {s.name || s.username || "Nom"}
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    @{s.username || "username"}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnsubscribe(s._id || s.id);
                  }}
                  className="ml-2 p-2 hover:opacity-70"
                  style={{ color: "var(--text-secondary)" }}
                  aria-label={t('unsubscribe')}
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
            className="flex-1 py-4 text-sm"
            style={{ 
              backgroundColor: "var(--card)",
              color: "var(--text-secondary)"
            }}
            onClick={() => router.push('/followers')}
          >
            {t('followers')}
          </button>
          <button 
            className="flex-1 py-4 font-semibold text-sm rounded-tr-xl"
            style={{ 
              backgroundColor: "var(--primary)", 
              color: "white"
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