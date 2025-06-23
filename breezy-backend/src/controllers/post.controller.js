const Post = require("../models/post.model");

exports.createPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.user.userId; 
        const post = new Post({ title, content, user_id: userId });
        await post.save();
        res.status(201).json({ message: "Post créé avec succès", post });
    } catch (error) {
        console.error("Erreur lors de la création du post :", error);
        res.status(500).json({ message: "Erreur lors de la création du post", error: error.message });
    }
};