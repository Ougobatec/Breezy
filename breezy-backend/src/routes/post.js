import express from 'express';
import postController from '#controllers/post.js';
import authMiddleware from '#middlewares/auth.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const postRouter = express.Router();

postRouter.post("/", authMiddleware, upload.single("image"), postController.createPost);
postRouter.get("/", authMiddleware, postController.getAllPosts);
postRouter.put("/:id/like", authMiddleware, postController.likePost);
postRouter.get("/:id/like", authMiddleware, postController.getPostLikes);
postRouter.delete("/:id", authMiddleware, postController.deletePost);

// Route pour signaler un post
postRouter.post("/:id/report", authMiddleware, postController.reportPost);

// Route pour récupérer le flux de posts
postRouter.get("/flow", authMiddleware, postController.getFlowPosts);

export default postRouter;