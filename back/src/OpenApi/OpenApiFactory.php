<?php

namespace App\OpenApi;

use ApiPlatform\OpenApi\Factory\OpenApiFactoryInterface;
use ApiPlatform\OpenApi\Model\Components;
use ApiPlatform\OpenApi\Model\Info;
use ApiPlatform\OpenApi\Model\SecurityScheme;
use ApiPlatform\OpenApi\OpenApi;

final class OpenApiFactory implements OpenApiFactoryInterface
{
    public function __construct(private OpenApiFactoryInterface $decorated) {}

    public function __invoke(array $context = []): OpenApi
    {
        $openApi = $this->decorated->__invoke($context);

        // Récupération des composants existants
        $existingComponents = $openApi->getComponents();

        // Création du schéma de sécurité Bearer
        $bearerAuth = new SecurityScheme(
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Token d\'authentification Bearer obtenu via /api/login'
        );

        // Création d'un ArrayObject pour les schémas de sécurité
        $securitySchemes = new \ArrayObject();
        $securitySchemes['bearerAuth'] = $bearerAuth;

        // Création des nouveaux composants avec sécurité
        $components = new Components(
            schemas: $existingComponents?->getSchemas(),
            responses: $existingComponents?->getResponses(),
            parameters: $existingComponents?->getParameters(),
            examples: $existingComponents?->getExamples(),
            requestBodies: $existingComponents?->getRequestBodies(),
            headers: $existingComponents?->getHeaders(),
            securitySchemes: $securitySchemes
        );

        // Documentation améliorée
        $info = new Info(
            title: 'CoachZone API',
            version: '1.0.0',
            description: '
# API CoachZone

API pour mettre en relation des coachs sportifs avec des institutions.

## 🔐 Authentification

Cette API utilise un système d\'authentification par **token Bearer**.

### 📝 Comment s\'authentifier :

    1. **Créer un compte** via `POST /api/register`

2. **Se connecter** via `POST /api/login` pour obtenir un token

3. **Cliquer sur "Authorize" 🔒** (bouton en haut à droite)

4. **Saisir votre token** dans le champ (sans "Bearer")

5. **Cliquer sur "Authorize"** 

6. **Testez vos routes !** Les cadenas disparaîtront sur les routes accessibles

### 🔓 Routes publiques (fonctionnent sans token malgré le cadenas) :

- `POST /api/login` - Connexion utilisateur

- `POST /api/logout` - Déconnexion utilisateur  

- `POST /api/register` - Inscription nouveau compte

- `GET /api/opendata/institutions` - Données ouvertes institutions

### 🔒 Routes sécurisées (token obligatoire) :

- `GET /api/institutions` - Liste institutions (ROLE_COACH)

- `GET /api/places` - Liste places sportives (ROLE_COACH)

- `POST /api/bookings` - Créer réservation (ROLE_COACH)

- `GET /api/bookings` - Voir réservations (ROLE_COACH/INSTITUTION)

- `PATCH /api/places/{id}` - Modifier prix (ROLE_INSTITUTION)

- `GET /api/users/me` - Mon profil utilisateur

### 💡 Note importante :
**Toutes les routes ont un cadenas** pour simplifier l\'interface, mais les **routes publiques fonctionnent sans token** !
'
        );

        // Application de la sécurité globale (cadenas partout)
        return $openApi
            ->withInfo($info)
            ->withComponents($components)
            ->withSecurity([['bearerAuth' => []]]);
    }
}
