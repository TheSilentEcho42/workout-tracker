# AI Workout Tracker

An intelligent workout tracking and planning application that leverages AI to create personalized workout plans and adapt them based on user progress.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (Auth, Database, Real-time)
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router DOM
- **AI Integration**: OpenAI API
- **Deployment**: Vercel

## Features

- 🔐 User authentication with Supabase Auth
- 📊 Dashboard with workout progress tracking
- 🤖 AI-powered workout planning and adaptation
- 📱 Responsive design with modern UI components
- 🔄 Real-time data synchronization
- 📈 Progress tracking and analytics
- 💾 Offline support with automatic sync (coming soon)
- 🧪 Comprehensive test coverage (coming soon)

## Prerequisites Checklist

Before you begin, ensure you have the following installed:

- [ ] **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- [ ] **npm** or **yarn** (comes with Node.js)
- [ ] **Git** - [Download](https://git-scm.com/)
- [ ] **Supabase account** - [Sign up](https://supabase.com) (free tier available)
- [ ] **OpenAI API key** (optional, for AI features) - [Get API key](https://platform.openai.com/api-keys)

## Quick Start (15-Minute Setup)

### Step 1: Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd workout-tracker
npm install
```

### Step 2: Set Up Environment Variables

1. Copy the example environment file:
```bash
cp env.example .env
```

2. Create a Supabase project:
   - Go to [Supabase](https://supabase.com) and create a new project
   - Wait for the project to finish provisioning (takes ~2 minutes)

3. Get your Supabase credentials:
   - Navigate to **Settings** > **API** in your Supabase dashboard
   - Copy your **Project URL** and **anon/public key**

4. Update your `.env` file with the following:

```env
# Database Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration (Optional - for AI features)
VITE_OPENAI_API_KEY=your_openai_api_key_here

# App Configuration
VITE_APP_NAME=Workout Tracker
VITE_APP_VERSION=1.0.0
```

### Step 3: Set Up Database Schema

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

### Step 4: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Step 5: Verify Setup

1. Open `http://localhost:5173` in your browser
2. Click "Sign Up" to create a new account
3. You should be redirected to the dashboard after successful signup

**Congratulations!** Your development environment is ready. 🎉

## Project Structure

```
workout-tracker/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ai/             # AI-related components
│   │   ├── auth/           # Authentication components
│   │   ├── history/        # Workout history components
│   │   ├── layout/         # Layout and navigation
│   │   ├── workout/        # Workout tracking components
│   │   └── ui/             # Base UI components
│   ├── contexts/           # React contexts (Auth, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries and configurations
│   │   ├── ai.ts          # OpenAI integration
│   │   ├── history.ts     # Workout history utilities
│   │   ├── supabase.ts   # Supabase client
│   │   ├── workouts.ts   # Workout CRUD operations
│   │   └── utils.ts      # General utilities
│   ├── pages/             # Page components (routes)
│   ├── types/             # TypeScript type definitions
│   └── main.tsx           # Application entry point
├── public/                 # Static assets
├── docs/                   # Documentation
│   ├── ARCHITECTURE.md   # System architecture
│   ├── API.md            # API documentation
│   └── USER_GUIDE.md     # End-user guide
├── e2e/                    # End-to-end tests
├── .github/                # GitHub workflows
├── complete-database-setup.sql  # Database schema
├── env.example            # Environment variables template
└── package.json           # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server (with hot reload)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality
- `npm test` - Run unit and integration tests (coming soon)
- `npm run test:e2e` - Run end-to-end tests (coming soon)
- `npm run test:coverage` - Generate test coverage report (coming soon)

## Development Workflow

### Making Changes

1. Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and test locally:
```bash
npm run dev
```

3. Run linting before committing:
```bash
npm run lint
```

4. Commit your changes:
```bash
git add .
git commit -m "feat: add your feature description"
```

5. Push and create a pull request:
```bash
git push origin feature/your-feature-name
```

### Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Use Tailwind CSS for styling (avoid inline styles)
- Follow the existing file structure and naming conventions

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

### Test Structure

- **Unit Tests**: Test individual utility functions (`src/lib/__tests__/`)
- **Integration Tests**: Test component interactions (`src/components/__tests__/`)
- **E2E Tests**: Test complete user workflows (`e2e/`)

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_OPENAI_API_KEY` (optional)
4. Deploy! Vercel will automatically deploy on every push to `main`

### Environment Variables for Production

Ensure these are set in your Vercel dashboard:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
- `VITE_OPENAI_API_KEY` - Your OpenAI API key (optional)

### Preview Deployments

Vercel automatically creates preview deployments for pull requests. The preview URL will be added as a comment on your PR.

## Troubleshooting

### Common Issues

#### 1. "Database not configured" warning

**Problem**: The app shows a warning about database not being configured.

**Solution**:
- Check that your `.env` file exists and contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart your development server after adding environment variables
- Verify your Supabase project is active and not paused

#### 2. "User not authenticated" errors

**Problem**: Authentication fails or user is not recognized.

**Solution**:
- Clear browser localStorage: `localStorage.clear()` in browser console
- Check Supabase dashboard > Authentication > Users to see if user exists
- Verify RLS policies are set up correctly (run `complete-database-setup.sql`)

#### 3. Build fails with TypeScript errors

**Problem**: `npm run build` fails with type errors.

**Solution**:
- Run `npm run lint` to see specific errors
- Check that all imports are correct
- Ensure all required types are defined in `src/types/`

#### 4. Port 5173 already in use

**Problem**: Development server won't start because port is occupied.

**Solution**:
```bash
# Kill the process using port 5173 (Windows)
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- --port 3000
```

#### 5. Supabase connection timeout

**Problem**: Requests to Supabase timeout or fail.

**Solution**:
- Check your internet connection
- Verify Supabase project is not paused (check dashboard)
- Check Supabase status page: https://status.supabase.com
- Verify your API keys are correct

#### 6. AI features not working

**Problem**: AI workout generation fails.

**Solution**:
- Verify `VITE_OPENAI_API_KEY` is set in `.env`
- Check OpenAI API status: https://status.openai.com
- Verify you have API credits in your OpenAI account
- Check browser console for specific error messages

### Getting Help

- Check the [Architecture Documentation](docs/ARCHITECTURE.md) for system overview
- Review [API Documentation](docs/API.md) for database operations
- See [User Guide](docs/USER_GUIDE.md) for feature usage
- Open an issue on GitHub for bugs or feature requests

## Contributing

This is a personal project, but feel free to fork and adapt for your own use. If you'd like to contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

Private use only - not for commercialization.

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
