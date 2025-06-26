

import express from 'express';
import authMiddleware from '#middlewares/auth.js';
import userController from '#controllers/user.js';
import multer from 'multer';

// Configuration de multer pour l'upload d'avatar
const upload = multer({
    dest: "/uploads/avatars",
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
});

const userRouter = express.Router();

// GET la biographie et l'avatar
userRouter.get("/profile", authMiddleware, userController.getBio);
// PUT la biographie avec possibilité d'upload d'avatar
userRouter.put("/profile", authMiddleware, upload.single("avatar"), userController.updateBio);
// PUT l'avatar
userRouter.put("/profile/avatar", authMiddleware, userController.uploadAvatar);

export default userRouter;
