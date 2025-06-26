import express from 'express';
import authMiddleware from '#middlewares/auth.js';
import searchController from '#controllers/search.js';

const searchRouter = express.Router();

// Recherche globale
searchRouter.get('/', authMiddleware, searchController.globalSearch);

// Recherche d'utilisateurs uniquement
searchRouter.get('/users', authMiddleware, searchController.searchUsers);

// Recherche de mentions
searchRouter.get('/mentions', authMiddleware, searchController.searchMentions);

export default searchRouter;