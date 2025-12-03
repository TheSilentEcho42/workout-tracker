# System Architecture

## Overview

The AI Workout Tracker is a modern, full-stack web application built with React and TypeScript. It leverages Supabase for backend services (authentication, database, and real-time capabilities) and OpenAI for AI-powered workout plan generation.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Pages      │  │  Components  │  │   Contexts  │   │
│  │              │  │              │  │              │   │
│  │ - Dashboard  │  │ - Workout    │  │ - Auth       │   │
│  │ - History    │  │ - Exercise   │  │ - Offline    │   │
│  │ - AI Workout │  │ - History    │  │              │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │     Lib      │  │    Hooks     │  │   Types      │   │
│  │              │  │              │  │              │   │
│  │ - workouts   │  │ - useOnline  │  │ - Workout    │   │
│  │ - history    │  │              │  │ - Exercise   │   │
│  │ - ai         │  │              │  │ - User       │   │
│  │ - supabase   │  │              │  │              │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST API
                            │
        ┌───────────────────┴───────────────────┐
        │                                         │
┌───────▼────────┐                    ┌──────────▼────────┐
│   Supabase     │                    │   OpenAI API       │
│                │                    │                   │
│ - Auth         │                    │ - GPT-4           │
│ - Database     │                    │ - GPT-4o-mini     │
│ - Real-time    │                    │ - Workout Plans   │
│ - Storage      │                    │                   │
└────────────────┘                    └───────────────────┘
```

## Component Architecture

### Frontend Layers

#### 1. Presentation Layer (Pages)
Located in `src/pages/`, these are top-level route components:
- **HomePage**: Landing page with authentication options
- **LoginPage**: User authentication (sign in/sign up/guest)
- **DashboardPage**: Main dashboard with workout overview
- **WorkoutPage**: Active workout tracking interface
- **HistoryPage**: Workout history and progress analytics
- **AIWorkoutPage**: AI-powered workout plan generation
- **WorkoutPlansPage**: Saved workout plans management
- **ProfilePage**: User profile and settings

#### 2. Component Layer
Located in `src/components/`, organized by feature:

**Workout Components** (`src/components/workout/`):
- `ActiveWorkout.tsx`: Manages active workout session
- `PlannedWorkout.tsx`: Displays and executes planned workouts
- `AddExerciseForm.tsx`: Form for adding exercises to workouts
- `WorkoutSets.tsx`: Displays and manages exercise sets
- `WorkoutReview.tsx`: Post-workout review and summary

**History Components** (`src/components/history/`):
- `WorkoutCard.tsx`: Individual workout card display
- `WorkoutHistoryCards.tsx`: Grid of workout cards
- `ExerciseDetail.tsx`: Detailed exercise progress view
- `ProgressChart.tsx`: Visual progress charts
- `WeeklySummary.tsx`: Weekly workout statistics

**AI Components** (`src/components/ai/`):
- `WorkoutPlanQuestionnaire.tsx`: User profile questionnaire
- `WorkoutPlanOptions.tsx`: Generated plan options display
- `WorkoutPlanDetails.tsx`: Detailed plan view
- `AICostMonitor.tsx`: AI API cost tracking

**Layout Components** (`src/components/layout/`):
- `Layout.tsx`: Main application layout wrapper
- `Navigation.tsx`: Top navigation bar

**Auth Components** (`src/components/auth/`):
- `ProtectedRoute.tsx`: Route guard for authenticated routes

#### 3. Business Logic Layer (Lib)
Located in `src/lib/`, contains core business logic:

- **`workouts.ts`**: Workout CRUD operations, exercise management
- **`history.ts`**: Workout history queries, exercise statistics
- **`ai.ts`**: OpenAI integration, workout plan generation
- **`supabase.ts`**: Supabase client initialization
- **`utils.ts`**: Utility functions (date formatting, ID generation)
- **`workoutPlans.ts`**: Workout plan management
- **`customExercises.ts`**: Custom exercise management
- **`offline/`**: Offline support (IndexedDB, sync queue) - coming soon

#### 4. State Management Layer

**React Contexts** (`src/contexts/`):
- **`AuthContext.tsx`**: Global authentication state
  - User session management
  - Sign in/up/out operations
  - Guest account handling
  - Session persistence

**React Query** (TanStack Query):
- Server state management
- Caching and synchronization
- Optimistic updates
- Automatic refetching

#### 5. Routing Layer
Located in `src/App.tsx`:
- React Router DOM for client-side routing
- Protected routes with authentication checks
- Layout wrapper for authenticated pages

## Data Flow

### Authentication Flow

```
User Action
    │
    ▼
LoginPage Component
    │
    ▼
AuthContext.signIn()
    │
    ▼
Supabase Auth API
    │
    ├── Success ──► Set session ──► Redirect to Dashboard
    │
    └── Error ────► Display error message
```

### Workout Creation Flow

```
User creates workout
    │
    ▼
ActiveWorkout Component
    │
    ▼
workouts.createWorkout()
    │
    ├── Online ──► Supabase Database ──► Success ──► Update UI
    │
    └── Offline ──► IndexedDB ──► Sync Queue ──► Update UI
                                    │
                                    └── When online ──► Sync to Supabase
```

### AI Workout Plan Generation Flow

```
User fills questionnaire
    │
    ▼
WorkoutPlanQuestionnaire Component
    │
    ▼
ai.generateWorkoutPlan()
    │
    ▼
OpenAI API (GPT-4)
    │
    ├── Success ──► Parse response ──► Display plan options
    │
    └── Error ────► Fallback plan ──► Display error
```

### Data Synchronization Flow (Future: Offline Support)

```
User action (create/update workout)
    │
    ├── Online ──► Direct to Supabase ──► Success
    │
    └── Offline ──► IndexedDB ──► Sync Queue
                            │
                            └── Connection restored
                                    │
                                    ▼
                            Process sync queue
                                    │
                                    ├── Success ──► Mark synced
                                    │
                                    └── Conflict ──► User resolution
```

## Database Schema

### Tables

#### `profiles`
User profile information linked to Supabase Auth users.

**Columns:**
- `id` (UUID, Primary Key, References `auth.users`)
- `email` (TEXT, NOT NULL)
- `full_name` (TEXT, nullable)
- `avatar_url` (TEXT, nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### `workouts`
Workout sessions with AI-generated summaries.

**Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to `auth.users`)
- `name` (TEXT, NOT NULL)
- `description` (TEXT, nullable)
- `workout_date` (DATE, NOT NULL)
- `status` (TEXT: 'planned' | 'in_progress' | 'completed' | 'cancelled')
- `ai_generated` (BOOLEAN)
- `summary` (TEXT, nullable) - AI-generated summary
- `strengths` (TEXT[], nullable) - AI-identified strengths
- `improvements` (TEXT[], nullable) - AI-suggested improvements
- `next_steps` (TEXT[], nullable) - AI-recommended next steps
- `duration_minutes` (INTEGER)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### `workout_sets`
Individual exercise sets within workouts.

**Columns:**
- `id` (UUID, Primary Key)
- `workout_id` (UUID, Foreign Key to `workouts`)
- `exercise_id` (TEXT) - Exercise identifier
- `exercise_name` (TEXT, NOT NULL)
- `weight` (NUMERIC, nullable) - Weight in kg/lbs
- `reps` (INTEGER, NOT NULL)
- `rir` (INTEGER) - Reps in Reserve (RPE scale)
- `duration` (INTEGER, nullable) - Duration in seconds for time-based exercises
- `notes` (TEXT, nullable)
- `order_index` (INTEGER) - Order within workout

#### `custom_exercises`
User-created custom exercises.

**Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to `auth.users`)
- `name` (TEXT, NOT NULL)
- `muscle_groups` (TEXT[])
- `equipment` (TEXT[])
- `notes` (TEXT, nullable)
- `created_at` (TIMESTAMP)

### Row Level Security (RLS)

All tables have RLS policies ensuring:
- Users can only read/write their own data
- Public access is restricted
- Guest accounts have appropriate access

### Indexes

Performance indexes on:
- `workouts.user_id` + `workouts.status`
- `workouts.workout_date`
- `workout_sets.workout_id`
- `workout_sets.exercise_name`

## External Integrations

### Supabase

**Services Used:**
1. **Authentication**
   - Email/password authentication
   - Session management
   - User metadata storage

2. **Database (PostgreSQL)**
   - Relational data storage
   - Row Level Security
   - Real-time subscriptions (future)

3. **Storage** (future)
   - Profile images
   - Workout media

### OpenAI API

**Models Used:**
- **GPT-4o**: Complex workout plan generation ($2.50/$10.00 per 1M tokens)
- **GPT-4o-mini**: Simple tasks and follow-up questions ($0.15/$0.60 per 1M tokens)
- **GPT-3.5-turbo**: Basic text processing ($0.50/$1.50 per 1M tokens)

**Endpoints:**
- Chat completions for workout plan generation
- Structured JSON responses for plan data

**Cost Management:**
- Model selection based on task complexity
- Token usage tracking
- Cost event dispatching for monitoring

## Offline Architecture (Future Implementation)

### Service Worker
- Caches application shell (HTML, CSS, JS)
- Network-first strategy for API calls
- Offline fallback to cached resources

### IndexedDB (Dexie.js)
- Local workout data storage
- Sync queue for pending operations
- Conflict resolution metadata

### Sync Strategy
- Optimistic UI updates
- Background sync when online
- Exponential backoff retry logic
- Conflict resolution UI

## Security Considerations

1. **Authentication**: Supabase handles secure authentication
2. **RLS Policies**: Database-level access control
3. **API Keys**: Environment variables (never committed)
4. **HTTPS**: All API calls over secure connections
5. **Input Validation**: Client and server-side validation

## Performance Optimizations

1. **Code Splitting**: Vite automatic code splitting
2. **React Query Caching**: Reduces unnecessary API calls
3. **Lazy Loading**: Route-based code splitting
4. **Database Indexes**: Optimized queries
5. **Bundle Size**: Tree shaking and minification

## Deployment Architecture

### Development
- Local Vite dev server (port 5173)
- Hot module replacement
- Source maps for debugging

### Production (Vercel)
- Static site generation
- Edge network distribution
- Automatic HTTPS
- Preview deployments for PRs
- Environment variable management

## Future Enhancements

1. **Offline Support**: Full PWA capabilities
2. **Real-time Sync**: Supabase real-time subscriptions
3. **Push Notifications**: Workout reminders
4. **Social Features**: Workout sharing
5. **Advanced Analytics**: Machine learning insights
6. **Mobile Apps**: React Native versions

## Technology Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 18 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router DOM |
| State Management | React Query (TanStack Query) |
| Backend | Supabase (PostgreSQL, Auth) |
| AI Integration | OpenAI API |
| Deployment | Vercel |
| Testing | Vitest, Playwright, MSW (planned) |
| Offline Storage | IndexedDB via Dexie.js (planned) |


