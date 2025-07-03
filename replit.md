# Skillify - Skill Sharing Platform

## Overview

Skillify is a full-stack skill-sharing platform that connects local learners and teachers through structured skill exchanges. The application facilitates peer-to-peer learning by allowing users to offer skills they can teach in exchange for skills they want to learn. It includes comprehensive features for user management, skill matching, session scheduling, messaging, and progress tracking.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Authentication with OpenID Connect
- **Session Management**: Express sessions stored in PostgreSQL
- **API Design**: RESTful API with WebSocket support for real-time messaging

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Database Provider**: Neon Database (serverless PostgreSQL)

## Key Components

### Authentication System
- **Provider**: Replit Authentication (OpenID Connect)
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **User Management**: Automatic user creation and profile management
- **Authorization**: Route-level authentication middleware

### Skill Management
- **Skill Categories**: Organized skill taxonomy with categories
- **User Skills**: Users can add skills they want to teach or learn
- **Skill Levels**: Beginner, Intermediate, Advanced proficiency levels
- **Skill Matching**: Algorithm to match users with complementary skills

### Swap System
- **Skill Swaps**: Structured exchanges between users
- **Status Management**: Pending, accepted, completed, rejected states
- **Match Discovery**: Find users with complementary skill needs
- **Request Management**: Send and respond to skill swap requests

### Session Management
- **Session Scheduling**: Calendar-based session booking
- **Video Integration**: Meeting links with Jitsi Meet integration
- **Session Types**: Teaching and learning sessions
- **Session Tracking**: Progress and completion tracking

### Real-time Communication
- **WebSocket Integration**: Real-time messaging between users
- **Message Threading**: Organized conversations by swap
- **Notification System**: Toast notifications for user actions
- **Online Status**: Real-time user presence indicators

### Progress Tracking
- **User Statistics**: Track teaching/learning activities
- **Skill Progress**: Visual progress bars for skill development
- **Rating System**: User ratings and reviews
- **Achievement Tracking**: Completed swaps and sessions

## Data Flow

### User Authentication Flow
1. User initiates login through Replit OAuth
2. OpenID Connect authentication with Replit
3. User profile creation/update in PostgreSQL
4. Session creation and cookie management
5. Route-level authentication checks

### Skill Matching Flow
1. User adds skills they want to teach/learn
2. System queries for complementary matches
3. Match algorithm considers skill overlap and user preferences
4. Filtered results presented to user
5. Swap request initiation

### Session Flow
1. Users with accepted swaps can schedule sessions
2. Session creation with meeting details
3. Calendar integration and notifications
4. Video meeting launch (Jitsi Meet)
5. Session completion and feedback

### Real-time Messaging Flow
1. WebSocket connection establishment
2. Message broadcasting to specific swap participants
3. Real-time UI updates through React Query
4. Message persistence in PostgreSQL
5. Notification delivery

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL hosting
- **Connection Pooling**: Built-in connection management
- **Environment**: DATABASE_URL environment variable required

### Authentication
- **Replit Authentication**: OpenID Connect provider
- **Required Environment Variables**: 
  - REPL_ID
  - ISSUER_URL
  - SESSION_SECRET
  - REPLIT_DOMAINS

### UI Components
- **Radix UI**: Accessible component primitives
- **shadcn/ui**: Pre-built component library
- **Lucide Icons**: Icon library for consistent iconography
- **Tailwind CSS**: Utility-first CSS framework

### Development Tools
- **Vite**: Development server and build tool
- **TypeScript**: Type safety and developer experience
- **ESLint/Prettier**: Code quality and formatting
- **Hot Module Replacement**: Fast development iteration

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite bundles React application to `dist/public`
2. **Backend Build**: ESBuild bundles Node.js server to `dist/index.js`
3. **Database Migration**: Drizzle migrations applied during deployment
4. **Asset Optimization**: Static assets processed and optimized

### Environment Configuration
- **Development**: Local development with hot reload
- **Production**: Optimized builds with environment-specific configurations
- **Database**: Automatic migration handling
- **Session Storage**: PostgreSQL-backed session management

### Replit Integration
- **Replit Development**: Integrated development environment
- **Cartographer Plugin**: Enhanced debugging and development tools
- **Runtime Error Overlay**: Development error handling
- **Replit Auth**: Native authentication integration

## Changelog

```
Changelog:
- July 03, 2025. Initial setup
```

## User Preferences

Preferred communication style: Simple, everyday language.