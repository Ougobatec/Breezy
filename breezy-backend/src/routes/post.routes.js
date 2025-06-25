const express = require('express');

const postController = require("../controllers/post.controller");
const authMiddleware = require('../middlewares/auth.middleware');   
const requireFields = require('../middlewares/requiredFields.middleware');
const multer = require("multer");
const upload = multer(); // stockage en mémoire

const router = express.Router();

// Route pour créer un post
router.post("/", authMiddleware, upload.single("image"), postController.createPost);
router.get("/", authMiddleware, postController.getAllPosts);

// Route pour liker un post
router.put("/:id/like", authMiddleware, postController.likePost);
router.get("/:id/like", authMiddleware, postController.getPostLikes);

// Route pour supprimer un post
router.delete("/:id", authMiddleware, postController.deletePost);

module.exports = router;
