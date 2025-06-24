


import subController from '#controllers/sub.js';

import express from 'express';

import requiredFields from '#middlewares/requiredFields.js';

const routerSub = express.Router();


routerSub.post("/subscriptions", requiredFields(['folower','subscriber']),  subController.subscriptionAdd);
routerSub.get("/follower", requiredFields(['folower']), subController.followerGet);
routerSub.get("/subscriptions", requiredFields(['subscription']), subController.subscriptionsGet);
routerSub.delete("/subscriptions", requiredFields(['subscription']), subController.subscriptionsRemove);

export default routerSub;

