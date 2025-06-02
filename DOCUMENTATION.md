
# AI Text Summarizer - Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Features](#features)
4. [Architecture](#architecture)
5. [File Structure](#file-structure)
6. [Installation & Setup](#installation--setup)
7. [Usage Guide](#usage-guide)
8. [API Integration](#api-integration)
9. [Authentication](#authentication)
10. [File Processing](#file-processing)
11. [Database Schema](#database-schema)
12. [Components Documentation](#components-documentation)
13. [Services Documentation](#services-documentation)
14. [Deployment](#deployment)
15. [Contributing](#contributing)

## Project Overview

The AI Text Summarizer is a modern web application that allows users to upload documents or paste text to generate AI-powered summaries. The application supports multiple input methods including file uploads (PDF, DOCX, TXT), URL content extraction, and direct text input.

### Key Capabilities
- **Multi-format Document Processing**: Supports PDF, DOCX, and plain text files
- **AI-Powered Summarization**: Uses Google Gemini API for intelligent text summarization
- **Flexible Summary Lengths**: Short, medium, long, or custom percentage-based summaries
- **User Authentication**: Secure user accounts with Supabase Auth
- **Summary History**: Persistent storage of user summaries
- **Interactive Chat**: Ask questions about your summaries
- **Export Functionality**: Export summaries as text files
- **Sharing Options**: Share summaries via social media or direct links

## Technology Stack

### Frontend Framework
- **React 18.3.1** - Core UI library
- **TypeScript** - Type safety and better development experience
- **Vite** - Modern build tool and development server

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Pre-built accessible React components
- **Radix UI** - Low-level UI primitives
- **Lucide React** - Icon library
- **next-themes** - Theme switching (light/dark mode)

### State Management
- **TanStack Query (React Query) 5.56.2** - Server state management
- **React Context** - Global state for auth, summaries, and themes
- **React Hook Form 7.53.0** - Form state management

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication system
  - Real-time subscriptions
  - File storage

### File Processing
- **PDF.js 5.2.133** - PDF content extraction
- **Mammoth.js 1.9.1** - DOCX content extraction

### AI Integration
- **Google Gemini API** - Text summarization and chat functionality

### Routing & Navigation
- **React Router DOM 6.26.2** - Client-side routing

### Validation & Forms
- **Zod 3.23.8** - Schema validation
- **@hookform/resolvers 3.9.0** - Form validation integration

### Additional Libraries
- **date-fns 3.6.0** - Date utilities
- **Recharts 2.12.7** - Data visualization
- **Sonner 1.5.0** - Toast notifications

## Features

### 1. Text Input Methods
- **Direct Text Input**: Paste text directly into the application
- **File Upload**: Support for PDF, DOCX, and TXT files (up to 10MB)
- **URL Import**: Extract content from web articles
- **Google Docs Integration**: (Planned) Direct import from Google Drive

### 2. AI Summarization
- **Multiple Length Options**:
  - Short (~10% of original)
  - Medium (~30% of original)
  - Long (~50% of original)
  - Custom percentage (1-100%)
- **Quality Analysis**: Word count, reading time, language detection
- **Source Tracking**: Maintains reference to original source

### 3. Summary Management
- **History Tracking**: All summaries are saved to user accounts
- **Export Options**: Download summaries as text files
- **Sharing Features**: Share via social media or direct links
- **Interactive Chat**: Ask follow-up questions about summaries

### 4. File Analysis
- **Comprehensive Metadata**: File size, type, word count, character count
- **Language Detection**: Basic language identification
- **Reading Time Estimation**: Based on average reading speed
- **Content Validation**: Ensures readable content extraction

### 5. User Management
- **Authentication**: Email/password login and registration
- **Profile Management**: User settings and preferences
- **API Key Management**: Store personal Gemini API keys
- **Theme Preferences**: Light/dark mode support

## Architecture

### Component Architecture
The application follows a modular React component architecture:

```
src/
├── components/           # Reusable UI components
│   ├── layout/          # Navigation and layout components
│   ├── summary/         # Summary-related components
│   ├── integrations/    # External service integrations
│   └── ui/              # Base UI components (shadcn/ui)
├── contexts/            # React Context providers
├── pages/               # Route components
├── services/            # Business logic and API calls
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

### Data Flow
1. **User Input** → Form validation (Zod) → File processing (if applicable)
2. **Content Processing** → AI summarization (Gemini API) → Database storage (Supabase)
3. **State Management** → React Context + TanStack Query → UI updates

### Authentication Flow
1. User registration/login through Supabase Auth
2. JWT tokens managed automatically by Supabase client
3. Row Level Security (RLS) policies protect user data
4. Context provider manages auth state across the app

## File Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx              # Main navigation
│   │   ├── MainLayout.tsx          # Page layout wrapper
│   │   ├── NavLogo.tsx             # Logo component
│   │   ├── DesktopNav.tsx          # Desktop navigation
│   │   ├── MobileNav.tsx           # Mobile navigation
│   │   ├── UserMenu.tsx            # User dropdown menu
│   │   └── AuthButtons.tsx         # Login/register buttons
│   ├── summary/
│   │   ├── ChatInterface.tsx       # Interactive chat with summaries
│   │   ├── FileMetadata.tsx        # File information display
│   │   ├── PdfExport.tsx           # Export functionality
│   │   ├── SharingOptions.tsx      # Social sharing
│   │   ├── TextAnalysis.tsx        # Text statistics
│   │   └── FlashCards.tsx          # Study aids (future)
│   ├── integrations/
│   │   └── UrlSummarizer.tsx       # URL content extraction
│   └── ui/                         # shadcn/ui components
├── contexts/
│   ├── AuthContext.tsx             # Authentication state
│   ├── SummaryContext.tsx          # Summary management
│   └── ThemeContext.tsx            # Theme preferences
├── pages/
│   ├── Index.tsx                   # Landing page
│   ├── Summarizer.tsx              # Main summarizer interface
│   ├── Summaries.tsx               # Summary history
│   ├── Profile.tsx                 # User profile
│   ├── Settings.tsx                # App settings
│   └── auth/                       # Authentication pages
├── services/
│   ├── fileAnalysis.ts             # File processing logic
│   ├── gemini.ts                   # AI API integration
│   ├── summary.ts                  # Summary operations
│   ├── auth.ts                     # Authentication logic
│   ├── url.ts                      # URL processing
│   └── supabase.ts                 # Database operations
├── types/
│   └── index.ts                    # TypeScript definitions
└── utils/
    └── fontSettings.ts             # UI utilities
```

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Google Gemini API key

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd ai-text-summarizer
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env.local` file with:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Database Setup**
Run the provided SQL migrations in your Supabase dashboard to set up the required tables and policies.

5. **Start Development Server**
```bash
npm run dev
```

### Supabase Configuration

1. Create a new Supabase project
2. Set up the database schema (see Database Schema section)
3. Configure authentication providers
4. Set up Row Level Security policies

## Usage Guide

### Basic Workflow

1. **Authentication**: Register or log in to your account
2. **Input Selection**: Choose your input method:
   - Paste text directly
   - Upload a file (PDF/DOCX/TXT)
   - Enter a URL to extract content
3. **Configuration**: Select summary length and options
4. **Generation**: Click "Summarize Text" to generate AI summary
5. **Interaction**: View results, export, share, or chat about the summary

### File Upload Guidelines

- **Supported formats**: PDF, DOCX, TXT
- **Maximum size**: 10MB per file
- **Content requirements**: Files must contain readable text
- **Processing time**: Varies based on file size and complexity

### Summary Options

- **Short**: ~10% of original length
- **Medium**: ~30% of original length  
- **Long**: ~50% of original length
- **Custom**: 1-100% custom percentage

## API Integration

### Google Gemini API

The application uses Google's Gemini API for AI-powered summarization:

```typescript
// Example API call structure
const response = await geminiService.summarize({
  text: inputText,
  lengthType: 'medium',
  lengthValue: 30
});
```

#### API Key Management
- Users can add their own Gemini API keys in Profile settings
- Fallback summarization available without API key
- Keys are stored securely in user profiles

### Supabase Integration

Supabase provides:
- **Authentication**: User management and JWT tokens
- **Database**: PostgreSQL with real-time capabilities
- **Storage**: File upload and management
- **Edge Functions**: Custom backend logic

## Authentication

### User Registration/Login
- Email and password authentication
- Email verification (configurable)
- Password reset functionality
- Secure session management

### Security Features
- Row Level Security (RLS) policies
- JWT token-based authentication
- Secure API key storage
- Protected routes and components

### User Data
Users have access to:
- Personal summary history
- Profile information and settings
- API key management
- Export and sharing preferences

## File Processing

### PDF Processing
Uses PDF.js for content extraction:
- Text extraction from PDF pages
- Metadata collection (page count, file size)
- Error handling for protected/corrupted files
- Fallback messages for processing failures

### DOCX Processing  
Uses Mammoth.js for document processing:
- Raw text extraction
- Formatting preservation options
- Conversion warnings and messages
- Cross-platform compatibility

### Text Analysis
Comprehensive analysis includes:
- Word count and character count
- Line and paragraph counting
- Reading time estimation
- Basic language detection
- File encoding information

## Database Schema

### Users Table (Supabase Auth)
Managed by Supabase authentication system.

### Summaries Table
```sql
CREATE TABLE public.summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  original_text TEXT NOT NULL,
  summary_text TEXT NOT NULL,
  length_type TEXT NOT NULL,
  length_value TEXT NOT NULL,
  source TEXT,
  model TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Row Level Security Policies
- Users can only access their own summaries
- Full CRUD operations protected by user ID
- Secure data isolation between users

## Components Documentation

### Core Components

#### Summarizer.tsx
Main interface component handling:
- Multi-tab input interface
- Form validation and submission
- File upload management
- Summary display and actions

#### ChatInterface.tsx
Interactive chat component featuring:
- Context-aware conversations about summaries
- Real-time message handling
- Conversation history
- AI-powered responses

#### FileMetadata.tsx
Displays comprehensive file information:
- File size and type
- Content statistics
- Processing status
- Analysis results

### Layout Components

#### Navbar.tsx
Responsive navigation with:
- Logo and branding
- User authentication status
- Theme toggle
- Mobile-responsive design

#### MainLayout.tsx
Page wrapper providing:
- Consistent page structure
- Navigation integration
- Content spacing
- Responsive design

## Services Documentation

### fileAnalysis.ts
Comprehensive file processing service:

```typescript
class FileAnalysisService {
  // Analyze uploaded files and extract content
  static async analyzeFile(file: File): Promise<{content: string, metadata: FileMetadata}>
  
  // Extract text from PDF files
  private static async extractPdfContent(file: File): Promise<string>
  
  // Extract text from DOCX files
  private static async extractDocxContent(file: File): Promise<string>
  
  // Analyze text content for statistics
  private static analyzeTextContent(text: string)
  
  // Generate analysis summary
  static generateAnalysisSummary(metadata: FileMetadata): string
}
```

### gemini.ts
AI integration service:
- API key management
- Text summarization
- Chat functionality
- Error handling and fallbacks

### summary.ts
Summary management service:
- CRUD operations for summaries
- History management
- Local storage integration
- Data synchronization

## Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
Ensure all required environment variables are set:
- Supabase URL and API keys
- Any additional API keys
- Production-specific configurations

### Hosting Options
- **Vercel**: Recommended for React applications
- **Netlify**: Alternative hosting with easy deployment
- **Supabase Hosting**: Native integration option
- **Custom Hosting**: Any static site hosting service

## Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Use provided ESLint configuration
3. Maintain component modularity
4. Write comprehensive tests
5. Document new features

### Code Style
- Use TypeScript for all new code
- Follow React hooks best practices
- Implement proper error handling
- Use semantic commit messages

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Update documentation
5. Submit pull request

---

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Support

For support and questions:
- Check the documentation
- Review existing issues
- Create a new issue with detailed description
- Follow the contribution guidelines

---

*Last updated: January 2025*
