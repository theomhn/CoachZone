# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Guidelines

-   **NEVER include Claude attributions**: Do not add any mentions of Claude, Claude Code, or Anthropic in commits, comments, documentation, or any code output.
-   **No AI attribution**: Keep all work anonymous without any AI tool references.

## Development Commands

### Core Development

- `npm start` - Start Expo development server
- `npm run android` - Start on Android device/emulator
- `npm run ios` - Start on iOS device/simulator
- `npm run web` - Start web development server

### Testing and Quality

- `npm test` - Run Jest tests in watch mode
- `npm run lint` - Run Expo linter for code quality
- `npm run format` - Format all files with Prettier (4 spaces indentation)
- `npm run format:check` - Check if files are properly formatted

### Project Management

- `npm run reset-project` - Reset project to clean state (uses scripts/reset-project.js)

## Architecture Overview

### Tech Stack

- **Framework**: React Native with Expo (v52)
- **Navigation**: Expo Router with file-based routing
- **UI**: React Native with custom theming system
- **State Management**: React Context for theme and filters
- **Maps**: React Native Maps for location features
- **Testing**: Jest with jest-expo preset

### Project Structure

```
app/                    # File-based routing (Expo Router)
├── (auth)/            # Authentication routes group
├── (coach)/           # Coach-specific routes group
├── (institution)/     # Institution-specific routes group
├── _layout.tsx        # Root layout with providers
└── [other screens]

components/            # Reusable UI components
├── screens/          # Screen-specific components
├── theme/            # Theme-related components
└── ui/              # Platform-specific UI components

contexts/             # React Context providers
├── ThemeContext.tsx  # Global theme state
└── InstitutionFiltersContext.tsx # Search/filter state

types/               # TypeScript type definitions
utils/               # Utility functions
constants/           # App constants and theme definitions
hooks/               # Custom React hooks
assets/              # Static assets (images, fonts, styles)
```

### Key Architectural Patterns

#### Theme System

- Centralized theme management via `ThemeContext`
- Supports light/dark/auto modes with device preference detection
- Theme-aware components throughout the app
- Platform-specific styling in assets/styles/

#### Navigation Architecture

- Uses Expo Router file-based routing with grouped routes
- Three main user flows: auth, coach, institution
- Global header configuration with theme integration
- Stack navigation with consistent theming

#### API Integration

- Centralized API configuration in `config.ts`
- Supports local development (127.0.0.1:8000) and production environments
- Platform-specific API URLs (Android uses 10.0.2.2 for localhost)

#### Data Models

Main entities defined in `types/index.ts`:

- `Institution` - Sports facilities with activities and equipment
- `User` - Coach or institution users with role-based properties
- `Place` - Specific equipment/venues within institutions
- `Booking` - Reservations linking coaches, places, and time slots

#### State Management

- `ThemeContext` - Global theme state and switching logic
- `InstitutionFiltersContext` - Search filters and activity selections
- Local state for screen-specific data

### Development Notes

#### API Configuration

The app connects to a Laravel backend. Update `config.ts` to switch between local and production APIs.

#### Testing Setup

- Jest configured with jest-expo preset
- Component snapshots in `__tests__/__snapshots__/`
- Run tests with `npm test` for watch mode

#### Theme Development

- Theme definitions in `constants/Themes.ts` and `constants/Colors.ts`
- Custom theme selector component for user preference
- All screens automatically inherit theme configuration from root layout

#### Platform Considerations

- Uses platform-specific components (IconSymbol, TabBarBackground)
- Android development requires different localhost configuration
- Maps integration requires platform-specific setup
