import UserModel from "#models/user.js";
import PostModel from "#models/post.js";
import Comment from "#models/comment.js";
import notificationController from "./notification.js";

const adminController = {
    // Obtenir tous les utilisateurs (Admin uniquement)
    getAllUsers: async (req, res) => {
        try {
            const { page = 1, limit = 20, search = '', role = '' } = req.query;
            const skip = (page - 1) * limit;

            // Construire le filtre de recherche
            let filter = {};
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { username: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
            }
            if (role) {
                filter.role = role;
            }

            const users = await UserModel.find(filter)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await UserModel.countDocuments(filter);

            res.status(200).json({
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error("Error in getAllUsers:", error);
            res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs", error: error.message });
        }
    },

    // Changer le rôle d'un utilisateur (Admin uniquement)
    changeUserRole: async (req, res) => {
        try {
            const { userId } = req.params;
            const { role } = req.body;
            const adminId = req.user.userId;

            if (!['user', 'moderator', 'admin'].includes(role)) {
                return res.status(400).json({ message: "Rôle invalide" });
            }

            // Empêcher un admin de se dégrader lui-même
            if (userId === adminId && role !== 'admin') {
                return res.status(403).json({ message: "Vous ne pouvez pas modifier votre propre rôle d'administrateur" });
            }

            const user = await UserModel.findByIdAndUpdate(
                userId,
                { role },
                { new: true }
            ).select('-password');

            if (!user) {
                return res.status(404).json({ message: "Utilisateur non trouvé" });
            }

            // Notifier l'utilisateur du changement de rôle
            try {
                await notificationController.createNotification(
                    userId,
                    'role_change',
                    adminId,
                    `Votre rôle a été modifié en ${role}`,
                    null
                );
            } catch (notificationError) {
                console.error("Erreur lors de la notification de changement de rôle:", notificationError);
            }

            res.status(200).json({ message: "Rôle modifié avec succès", user });
        } catch (error) {
            console.error("Error in changeUserRole:", error);
            res.status(500).json({ message: "Erreur lors de la modification du rôle", error: error.message });
        }
    },

    // Suspendre/Bannir un utilisateur (Admin et Modérateur)
    moderateUser: async (req, res) => {
        try {
            const { userId } = req.params;
            const { action, reason } = req.body; // action: 'suspend', 'ban', 'unsuspend', 'unban'
            const moderatorId = req.user.userId;
            const moderatorRole = req.userRole;

            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "Utilisateur non trouvé" });
            }

            // Empêcher la modération d'un admin par un modérateur
            if (user.role === 'admin' && moderatorRole !== 'admin') {
                return res.status(403).json({ message: "Seul un administrateur peut modérer un autre administrateur" });
            }

            // Empêcher l'auto-modération
            if (userId === moderatorId) {
                return res.status(403).json({ message: "Vous ne pouvez pas vous modérer vous-même" });
            }

            let updateData = {};
            let actionMessage = '';

            switch (action) {
                case 'suspend':
                    updateData.suspended = true;
                    actionMessage = `Votre compte a été suspendu. Raison: ${reason || 'Non spécifiée'}`;
                    break;
                case 'unsuspend':
                    updateData.suspended = false;
                    actionMessage = 'Votre compte n\'est plus suspendu';
                    break;
                case 'ban':
                    updateData.banned = true;
                    actionMessage = `Votre compte a été banni. Raison: ${reason || 'Non spécifiée'}`;
                    break;
                case 'unban':
                    updateData.banned = false;
                    actionMessage = 'Votre compte n\'est plus banni';
                    break;
                default:
                    return res.status(400).json({ message: "Action invalide" });
            }

            const updatedUser = await UserModel.findByIdAndUpdate(
                userId,
                updateData,
                { new: true }
            ).select('-password');

            // Notifier l'utilisateur
            try {
                await notificationController.createNotification(
                    userId,
                    'moderation',
                    moderatorId,
                    actionMessage,
                    null
                );
            } catch (notificationError) {
                console.error("Erreur lors de la notification de modération:", notificationError);
            }

            res.status(200).json({ message: `Utilisateur ${action} avec succès`, user: updatedUser });
        } catch (error) {
            console.error("Error in moderateUser:", error);
            res.status(500).json({ message: "Erreur lors de la modération de l'utilisateur", error: error.message });
        }
    },

    // Obtenir les posts signalés (Admin et Modérateur)
    getReportedPosts: async (req, res) => {
        try {
            const { page = 1, limit = 20 } = req.query;
            const skip = (page - 1) * limit;

            const reportedPosts = await PostModel.find({ 
                reports: { $exists: true, $not: { $size: 0 } } 
            })
                .populate('user_id', 'username name avatar')
                .populate('reports.user_id', 'username name')
                .sort({ 'reports.0.reported_at': -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await PostModel.countDocuments({ 
                reports: { $exists: true, $not: { $size: 0 } } 
            });

            res.status(200).json({
                posts: reportedPosts,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error("Error in getReportedPosts:", error);
            res.status(500).json({ message: "Erreur lors de la récupération des posts signalés", error: error.message });
        }
    },

    // Résoudre un signalement de post (Admin et Modérateur)
    resolvePostReport: async (req, res) => {
        try {
            const { postId } = req.params;
            const { action } = req.body; // action: 'dismiss', 'delete'
            const moderatorId = req.user.userId;

            const post = await PostModel.findById(postId);
            if (!post) {
                return res.status(404).json({ message: "Post non trouvé" });
            }

            if (action === 'delete') {
                // Notifier l'auteur du post
                try {
                    await notificationController.createNotification(
                        post.user_id,
                        'moderation',
                        moderatorId,
                        'Votre post a été supprimé suite à des signalements',
                        postId
                    );
                } catch (notificationError) {
                    console.error("Erreur lors de la notification:", notificationError);
                }

                await PostModel.findByIdAndDelete(postId);
                res.status(200).json({ message: "Post supprimé avec succès" });
            } else if (action === 'dismiss') {
                // Vider les signalements
                post.reports = [];
                await post.save();
                res.status(200).json({ message: "Signalements ignorés" });
            } else {
                return res.status(400).json({ message: "Action invalide" });
            }
        } catch (error) {
            console.error("Error in resolvePostReport:", error);
            res.status(500).json({ message: "Erreur lors de la résolution du signalement", error: error.message });
        }
    },

    // Statistiques de modération (Admin uniquement)
    getModerationStats: async (req, res) => {
        try {
            const totalUsers = await UserModel.countDocuments();
            const totalModerators = await UserModel.countDocuments({ role: 'moderator' });
            const totalAdmins = await UserModel.countDocuments({ role: 'admin' });
            const suspendedUsers = await UserModel.countDocuments({ suspended: true });
            const bannedUsers = await UserModel.countDocuments({ banned: true });
            const totalPosts = await PostModel.countDocuments();
            const reportedPosts = await PostModel.countDocuments({ 
                reports: { $exists: true, $not: { $size: 0 } } 
            });

            res.status(200).json({
                users: {
                    total: totalUsers,
                    moderators: totalModerators,
                    admins: totalAdmins,
                    suspended: suspendedUsers,
                    banned: bannedUsers
                },
                posts: {
                    total: totalPosts,
                    reported: reportedPosts
                }
            });
        } catch (error) {
            console.error("Error in getModerationStats:", error);
            res.status(500).json({ message: "Erreur lors de la récupération des statistiques", error: error.message });
        }
    }
};

export default adminController;
