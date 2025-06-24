
import postModel from "#models/post.js";


const postController = {
    



    createPost: async (req, res) => {
        try {
            const { content } = req.body;
            const userId = req.user.userId;
            const post = new Post({ content, user_id: userId });
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
            const posts = await Post.find().sort({ createdAt: -1 }).populate('user_id', 'username name avatar');
        
            if (!posts || posts.length === 0) {
                return res.status(404).json({ message: "Aucun post trouvé." });
            }

            res.status(200).json(posts);
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la récupération des posts", error: error.message });
        }
    }
}

export default postController;