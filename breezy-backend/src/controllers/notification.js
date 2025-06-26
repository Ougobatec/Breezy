import NotificationModel from "#models/notification.js";

const notificationController = {
    // Créer une notification
    createNotification: async (userId, type, fromUserId, content, fromPostId = null) => {
        try {
            // Éviter de créer une notification pour soi-même
            if (userId === fromUserId) return;

            const notification = new NotificationModel({
                user_id: userId,
                type,
                from_user_id: fromUserId,
                from_post_id: fromPostId,
                content,
                status: 'unread'
            });
            
            await notification.save();
            return notification;
        } catch (error) {
            console.error("Erreur lors de la création de la notification :", error);
        }
    },

    // Récupérer les notifications d'un utilisateur
    getNotifications: async (req, res) => {
        try {
            const userId = req.user.userId;
            const { type, status = 'all' } = req.query;
            
            let filter = { user_id: userId };
            
            // Filtrer par type si spécifié
            if (type && ['like', 'comment', 'follow', 'mention'].includes(type)) {
                filter.type = type;
            }
            
            // Filtrer par statut si spécifié
            if (status !== 'all' && ['unread', 'read'].includes(status)) {
                filter.status = status;
            }

            const notifications = await NotificationModel.find(filter)
                .populate('from_user_id', 'username name avatar')
                .populate('from_post_id', 'content')
                .sort({ created_at: -1 })
                .limit(50); // Limiter à 50 notifications récentes

            res.status(200).json(notifications);
        } catch (error) {
            console.error("Erreur lors de la récupération des notifications :", error);
            res.status(500).json({ error: error.message });
        }
    },

    // Marquer une notification comme lue
    markAsRead: async (req, res) => {
        try {
            const { notificationId } = req.params;
            const userId = req.user.userId;

            const notification = await NotificationModel.findOneAndUpdate(
                { _id: notificationId, user_id: userId },
                { status: 'read' },
                { new: true }
            );

            if (!notification) {
                return res.status(404).json({ message: "Notification non trouvée" });
            }

            res.status(200).json({ message: "Notification marquée comme lue" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Marquer toutes les notifications comme lues
    markAllAsRead: async (req, res) => {
        try {
            const userId = req.user.userId;
            const { type } = req.body;

            let filter = { user_id: userId, status: 'unread' };
            
            // Si un type spécifique est fourni
            if (type && ['like', 'comment', 'follow', 'mention'].includes(type)) {
                filter.type = type;
            }

            await NotificationModel.updateMany(filter, { status: 'read' });

            res.status(200).json({ message: "Notifications marquées comme lues" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Supprimer une notification
    deleteNotification: async (req, res) => {
        try {
            const { notificationId } = req.params;
            const userId = req.user.userId;

            const notification = await NotificationModel.findOneAndDelete({
                _id: notificationId,
                user_id: userId
            });

            if (!notification) {
                return res.status(404).json({ message: "Notification non trouvée" });
            }

            res.status(200).json({ message: "Notification supprimée" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtenir le nombre de notifications non lues
    getUnreadCount: async (req, res) => {
        try {
            const userId = req.user.userId;
            
            const counts = await NotificationModel.aggregate([
                { $match: { user_id: userId, status: 'unread' } },
                { $group: { _id: '$type', count: { $sum: 1 } } }
            ]);

            const result = {
                total: 0,
                like: 0,
                comment: 0,
                follow: 0,
                mention: 0
            };

            counts.forEach(item => {
                result[item._id] = item.count;
                result.total += item.count;
            });

            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

export default notificationController;