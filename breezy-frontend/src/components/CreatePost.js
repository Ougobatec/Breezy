import { useState } from "react";

export default function CreatePost({ onPostCreated, token }) {
    const [content, setContent] = useState("");
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");
    const [image, setImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Ajouter un tag
    const addTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase()) && tags.length < 10) {
            setTags([...tags, tagInput.trim().toLowerCase()]);
            setTagInput("");
        }
    };

    // Supprimer un tag
    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    // Gérer l'appui sur Entrée pour ajouter un tag
    const handleTagKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        
        try {
            const formData = new FormData();
            formData.append('content', content);
            
            // Ajouter les tags au FormData
            if (tags.length > 0) {
                formData.append('tags', JSON.stringify(tags));
            }
            
            if (image) {
                formData.append('image', image);
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
                body: formData,
            });

            if (response.ok) {
                setContent("");
                setTags([]);
                setTagInput("");
                setImage(null);
                onPostCreated();
            } else {
                console.error("Erreur lors de la création du post");
            }
        } catch (error) {
            console.error("Erreur lors de la création du post:", error);
        }
        
        setIsSubmitting(false);
    };

    return (
        <div className="bg-white rounded-xl shadow p-4 mb-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Zone de texte */}
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Quoi de neuf ?"
                    className="w-full p-3 border border-gray-200 rounded-lg resize-none outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                />

                {/* Zone des tags */}
                <div className="space-y-2">
                    {/* Input pour ajouter des tags */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={handleTagKeyPress}
                            placeholder="Ajouter un tag..."
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            maxLength="50"
                        />
                        <button
                            type="button"
                            onClick={addTag}
                            disabled={!tagInput.trim() || tags.length >= 10}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            +
                        </button>
                    </div>

                    {/* Affichage des tags ajoutés */}
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                >
                                    #{tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="text-blue-600 hover:text-blue-800 ml-1"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                    
                    {/* Limite de tags */}
                    <div className="text-xs text-gray-500">
                        {tags.length}/10 tags
                    </div>
                </div>

                {/* Zone d'upload d'image */}
                <div className="flex items-center gap-4">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                        className="text-sm text-gray-500"
                    />
                    {image && (
                        <button
                            type="button"
                            onClick={() => setImage(null)}
                            className="text-red-500 text-sm hover:text-red-700"
                        >
                            Supprimer l'image
                        </button>
                    )}
                </div>

                {/* Bouton de soumission */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={!content.trim() || isSubmitting}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? "Publication..." : "Publier"}
                    </button>
                </div>
            </form>
        </div>
    );
}