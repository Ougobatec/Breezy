"use client";
import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import PrimaryButton from "@/components/PrimaryButton";

export default function PublishPage() {
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
    try {
      const formData = new FormData();
      formData.append("content", content);
      tags.forEach((t) => formData.append("tags[]", t));
      if (image) formData.append("image", image);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Erreur lors de la publication.");
      } else {
        router.replace("/home");
      }
    } catch (e) {
      setError("Erreur lors de la publication.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Layout headerProps={{ title: "Publier un post", showButtons: false }}>
      <div className="space-y-4 p-4">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl overflow-hidden border"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          {/* En-tête utilisateur */}
          <div className="flex items-center p-3.5">
            {user.avatar ? (
              <Image
                src={
                  user.avatar.startsWith("http")
                    ? user.avatar
                    : `${process.env.NEXT_PUBLIC_BACKEND_URL}${user.avatar}`
                }
                alt="Avatar"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full mr-2 object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full mr-2 flex items-center justify-center" style={{ backgroundColor: "var(--input)" }}>
                <Image
                  src="/avatar.svg"
                  alt="Avatar temporaire"
                  width={40}
                  height={40}
                  className="w-6 h-6 rounded-full object-cover"
                />
              </div>
            )}
            <div className="flex items-center gap-1 font-semibold text-sm">
              <span>{user?.name || "Name"}</span>
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                @{user?.username || "username"}
              </span>
            </div>
          </div>

          {/* Image du post */}
          <label
            htmlFor="image-upload"
            className="w-full aspect-[16/9] flex items-center justify-center cursor-pointer"
            style={{ backgroundColor: "var(--input)", borderColor: "var(--border)" }}
          >
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="preview"
                width={600}
                height={224}
                className="object-cover w-full h-full"
                style={{ width: "100%", height: "100%" }}
                unoptimized
              />
            ) : (
              <span style={{ color: "var(--text-secondary)" }}>Ajouter une image</span>
            )}
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>

          {/* Contenu */}
          <div className="flex flex-col gap-3.5 p-3.5 text-sm">
            <textarea
              className="w-full rounded-xl border px-3 py-3 text-sm"
              style={{ backgroundColor: "var(--input)", borderColor: "var(--border)" }}
              placeholder="Rédiger un post"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              maxLength={280}
              required
            />
            {/* Tags */}
            <div className="flex gap-2">
              <input
                className="w-full rounded-xl border p-3 text-sm"
                style={{ backgroundColor: "var(--input)", borderColor: "var(--border)" }}
                placeholder="Ajouter un tag"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="p-3 rounded-xl text-sm border cursor-pointer"
                style={{ backgroundColor: "var(--input)", borderColor: "var(--border)" }}
              >
                <Image src="/plus-grey.svg" alt="Ajouter un tag" width={24} height={24} />
              </button>
            </div>
            <div className="flex gap-1 flex-wrap text-xs" style={{ color: "var(--text-secondary)" }}>
              {tags.map((t) => (
                <span
                  key={t}
                  className="border rounded-full pl-2 py-1 flex items-center"
                  style={{ borderColor: "var(--border)" }}
                >
                  #{t}
                  <button
                    type="button"
                    className="mx-1 w-4 h-4 rounded-full cursor-pointer"
                    style={{ backgroundColor: "var(--primary)", color: "var(--text-inverted)" }}
                    title="Supprimer le tag"
                    onClick={() => handleRemoveTag(t)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
          </div>
          <div className="p-3.5 pt-0">
            <PrimaryButton
              type="submit"
              disabled={loading}
            >
              {loading ? "Publication..." : "Publier"}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </Layout>
  );
}