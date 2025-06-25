

import express from 'express';
import authMiddleware from '#middlewares/auth.js';
import userController from '#controllers/user.js';

const userRouter = express.Router();

// GET la biographie et l'avatar
userRouter.get("/profile", authMiddleware, userController.getBio);
// PUT la biographie
userRouter.put("/profile", authMiddleware, userController.updateBio);
// PUT l'avatar
userRouter.put("/profile/avatar", authMiddleware, userController.uploadAvatar);

export default userRouter;
