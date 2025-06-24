


import subController from '#controllers/sub.js';

import express from 'express';

import requiredFields from '#middlewares/requiredFields.js';

const SubRouter = express.Router();


SubRouter.post("/subscriptions", requiredFields(['folower','subscriber']),  subController.subscriptionAdd);
SubRouter.get("/follower", requiredFields(['folower']), subController.followerGet);
SubRouter.get("/subscriptions", requiredFields(['subscription']), subController.subscriptionsGet);
SubRouter.delete("/subscriptions", requiredFields(['subscription']), subController.subscriptionsRemove);

export default SubRouter;

