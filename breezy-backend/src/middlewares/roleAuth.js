import UserModel from "#models/user.js";

// Middleware pour vérifier les rôles
const requireRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.userId;
            const user = await UserModel.findById(userId);
            
            if (!user) {
                return res.status(404).json({ message: "Utilisateur non trouvé" });
            }

            // Vérifier si l'utilisateur est suspendu ou banni
            if (user.suspended || user.banned) {
                return res.status(403).json({ message: "Accès refusé: compte suspendu ou banni" });
            }

            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({ message: "Accès refusé: privilèges insuffisants" });
            }

            req.userRole = user.role;
            req.userInfo = user;
            next();
        } catch (error) {
            console.error("Erreur dans requireRole:", error);
            res.status(500).json({ message: "Erreur serveur" });
        }
    };
};

// Middleware pour vérifier si l'utilisateur est modérateur ou admin
const requireModerator = requireRole(['moderator', 'admin']);

// Middleware pour vérifier si l'utilisateur est admin
const requireAdmin = requireRole(['admin']);

// Middleware pour vérifier si l'utilisateur peut modifier/supprimer un contenu
const canModerateContent = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const user = await UserModel.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Vérifier si l'utilisateur est suspendu ou banni
        if (user.suspended || user.banned) {
            return res.status(403).json({ message: "Accès refusé: compte suspendu ou banni" });
        }

        req.userRole = user.role;
        req.userInfo = user;
        req.canModerate = user.role === 'moderator' || user.role === 'admin';
        next();
    } catch (error) {
        console.error("Erreur dans canModerateContent:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export { requireRole, requireModerator, requireAdmin, canModerateContent };
