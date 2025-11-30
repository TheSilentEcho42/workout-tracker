-- ============================================================================
-- Complete Database Setup for Workout Tracker
-- ============================================================================
-- This file contains all SQL needed to set up the workout tracker database
-- Run this in your Supabase SQL Editor to set up the complete database schema
-- ============================================================================

-- ============================================================================
-- 1. ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. CREATE TABLES
-- ============================================================================

-- Profiles table - stores user profile information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workouts table - stores workout sessions
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  workout_date DATE NOT NULL,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  ai_generated BOOLEAN DEFAULT false,
  summary TEXT,
  strengths TEXT[],
  improvements TEXT[],
  next_steps TEXT[],
  duration_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout sets table - stores individual exercise sets within workouts
CREATE TABLE IF NOT EXISTS public.workout_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE NOT NULL,
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  weight DECIMAL(5,2),
  reps INTEGER NOT NULL,
  rir INTEGER NOT NULL DEFAULT 0, -- Reps in Reserve
  duration INTEGER, -- Duration in seconds for time-based exercises (cardio, etc.)
  notes TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom exercises table - stores user-created custom exercises
CREATE TABLE IF NOT EXISTS public.custom_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('strength', 'cardio', 'flexibility', 'bodyweight')),
  equipment TEXT[] DEFAULT '{}',
  muscle_groups TEXT[] DEFAULT '{}',
  instructions TEXT,
  is_time_based BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name) -- Prevent duplicate exercise names per user
);

-- ============================================================================
-- 3. ADD COLUMNS (for existing tables that may have been created earlier)
-- ============================================================================

-- Ensure workout_sets has all required columns
DO $$ 
BEGIN
    -- Add duration column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workout_sets' 
        AND column_name = 'duration' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.workout_sets ADD COLUMN duration INTEGER;
    END IF;

    -- Ensure duration is nullable
    ALTER TABLE public.workout_sets ALTER COLUMN duration DROP NOT NULL;

    -- Add exercise_id if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workout_sets' 
        AND column_name = 'exercise_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.workout_sets ADD COLUMN exercise_id TEXT NOT NULL DEFAULT '';
    END IF;

    -- Add exercise_name if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workout_sets' 
        AND column_name = 'exercise_name' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.workout_sets ADD COLUMN exercise_name TEXT NOT NULL DEFAULT '';
    END IF;

    -- Add weight if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workout_sets' 
        AND column_name = 'weight' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.workout_sets ADD COLUMN weight DECIMAL(5,2);
    END IF;

    -- Add reps if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workout_sets' 
        AND column_name = 'reps' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.workout_sets ADD COLUMN reps INTEGER NOT NULL DEFAULT 0;
    END IF;

    -- Add rir if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workout_sets' 
        AND column_name = 'rir' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.workout_sets ADD COLUMN rir INTEGER NOT NULL DEFAULT 0;
    END IF;

    -- Add notes if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workout_sets' 
        AND column_name = 'notes' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.workout_sets ADD COLUMN notes TEXT;
    END IF;

    -- Add order_index if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workout_sets' 
        AND column_name = 'order_index' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.workout_sets ADD COLUMN order_index INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Add workout summary fields if they don't exist
ALTER TABLE public.workouts 
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS strengths TEXT[],
ADD COLUMN IF NOT EXISTS improvements TEXT[],
ADD COLUMN IF NOT EXISTS next_steps TEXT[],
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 0;

-- Update existing workouts to have default duration of 0 if not set
UPDATE public.workouts 
SET duration_minutes = 0 
WHERE duration_minutes IS NULL;

-- ============================================================================
-- 4. ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON COLUMN public.workout_sets.duration IS 'Duration in seconds for time-based exercises (cardio, etc.)';

-- ============================================================================
-- 5. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_exercises ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. CREATE ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can insert own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can update own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can delete own workouts" ON public.workouts;

DROP POLICY IF EXISTS "Users can view sets for own workouts" ON public.workout_sets;
DROP POLICY IF EXISTS "Users can insert sets for own workouts" ON public.workout_sets;
DROP POLICY IF EXISTS "Users can update sets for own workouts" ON public.workout_sets;
DROP POLICY IF EXISTS "Users can delete sets for own workouts" ON public.workout_sets;

DROP POLICY IF EXISTS "Users can view own custom exercises" ON public.custom_exercises;
DROP POLICY IF EXISTS "Users can insert own custom exercises" ON public.custom_exercises;
DROP POLICY IF EXISTS "Users can update own custom exercises" ON public.custom_exercises;
DROP POLICY IF EXISTS "Users can delete own custom exercises" ON public.custom_exercises;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Workouts policies
CREATE POLICY "Users can view own workouts" ON public.workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts" ON public.workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts" ON public.workouts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts" ON public.workouts
  FOR DELETE USING (auth.uid() = user_id);

-- Workout sets policies (using EXISTS for better security)
CREATE POLICY "Users can view sets for own workouts" ON public.workout_sets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workouts 
      WHERE id = workout_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert sets for own workouts" ON public.workout_sets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workouts 
      WHERE id = workout_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sets for own workouts" ON public.workout_sets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.workouts 
      WHERE id = workout_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sets for own workouts" ON public.workout_sets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.workouts 
      WHERE id = workout_id AND user_id = auth.uid()
    )
  );

-- Custom exercises policies (with explicit auth checks)
CREATE POLICY "Users can view own custom exercises" ON public.custom_exercises
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can insert own custom exercises" ON public.custom_exercises
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own custom exercises" ON public.custom_exercises
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete own custom exercises" ON public.custom_exercises
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id AND
    auth.role() = 'authenticated'
  );

-- ============================================================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Workouts indexes
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON public.workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON public.workouts(workout_date);
CREATE INDEX IF NOT EXISTS idx_workouts_status ON public.workouts(status);
CREATE INDEX IF NOT EXISTS idx_workouts_summary ON public.workouts(summary) WHERE summary IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workouts_duration ON public.workouts(duration_minutes);

-- Workout sets indexes
CREATE INDEX IF NOT EXISTS idx_workout_sets_workout_id ON public.workout_sets(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_sets_order ON public.workout_sets(workout_id, order_index);
CREATE INDEX IF NOT EXISTS idx_workout_sets_exercise ON public.workout_sets(exercise_name);

-- Custom exercises indexes
CREATE INDEX IF NOT EXISTS idx_custom_exercises_user_id ON public.custom_exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_exercises_name ON public.custom_exercises(name);
CREATE INDEX IF NOT EXISTS idx_custom_exercises_category ON public.custom_exercises(category);

-- ============================================================================
-- 8. CREATE FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to handle new user signup (creates profile automatically)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to call the function on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 9. VERIFICATION QUERIES (Optional - can be removed in production)
-- ============================================================================

-- Verify table structures
SELECT 
    'profiles' as table_name,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
    'workouts' as table_name,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'workouts' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
    'workout_sets' as table_name,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'workout_sets' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
    'custom_exercises' as table_name,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'custom_exercises' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
SELECT 'Database setup completed successfully! All tables, policies, indexes, and triggers have been created.' as status;

