"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext"; 
import { useRouter } from "next/navigation";

export default function Publish() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("");
  const [tags, setTags] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTag("");
    }
  };

  const handleRemoveTag = (removeTag) => {
    setTags(tags.filter((t) => t !== removeTag));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Ajout des logs pour debug
    console.log("Contenu du post :", content);
    console.log("Tags :", tags);
    console.log("Image :", image);
    try {
      const formData = new FormData();
      formData.append("content", content);
      tags.forEach((t) => formData.append("tags[]", t));
      if (image) formData.append("image", image);

      // Log du FormData (affichage des paires clé/valeur)
      for (let pair of formData.entries()) {
        console.log(pair[0]+ ': ' + pair[1]);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/posts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      console.log("Status de la réponse :", res.status);
      if (!res.ok) {
        const data = await res.json();
        console.log("Erreur backend :", data);
        setError(data.message || "Erreur lors de la publication.");
      } else {
        const data = await res.json();
        console.log("Réponse backend :", data);
        router.replace("/home");
      }
    } catch (e) {
      console.error("Erreur lors de la publication :", e);
      setError("Erreur lors de la publication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center">
        <button onClick={() => router.back()} className="mr-2 text-xl">iooo</button>
        <span className="font-bold text-lg">Créer un nouveau post</span>
      </header>
      {/* Card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl shadow-md mx-4 mt-2 mb-4 flex flex-col"
        style={{ padding: 16, backgroundColor: "var(--card)" }}
      >
        {/* User */}
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 mr-2" />
          <span className="font-semibold text-sm">{user?.name || "Name"}</span>
          <span className="text-gray-400 text-xs ml-1">@{user?.username || "username"}</span>
        </div>
        {/* Image */}
        <label
          htmlFor="image-upload"
          className="w-full h-40 bg-gray-100 flex items-center justify-center rounded-md cursor-pointer mb-2"
        >
          {imagePreview ? (
            <Image
              src={imagePreview}
              alt="preview"
              width={400}
              height={160}
              className="object-cover w-full h-full rounded-md"
              style={{ width: "100%", height: "100%" }}
              unoptimized
            />
          ) : (
            <span className="text-gray-400">Ajouter une image</span>
          )}
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>
        {/* Content */}
        <textarea
          className="w-full rounded-xl border border-gray-200 px-3 py-2 mb-2 text-sm"
          placeholder="Rédiger un post"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          maxLength={280}
          required
        />
        {/* Tags */}
        <div className="flex mb-2">
          <input
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm"
            placeholder="Ajouter un tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="ml-2 px-3 py-2 rounded-xl bg-gray-200 text-gray-600 text-sm"
          >
            +
          </button>
        </div>
        <div className="flex flex-wrap mb-2">
          {tags.map((t) => (
            <span
              key={t}
              className="bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-xs mr-2 mb-2 flex items-center"
            >
              #{t}
              <button
                type="button"
                className="ml-1 text-red-400"
                onClick={() => handleRemoveTag(t)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        {/* Publish button déplacé ici */}
        <button
          type="submit"
          disabled={loading}
          className="mx-0 mb-0 py-4 rounded-xl bg-red-600 text-white font-semibold text-base"
        >
          {loading ? "Publication..." : "Publier"}
        </button>
    </form>
    </div>
  );
}