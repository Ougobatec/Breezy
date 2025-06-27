const requireFields = (requiredFields, location = "body") => {
    return (req, res, next) => {
        const data = req[location] || {};
        const missing = requiredFields.filter((field) => !(field in data));
        if (missing.length > 0) {
            return res.status(400).json({ message: `Les champs suivants sont requis : ${missing.join(", ")}` });
        }
        next();
    };
};

export default requireFields;