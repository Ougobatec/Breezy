
import jsonwebtoken from "jsonwebtoken";

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

export default authMiddleware;