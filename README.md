# 🌬️ Breezy – Réseau social léger & réactif

**Breezy** est un réseau social minimaliste inspiré de Twitter/X, conçu pour fonctionner efficacement même sur des environnements à faibles ressources. Il permet la publication de messages courts, l'interaction entre utilisateurs et une navigation fluide et rapide.


## 🚀 Objectifs du projet

* Offrir une alternative légère aux réseaux sociaux traditionnels.
* Garantir une excellente expérience utilisateur sur mobile.
* Optimiser l'application pour les environnements contraints (faibles débits, matériels limités).
* Concevoir une architecture modulaire, scalable et facilement déployable.


## 🛠️ Stack technique

### Back-end (Node.js + Express)
* **Node.js**, **Express.js** : API RESTful légère et performante
* **MongoDB** + **Mongoose** : base de données NoSQL flexible
* **JWT (JSON Web Tokens)** : authentification sécurisée
* **Docker** : containerisation pour le développement et la production
* Sécurisation : CORS, gestion fine des erreurs

### Front-end (React + Next.js)
* **React.js**, **Next.js** : rendu rapide, SSR & SSG
* **Tailwind CSS** : design rapide et responsive
* **Axios** : communication fluide avec l'API
* **React Router / Next Router** : navigation fluide
* Mobile-first et responsive par défaut


## 🔐 Gestion des sessions
* Authentification via JWT
* Stockage sécurisé des tokens (HTTP-only ou localStorage)
* Redirection automatique selon l’état de session


## 📦 Fonctionnalités principales (MVP)

| ID   | Fonctionnalité               | Description                       |
| ---- | ---------------------------- | --------------------------------- |
| Fx1  | Création de compte           | Inscription avec validation       |
| Fx2  | Authentification sécurisée   | Connexion via JWT                 |
| Fx3  | Publication de messages      | Messages limités à 280 caractères |
| Fx4  | Affichage des messages       | Sur le profil utilisateur         |
| Fx5  | Fil d’actualités             | Messages des utilisateurs suivis  |
| Fx6  | Like de post                 | Interaction simple                |
| Fx7  | Commentaires                 | Réponses aux posts                |
| Fx8  | Réponses à commentaires      | Discussions en thread             |
| Fx9  | Suivi d’utilisateurs         | Système de followers              |
| Fx10 | Page de profil               | Nom, bio, photo                   |
| Fx11 | Liste des messages du profil | Historique personnel              |


## 💡 Fonctionnalités secondaires (facultatives)

* Tags & recherche par tags
* Notifications (mentions, likes, abonnements)
* Messagerie privée
* Ajout d’images/vidéos
* Signalement de contenus
* Modération (suspensions/bannissements)
* Interface multi-langue
* Thèmes personnalisés


## 📐 Architecture (microservices)

* **Frontend Service** : Interface utilisateur (Next.js)
* **Auth Service** : Authentification, gestion JWT
* **User Service** : Gestion des utilisateurs, profils, thèmes
* **Post Service** : Posts, commentaires, likes
* **Subscription Service** : Abonnés, abonnements
* **Message Service** : Messages
* **Notification Service** *(optionnel)* : Gestion des alertes en temps réel
* **Report Service** *(optionnel)* : Signalements, bannissements
* **Gateway/API** : Point d’entrée de l’application


## 🧑‍🎨 Interfaces & UX

* Design mobile-first
* Interfaces claires, intuitives
* Feedback utilisateur rapide


## 📄 Livrables attendus

* Rapport détaillé (objectifs, architecture, méthodologie, évolutions)
* Maquettes ou wireframes
* Présentation (soutenance)
* Code source + docker-compose


## 🗓️ Méthodologie de travail

* Organisation Agile (Kanban ou Scrum)
* Répartition des tâches par fonctionnalité
* Versioning via Git
* Tests manuels et unitaires


## 📦 Lancer le projet

```
# Lancer tous les services en local
docker-compose up --build
```

Accès :

* Frontend : [http://localhost:3000](http://localhost:3000)
* Backend API : [http://localhost:5000](http://localhost:5000)
* MongoDB : localhost:27017 (via docker) ou localhost:27019 (en local)


## 👥 Équipe projet

* [Axel CALENDREAU](https://github.com/calaxo)
* [Hugo BATTAGLIA](https://github.com/Ougobatec)
* [Maxime LIRIO](https://github.com/MaximeLIRIO)
* [Oskar MASTALERZ](https://github.com/M-Oskar-dev)
