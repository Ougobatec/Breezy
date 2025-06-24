import SubscriptionModel from "#models/subscription.js";



const subController = {
    
    subscriptionAdd: async (req, res) => {
        console.log("Creating a new post");
        const { title, content, author } = req.body; // Ajout de image

        try {
            const post = new Post_private({ title, content, author, image }); // Ajout de image
            await post.save();
            res.status(201).json(post);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    followerGet: async (req, res) => {
        console.log("Creating a new post");
        const { title, content, author } = req.body; // Ajout de image

        try {
            const post = new Post_private({ title, content, author, image }); // Ajout de image
            await post.save();
            res.status(201).json(post);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    subscriptionsGet: async (req, res) => {
        console.log("Creating a new post");
        const { title, content, author } = req.body; // Ajout de image

        try {
            const post = new Post_private({ title, content, author, image }); // Ajout de image
            await post.save();
            res.status(201).json(post);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    subscriptionsRemove: async (req, res) => {
        console.log("Creating a new post");
        const { title, content, author } = req.body; // Ajout de image

        try {
            const post = new Post_private({ title, content, author, image }); // Ajout de image
            await post.save();
            res.status(201).json(post);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
}

export default subController