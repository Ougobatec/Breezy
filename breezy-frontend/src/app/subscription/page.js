"use client";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import LoadingScreen from "@/components/LoadingScreen";
import Layout from "@/components/Layout";
import SkeletonAvatar from "@/components/SkeletonAvatar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


export default function SubscriptionPage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true);
  const [targetId, setTargetId] = useState("");
  const [subscribeMsg, setSubscribeMsg] = useState("");

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

  const handleSubscribe = async () => {
    if (!targetId) return;
    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/sub/subscribe`;
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          subscription_id: targetId,
        }),
      };

      const res = await fetch(url, options);
      if (!res.ok) throw new Error("Erreur lors de l'abonnement");

      setSubscribeMsg("Abonnement réussi");
      setTargetId("");
      // Optionally, refetch subscriptions or update state
    } catch (error) {
      setSubscribeMsg("Erreur lors de l'abonnement");
    }
  };

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
      setSubscribeMsg("Erreur lors du désabonnement");
    }
  };

  if (loading) return <LoadingScreen text={t('loading')} />;
  if (!user) return null;
  if (subscriptionsLoading)
    return <LoadingScreen text={t('loadingSubscriptions')} />;

  return (
    <Layout headerProps={{ title: t('following') }}>
      <div className="px-4 py-2">
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder={t('userIdToFollow')}
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="border px-2 py-1 rounded"
          />
          <button
            onClick={handleSubscribe}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            {t('subscribe')}
          </button>
          {subscribeMsg && (
            <span className="ml-2 text-sm">{subscribeMsg}</span>
          )}
        </div>
        <input
          type="text"
          placeholder={t('search')}
          className="w-full mb-4 rounded-xl bg-gray-100 px-4 py-2 text-gray-500 outline-none"
        />
        <div className="space-y-3">
          {subscriptions.length === 0 ? (
            <div className="text-center text-gray-400">{t('noSubscriptions')}</div>
          ) : (
            subscriptions.map((s, idx) => (
              <div
                key={s._id || idx}
                className="flex items-center bg-white rounded-xl shadow p-3"
              >
                <SkeletonAvatar />
                <div className="ml-4 flex-1">
                  <div className="font-medium text-gray-700">
                    {s.name || s.username || "Nom"}{" "}
                    <span className="text-gray-400">
                      @{s.username || "username"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleUnsubscribe(s._id || s.id)}
                  aria-label={t('unsubscribe')}
                >
                  <svg
                    className="w-6 h-6 text-gray-500"
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
      <div className="fixed bottom-0 left-0 w-full">
        <div className="flex bg-white rounded-t-xl shadow">
          <button 
            className="flex-1 py-3 text-gray-500"
            onClick={() => router.push('/followers')}
          >
            {t('followers')}
          </button>
          <button 
            className="flex-1 py-3 font-semibold text-orange-600 bg-gray-100 rounded-tr-xl"
            onClick={() => router.push('/subscription')}
          >
            {t('following')}
          </button>
        </div>
      </div>
    </Layout>
  );
}