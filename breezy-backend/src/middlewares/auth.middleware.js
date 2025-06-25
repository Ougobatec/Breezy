const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.cookies && req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "Token manquant" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ message: "Token invalide ou expiré" });
    }
};