"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import PrimaryButton from "@/components/PrimaryButton";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/utils/cropImage";

export default function PublishPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("");
  const [tags, setTags] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const fileInputRef = useRef();
  const [originalImage, setOriginalImage] = useState(null);
  const [video, setVideo] = useState(null);

  function handleMediaChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.type.startsWith("image/")) {
    setVideo(null); // <-- Ajoute ceci pour éviter d'uploader une vidéo en même temps
    setOriginalImage(file);
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setShowCropper(true);
  } else if (file.type.startsWith("video/")) {
    setImage(null);
    setOriginalImage(null);
    setImagePreview(URL.createObjectURL(file));
    setShowCropper(false);
    setVideo(file);
  }
}
  const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setOriginalImage(file);
  setImage(file);
  setImagePreview(URL.createObjectURL(file));
  setShowCropper(true);
};

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropConfirm = async () => {
    if (!imagePreview || !croppedAreaPixels) return;
    const croppedFile = await getCroppedImg(imagePreview, croppedAreaPixels);
    setImage(croppedFile);
    setImagePreview(URL.createObjectURL(croppedFile));
    setShowCropper(false);
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
    if (loading) return; // Empêche les doubles soumissions
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("content", content);
      tags.forEach((t) => formData.append("tags[]", t));
      if (image) formData.append("image", image);
      else if (video) formData.append("image", video);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );
      // Redirige vers home si une vidéo a été publiée et la requête a réussi
      if (video && res.ok) {
        router.push("/home");
        return;
      }
      // Redirige aussi si une image a été publiée et la requête a réussi
      if (image && res.ok) {
        router.push("/home");
        return;
      }
    } catch (e) {
      setError(t("publishError"));
      setLoading(false); // On réactive le bouton seulement en cas d'erreur
    } finally {
      // On ne réactive plus le bouton ici, car la page va changer si succès
    }
  };

  if (!user) return null;

  return (
    <Layout headerProps={{ title: t("publishPost"), showButtons: false }}>
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
              <div
                className="w-10 h-10 rounded-full mr-2 flex items-center justify-center"
                style={{ backgroundColor: "var(--input)" }}
              >
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

          {/* Image du post avec cropper */}
          <label
            htmlFor="media-upload"
            className="w-full aspect-[1/1] flex items-center justify-center cursor-pointer relative"
            style={{ backgroundColor: "var(--input)", borderColor: "var(--border)" }}
          >
            {video && imagePreview ? (
              <div className="relative w-full h-full">
                <video
                  src={imagePreview}
                  controls
                  className="object-cover w-full h-full rounded-xl"
                  style={{ width: "100%", height: "100%" }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setVideo(null);
                    setImagePreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute bottom-2 left-2 z-10 bg-gray-600 text-white px-3 py-1 rounded"
                >
                  Changer la vidéo
                </button>
              </div>
            ) : imagePreview && showCropper ? (
              <div style={{ position: "relative", width: "100%", height: 224 }}>
                <Cropper
                  image={imagePreview}
                  crop={crop}
                  zoom={zoom}
                  aspect={1 / 1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
                <button
                  type="button"
                  onClick={handleCropConfirm}
                  className="absolute bottom-2 right-2 z-10 bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Valider le crop
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                    setShowCropper(false);
                    setCroppedAreaPixels(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute bottom-2 left-2 z-10 bg-gray-600 text-white px-3 py-1 rounded"
                >
                  Changer d&apos;image
                </button>
              </div>
            ) : imagePreview ? (
              <div className="relative w-full h-full">
                <Image
                  src={imagePreview}
                  alt="preview"
                  width={600}
                  height={600}
                  className="object-cover w-full h-full"
                  style={{ width: "100%", height: "100%" }}
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage(originalImage);
                    setImagePreview(URL.createObjectURL(originalImage));
                    setShowCropper(true);
                  }}
                  className="absolute bottom-2 right-2 z-10 bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Recadrer à nouveau
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                    setShowCropper(false);
                    setCroppedAreaPixels(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute bottom-2 left-2 z-10 bg-gray-600 text-white px-3 py-1 rounded"
                >
                  Changer d&apos;image
                </button>
              </div>
            ) : (
              <span style={{ color: "var(--text-secondary)" }}>{t("addImage")}</span>
            )}
            <input
              id="media-upload"
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleMediaChange}
              ref={fileInputRef}
              disabled={showCropper}
            />
          </label>

          {/* Contenu */}
          <div className="flex flex-col gap-3.5 p-3.5 text-sm">
            <textarea
              className="w-full rounded-xl border px-3 py-3 text-sm"
              style={{ backgroundColor: "var(--input)", borderColor: "var(--border)" }}
              placeholder={t("writePost")}
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
                placeholder={t("addTag")}
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="p-3 rounded-xl text-sm border cursor-pointer"
                style={{ backgroundColor: "var(--input)", borderColor: "var(--border)" }}
              >
                <Image src="/plus-grey.svg" alt={t("addTag")} width={24} height={24} />
              </button>
            </div>
            <div
              className="flex gap-1 flex-wrap text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              {tags.map((tagItem) => (
                <span
                  key={tagItem}
                  className="border rounded-full pl-2 py-1 flex items-center"
                  style={{ borderColor: "var(--border)" }}
                >
                  #{tagItem}
                  <button
                    type="button"
                    className="mx-1 w-4 h-4 rounded-full cursor-pointer"
                    style={{
                      backgroundColor: "var(--primary)",
                      color: "var(--text-inverted)",
                    }}
                    title={t("removeTag")}
                    onClick={() => handleRemoveTag(tagItem)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
          </div>
          <div className="p-3.5 pt-0">
            <PrimaryButton type="submit" disabled={loading || showCropper}>
              {loading ? t("publishing") : t("publish")}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </Layout>
  );
}