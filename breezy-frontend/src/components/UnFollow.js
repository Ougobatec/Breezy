await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/sub/subscriptions`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ unfollowUserId: idDeLaPersonne }),
  });