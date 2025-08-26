# Overview

ClassSync is a full-stack web application for managing class schedules and cancellations. The system provides role-based dashboards for teachers and students, allowing teachers to cancel classes and notify enrolled students, while students can view their enrolled classes and receive notifications about cancellations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Custom component library built on Radix UI primitives with shadcn/ui styling
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for full-stack type safety
- **API Pattern**: RESTful API with JSON responses
- **Error Handling**: Centralized error middleware with proper HTTP status codes
- **Request Logging**: Custom middleware for API request/response logging

## Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon serverless PostgreSQL for cloud hosting
- **Schema Management**: Drizzle Kit for database migrations and schema evolution
- **Development Storage**: In-memory storage implementation for rapid prototyping

## Authentication and Authorization
- **Session Management**: Simple email/password authentication with user data stored in localStorage
- **Role-Based Access**: Two user roles (teacher/student) with different dashboard views and permissions
- **Route Protection**: Client-side route guards based on authentication status and user role

## Data Models
- **Users**: Core user entity with email, name, role, and password fields
- **Classes**: Class scheduling with teacher assignment, room, day/time, and status tracking
- **Enrollments**: Many-to-many relationship between students and classes
- **Cancellations**: Class cancellation records with reason, notes, and rescheduling flags
- **Notifications**: User notification system for class updates and announcements

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect support

## UI and Styling
- **Radix UI**: Headless component primitives for accessibility and behavior
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Icon library for consistent visual elements
- **Google Fonts**: Inter font family for typography

## Development Tools
- **Vite**: Build tool with hot module replacement and optimized bundling
- **TypeScript**: Static type checking across frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Autoprefixer for browser compatibility

## Runtime Libraries
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Form handling with validation support
- **Zod**: Runtime type validation for API requests and responses
- **Date-fns**: Date manipulation and formatting utilities
- **Class Variance Authority**: Component variant management for design system consistency