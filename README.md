# AI Workout Tracker

An intelligent workout tracking and planning application that leverages AI to create personalized workout plans and adapt them based on user progress.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (Auth, Database, Real-time)
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router DOM
- **Deployment**: Vercel

## Features

- 🔐 User authentication with Supabase Auth
- 📊 Dashboard with workout progress tracking
- 🤖 AI-powered workout planning and adaptation
- 📱 Responsive design with modern UI components
- 🔄 Real-time data synchronization
- 📈 Progress tracking and analytics

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- Git

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd workout-tracker
npm install
```

### 2. Set Up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Navigate to Settings > API in your Supabase dashboard
3. Copy your Project URL and anon/public key
4. Create a `.env` file in the root directory:

```bash
cp env.example .env
```

5. Update `.env` with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Database Schema

1. Open your Supabase dashboard and navigate to the **SQL Editor**
2. Open the `complete-database-setup.sql` file from the project root
3. Copy the entire contents of the file
4. Paste it into the Supabase SQL Editor
5. Click **Run** to execute the SQL

This will create all necessary tables, policies, indexes, and triggers:
- `profiles` - User profile information
- `workouts` - Workout sessions with AI summary fields
- `workout_sets` - Individual exercise sets within workouts
- `custom_exercises` - User-created custom exercises
- Row Level Security (RLS) policies for all tables
- Performance indexes
- Automatic profile creation trigger

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   └── layout/         # Layout and navigation components
├── contexts/           # React contexts (Auth, etc.)
├── lib/               # Utility libraries and configurations
├── pages/             # Page components
└── types/             # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Ensure these are set in your Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Next Steps

This is the basic framework. The following features need to be implemented:

1. **AI Workout Generation**: Integrate with AI services for workout planning
2. **Workout Execution**: Real-time workout tracking and progress updates
3. **Progress Analytics**: Charts and insights for user progress
4. **AI Adaptation**: Machine learning for workout adjustments based on performance
5. **Social Features**: Optional sharing and community features

## Contributing

This is a personal project, but feel free to fork and adapt for your own use.

## License

Private use only - not for commercialization.
