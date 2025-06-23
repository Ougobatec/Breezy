import { useState, useEffect } from "react";
import Image from "next/image";

export default function UserProfile({ user, onBioUpdate, onAvatarUpdate }) {
    const [editing, setEditing] = useState(false);
    const [bio, setBio] = useState(user?.bio || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [avatar, setAvatar] = useState(user?.avatar || "");
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarLoading, setAvatarLoading] = useState(false);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const avatarSrc = avatar?.startsWith("/uploads/")
        ? `${backendUrl}${avatar}`
        : avatar || "/user.svg";

    // Synchronise la bio locale si user.bio change (après update)
    useEffect(() => {
        setBio(user?.bio || "");
    }, [user?.bio]);

    useEffect(() => {
        setAvatar(user?.avatar || "");
    }, [user?.avatar]);

    const handleSave = async () => {
        setLoading(true);
        setError("");
        try {
            if (onBioUpdate) {
                await onBioUpdate(bio);
            }
            setEditing(false);
        } catch (e) {
            setError("Erreur lors de la mise à jour.");
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatar(URL.createObjectURL(file));
        }
    };

    const handleAvatarSave = async () => {
        if (!avatarFile) return;
        setAvatarLoading(true);
        setError("");
        try {
            const formData = new FormData();
            formData.append("avatar", avatarFile);
            // Appel à la prop onAvatarUpdate si fournie
            if (typeof onAvatarUpdate === "function") {
                await onAvatarUpdate(formData);
            }
            setAvatarFile(null);
        } catch (e) {
            setError("Erreur lors de la mise à jour de l'image.");
        } finally {
            setAvatarLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-md w-full max-w-md mx-auto mt-8">
            <div className="w-24 h-24 relative">
                <Image
                    src={avatarSrc}
                    alt="Photo de profil"
                    fill
                    className="rounded-full object-cover border-2 border-gray-200"
                />
                <input
                    type="file"
                    accept="image/*"
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleAvatarChange}
                    disabled={avatarLoading}
                    title="Changer la photo de profil"
                />
                {avatarFile && (
                    <button
                        onClick={handleAvatarSave}
                        className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full px-2 py-1 text-xs"
                        disabled={avatarLoading}
                    >
                        Sauver
                    </button>
                )}
            </div>
            <h2 className="text-2xl font-bold text-black">{user?.name || "Nom d'utilisateur"}</h2>
            {editing ? (
                <>
                    <textarea
                        className="border rounded p-2 w-full min-h-[60px] text-black"
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        disabled={loading}
                    />
                    <div className="flex gap-2 mt-2">
                        <button onClick={handleSave} className="px-4 py-1 bg-blue-500 text-white rounded" disabled={loading}>
                            Sauvegarder
                        </button>
                        <button onClick={() => { setEditing(false); setBio(user?.bio || ""); }} className="px-4 py-1 bg-gray-200 rounded" disabled={loading}>
                            Annuler
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </>
            ) : (
                <>
                    <p className="text-black text-center">{user?.bio || "Aucune biographie renseignée."}</p>
                    <button onClick={() => setEditing(true)} className="mt-2 px-4 py-1 bg-blue-500 text-white rounded">
                        Modifier ma bio
                    </button>
                </>
            )}
        </div>
    );
}
