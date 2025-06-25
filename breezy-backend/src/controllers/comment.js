const Comment = require("../models/comment.model");

// Créer un commentaire principal
exports.createComment = async (req, res) => {
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
        res.status(201).json({ message: "Commentaire ajouté", comment });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'ajout du commentaire", error: error.message });
    }
};

// Répondre à un commentaire
exports.replyToComment = async (req, res) => {
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

        res.status(201).json({ message: "Réponse ajoutée", reply });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la réponse", error: error.message });
    }
};

// Récupérer tous les commentaires d'un post (avec population des réponses)
exports.getCommentsByPost = async (req, res) => {
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
exports.deleteComment = async (req, res) => {
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