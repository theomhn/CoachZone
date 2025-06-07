# CoachZone

![Symfony](https://img.shields.io/badge/symfony-%23000000.svg?style=for-the-badge&logo=symfony&logoColor=white)
![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Expo](https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37)
![PHP](https://img.shields.io/badge/php-%23777BB4.svg?style=for-the-badge&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/mysql-4479A1.svg?style=for-the-badge&logo=mysql&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![Symfony](https://img.shields.io/badge/symfony-7.1-green?style=for-the-badge)
![React](https://img.shields.io/badge/react-18.3.1-blue?style=for-the-badge)
![React Native](https://img.shields.io/badge/react%20native-0.76.9-blue?style=for-the-badge)
![Expo](https://img.shields.io/badge/expo%20sdk-52.x.x-orange?style=for-the-badge)
![PHP](https://img.shields.io/badge/php-8.2%2B-purple?style=for-the-badge)
![License](https://img.shields.io/badge/license-proprietary-red?style=for-the-badge)

## Description

CoachZone est une application mobile dédiée aux indépendants du sport, conçue pour devenir à terme le compagnon tout-en-un des entraîneurs, professeurs et coachs sportifs en France.

### Vision du projet

Cette application vise dans un premier temps à **simplifier la recherche et la réservation d'infrastructures** pouvant accueillir leurs activités, selon leurs besoins spécifiques. Dans un second temps, CoachZone évoluera vers un **système de gestion d'entreprise complet** intégrant un ERP (type Odoo) pour la gestion de la facturation, le suivi client, l'organisation de cours et le suivi budgétaire.

### Fonctionnalités principales

**Répertoire complet des lieux sportifs** : L'application met à disposition une base de données exhaustive des installations sportives avec des informations détaillées (adresse, équipements disponibles, tarifs de location).

**Système de réservation** : Les professionnels du sport peuvent réserver ces espaces pour organiser leurs cours et séances d'entraînement avec leur clientèle existante. L'interface permet de réserver des créneaux horaires facilement.

**Carte interactive avec Open Data** : Une carte interactive et le répertoire (liste) utilisent le même jeu de données des espaces sportifs disponibles grâce à l'Open Data, offrant deux expériences utilisateur différentes pour visualiser les installations à proximité. Fonctionnalités de recherche et de filtrage disponibles : recherche par nom ou activité, filtres par activités, et filtres par équipements (toilettes, douches).

### État actuel (MVP)

Le projet actuel implémente les fonctionnalités essentielles :

-   Authentification et gestion des utilisateurs (coachs/institutions)
-   Répertoire complet des installations sportives
-   Carte interactive avec filtres
-   Système de favoris pour les institutions
-   Réservation de créneaux horaires
-   Interface différenciée par type d'utilisateur

### Évolutions futures

L'application intégrera progressivement :

**Fonctionnalités de gestion avancées** : Affichage des horaires d'ouverture des installations et des créneaux de réservation (ne sera plus une plage horaire fixe pour chaque complexe sportif), système de contact direct via l'application, gestion des annulations/modifications de réservations, notifications avancées, système de formules d'abonnement avec tarifs préférentiels et support dédié.

**Ouverture au grand public** : Permettre aux sportifs (particuliers) de réserver directement des cours avec les coachs via l'application.

**ERP complet** : Intégration d'un système de gestion d'entreprise complet (type Odoo) incluant l'envoi de factures, le suivi budgétaire, la gestion clientèle approfondie, l'organisation de cours avancée, transformant CoachZone en solution tout-en-un pour les indépendants du sport.

_Projet réalisé dans le cadre de la fin d'études de Master._

## Architecture

-   **Backend** : Symfony 7.1 avec API Platform
-   **Frontend** : React Native / Expo
-   **Base de données** : MySQL

## Structure du projet

```
CoachZone/
├── back/           # Backend Symfony + API Platform
└── front/          # Frontend React Native / Expo
```

## Prérequis

### Système

-   **PHP** : >= 8.2
-   **Node.js** : >= 18.x
-   **npm**
-   **Composer**
-   **MySQL** : >= 5.7
-   **macOS** : Recommandé (développement sur macOS)

### Outils de développement

-   **Expo CLI** : `npm install -g @expo/cli`
-   **Symfony CLI** (optionnel mais recommandé)
-   **Xcode** : Requis pour iOS Simulator (macOS uniquement)

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/theomhn/CoachZone.git
cd CoachZone
```

### 2. Installation du Backend

#### Configuration de la base de données

1. Créer une base de données MySQL :

```sql
CREATE DATABASE coachZone CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'CZ-admin'@'localhost' IDENTIFIED BY 'votre-mot-de-passe';
GRANT ALL PRIVILEGES ON coachZone.* TO 'CZ-admin'@'localhost';
FLUSH PRIVILEGES;
```

#### Installation des dépendances

```bash
cd back/
composer install
```

#### Configuration de l'environnement

1. Copier le fichier d'environnement :

```bash
cp .env .env.local
```

2. Modifier `.env.local` avec vos paramètres de base de données :

```env
APP_ENV=dev
APP_SECRET=votre-clé-secrète-forte
DATABASE_URL="mysql://CZ-admin:votre-mot-de-passe@127.0.0.1:3306/coachZone?serverVersion=5.7.39-MySQL&charset=utf8mb4"
```

> **Note sur les fichiers d'environnement** :
>
> -   `.env` : Contient les valeurs par défaut et est commité dans le repository
> -   `.env.local` : Contient vos valeurs locales et ne doit jamais être commité
> -   `.env.prod` : Template pour la production, également commité

#### Création du schéma de base de données

```bash
# Créer les migrations (si elles n'existent pas - à vérifier dans /migrations)
php bin/console make:migration

# Exécuter les migrations
php bin/console doctrine:migrations:migrate
```

> **⚠️ Warning OpenData** : Les gestionnaires de l'OpenData ont récemment revu leur jeu de données et supprimé certaines informations essentielles au bon fonctionnement de l'application (notamment les activités réalisables dans les équipements sportifs). Cela provoque des dysfonctionnements dans les filtres par activités et l'affichage des activités disponibles **si la commande `php bin/console app:sync-places` est exécutée**.
>
> **Solution recommandée** : Cette situation ayant été anticipée, une sauvegarde complète des données est disponible dans le fichier `place.sql` situé dans le répertoire `/back/`. Après l'exécution des migrations, importez directement ce fichier dans la base de données. Cet import s'exécute sans problème et ne nécessite pas de supprimer la table créée par les migrations.

### 3. Installation du Frontend

```bash
cd front/
npm install
# ou
yarn install
```

#### Configuration de l'API

Le projet utilise un fichier `config.ts` pour gérer les URLs d'API. Par défaut, l'application est configurée pour utiliser l'API locale :

```typescript
export const API_BASE_URL = LOCAL_API;
```

## Lancement des serveurs

### Backend (API)

```bash
cd back/

# Démarrer le serveur de développement
symfony server:start
# ou
symfony serve

# L'API sera accessible sur : http://127.0.0.1:8000/
```

### Frontend (Application mobile)

```bash
cd front/

# Démarrer le serveur de développement Expo
npm run start

# Puis appuyer sur 'i' pour ouvrir sur le simulateur iOS (macOS uniquement)
# ou 'a' pour ouvrir sur l'émulateur Android
```

> **Note** : L'iOS Simulator est uniquement disponible sur macOS avec Xcode installé. Sur Windows/Linux, utilisez un émulateur Android.
>
> **Appareils physiques** : Les tests sur appareils physiques via l'app Expo Go ne sont actuellement pas possibles car l'application utilise SDK 52 tandis que l'app Expo Go fonctionne avec SDK 53. Privilégiez les simulateurs/émulateurs.

## Scripts disponibles

### Backend

```bash
cd back/

# Vider le cache
php bin/console cache:clear

# Synchroniser les places depuis l'OpenData (Attention à l'exécution de cette commande - voir l'avertissement ci-dessus)
php bin/console app:sync-places

# Créer une migration
php bin/console make:migration

# Exécuter les migrations
php bin/console doctrine:migrations:migrate
```

### Frontend

```bash
cd front/

# Démarrer le projet
npm run start
```

## Configuration CORS

Le backend est configuré pour accepter les requêtes depuis `localhost` et `127.0.0.1`. Si vous avez besoin de modifier cette configuration, éditez le fichier `.env` :

```env
CORS_ALLOW_ORIGIN='^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$'
```

## API Documentation

Une fois le backend lancé, la documentation de l'API sera disponible à :

-   **API Platform interface** : `http://127.0.0.1:8000/api`
-   **Documentation OpenAPI** : `http://127.0.0.1:8000/api/docs`

### Routes API disponibles

#### Authentification

-   **POST** `/api/login` - Connexion utilisateur
-   **POST** `/api/logout` - Déconnexion utilisateur
-   **POST** `/api/register` - Inscription utilisateur

#### Réservations (Booking)

-   **GET** `/api/bookings` - Récupère la collection des réservations
-   **POST** `/api/bookings` - Crée une nouvelle réservation
-   **GET** `/api/bookings/{id}` - Récupère une réservation spécifique

#### Favoris (Coach)

-   **GET** `/api/coaches/me/favorites` - Récupère les institutions favorites du coach connecté
-   **POST** `/api/coaches/me/favorites/{institutionId}` - Ajoute une institution aux favoris
-   **DELETE** `/api/coaches/me/favorites/{institutionId}` - Supprime une institution des favoris

#### Institutions

-   **GET** `/api/institutions` - Récupère la collection des institutions

#### OpenData

-   **GET** `/api/opendata/institutions` - Récupère la liste des institutions pour l'inscription

#### Lieux sportifs (Place)

-   **GET** `/api/places` - Récupère la collection des lieux sportifs
-   **GET** `/api/places/{id}` - Récupère un lieu sportif spécifique
-   **PATCH** `/api/places/{id}` - Met à jour un lieu sportif

#### Utilisateurs (User)

-   **GET** `/api/users/me` - Récupère les informations de l'utilisateur connecté
-   **GET** `/api/users/{id}` - Récupère un utilisateur spécifique

## Dépendances principales

### Backend

-   **Symfony** 7.1
-   **API Platform** 4.0
-   **Doctrine ORM** 3.3

### Frontend

-   **React Native** 0.76.9
-   **Expo** ~52.0.46
-   **React Navigation** 7.x
-   **React Native Maps**
-   **React Native Calendars**

## Développement

> **Environnement de développement** : Ce projet a été développé sous macOS. L'iOS Simulator nécessite macOS et Xcode pour fonctionner.

### Notes importantes du projet

-   **Compatibilité SDK** : L'application nécessite Expo SDK 53 pour les appareils physiques, mais le projet utilise actuellement SDK 52.x.x. Certaines bibliothèques ne sont pas encore mises à jour. Privilégiez les simulateurs/émulateurs pour les tests.
-   **Problème OpenData** : L'OpenData a récemment supprimé des données essentielles (activités des équipements), impactant les filtres par activités. Une sauvegarde complète de la table `places` est nécessaire pour un fonctionnement optimal.

### Structure des dossiers Backend

```
back/
├── config/         # Configuration Symfony
├── migrations/     # Migrations de base de données
├── public/         # Point d'entrée web
├── src/
│   ├── ApiResource/    # Ressources API Platform
│   ├── Command/        # Commandes Symfony (app:sync-places)
│   ├── Controller/     # Contrôleurs
│   ├── DataProvider/   # Fournisseurs de données
│   ├── Entity/         # Entités Doctrine
│   ├── OpenApi/        # Documentation Swagger API Platform
│   ├── Repository/     # Repositories
│   ├── Security/       # Configuration sécurité
│   ├── Service/        # Services métier
│   └── Validator/      # Validateurs personnalisés
├── var/            # Cache et logs
└── vendor/         # Dépendances Composer
```

### Structure des dossiers Frontend

```
front/
├── app/            # Pages et navigation (Expo Router)
│   ├── (auth)/         # Pages d'authentification
│   │   ├── _layout.tsx     # Layout pour l'authentification
│   │   ├── login.tsx       # Page de connexion
│   │   └── register.tsx    # Page d'inscription
│   ├── (coach)/        # Écrans spécifiques aux coachs
│   │   ├── _layout.tsx     # Layout pour les coachs
│   │   ├── favorites.tsx   # Page des favoris
│   │   ├── institutions.tsx # Liste des institutions
│   │   ├── my-bookings.tsx # Mes réservations
│   │   └── profile.tsx     # Profil coach
│   ├── (institution)/  # Écrans spécifiques aux institutions
│   │   ├── _layout.tsx     # Layout pour les institutions
│   │   ├── my-bookings.tsx # Mes réservations
│   │   └── profile.tsx     # Profil institution
│   ├── booking.tsx     # Page de réservation (coach)
│   ├── index.tsx       # Gestion auth & routing par type d'utilisateur
│   ├── institution-details.tsx # Détails institution (coach)
│   └── map.tsx         # Carte interactive (coach)
├── assets/
├── components/
├── constants/
├── contexts/
├── hooks/
├── types/
└── utils/
```

## Troubleshooting

### Problèmes courants Backend

-   **Erreur de base de données** : Vérifiez que MySQL est démarré et que les identifiants sont corrects
-   **Erreur de permissions** : `chmod -R 755 var/`
-   **Cache** : `php bin/console cache:clear`

### Problèmes courants Frontend

-   **Metro bundler issues** : `npx expo start --clear`
-   **Dependencies issues** : Supprimer `node_modules/` et exécuter à nouveau `npm install`
-   **iOS Simulator** : Assurez-vous qu'Xcode est installé et configuré (macOS uniquement)
-   **Sur Windows/Linux** : Utilisez un émulateur Android ou l'app Expo Go sur votre téléphone

## License

Ce projet est sous licence propriétaire.

© 2025 Theo Menchon - CoachZone. Tous droits réservés.
