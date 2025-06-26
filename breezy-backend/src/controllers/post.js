import PostModel from "#models/post.js";
import SubscriptionModel from "#models/subscription.js"
import notificationController from "./notification.js";
import path from "path";
import fs from "fs";

const postController = {
    createPost: async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.user.userId;
        let media = null;

        // Si une image est envoyée
        if (req.file) {
            // Déplacer le fichier dans /uploads
            const ext = path.extname(req.file.originalname);
            const filename = `${Date.now()}_${userId}${ext}`;
            const destPath = path.join("uploads", filename);
            fs.writeFileSync(destPath, req.file.buffer);
            media = `/${destPath.replace(/\\/g, "/")}`;
        }

        const tags = req.body["tags[]"]
            ? Array.isArray(req.body["tags[]"])
                ? req.body["tags[]"]
                : [req.body["tags[]"]]
            : [];

        const post = new PostModel({ content, user_id: userId, media, tags });
        await post.save();
        res.status(201).json({ message: "Post créé avec succès", post });
    } catch (error) {
        console.error("Erreur lors de la création du post :", error);
        res.status(500).json({ message: "Erreur lors de la création du post", error: error.message });
    }
},

    // Récupérer tous les posts
    getAllPosts: async (req, res) => {
        try {
            // Si un userId est passé en query, on filtre sur cet utilisateur
            const filter = req.query.userId ? { user_id: req.query.userId } : {};
            const posts = await PostModel.find(filter)
                .sort({ createdAt: -1 })
                .populate('user_id', 'username name avatar');

            // Return empty array if no posts found instead of 404
            res.status(200).json(posts || []);
        } catch (error) {
            console.error("Error in getAllPosts:", error);
            res.status(500).json({ message: "Erreur lors de la récupération des posts", error: error.message });
        }
    },

    // Récupérer les posts du flux de l'utilisateur
    getFlowPosts: async (req, res) => {
        const userId = req.user.userId;

        try {
            // Récupérer les abonnements de l'utilisateur (utilisateurs suivis)
            const subscriptions = await SubscriptionModel.find({ subscriber_id: userId }).populate('subscription_id', 'username name avatar');
            const subscribedUserIds = subscriptions.map(sub => sub.subscription_id._id);

            // Ajouter l'utilisateur lui-même pour afficher ses propres posts
            subscribedUserIds.push(userId);

            // Récupérer les posts des utilisateurs abonnés
            const posts = await PostModel.find({ user_id: { $in: subscribedUserIds } })
                .sort({ createdAt: -1 })
                .populate('user_id', 'username name avatar');

            res.status(200).json({ posts });
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la récupération des posts du flux", error: error.message });
        }
    },

    // Récupérer un post par son ID
    getPostLikes : async (req, res) => {
        const postId = req.params.id;
    
        try {
            const post = await PostModel.findById(postId).populate('likes', 'username name avatar');
            if (!post) {
                return res.status(404).json({ message: "Post non trouvé." });
            }
    
            res.status(200).json({ likes: post.likes });
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la récupération des likes du post", error: error.message });
        }
    },

    likePost : async (req, res) => {
        const postId = req.params.id;
        const userId = req.user.userId;
    
        try {
            const post = await PostModel.findById(postId);
            if (!post) {
                return res.status(404).json({ message: "Post non trouvé." });
            }
    
            const wasLiked = post.likes.includes(userId);
    
            if (wasLiked) {
                // Si l'utilisateur a déjà liké le post, on le retire
                post.likes = post.likes.filter(id => id.toString() !== userId);
            } else {
                // Sinon, on ajoute l'utilisateur aux likes
                post.likes.push(userId);
                
                // Créer une notification pour le propriétaire du post (seulement s'il n'aime pas son propre post)
                if (post.user_id.toString() !== userId) {
                    try {
                        await notificationController.createNotification(
                            post.user_id,
                            'like',
                            userId,
                            'Quelqu\'un a aimé votre post',
                            postId
                        );
                    } catch (notificationError) {
                        console.error("Erreur lors de la création de la notification:", notificationError);
                        // On continue même si la notification échoue
                    }
                }
            }
    
            await post.save();
            res.status(200).json({ 
                message: "Post mis à jour avec succès", 
                post,
                liked: !wasLiked,
                likesCount: post.likes.length
            });
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la mise à jour du post", error: error.message });
        }
    },

    // Supprimer un post
    deletePost: async (req, res) => {
        const postId = req.params.id;
        const userId = req.user.userId;

        try {
            const post = await PostModel.findById(postId);
            if (!post) {
                return res.status(404).json({ message: "Post non trouvé." });
            }

            // Vérifier si l'utilisateur est le propriétaire du post
            if (post.user_id.toString() !== userId) {
                return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer ce post." });
            }

            await PostModel.findByIdAndDelete(postId);
            res.status(200).json({ message: "Post supprimé avec succès" });
        } catch (error) {
            console.error("Error in deletePost:", error);
            res.status(500).json({ message: "Erreur lors de la suppression du post", error: error.message });
        }
    }
}

export default postController;