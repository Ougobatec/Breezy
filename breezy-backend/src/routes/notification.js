import express from 'express';
import authMiddleware from '#middlewares/auth.js';
import notificationController from '#controllers/notification.js';

const notificationRouter = express.Router();

// Récupérer les notifications
notificationRouter.get('/', authMiddleware, notificationController.getNotifications);

// Récupérer le nombre de notifications non lues
notificationRouter.get('/unread-count', authMiddleware, notificationController.getUnreadCount);

// Marquer une notification comme lue
notificationRouter.put('/:notificationId/read', authMiddleware, notificationController.markAsRead);

// Marquer toutes les notifications comme lues
notificationRouter.put('/mark-all-read', authMiddleware, notificationController.markAllAsRead);

// Supprimer une notification
notificationRouter.delete('/:notificationId', authMiddleware, notificationController.deleteNotification);

export default notificationRouter;