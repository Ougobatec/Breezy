import SubscriptionModel from "#models/subscription.js";

// Supposons que tu as un middleware d'auth qui ajoute req.user (sinon à ajouter !)

const subController = {
    // Ajouter un abonnement (je m'abonne à quelqu'un)
    subscriptionAdd: async (req, res) => {
        console.log("Requête d'abonnement reçue :", req.body);
        const { targetId } = req.body; // id de la personne que je veux suivre

        const myUserId = req.user.userId || req.user.id; // pour compatibilité
        console.log(myUserId, "veut s'abonner à", targetId);
        try {
            const subscription = new SubscriptionModel({
                subscription_id: targetId,
                subscriber_id: myUserId,
            });
            await subscription.save();
            res.status(201).json(subscription);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Récupérer mes followers (ceux qui ME suivent)
    followerGet: async (req, res) => {
        const myUserId = req.user.userId || req.user.id; // pour compatibilité
        console.log(myUserId, "veut voir ses abonnés");

        try {
            const followers = await SubscriptionModel.find({ subscription_id: myUserId }).populate("subscriber_id", "name username avatar");
            res.status(200).json(followers.map(sub => sub.subscriber_id));
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Récupérer mes abonnements (ceux que JE suis)
    subscriptionsGet: async (req, res) => {
        const myUserId = req.user.userId || req.user.id; // pour compatibilité
        console.log(myUserId, "veut voir ses abonnements");
        try {
            const subscriptions = await SubscriptionModel.find({ subscriber_id: myUserId }).populate("subscription_id", "name username avatar");
            res.status(200).json(subscriptions.map(sub => sub.subscription_id));
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    removeFollower: async (req, res) => {
        const { followerUserId } = req.body; // id de l'abonné à retirer
        const myUserId = req.user.userId || req.user.id; // moi (l'utilisateur connecté)
        console.log(myUserId, "veut retirer", followerUserId, "de ses abonnés");
        try {
            const deleted = await SubscriptionModel.findOneAndDelete({
                subscriber_id: followerUserId,
                subscription_id: myUserId,
            });
            if (!deleted) {
                return res.status(404).json({ message: "Abonné non trouvé" });
            }
            res.status(200).json({ message: "Abonné supprimé avec succès" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Se désabonner d'un utilisateur
    subscriptionsRemove: async (req, res) => {
        const { unfollowUserId } = req.body; // id de la personne à ne plus suivre
        const myUserId = req.user.userId || req.user.id; // pour compatibilité
        console.log(myUserId, "veut se désabonner de", unfollowUserId);
        try {
            const deleted = await SubscriptionModel.findOneAndDelete({
                subscriber_id: myUserId,
                subscription_id: unfollowUserId,
            });
            if (!deleted) {
                return res.status(404).json({ message: "Abonnement non trouvé" });
            }
            res.status(200).json({ message: "Abonnement supprimé avec succès" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

};

export default subController;