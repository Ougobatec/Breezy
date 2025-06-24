import SubscriptionModel from "#models/subscription.js";


const subController = {
    
    subscriptionAdd: async (req, res) => {

        const { folower, subscriber } = req.body; // Ajout de image

        try {
            const subscription = new SubscriptionModel({ folower, subscriber }); // Ajout de image
            await subscription.save();
            res.status(201).json(subscription);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    followerGet: async (req, res) => {
        console.log("Creating a new post");
        const { follower } = req.body; // Ajout de image
        const lefollower = await SubscriptionModel.findOne({ follower });
        if (!lefollower) {
            return res.status(404).json({ message: "Abonnement non trouvé" });
        }
        res.status(200).json(lefollower);
    },

    subscriptionsGet: async (req, res) => {
        console.log("Creating a new post");
        const { subscription } = req.body; // Ajout de image
        const abonement = await SubscriptionModel.findOne({ subscription });
        if (!abonement) {
            return res.status(404).json({ message: "Abonnement non trouvé" });
        }
        res.status(200).json(abonement);

    },

    subscriptionsRemove: async (req, res) => {
        console.log("Creating a new post");
        const { subscription } = req.body; // Ajout de image
        const abonement = await SubscriptionModel.findOne({ subscription });
        if (!abonement) {
            return res.status(404).json({ message: "Abonnement non trouvé" });
        }
        try {
            await abonement.remove();
            res.status(200).json({ message: "Abonnement supprimé avec succès" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

       
}

export default subController