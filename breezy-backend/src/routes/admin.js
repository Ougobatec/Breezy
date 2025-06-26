import express from "express";
import adminController from "#controllers/admin.js";
import { requireAdmin, requireModerator } from "#middlewares/roleAuth.js";
import authMiddleware from "#middlewares/auth.js";

const router = express.Router();

// Routes pour les administrateurs uniquement
router.get("/users", authMiddleware, requireAdmin, adminController.getAllUsers);
router.put("/users/:userId/role", authMiddleware, requireAdmin, adminController.changeUserRole);
router.get("/stats", authMiddleware, requireAdmin, adminController.getModerationStats);
router.post("/test-notification", authMiddleware, requireAdmin, adminController.testNotification);
router.get("/check-moderators", authMiddleware, requireAdmin, adminController.checkModerators);

// Routes pour les administrateurs et modérateurs
router.put("/users/:userId/moderate", authMiddleware, requireModerator, adminController.moderateUser);
router.get("/posts/reported", authMiddleware, requireModerator, adminController.getReportedPosts);
router.put("/posts/:postId/resolve", authMiddleware, requireModerator, adminController.resolvePostReport);

export default router;
