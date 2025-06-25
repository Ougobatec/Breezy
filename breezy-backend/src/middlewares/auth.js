
import jsonwebtoken from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
    // Chercher le token dans les cookies d'abord
    let token = req.cookies && req.cookies.token;
    
    // Si pas trouvé dans les cookies, chercher dans l'en-tête Authorization
    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7); // Enlever "Bearer "
        }
    }
    
    if (!token) {
        return res.status(401).json({ message: "Token manquant" });
    }
    
    try {
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ message: "Token invalide ou expiré" });
    }
};

export default authMiddleware;