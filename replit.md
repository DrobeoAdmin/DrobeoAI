# replit.md

## Overview

Drobeo is a full-stack wardrobe management application built with React, TypeScript, Express.js, and PostgreSQL. The app helps users organize their clothing items, create outfits, plan their wardrobe calendar, and receive AI-powered styling suggestions. It features a modern UI built with shadcn/ui components and Tailwind CSS, with AI integration for outfit generation and clothing analysis.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM
- **File Upload**: Multer for handling image uploads
- **API Integration**: OpenAI API for AI-powered features
- **Development**: tsx for TypeScript execution in development

### Database Schema
- **Users**: User authentication and profile management
- **Categories**: Clothing categories with icons and colors
- **Clothing Items**: Individual wardrobe pieces with metadata (brand, color, season, tags, etc.)
- **Outfits**: Collections of clothing items for specific occasions
- **Outfit Calendar**: Scheduled outfits for specific dates
- **Wishlist Items**: Desired clothing items for future purchase

## Key Components

### Data Management
- **Drizzle ORM**: Type-safe database operations with PostgreSQL
- **Schema Validation**: Zod schemas for runtime type checking
- **File Storage**: Multer configuration for image uploads
- **Database Migrations**: Managed through Drizzle Kit

### AI Integration
- **OpenAI GPT-4o**: Image analysis for clothing categorization
- **Outfit Generation**: AI-powered outfit suggestions based on weather, occasion, and personal style
- **Style Advice**: Conversational AI for fashion recommendations

### User Interface
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Component Library**: Comprehensive set of reusable UI components
- **Accessibility**: ARIA compliant components with keyboard navigation
- **Dark Mode**: Built-in theme switching capabilities

### Authentication
- **Session Management**: Express sessions with PostgreSQL storage and bcrypt password hashing
- **User Registration**: Full signup flow with validation and password encryption
- **Authentication Flow**: Login/logout with session-based authentication
- **Phone Authentication**: SMS verification system using Twilio for phone number authentication
- **Multi-Modal Auth**: Support for both email/password and phone number authentication
- **Onboarding**: Multi-step preference collection for new users

## Data Flow

1. **Client Requests**: React components make API calls through TanStack Query
2. **API Layer**: Express.js routes handle HTTP requests and validation
3. **Database Operations**: Drizzle ORM executes type-safe database queries
4. **AI Processing**: OpenAI API calls for image analysis and outfit generation
5. **Response Handling**: Structured JSON responses with error handling
6. **State Updates**: TanStack Query manages cache invalidation and updates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **OpenAI**: AI-powered features (image analysis, outfit generation)
- **Multer**: File upload handling
- **React Hook Form**: Form state management
- **TanStack Query**: Server state management

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **shadcn/ui**: Pre-built component library

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Static type checking
- **ESBuild**: Production bundling
- **Drizzle Kit**: Database schema management

## Deployment Strategy

### Development Environment
- **Hot Reloading**: Vite HMR for frontend, tsx watch mode for backend
- **Database**: PostgreSQL 16 module in Replit
- **Environment Variables**: DATABASE_URL and OPENAI_API_KEY required

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database**: Migrations applied via `drizzle-kit push`
- **Deployment**: Replit autoscale deployment target

### Configuration
- **Port**: Application runs on port 5000
- **Static Files**: Served from `dist/public` in production
- **API Routes**: All backend routes prefixed with `/api`

## Changelog
- June 26, 2025. Initial setup
- June 26, 2025. Implemented comprehensive authentication system with signup, login, and onboarding flows
- June 26, 2025. Renamed project to "Drobeo"
- June 26, 2025. Implemented phone number authentication with SMS verification using Twilio

## User Preferences

Preferred communication style: Simple, everyday language.