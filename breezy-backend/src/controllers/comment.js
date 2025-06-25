import Comment from "#models/comment.js";
import PostModel from "#models/post.js";
import notificationController from "#controllers/notification.js";

// Créer un commentaire principal
export const createComment = async (req, res) => {
    const { content } = req.body;
    const postId = req.params.postId;
    const userId = req.user.userId;

    try {
        const comment = new Comment({
            post_id: postId,
            user_id: userId,
            content,
            parent_comment: null
        });
        await comment.save();

        // Récupérer le post pour obtenir l'ID du propriétaire
        const post = await PostModel.findById(postId);
        
        if (post && post.user_id.toString() !== userId) {
            // Créer une notification pour le propriétaire du post
            try {
                await notificationController.createNotification(
                    post.user_id,
                    'comment',
                    userId,
                    'Quelqu\'un a commenté votre post',
                    postId
                );
            } catch (notificationError) {
                console.error("Erreur lors de la création de la notification de commentaire:", notificationError);
            }
        }

        res.status(201).json({ message: "Commentaire ajouté", comment });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'ajout du commentaire", error: error.message });
    }
};

// Répondre à un commentaire
export const replyToComment = async (req, res) => {
    const { content } = req.body;
    const postId = req.params.postId;
    const parentCommentId = req.params.commentId;
    const userId = req.user.userId;

    try {
        // Créer la réponse
        const reply = new Comment({
            post_id: postId,
            user_id: userId,
            content,
            parent_comment: parentCommentId
        });
        await reply.save();

        // Ajouter la réponse à la liste des replies du commentaire parent
        await Comment.findByIdAndUpdate(parentCommentId, {
            $push: { replies: reply._id }
        });

        // Récupérer le commentaire parent pour obtenir l'ID de son auteur
        const parentComment = await Comment.findById(parentCommentId);
        
        if (parentComment && parentComment.user_id.toString() !== userId) {
            // Créer une notification pour l'auteur du commentaire parent
            try {
                await notificationController.createNotification(
                    parentComment.user_id,
                    'comment',
                    userId,
                    'Quelqu\'un a répondu à votre commentaire',
                    postId
                );
            } catch (notificationError) {
                console.error("Erreur lors de la création de la notification de réponse:", notificationError);
            }
        }

        // Aussi notifier le propriétaire du post si c'est différent de l'auteur du commentaire parent
        const post = await PostModel.findById(postId);
        if (post && 
            post.user_id.toString() !== userId && 
            post.user_id.toString() !== parentComment.user_id.toString()) {
            try {
                await notificationController.createNotification(
                    post.user_id,
                    'comment',
                    userId,
                    'Quelqu\'un a répondu à un commentaire sur votre post',
                    postId
                );
            } catch (notificationError) {
                console.error("Erreur lors de la création de la notification de réponse au propriétaire:", notificationError);
            }
        }

        res.status(201).json({ message: "Réponse ajoutée", reply });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la réponse", error: error.message });
    }
};

// Récupérer tous les commentaires d'un post (avec population des réponses)
export const getCommentsByPost = async (req, res) => {
    const postId = req.params.postId;
    try {
        const comments = await Comment.find({ post_id: postId, parent_comment: null })
            .populate({
                path: "replies",
                populate: { path: "replies" } // pour peupler les sous-réponses (1 niveau)
            })
            .populate("user_id", "username name avatar");
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des commentaires", error: error.message });
    }
};

// Supprimer un commentaire (et ses réponses)
export const deleteComment = async (req, res) => {
    const commentId = req.params.commentId;
    try {
        // Supprimer le commentaire et toutes ses réponses récursivement
        const deleteCommentAndReplies = async (id) => {
            const comment = await Comment.findById(id);
            if (comment && comment.replies.length > 0) {
                for (const replyId of comment.replies) {
                    await deleteCommentAndReplies(replyId);
                }
            }
            await Comment.findByIdAndDelete(id);
        };
        await deleteCommentAndReplies(commentId);
        res.status(200).json({ message: "Commentaire supprimé" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression", error: error.message });
    }
};

// Export par défaut pour compatibilité
const commentController = {
    createComment,
    replyToComment,
    getCommentsByPost,
    deleteComment
};

export default commentController;