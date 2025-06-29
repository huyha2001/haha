# Document Library System

## Overview

This is a Vietnamese document library management system built with a modern full-stack architecture. The application allows users to browse, search, and manage documents organized in hierarchical folders, with Google Drive integration for file storage and retrieval.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: PostgreSQL-based session storage
- **API Structure**: RESTful API with JSON responses

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon Database (serverless)
- **File Storage**: Google Drive API integration for document storage
- **Session Storage**: PostgreSQL-based session management using connect-pg-simple
- **Development Storage**: In-memory storage implementation for development/testing

## Key Components

### Database Schema
- **Folders Table**: Hierarchical folder structure with parent-child relationships, document counts, and Google Drive integration
- **Users Table**: Contributor information for document submissions and user management
- **Documents Table**: Document metadata including file information, download statistics, favorite status, folder associations, contributor details, and approval status
- **Shared Schema**: Common TypeScript types and Zod validation schemas used across frontend and backend

### Frontend Components
- **Header**: Search functionality, navigation controls, and upload triggers
- **Sidebar**: Hierarchical folder navigation with expand/collapse functionality
- **Document Grid/List**: Responsive document display with grid and list view modes
- **Document Cards**: Individual document representation with actions (favorite, download, preview)
- **Upload Modal**: File upload interface with form validation and folder selection

### Backend Services
- **Storage Interface**: Abstracted storage layer supporting both in-memory and database implementations
- **Route Handlers**: RESTful endpoints for folders, documents, search, and file operations
- **Google Drive Service**: Integration layer for Google Drive API operations

## Data Flow

1. **Document Browsing**: Client requests documents → Backend queries database → Returns filtered results
2. **Folder Navigation**: User selects folder → Client updates state → Fetches folder-specific documents
3. **Search Functionality**: User enters search term → Real-time API calls → Filtered document results
4. **File Upload**: User uploads file → Google Drive API stores file → Database stores metadata
5. **Download Process**: User clicks download → Backend increments counter → Redirects to Google Drive file

## External Dependencies

### Core Libraries
- **Database**: @neondatabase/serverless, drizzle-orm, drizzle-zod
- **UI Components**: @radix-ui/* components, lucide-react for icons
- **Form Management**: react-hook-form, @hookform/resolvers
- **Date Handling**: date-fns for date formatting and manipulation
- **Styling**: tailwindcss, class-variance-authority, clsx

### Development Tools
- **Replit Integration**: @replit/vite-plugin-runtime-error-modal, @replit/vite-plugin-cartographer
- **Build Tools**: esbuild for server bundling, tsx for TypeScript execution
- **Type Safety**: TypeScript, @types/node

### External APIs
- **Google Drive API**: For file storage, retrieval, and management
- **PostgreSQL**: Via Neon Database for persistent data storage

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite development server with HMR support
- **TypeScript**: Real-time type checking and compilation
- **Database**: Uses DATABASE_URL environment variable for connection
- **Error Handling**: Runtime error overlay for development debugging

### Production Build
- **Frontend**: Vite production build with optimized assets
- **Backend**: esbuild compilation to optimized Node.js bundle
- **Static Assets**: Served from dist/public directory
- **Environment**: Configurable via NODE_ENV and database connection strings

### Database Management
- **Migrations**: Drizzle migrations stored in ./migrations directory
- **Schema**: Centralized schema definition in shared/schema.ts
- **Connection**: Serverless PostgreSQL via Neon Database with connection pooling

## Changelog
- June 28, 2025. Initial setup
- June 28, 2025. Added user contribution system with approval workflow

## User Preferences

Preferred communication style: Simple, everyday language.