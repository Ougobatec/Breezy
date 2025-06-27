import express from 'express';
import authMiddleware from '#middlewares/auth.js';
import commentController from '#controllers/comment.js';

const router = express.Router();

router.post('/:postId', authMiddleware, commentController.createComment);
router.post('/:postId/comments/:commentId/replies', authMiddleware, commentController.replyToComment);
router.get('/:postId/comments', authMiddleware, commentController.getCommentsByPost);
router.delete('/:postId/comments/:commentId', authMiddleware, commentController.deleteComment);

export default router;
// Ce fichier gère les routes pour les commentaires