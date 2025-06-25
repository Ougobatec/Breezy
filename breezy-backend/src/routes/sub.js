import subController from '#controllers/sub.js';
import express from 'express';
import auth from '#middlewares/auth.js';

const subRouter = express.Router();

subRouter.post("/subscribe", auth, subController.subscriptionAdd);
subRouter.get("/follower", auth, subController.followerGet);
subRouter.get("/subscriptions", auth, subController.subscriptionsGet);
subRouter.delete("/unsubscribe", auth, subController.subscriptionsRemove);
subRouter.delete("/remove-follower", auth, subController.removeFollower);

export default subRouter;

