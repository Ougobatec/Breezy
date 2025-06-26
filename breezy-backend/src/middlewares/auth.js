
import jsonwebtoken from "jsonwebtoken";
import UserModel from "#models/user.js";

const authMiddleware = (req, res, next) => {
    const token = req.cookies && req.cookies.token;
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

// Middleware enrichi qui récupère les informations complètes de l'utilisateur
const authMiddlewareWithRole = async (req, res, next) => {
    const token = req.cookies && req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "Token manquant" });
    }
    try {
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const user = await UserModel.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({ message: "Utilisateur non trouvé" });
        }

        req.user = decoded;
        req.userRole = user.role;
        req.userInfo = user;
        next();
    } catch (error) {
        console.error("Erreur dans authMiddlewareWithRole:", error);
        res.status(401).json({ message: "Token invalide ou expiré" });
    }
};

export default authMiddleware;
export { authMiddlewareWithRole };