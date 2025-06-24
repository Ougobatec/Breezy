const express = require('express');
const router = express.Router();

const commentController = require('../controllers/comment.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/:postId', authMiddleware, commentController.createComment);
router.post('/:postId/comments/:commentId/replies', authMiddleware, commentController.replyToComment);
router.get('/:postId/comments', authMiddleware, commentController.getCommentsByPost);
router.delete('/:postId/comments/:commentId', authMiddleware, commentController.deleteComment);

module.exports = router;
// Ce fichier gère les routes pour les commentaires