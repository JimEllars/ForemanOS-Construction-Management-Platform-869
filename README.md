# ForemanOS - Field Operations Management Platform

ForemanOS is a modern, offline-first field operations management platform built specifically for construction professionals, contractors, and trades businesses.

## Features

- **Real-Time Project Dashboard** - Monitor all projects and tasks from a central hub
- **Client & Quote Management** - Comprehensive CRM for construction clients
- **Task Management** - Assign, track, and manage work across your team
- **Daily Logs** - Document daily progress, weather, and site conditions
- **Time Tracking** - Accurate labor hour tracking for projects
- **Document Management** - Store plans, permits, and photos securely
- **Offline-First** - Work seamlessly even without internet connectivity
- **Team Collaboration** - Invite team members and manage permissions

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand with slice pattern
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Offline Support**: Service Worker with advanced caching
- **Icons**: React Icons (Feather)
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd foremanos
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your Supabase credentials in `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

5. Start the development server:
```bash
npm run dev
```

## Architecture

ForemanOS follows a clean, modular architecture:

- **Components**: Reusable UI components with consistent design
- **Features**: Self-contained feature modules (auth, projects, etc.)
- **Store**: Unified Zustand store with logical slices
- **Services**: Data access layer for Supabase integration
- **Types**: TypeScript definitions for type safety

## Offline Capabilities

The application implements advanced offline-first capabilities:

- **Service Worker**: Caches static assets and API responses
- **Optimistic UI**: Immediate UI updates with background sync
- **Sync Queue**: Queues offline actions for later synchronization
- **Visual Feedback**: Clear indicators for sync status

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Support

For support and questions, please contact the development team.