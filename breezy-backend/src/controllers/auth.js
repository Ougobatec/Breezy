import UserModel from "#models/user.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authController = {
    register: async (req, res) => {
        const { name, username, email, password } = req.body;
        try {
            const existingUser = await UserModel.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ message: "Ce nom d'utilisateur est déjà pris" });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new UserModel({ name, username, email, password: hashedPassword });
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
            
            res.status(201).json({ message: "Utilisateur créé avec succès", user: { id: user._id, name: user.name, username: user.username, email: user.email } });
        } catch (error) {
            console.error("Erreur lors de la création de l'utilisateur :", error);
            res.status(500).json({ message: "Erreur interne du serveur" });
        }
    },

    login: async (req, res) => {
        const { username, password } = req.body;
        try {
            const user = await UserModel.findOne({ username });
            if (!user) {
                return res.status(400).json({ message: "Nom d'utilisateur ou mot de passe incorrect" });
            }
            
            // Vérifier si l'utilisateur est banni
            if (user.banned) {
                return res.status(403).json({ message: "Votre compte a été banni" });
            }
            
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: "Nom d'utilisateur ou mot de passe incorrect" });
            }
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
            // Envoie le token dans un cookie HTTP-only
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 3600 * 1000, // 1h
            });
    
            res.status(200).json({ 
                user: { 
                    id: user._id, 
                    name: user.name, 
                    username: user.username, 
                    email: user.email,
                    role: user.role,
                    suspended: user.suspended,
                    banned: user.banned,
                    avatar: user.avatar,
                    biography: user.biography
                } 
            });
        } catch (error) {
            console.error("Erreur lors de la connexion :", error);
            res.status(500).json({ message: "Erreur interne du serveur" });
        }
    },

    logout: async (req, res) => {
        res.clearCookie("token");
        res.status(200).json({ message: "Déconnexion réussie" });
    },

    authenticate: async (req, res) => {
        try {
            const user = await UserModel.findById(req.user.userId).select("-password");
            if (!user) {
                return res.status(404).json({ message: "Utilisateur introuvable" });
            }
            
            // Vérifier si l'utilisateur est banni
            if (user.banned) {
                res.clearCookie("token");
                return res.status(403).json({ message: "Votre compte a été banni" });
            }
            
            res.status(200).json({ 
                message: "Utilisateur authentifié avec succès", 
                user: {
                    id: user._id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    suspended: user.suspended,
                    banned: user.banned,
                    avatar: user.avatar,
                    biography: user.biography
                }
            });
        } catch (error) {
            console.error("Erreur lors de l'authentification :", error);
            res.status(500).json({ message: "Erreur interne du serveur" });
        }
    },

    passwordForget: async (req, res) => {
        const { username } = req.body;
        try {
            const user = await UserModel.findOne({ username });
            if (!user) {
                return res.status(400).json({ message: "Utilisateur non trouvé" });
            }
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '10m' });
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
            res.status(200).json({ message: "Un email de réinitialisation a été envoyé si le compte existe", resetLink });
        } catch (error) {
            console.error("Erreur lors de la demande de réinitialisation de mot de passe :", error);
            res.status(500).json({ message: "Erreur interne du serveur" });
        }
    },

    passwordReset: async (req, res) => {
        const { token, newPassword } = req.body;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await UserModel.findById(decoded.userId);
            if (!user) {
                return res.status(400).json({ message: "Utilisateur non trouvé" });
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            await user.save();
            res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
        } catch (error) {
            console.error("Erreur lors de la réinitialisation du mot de passe :", error);
            if (error.name === "TokenExpiredError") {
                return res.status(400).json({ message: "Le lien de réinitialisation a expiré" });
            }
            res.status(500).json({ message: "Erreur interne du serveur" });
        }
    },

    googleAuth: async (req, res) => {
        try {
            let email, name, avatar, googleId;

            // Cas 1: Login avec id_token (GoogleLogin component)
            if (req.body.id_token) {
                const ticket = await client.verifyIdToken({
                    idToken: req.body.id_token,
                    audience: process.env.GOOGLE_CLIENT_ID,
                });
                const payload = ticket.getPayload();
                email = payload.email;
                name = payload.name;
                avatar = payload.picture;
                googleId = payload.sub;
            }
            // Cas 2: Register avec données du profil (useGoogleLogin)
            else if (req.body.email && req.body.name) {
                email = req.body.email;
                name = req.body.name;
                avatar = req.body.avatar;
                googleId = req.body.googleId;
            }
            else {
                return res.status(400).json({ message: "Données Google manquantes" });
            }

            const username = email.split("@")[0];

            // Recherche l'utilisateur par email
            let user = await UserModel.findOne({ email });
            if (!user) {
                // Génère un username unique si besoin
                let uniqueUsername = username;
                let count = 1;
                while (await UserModel.findOne({ username: uniqueUsername })) {
                    uniqueUsername = `${username}${count}`;
                    count++;
                }
                
                // Crée l'utilisateur
                user = new UserModel({
                    name,
                    username: uniqueUsername,
                    email,
                    password: "google", // valeur factice
                    avatar: avatar || "",
                    googleId: googleId || "",
                });
                await user.save();
            }
            
            // Génère le token JWT
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            // Envoie le token dans un cookie HTTP-only (cohérent avec login)
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 3600 * 1000, // 1h
            });

            res.status(200).json({
                user: {
                    id: user._id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    suspended: user.suspended,
                    banned: user.banned,
                    avatar: user.avatar,
                    biography: user.biography
                },
            });
        } catch (error) {
            console.error("Erreur lors de l'authentification Google :", error);
            res.status(401).json({ message: "Erreur d'authentification Google", error: error.message });
        }
    },

    // ...existing code...
};

export default authController;