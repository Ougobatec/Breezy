const User = require("../models/user.model");

// Met à jour la biographie de l'utilisateur connecté
exports.updateBio = async (req, res) => {
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
};

// Récupère la biographie de l'utilisateur connecté
exports.getBio = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        res.json({ biography: user.biography });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};
