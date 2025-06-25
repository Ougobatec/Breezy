

import UserModel from "#models/user.js";
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
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "Utilisateur non trouvé" });
            }
            res.json({ biography: user.biography, avatar: user.avatar });
        } catch (err) {
            res.status(500).json({ message: "Erreur serveur" });
        }
    },

    // PUT /user/profile : met à jour la biographie
    updateBio: async (req, res) => {
        try {
            const userId = req.user.userId;
            const { biography } = req.body;
            if (typeof biography !== "string") {
                return res.status(400).json({ message: "Biographie invalide" });
            }
            const user = await User.findByIdAndUpdate(
                userId,
                { biography },
                { new: true }
            );
            if (!user) {
                return res.status(404).json({ message: "Utilisateur non trouvé" });
            }
            res.json({ message: "Biographie mise à jour", user });
        } catch (err) {
            res.status(500).json({ message: "Erreur serveur" });
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
                const user = await User.findByIdAndUpdate(
                    userId,
                    { avatar: avatarPath },
                    { new: true }
                );
                if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
                res.json({ message: "Avatar mis à jour", user });
            } catch (err) {
                res.status(500).json({ message: "Erreur serveur" });
            }
        }
    }
}


export default userController;