import PostModel from "#models/post.js";
import SubscriptionModel from "#models/subscription.js"
import UserModel from "#models/user.js";
import notificationController from "./notification.js";
import path from "path";
import fs from "fs";

const postController = {
    createPost: async (req, res) => {
        try {
            const { content } = req.body;
            const userId = req.user.userId;
            
            // Vérifier le statut de l'utilisateur
            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "Utilisateur non trouvé" });
            }
            
            if (user.suspended) {
                return res.status(403).json({ message: "Vous ne pouvez pas publier car votre compte est suspendu" });
            }
            
            if (user.banned) {
                return res.status(403).json({ message: "Vous ne pouvez pas publier car votre compte est banni" });
            }
            
            let media = null;

            // Si une image est envoyée
            if (req.file) {
                // S'assurer que le dossier uploads existe
                const uploadsDir = "uploads";
                if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir, { recursive: true });
                }
                
                // Déplacer le fichier dans /uploads
                const ext = path.extname(req.file.originalname);
                const filename = `${Date.now()}_${userId}${ext}`;
                const destPath = path.join(uploadsDir, filename);
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
<<<<<<< HEAD
    },
=======

        let tags = [];
        if (req.body["tags"]) {
            tags = Array.isArray(req.body["tags"])
                ? req.body["tags"]
                : [req.body["tags"]];
            tags = tags
                .map(t => (typeof t === "string" ? t.trim() : ""))
                .filter(t => t)
                .filter((t, i, arr) => arr.indexOf(t) === i);
        }
        console.log("tags reçu :", req.body["tags"]);
        const post = new PostModel({ content, user_id: userId, media, tags });
        await post.save();
        res.status(201).json({ message: "Post créé avec succès", post });
    } catch (error) {
        console.error("Erreur lors de la création du post :", error);
        res.status(500).json({ message: "Erreur lors de la création du post", error: error.message });
    }
},
>>>>>>> dev

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

            // Récupérer les informations de l'utilisateur pour vérifier son rôle
            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "Utilisateur non trouvé." });
            }

            // Vérifier les permissions de suppression
            const isOwner = post.user_id.toString() === userId;
            const isModerator = user.role === 'moderator' || user.role === 'admin';
            
            if (!isOwner && !isModerator) {
                return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer ce post." });
            }

            // Si c'est un modérateur/admin qui supprime le post d'un autre utilisateur,
            // créer une notification pour informer l'auteur original
            if (!isOwner && isModerator) {
                try {
                    await notificationController.createNotification(
                        post.user_id,
                        'moderation',
                        userId,
                        `Votre post a été supprimé par un ${user.role === 'admin' ? 'administrateur' : 'modérateur'}`,
                        postId
                    );
                } catch (notificationError) {
                    console.error("Erreur lors de la création de la notification de modération:", notificationError);
                }
            }

            await PostModel.findByIdAndDelete(postId);
            res.status(200).json({ message: "Post supprimé avec succès" });
        } catch (error) {
            console.error("Error in deletePost:", error);
            res.status(500).json({ message: "Erreur lors de la suppression du post", error: error.message });
        }
    },

    // Signaler un post (pour les utilisateurs)
    reportPost: async (req, res) => {
        const postId = req.params.id;
        const userId = req.user.userId;
        const { reason } = req.body;

        try {
            const post = await PostModel.findById(postId);
            if (!post) {
                return res.status(404).json({ message: "Post non trouvé." });
            }

            // Vérifier si l'utilisateur a déjà signalé ce post
            if (post.reports && post.reports.some(report => report.user_id.toString() === userId)) {
                return res.status(400).json({ message: "Vous avez déjà signalé ce post." });
            }

            // Ajouter le signalement
            if (!post.reports) {
                post.reports = [];
            }
            post.reports.push({
                user_id: userId,
                reason: reason || "Contenu inapproprié",
                reported_at: new Date()
            });

            await post.save();

            // Notifier les modérateurs si le post a plusieurs signalements
            if (post.reports.length >= 3) {
                try {
                    console.log(`Post ${postId} a atteint ${post.reports.length} signalements, notification des modérateurs...`);
                    
                    // Trouver tous les modérateurs et admins
                    const moderators = await UserModel.find({ role: { $in: ['moderator', 'admin'] } });
                    console.log(`${moderators.length} modérateurs/admins trouvés:`, moderators.map(m => `${m.username} (${m.role})`));
                    
                    for (const moderator of moderators) {
                        const notification = await notificationController.createNotification(
                            moderator._id,
                            'report',
                            userId,
                            `Un post a été signalé ${post.reports.length} fois et nécessite une modération`,
                            postId
                        );
                        console.log(`Notification créée pour ${moderator.username}:`, notification?._id);
                    }
                } catch (notificationError) {
                    console.error("Erreur lors de la notification des modérateurs:", notificationError);
                }
            }

            res.status(200).json({ message: "Post signalé avec succès" });
        } catch (error) {
            console.error("Error in reportPost:", error);
            res.status(500).json({ message: "Erreur lors du signalement du post", error: error.message });
        }
    }
}

export default postController;