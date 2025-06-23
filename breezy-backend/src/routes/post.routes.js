const express = require('express');

const postController = require("../controllers/post.controller");
const authMiddleware = require('../middlewares/auth.middleware');   
const requireFields = require('../middlewares/requiredFields.middleware');

const router = express.Router();

// Route pour créer un post
router.post("/", authMiddleware, requireFields(['title', 'content']), postController.createPost);
router.get("/", authMiddleware, postController.getAllPosts);

module.exports = router;
