import express from 'express';

import authController from '#controllers/auth.js';
import authMiddleware from '#middlewares/auth.js';
import requireFields from '#middlewares/requiredFields.js';

const authRouter = express.Router();

authRouter.post("/register", requireFields(['name', 'username', 'email', 'password']), authController.register);
authRouter.post("/login", requireFields(['username', 'password']), authController.login);
authRouter.post("/logout", authController.logout);
authRouter.post("/password-forget", requireFields(['username']), authController.passwordForget);
authRouter.post("/password-reset", requireFields(['token', 'newPassword']), authController.passwordReset);
authRouter.get("/authenticate", authMiddleware, authController.authenticate);

export default authRouter;