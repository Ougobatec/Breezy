

import express from 'express';
import postController from '#controllers/post.js';
import authMiddleware from '#middlewares/auth.js';
import multer from 'multer';

const upload = multer(); // stockage en mémoire

const PostRouter = express.Router();

// Route pour créer un post
PostRouter.post("/", authMiddleware, upload.single("image"), postController.createPost);
PostRouter.get("/", authMiddleware, postController.getAllPosts);


export default PostRouter;
