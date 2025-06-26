Write-Host "=== Export des images Docker Breezy ===" -ForegroundColor Green

# Verifier que Docker est installe et demarre
try {
    docker --version | Out-Null
    Write-Host "OK Docker detecte" -ForegroundColor Green
}
catch {
    Write-Host "ERREUR Docker n'est pas installe ou demarre" -ForegroundColor Red
    Write-Host "Veuillez installer Docker Desktop depuis https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Verifier que Docker Compose est disponible
try {
    docker-compose --version | Out-Null
    Write-Host "OK Docker Compose detecte" -ForegroundColor Green
}
catch {
    Write-Host "ERREUR Docker Compose non disponible" -ForegroundColor Red
    exit 1
}

Write-Host "`n--- Construction des images ---" -ForegroundColor Yellow
try {
    docker-compose build
    Write-Host "OK Images construites avec succes" -ForegroundColor Green
}
catch {
    Write-Host "ERREUR lors de la construction des images" -ForegroundColor Red
    exit 1
}

# Determiner les noms d'images automatiquement
$projectName = (Get-Item .).Name.ToLower()
Write-Host "Nom du projet detecte : $projectName" -ForegroundColor Cyan

# Tagger les images avec des noms standardises
Write-Host "`n--- Tagging des images ---" -ForegroundColor Yellow
try {
    docker tag "${projectName}-backend:latest" "breezy-backend:latest"
    docker tag "${projectName}-frontend:latest" "breezy-frontend:latest"
    Write-Host "OK Images taguees avec succes" -ForegroundColor Green
}
catch {
    # Si le tagging echoue, essayer avec "breezy" comme prefixe
    try {
        docker tag "breezy-backend:latest" "breezy-backend:latest"
        docker tag "breezy-frontend:latest" "breezy-frontend:latest"
        Write-Host "OK Images deja correctement nommees" -ForegroundColor Green
    }
    catch {
        Write-Host "ERREUR lors du tagging des images" -ForegroundColor Red
        Write-Host "Verifiez que les images ont bien ete construites" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "`n--- Export des images ---" -ForegroundColor Yellow

# Export de l'image frontend
Write-Host "Export de breezy-frontend..." -ForegroundColor Cyan
$frontendImage = "breezy-frontend:latest"
try {
    docker save -o "breezy-frontend.tar" $frontendImage
    $frontendSize = [math]::Round((Get-Item "breezy-frontend.tar").Length / 1024 / 1024, 2)
    Write-Host "OK breezy-frontend.tar cree ($frontendSize megabytes)" -ForegroundColor Green
}
catch {
    Write-Host "ERREUR lors de l'export de l'image frontend" -ForegroundColor Red
    exit 1
}

# Export de l'image backend
Write-Host "Export de breezy-backend..." -ForegroundColor Cyan
$backendImage = "breezy-backend:latest"
try {
    docker save -o "breezy-backend.tar" $backendImage
    $backendSize = [math]::Round((Get-Item "breezy-backend.tar").Length / 1024 / 1024, 2)
    Write-Host "OK breezy-backend.tar cree ($backendSize megabytes)" -ForegroundColor Green
}
catch {
    Write-Host "ERREUR lors de l'export de l'image backend" -ForegroundColor Red
    exit 1
}

Write-Host "`n--- Creation du package de deploiement ---" -ForegroundColor Yellow

# Creer un dossier de deploiement
$deployFolder = "breezy-deployment"
if (Test-Path $deployFolder) {
    Remove-Item $deployFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $deployFolder | Out-Null

# Copier les fichiers necessaires
Copy-Item "breezy-frontend.tar" "$deployFolder/"
Copy-Item "breezy-backend.tar" "$deployFolder/"
Copy-Item "docker-compose.prod.yml" "$deployFolder/" -ErrorAction SilentlyContinue
Copy-Item "nginx.prod.conf" "$deployFolder/" -ErrorAction SilentlyContinue
Copy-Item "deploy.sh" "$deployFolder/" -ErrorAction SilentlyContinue

# Creer un fichier d'instructions
$instructions = @"
# Instructions de deploiement Breezy

## Fichiers inclus :
- breezy-frontend.tar : Image Docker du frontend
- breezy-backend.tar : Image Docker du backend  
- docker-compose.prod.yml : Configuration Docker Compose pour production
- nginx.prod.conf : Configuration Nginx optimisee
- deploy.sh : Script de deploiement automatique

## Deploiement sur serveur Linux :

1. Uploadez tous ces fichiers sur votre serveur :
   scp -r breezy-deployment/ user@your-server:/home/user/

2. Connectez-vous au serveur :
   ssh user@your-server

3. Allez dans le dossier et lancez le deploiement :
   cd breezy-deployment
   chmod +x deploy.sh
   ./deploy.sh

4. Modifiez docker-compose.prod.yml avec vos valeurs :
   - JWT_SECRET
   - FRONTEND_URL
   - GOOGLE_CLIENT_ID (si utilise)

## Ressources recommandees :
- 1-2 vCPU
- 1-2 GB RAM
- 10-20 GB stockage SSD

L'application sera accessible sur http://your-server-ip
"@

$instructions | Out-File -FilePath "$deployFolder/DEPLOIEMENT.md" -Encoding UTF8

Write-Host "`n=== Export termine avec succes ===" -ForegroundColor Green
Write-Host "Fichiers crees :" -ForegroundColor White
Write-Host "Dossier $deployFolder/" -ForegroundColor Cyan
Get-ChildItem $deployFolder | ForEach-Object {
    $size = ""
    if ($_.Extension -eq ".tar") { 
        $sizeInMB = [math]::Round($_.Length / 1024 / 1024, 2)
        $size = " ($sizeInMB megabytes)"
    }
    Write-Host "  Fichier $($_.Name)$size" -ForegroundColor Gray
}

$totalSize = [math]::Round((Get-ChildItem $deployFolder -File | Measure-Object Length -Sum).Sum / 1024 / 1024, 2)
Write-Host "`nTaille totale du package : $totalSize megabytes" -ForegroundColor Yellow

Write-Host "`nPret pour le deploiement !" -ForegroundColor Green
Write-Host "Uploadez le dossier '$deployFolder' sur votre serveur cloud" -ForegroundColor White

$totalSize = [math]::Round((Get-ChildItem $deployFolder -File | Measure-Object Length -Sum).Sum / 1024 / 1024, 2)
Write-Host "`nTaille totale du package : $totalSize MB" -ForegroundColor Yellow

Write-Host "`n🚀 Prêt pour le déploiement !" -ForegroundColor Green
Write-Host "Uploadez le dossier '$deployFolder' sur votre serveur cloud" -ForegroundColor White
Write-Host "Uploadez le dossier '$deployFolder' sur votre serveur cloud" -ForegroundColor White
