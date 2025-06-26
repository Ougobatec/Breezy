#!/bin/bash

echo "=== Déploiement Breezy sur serveur Linux ==="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
log_info() { echo -e "${BLUE}ℹ${NC} $1"; }
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; }

# Vérifier les prérequis
log_info "Vérification des prérequis..."

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    log_warning "Docker n'est pas installé. Installation en cours..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    log_success "Docker installé avec succès"
    log_warning "Veuillez vous reconnecter pour que les permissions Docker prennent effet"
    exit 0
else
    log_success "Docker est installé"
fi

# Vérifier que Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    log_warning "Docker Compose n'est pas installé. Installation en cours..."
    DOCKER_COMPOSE_VERSION="v2.20.0"
    sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    log_success "Docker Compose installé avec succès"
else
    log_success "Docker Compose est installé"
fi

# Vérifier que les fichiers TAR existent
if [[ ! -f "breezy-frontend.tar" || ! -f "breezy-backend.tar" ]]; then
    log_error "Les fichiers d'images Docker (*.tar) sont manquants!"
    log_info "Assurez-vous d'avoir exporté les images avec le script PowerShell"
    exit 1
fi

# Vérifier que le fichier docker-compose existe
if [[ ! -f "docker-compose.prod.yml" ]]; then
    log_error "Le fichier docker-compose.prod.yml est manquant!"
    exit 1
fi

# Chargement des images Docker
log_info "Chargement des images Docker..."
docker load -i breezy-frontend.tar
if [[ $? -eq 0 ]]; then
    log_success "Image frontend chargée"
else
    log_error "Erreur lors du chargement de l'image frontend"
    exit 1
fi

docker load -i breezy-backend.tar
if [[ $? -eq 0 ]]; then
    log_success "Image backend chargée"
else
    log_error "Erreur lors du chargement de l'image backend"
    exit 1
fi

# Arrêter les anciens conteneurs s'ils existent
log_info "Arrêt des anciens conteneurs..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null
log_success "Anciens conteneurs arrêtés"

# Nettoyage des images non utilisées pour libérer de l'espace
log_info "Nettoyage des images non utilisées..."
docker image prune -f >/dev/null 2>&1

# Configuration des variables d'environnement
log_warning "IMPORTANT : Pensez à modifier les variables d'environnement dans docker-compose.prod.yml"
log_info "Variables à personnaliser :"
echo "  - JWT_SECRET (obligatoire)"
echo "  - FRONTEND_URL (votre domaine)"
echo "  - GOOGLE_CLIENT_ID (si connexion Google activée)"

# Démarrage des nouveaux conteneurs
log_info "Démarrage des nouveaux conteneurs..."
docker-compose -f docker-compose.prod.yml up -d

if [[ $? -eq 0 ]]; then
    log_success "Conteneurs démarrés avec succès"
else
    log_error "Erreur lors du démarrage des conteneurs"
    exit 1
fi

# Attendre que les services soient prêts
log_info "Vérification du statut des services..."
sleep 10

# Vérifier que tous les conteneurs sont en cours d'exécution
RUNNING_CONTAINERS=$(docker-compose -f docker-compose.prod.yml ps --services --filter "status=running" | wc -l)
TOTAL_CONTAINERS=$(docker-compose -f docker-compose.prod.yml ps --services | wc -l)

if [[ $RUNNING_CONTAINERS -eq $TOTAL_CONTAINERS ]]; then
    log_success "Tous les services sont opérationnels"
else
    log_warning "Certains services ne sont pas démarrés correctement"
    docker-compose -f docker-compose.prod.yml ps
fi

# Test de connectivité
log_info "Test de connectivité..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost/health | grep -q "200"; then
    log_success "Application accessible sur http://localhost"
else
    log_warning "L'application pourrait ne pas être encore prête, vérifiez les logs"
fi

echo ""
echo "=== Déploiement terminé ==="
log_success "Breezy est déployé et accessible"
echo ""
log_info "Commandes utiles :"
echo "  - Voir les logs : docker-compose -f docker-compose.prod.yml logs -f"
echo "  - Arrêter : docker-compose -f docker-compose.prod.yml down"
echo "  - Redémarrer : docker-compose -f docker-compose.prod.yml restart"
echo "  - Statut : docker-compose -f docker-compose.prod.yml ps"
echo ""
log_warning "N'oubliez pas de configurer votre domaine et SSL en production!"
