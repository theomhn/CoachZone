# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Composer Commands
- `composer install` - Install PHP dependencies
- `composer update` - Update dependencies
- `composer dump-autoload` - Regenerate autoloader

### Symfony Commands
- `php bin/console cache:clear` - Clear application cache
- `php bin/console doctrine:migrations:migrate` - Run database migrations
- `php bin/console doctrine:schema:update --force` - Update database schema
- `php bin/console make:entity` - Generate new entity
- `php bin/console make:controller` - Generate new controller
- `php bin/console app:sync-places` - Sync places data (custom command)

### Development Server
- Start built-in PHP server: `php -S localhost:8000 -t public/`
- Access API documentation: `http://localhost:8000/api/docs`

## Architecture Overview

### Core Framework
- **Symfony 7.1**: Modern PHP framework with dependency injection and service container
- **API Platform 4.0**: REST/GraphQL API framework built on Symfony
- **Doctrine ORM 3.3**: Database abstraction layer and ORM
- **Security**: Custom access token authentication system

### Entity Structure
- **User inheritance hierarchy**: 
  - Base `User` entity with email/password authentication
  - `Coach` extends User - coaches who book sports facilities  
  - `Institution` extends User - sports facilities/institutions
- **Booking system**: Central entity linking coaches to places/institutions
- **Places**: Sports facilities that can be booked
- **Access tokens**: Custom authentication tokens for API access

### API Design
- RESTful API endpoints following API Platform conventions
- JWT-like access token authentication via `AccessTokenHandler`
- Role-based access control (ROLE_COACH, ROLE_INSTITUTION, ROLE_USER)
- Custom controllers for complex business logic (booking, favorites)

### Key Services
- `BookingValidationService`: Validates booking conflicts and constraints
- `InstitutionEnrichmentService`: Enriches institution data
- `PlaceSyncService`: Synchronizes places data from external sources
- `OpenApiFactory`: Custom OpenAPI documentation decorator

### Security Model
- Email-based user authentication
- Access token system for API authentication
- Role-based permissions enforced at API level
- Security constraints defined in entity annotations

### Database
- Doctrine migrations for schema management
- Joined table inheritance for User hierarchy
- Foreign key relationships between entities
- Custom repositories for complex queries

### Development Features
- Web Profiler for debugging (dev environment)
- Maker bundle for code generation
- CORS enabled for frontend integration
- Comprehensive API documentation via Swagger/OpenAPI

## Important Guidelines

- **NEVER include Claude attributions**: Do not add any mentions of Claude, Claude Code, or Anthropic in commits, comments, documentation, or any code output.
- **No AI attribution**: Keep all work anonymous without any AI tool references.
- **Commit messages**: Focus only on the final result and permanent changes. Do not mention temporary files, intermediate steps, or files that were created and later removed during development.

## Data Architecture & Sources

### OpenData Integration
- **OpenData Entity**: Stores equipment data from external sources in JSON format (id, data, lastUpdate)
- **Usage**: OpenData is ONLY used for institution registration validation and initial enrichment
- **Route**: `/api/opendata/institutions` - Public endpoint for institution discovery during registration
- **High Availability**: OpenData serves as backup data source - if external service fails, application continues working

### Institution Data Management
- **Primary Source**: Institution table stores all operational data (adresse, ville, coordonnees, activites, equipements)
- **Usage**: All API operations (`/api/institutions`, favorites, etc.) read from Institution table
- **Independence**: Institution data can be modified independently of OpenData
- **Performance**: No external API calls during normal operations

### Data Flow
1. **Registration**: Validate institution exists in OpenData → Enrich with OpenData → Store in Institution table
2. **Operations**: All reads/writes use Institution table data
3. **Updates**: Modify Institution table directly (not OpenData)
4. **Resilience**: If OpenData becomes unavailable, existing institutions continue operating

### Place-Institution Relations
- **One-to-Many**: One Institution can have multiple Places
- **Synchronization**: Places are automatically created from OpenData during institution registration
- **Association**: Places are linked to Institutions via foreign key relationship

## Important Notes
- All API routes require authentication except `/api/docs`, `/api/login`, `/api/register`, and `/api/opendata`
- The application uses a custom access token system rather than standard JWT
- Booking validation includes conflict detection for equipment and time slots
- Institution favorites are managed through dedicated controllers
- OpenData is used ONLY for registration validation - operational data comes from Institution table