

import express from 'express';
import postController from '#controllers/post.js';
import authMiddleware from '#middlewares/auth.js';
import multer from 'multer';

const upload = multer(); // stockage en mémoire

const postRouter = express.Router();

// Route pour créer un post
postRouter.post("/", authMiddleware, upload.single("image"), postController.createPost);
postRouter.get("/", authMiddleware, postController.getAllPosts);

// Route pour liker un post
postRouter.put("/:id/like", authMiddleware, postController.likePost);
postRouter.get("/:id/like", authMiddleware, postController.getPostLikes);

// Route pour supprimer un post
postRouter.delete("/:id", authMiddleware, postController.deletePost);

export default postRouter;
