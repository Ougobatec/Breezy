"use client";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";
import React, { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import SkeletonAvatar from "@/components/SkeletonAvatar";

export default function HomePage() {
  const { user, token, loading, logout } = useAuth();
  const [followers, setFollowers] = useState([]);
  const [followersLoading, setFollowersLoading] = useState(true);

  useEffect(() => {
    if (loading || !user || !token) return;
    const fetchFollowers = async () => {
      setFollowersLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/sub/follower`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
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
  }, [loading, user, token]);

  const handleRemoveFollower = async (followerUserId) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/sub/remove-follower`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
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

  if (loading) return <LoadingScreen text="Connexion en cours..." />;
  if (!user) return null;
  if (followersLoading) return <LoadingScreen text="Chargement des abonnés" />;

  return (
    <>
      <Header title="Abonnés" showButtons={true} />
      <div className="px-4 py-2">
        <input
          type="text"
          placeholder="Rechercher"
          className="w-full mb-4 rounded-xl bg-gray-100 px-4 py-2 text-gray-500 outline-none"
        />
        <div className="space-y-3">
          {followers.length === 0 ? (
            <div className="text-center text-gray-400">Aucun abonné</div>
          ) : (
            followers.map((f, idx) => (
              <div
                key={f._id || idx}
                className="flex items-center bg-white rounded-xl shadow p-3"
              >
                <SkeletonAvatar />
                <div className="ml-4 flex-1">
                  <div className="font-medium text-gray-700">
                    {f.name || f.username || "Nom"}{" "}
                    <span className="text-gray-400">
                      @{f.username || "username"}
                    </span>
                  </div>
                </div>
                <button onClick={() => handleRemoveFollower(f._id || f.id)}>
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
          <button className="flex-1 py-3 font-semibold text-orange-600 bg-gray-100 rounded-tl-xl">
            Abonnés
          </button>
          <button className="flex-1 py-3 text-gray-500">Abonnements</button>
        </div>
        <BottomNav />
      </div>
    </>
  );
}