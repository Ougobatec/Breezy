import subController from '#controllers/sub.js';
import express from 'express';
import auth from '#middlewares/auth.js';

const routerSub = express.Router();

routerSub.post("/subscribe", auth, subController.subscriptionAdd);
routerSub.get("/follower", auth, subController.followerGet);
routerSub.get("/subscriptions", auth, subController.subscriptionsGet);
routerSub.delete("/unsubscribe", auth, subController.subscriptionsRemove);
routerSub.delete("/remove-follower", auth, subController.removeFollower);

export default routerSub;

