<?php

namespace App\OpenApi;

use ApiPlatform\OpenApi\Factory\OpenApiFactoryInterface;
use ApiPlatform\OpenApi\Model\RequestBody;
use ApiPlatform\OpenApi\OpenApi;

final class OpenApiSchemaDecorator implements OpenApiFactoryInterface
{
    public function __construct(private OpenApiFactoryInterface $decorated) {}

    public function __invoke(array $context = []): OpenApi
    {
        $openApi = $this->decorated->__invoke($context);
        
        return $this->addCustomSchemas($openApi);
    }

    private function addCustomSchemas(OpenApi $openApi): OpenApi
    {
        $paths = $openApi->getPaths();
        
        // Modifier les paths directement via la réflection
        $pathsReflection = new \ReflectionClass($paths);
        $pathsProperty = $pathsReflection->getProperty('paths');
        $pathsProperty->setAccessible(true);
        $pathsArray = $pathsProperty->getValue($paths);

        // Ajouter la documentation pour les routes d'authentification
        $this->addAuthSchemas($pathsArray);

        // POST /api/bookings
        if (isset($pathsArray['/api/bookings'])) {
            $bookingPath = $pathsArray['/api/bookings'];
            $postOp = $bookingPath->getPost();
            
            if ($postOp) {
                $requestBody = new RequestBody(
                    content: new \ArrayObject([
                        'application/json' => [
                            'schema' => [
                                'type' => 'object',
                                'properties' => [
                                    'dateStart' => [
                                        'type' => 'string',
                                        'format' => 'date-time',
                                        'example' => '2024-07-25T14:00:00'
                                    ],
                                    'dateEnd' => [
                                        'type' => 'string', 
                                        'format' => 'date-time',
                                        'example' => '2024-07-25T16:00:00'
                                    ],
                                    'price' => [
                                        'type' => 'number',
                                        'format' => 'float',
                                        'example' => 25.50
                                    ],
                                    'place' => [
                                        'type' => 'string',
                                        'example' => '/api/places/EQ12345'
                                    ],
                                    'coach' => [
                                        'type' => 'string',
                                        'example' => '/api/coaches/1'
                                    ]
                                ]
                            ],
                            'example' => [
                                'dateStart' => '2024-07-25T14:00:00',
                                'dateEnd' => '2024-07-25T16:00:00',
                                'price' => 25.50,
                                'place' => '/api/places/EQ12345',
                                'coach' => '/api/coaches/1'
                            ]
                        ]
                    ])
                );
                
                $pathsArray['/api/bookings'] = $bookingPath->withPost($postOp->withRequestBody($requestBody));
            }
        }

        // PATCH /api/institutions/{id}
        if (isset($pathsArray['/api/institutions/{id}'])) {
            $institutionPath = $pathsArray['/api/institutions/{id}'];
            $patchOp = $institutionPath->getPatch();
            
            if ($patchOp) {
                $requestBody = new RequestBody(
                    content: new \ArrayObject([
                        'application/json' => [
                            'schema' => [
                                'type' => 'object',
                                'properties' => [
                                    'adresse' => [
                                        'type' => 'string',
                                        'example' => '123 Avenue du Sport, 75001 Paris'
                                    ],
                                    'ville' => [
                                        'type' => 'string',
                                        'example' => 'Paris'
                                    ],
                                    'coordonnees' => [
                                        'type' => 'object',
                                        'example' => ['latitude' => 48.8566, 'longitude' => 2.3522]
                                    ],
                                    'activites' => [
                                        'type' => 'array',
                                        'items' => ['type' => 'string'],
                                        'example' => ['Football', 'Basketball', 'Tennis']
                                    ],
                                    'equipements' => [
                                        'type' => 'array',
                                        'items' => ['type' => 'string'],
                                        'example' => ['Terrain de football', 'Gymnase', 'Court de tennis']
                                    ]
                                ]
                            ],
                            'example' => [
                                'adresse' => '123 Avenue du Sport, 75001 Paris',
                                'ville' => 'Paris',
                                'coordonnees' => ['latitude' => 48.8566, 'longitude' => 2.3522],
                                'activites' => ['Football', 'Basketball', 'Tennis'],
                                'equipements' => ['Terrain de football', 'Gymnase', 'Court de tennis']
                            ]
                        ]
                    ])
                );
                
                $pathsArray['/api/institutions/{id}'] = $institutionPath->withPatch($patchOp->withRequestBody($requestBody));
            }
        }

        // POST /api/places
        if (isset($pathsArray['/api/places'])) {
            $placePath = $pathsArray['/api/places'];
            $postOp = $placePath->getPost();
            
            if ($postOp) {
                $requestBody = new RequestBody(
                    content: new \ArrayObject([
                        'application/json' => [
                            'schema' => [
                                'type' => 'object',
                                'properties' => [
                                    'id' => [
                                        'type' => 'string',
                                        'example' => 'EQ12345'
                                    ],
                                    'inst_numero' => [
                                        'type' => 'string',
                                        'example' => 'INST001'
                                    ],
                                    'inst_name' => [
                                        'type' => 'string',
                                        'example' => 'Centre Sportif Municipal'
                                    ],
                                    'equip_nom' => [
                                        'type' => 'string',
                                        'example' => 'Terrain de football principal'
                                    ],
                                    'price' => [
                                        'type' => 'number',
                                        'format' => 'float',
                                        'example' => 25.50
                                    ],
                                    'institution' => [
                                        'type' => 'string',
                                        'example' => '/api/institutions/1'
                                    ]
                                ]
                            ],
                            'example' => [
                                'id' => 'EQ12345',
                                'inst_numero' => 'INST001',
                                'inst_name' => 'Centre Sportif Municipal',
                                'equip_nom' => 'Terrain de football principal',
                                'price' => 25.50,
                                'institution' => '/api/institutions/1'
                            ]
                        ]
                    ])
                );
                
                $pathsArray['/api/places'] = $placePath->withPost($postOp->withRequestBody($requestBody));
            }
        }

        // PATCH /api/places/{id}
        if (isset($pathsArray['/api/places/{id}'])) {
            $placePatchPath = $pathsArray['/api/places/{id}'];
            $patchOp = $placePatchPath->getPatch();
            
            if ($patchOp) {
                $requestBody = new RequestBody(
                    content: new \ArrayObject([
                        'application/json' => [
                            'schema' => [
                                'type' => 'object',
                                'properties' => [
                                    'price' => [
                                        'type' => 'number',
                                        'format' => 'float',
                                        'example' => 30.00
                                    ]
                                ]
                            ],
                            'example' => [
                                'price' => 30.00
                            ]
                        ]
                    ])
                );
                
                $pathsArray['/api/places/{id}'] = $placePatchPath->withPatch($patchOp->withRequestBody($requestBody));
            }
        }

        // Remettre les paths modifiés
        $pathsProperty->setValue($paths, $pathsArray);
        
        return $openApi;
    }

    private function addAuthSchemas(array &$pathsArray): void
    {
        // POST /api/login
        if (isset($pathsArray['/api/login'])) {
            $loginPath = $pathsArray['/api/login'];
            $postOp = $loginPath->getPost();
            
            if ($postOp) {
                $requestBody = new RequestBody(
                    content: new \ArrayObject([
                        'application/json' => [
                            'schema' => [
                                'type' => 'object',
                                'properties' => [
                                    'email' => [
                                        'type' => 'string',
                                        'format' => 'email',
                                        'description' => 'Adresse email de l\'utilisateur',
                                        'example' => 'coach@example.com'
                                    ],
                                    'password' => [
                                        'type' => 'string',
                                        'description' => 'Mot de passe de l\'utilisateur',
                                        'example' => 'MonMotDePasse123'
                                    ]
                                ],
                                'required' => ['email', 'password']
                            ],
                            'examples' => [
                                'coach' => [
                                    'summary' => 'Connexion Coach',
                                    'description' => 'Exemple de connexion pour un coach',
                                    'value' => [
                                        'email' => 'coach@example.com',
                                        'password' => 'MotDePasseCoach123'
                                    ]
                                ],
                                'institution' => [
                                    'summary' => 'Connexion Institution',
                                    'description' => 'Exemple de connexion pour une institution',
                                    'value' => [
                                        'email' => 'institution@centresportif.com',
                                        'password' => 'MotDePasseInstitution123'
                                    ]
                                ]
                            ]
                        ]
                    ])
                );
                
                $pathsArray['/api/login'] = $loginPath->withPost($postOp->withRequestBody($requestBody));
            }
        }

        // POST /api/logout
        if (isset($pathsArray['/api/logout'])) {
            $logoutPath = $pathsArray['/api/logout'];
            $postOp = $logoutPath->getPost();
            
            if ($postOp) {
                $requestBody = new RequestBody(
                    content: new \ArrayObject([
                        'application/json' => [
                            'schema' => [
                                'type' => 'object',
                                'properties' => [
                                    'token' => [
                                        'type' => 'string',
                                        'description' => 'Token d\'accès à invalider (optionnel, sera détecté automatiquement)',
                                        'example' => 'abc123def456...'
                                    ]
                                ]
                            ],
                            'example' => [
                                'token' => 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz'
                            ]
                        ]
                    ])
                );
                
                $pathsArray['/api/logout'] = $logoutPath->withPost($postOp->withRequestBody($requestBody));
            }
        }

        // POST /api/register
        if (isset($pathsArray['/api/register'])) {
            $registerPath = $pathsArray['/api/register'];
            $postOp = $registerPath->getPost();
            
            if ($postOp) {
                $requestBody = new RequestBody(
                    content: new \ArrayObject([
                        'application/json' => [
                            'schema' => [
                                'type' => 'object',
                                'properties' => [
                                    'email' => [
                                        'type' => 'string',
                                        'format' => 'email',
                                        'description' => 'Adresse email unique',
                                        'example' => 'user@example.com'
                                    ],
                                    'password' => [
                                        'type' => 'string',
                                        'description' => 'Mot de passe (minimum 8 caractères, avec majuscule, minuscule et chiffre)',
                                        'example' => 'MonMotDePasse123'
                                    ],
                                    'type' => [
                                        'type' => 'string',
                                        'enum' => ['coach', 'institution'],
                                        'description' => 'Type d\'utilisateur',
                                        'example' => 'coach'
                                    ],
                                    'firstName' => [
                                        'type' => 'string',
                                        'description' => 'Prénom (requis pour les coaches)',
                                        'example' => 'Jean'
                                    ],
                                    'lastName' => [
                                        'type' => 'string',
                                        'description' => 'Nom de famille (requis pour les coaches)',
                                        'example' => 'Dupont'
                                    ],
                                    'work' => [
                                        'type' => 'string',
                                        'description' => 'Profession/spécialité (requis pour les coaches)',
                                        'example' => 'Entraîneur de football'
                                    ],
                                    'inst_numero' => [
                                        'type' => 'string',
                                        'description' => 'Numéro d\'institution dans OpenData (requis pour les institutions)',
                                        'example' => 'INST001'
                                    ]
                                ],
                                'required' => ['email', 'password', 'type']
                            ],
                            'examples' => [
                                'coach' => [
                                    'summary' => 'Inscription Coach',
                                    'description' => 'Inscription d\'un coach sportif',
                                    'value' => [
                                        'email' => 'jean.dupont@gmail.com',
                                        'password' => 'MotDePasseCoach123',
                                        'type' => 'coach',
                                        'firstName' => 'Jean',
                                        'lastName' => 'Dupont',
                                        'work' => 'Entraîneur de football'
                                    ]
                                ],
                                'institution' => [
                                    'summary' => 'Inscription Institution',
                                    'description' => 'Inscription d\'une institution sportive',
                                    'value' => [
                                        'email' => 'contact@centresportif.com',
                                        'password' => 'MotDePasseInstitution123',
                                        'type' => 'institution',
                                        'inst_numero' => 'INST001'
                                    ]
                                ]
                            ]
                        ]
                    ])
                );
                
                $pathsArray['/api/register'] = $registerPath->withPost($postOp->withRequestBody($requestBody));
            }
        }
    }
}