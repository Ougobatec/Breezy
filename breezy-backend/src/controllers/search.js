import UserModel from '#models/user.js';
import PostModel from '#models/post.js';

const searchController = {
    // Recherche globale (utilisateurs + posts)
    globalSearch: async (req, res) => {
        try {
            const { query, type = 'all', limit = 10 } = req.query;
            
            if (!query || query.trim().length < 2) {
                return res.status(400).json({ message: "La recherche doit contenir au moins 2 caractères" });
            }

            const searchRegex = new RegExp(query.trim(), 'i');
            const results = {};

            // Rechercher des utilisateurs si type = 'all' ou 'users'
            if (type === 'all' || type === 'users') {
                const users = await UserModel.find({
                    $or: [
                        { username: searchRegex },
                        { name: searchRegex }
                    ]
                })
                .select('username name avatar biography')
                .limit(parseInt(limit));
                
                results.users = users;
            }

            // Rechercher dans les posts si type = 'all' ou 'posts'
            if (type === 'all' || type === 'posts') {
                const posts = await PostModel.find({
                    content: searchRegex
                })
                .populate('user_id', 'username name avatar')
                .sort({ createdAt: -1 })
                .limit(parseInt(limit));
                
                results.posts = posts;
            }

            res.status(200).json(results);
        } catch (error) {
            console.error("Erreur lors de la recherche :", error);
            res.status(500).json({ message: "Erreur lors de la recherche", error: error.message });
        }
    },

    // Recherche d'utilisateurs uniquement
    searchUsers: async (req, res) => {
        try {
            const { query, limit = 10 } = req.query;
            
            if (!query || query.trim().length < 2) {
                return res.status(400).json({ message: "La recherche doit contenir au moins 2 caractères" });
            }

            const searchRegex = new RegExp(query.trim(), 'i');
            
            const users = await UserModel.find({
                $or: [
                    { username: searchRegex },
                    { name: searchRegex }
                ]
            })
            .select('username name avatar biography')
            .limit(parseInt(limit));

            res.status(200).json(users);
        } catch (error) {
            console.error("Erreur lors de la recherche d'utilisateurs :", error);
            res.status(500).json({ message: "Erreur lors de la recherche", error: error.message });
        }
    },

    // Recherche de mentions dans les posts
    searchMentions: async (req, res) => {
        try {
            const { query, limit = 10 } = req.query;
            
            if (!query || query.trim().length < 2) {
                return res.status(400).json({ message: "La recherche doit contenir au moins 2 caractères" });
            }

            // Rechercher les posts qui contiennent @query
            const mentionRegex = new RegExp(`@${query.trim()}`, 'i');
            
            const posts = await PostModel.find({
                content: mentionRegex
            })
            .populate('user_id', 'username name avatar')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

            res.status(200).json(posts);
        } catch (error) {
            console.error("Erreur lors de la recherche de mentions :", error);
            res.status(500).json({ message: "Erreur lors de la recherche", error: error.message });
        }
    }
};

export default searchController;