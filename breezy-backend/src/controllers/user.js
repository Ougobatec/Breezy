import UserModel from "#models/user.js";
import PostModel from "#models/post.js";
import SubscriptionModel from "#models/subscription.js";
import multer from "multer";
import path from "path";

// Multer config pour l'upload d'avatar
const upload = multer({
    dest: "/uploads/avatars",
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
});


const userController = {
    // GET /user/profile : renvoie la biographie et l'avatar de l'utilisateur connecté
    getBio: async (req, res) => {
        try {
            const userId = req.user.userId;
            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "Utilisateur non trouvé" });
            }
            res.json({ 
                name: user.name,
                username: user.username,
                biography: user.biography, 
                avatar: user.avatar 
            });
        } catch (err) {
            console.error("Error in getBio:", err);
            res.status(500).json({ message: "Erreur serveur" });
        }
    },

    // PUT /user/profile : met à jour la biographie et d'autres informations
    updateBio: async (req, res) => {
        try {
            const userId = req.user.userId;
            const { bio, name, removeAvatar } = req.body;
            
            // Préparer les champs à mettre à jour
            const updateFields = {};
            if (typeof bio === "string") {
                updateFields.biography = bio;
            }
            if (typeof name === "string") {
                updateFields.name = name;
            }
            
            // Gérer la suppression de l'avatar
            if (removeAvatar === "true" || removeAvatar === true) {
                updateFields.avatar = null;
            }
            
            // Gérer l'upload d'avatar (si un fichier est envoyé)
            if (req.file) {
                updateFields.avatar = `/uploads/avatars/${req.file.filename}`;
            }
            
            const user = await UserModel.findByIdAndUpdate(
                userId,
                updateFields,
                { new: true }
            );
            
            if (!user) {
                return res.status(404).json({ message: "Utilisateur non trouvé" });
            }
            
            res.json({ message: "Profil mis à jour", user });
        } catch (err) {
            console.error("Error in updateBio:", err);
            res.status(500).json({ message: "Erreur serveur", error: err.message });
        }
    },

    // PUT /user/profile/avatar : upload et met à jour l'avatar
    uploadAvatar: () => {
        upload.single("avatar"),
        async (req, res) => {
            try {
                const userId = req.user.userId;
                if (!req.file) return res.status(400).json({ message: "Aucun fichier envoyé" });
                const avatarPath = `/uploads/avatars/${req.file.filename}`;
                const user = await UserModel.findByIdAndUpdate(
                    userId,
                    { avatar: avatarPath },
                    { new: true }
                );
                if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
                res.json({ message: "Avatar mis à jour", user });
            } catch (err) {
                console.error("Error in uploadAvatar:", err);
                res.status(500).json({ message: "Erreur serveur" });
            }
        }
    },

    // GET /users/:id : récupère le profil public d'un utilisateur
    getPublicProfile: async (req, res) => {
        try {
            const userId = req.params.id;
            const currentUserId = req.user.userId;
            
            const user = await UserModel.findById(userId).select('-password -email');
            
            if (!user) {
                return res.status(404).json({ message: "Utilisateur non trouvé" });
            }

            // Compter les posts réels
            const postsCount = await PostModel.countDocuments({ user_id: userId });
            
            // Compter les followers et following via le modèle Subscription
            const followersCount = await SubscriptionModel.countDocuments({ subscription_id: userId });
            const followingCount = await SubscriptionModel.countDocuments({ subscriber_id: userId });
            
            // Vérifier si l'utilisateur actuel suit déjà cet utilisateur
            const isFollowing = await SubscriptionModel.findOne({
                subscriber_id: currentUserId,
                subscription_id: userId
            });

            res.json({
                _id: user._id,
                name: user.name,
                username: user.username,
                biography: user.biography,
                avatar: user.avatar,
                postsCount,
                followersCount,
                followingCount,
                isFollowing: !!isFollowing
            });
        } catch (err) {
            console.error("Error in getPublicProfile:", err);
            res.status(500).json({ message: "Erreur serveur" });
        }
    }

}

export default userController;