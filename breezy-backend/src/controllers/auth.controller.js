const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

exports.register = async (req, res) => {
    const { name, username, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, username, email, password: hashedPassword });
        await user.save();

        const smtpReady = process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS;
        if (smtpReady) {
            try {
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: process.env.SMTP_PORT,
                    secure: false,
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
                    },
                });

                const mailOptions = {
                    from: `"Breezy" <${process.env.SMTP_USER}>`,
                    to: email,
                    subject: "Bienvenue sur Breezy 🎉",
                    text: `Bonjour ${name},\n\nMerci de vous être inscrit sur Breezy ! Nous sommes ravis de vous accueillir.\n\nÀ bientôt sur Breezy !\nL'équipe Breezy`,
                    html: `
                        <div style="font-family: Arial, sans-serif; background: #f9fafb; padding: 32px;">
                            <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px #0001; padding: 32px;">
                                <h2 style="color: #e11d48; margin-bottom: 16px;">Bienvenue sur <span style="color:#0ea5e9;">Breezy</span> 🎉</h2>
                                <p style="font-size: 16px; color: #222;">Bonjour <b>${name}</b>,</p>
                                <p style="font-size: 16px; color: #222;">Merci de vous être inscrit sur <b>Breezy</b> ! Nous sommes ravis de vous accueillir.</p>
                                <p style="font-size: 15px; color: #666; margin-top: 32px;">À bientôt sur Breezy !<br>L’équipe Breezy</p>
                            </div>
                        </div>
                    `,
                };

                await transporter.sendMail(mailOptions);
            } catch (mailError) {
                console.error("Erreur lors de l'envoi du mail d'inscription :", mailError);
            }
        }
        
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "Invalid username or password" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid username or password" });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, user: { id: user._id, name: user.name, username: user.username, email: user.email } });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.authenticate = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User authenticated successfully", user });
    } catch (error) {
        console.error("Error authenticating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.passwordForget = async (req, res) => {
    const { username } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const resetLink = `${process.env.FRONTEND_URL}/auth/password-reset?token=${token}`;

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: `"Breezy" <${process.env.SMTP_USER}>`,
            to: user.email,
            subject: "Réinitialisation de votre mot de passe Breezy",
            text: `Bonjour,\n\nVous avez demandé la réinitialisation de votre mot de passe.\nCliquez sur ce lien pour choisir un nouveau mot de passe :\n${resetLink}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez simplement ce message.`,
            html: `
                <div style="font-family: Arial, sans-serif; background: #f9fafb; padding: 32px;">
                    <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px #0001; padding: 32px;">
                        <h2 style="color: #e11d48; margin-bottom: 16px;">Réinitialisation de mot de passe</h2>
                        <p style="font-size: 16px; color: #222;">Vous avez demandé la réinitialisation de votre mot de passe sur <b>Breezy</b>.</p>
                        <p style="font-size: 16px; color: #222;">Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${resetLink}" style="background: #0ea5e9; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 16px; display: inline-block;">
                                Réinitialiser mon mot de passe
                            </a>
                        </div>
                        <p style="font-size: 14px; color: #666;">Si vous n'êtes pas à l'origine de cette demande, ignorez simplement ce message.</p>
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Password reset link sent to your email", resetLink });
    } catch (error) {
        console.error("Error in forgot password:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.passwordReset = async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(400).json({ message: "Invalid token or user not found" });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Error resetting password:", error);
        if (error.name === "TokenExpiredError") {
            return res.status(400).json({ message: "Token expired" });
        }
        res.status(500).json({ message: "Internal server error"});
    }
}