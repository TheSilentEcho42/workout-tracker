export interface ExerciseOption {
  id: string
  name: string
  category: 'strength' | 'cardio' | 'flexibility' | 'bodyweight'
  equipment: string[]
  muscle_groups: string[]
  instructions?: string
  isTimeBased?: boolean // For exercises like planks, wall sits, etc.
  weightConversion?: {
    from: string // e.g., 'barbell', 'ez_bar'
    to: string // e.g., 'dumbbell'
    ratio: number // e.g., 0.5 for barbell to dumbbell (50 lbs barbell = 25 lbs each dumbbell)
    note: string // Explains this is a rule of thumb, not scientific
  }
}

// Common exercise database with comprehensive variations
export const EXERCISE_DATABASE: ExerciseOption[] = [
  // CHEST EXERCISES
  { 
    id: 'bench_press_barbell', 
    name: 'Barbell Bench Press', 
    category: 'strength', 
    equipment: ['barbell', 'bench'], 
    muscle_groups: ['chest', 'triceps', 'shoulders'],
    weightConversion: { 
      from: 'barbell', 
      to: 'dumbbell', 
      ratio: 0.4,
      note: 'Rule of thumb: Dumbbells require more stabilizer muscles, so you typically use lighter weight per arm'
    }
  },
  { 
    id: 'bench_press_dumbbell', 
    name: 'Dumbbell Bench Press', 
    category: 'strength', 
    equipment: ['dumbbell', 'bench'], 
    muscle_groups: ['chest', 'triceps', 'shoulders']
  },
  { 
    id: 'incline_bench_press_barbell', 
    name: 'Incline Barbell Bench Press', 
    category: 'strength', 
    equipment: ['barbell', 'bench'], 
    muscle_groups: ['chest', 'triceps', 'shoulders'],
    weightConversion: { 
      from: 'barbell', 
      to: 'dumbbell', 
      ratio: 0.4,
      note: 'Rule of thumb: Dumbbells require more stabilizer muscles, so you typically use lighter weight per arm'
    }
  },
  { 
    id: 'incline_bench_press_dumbbell', 
    name: 'Incline Dumbbell Bench Press', 
    category: 'strength', 
    equipment: ['dumbbell', 'bench'], 
    muscle_groups: ['chest', 'triceps', 'shoulders']
  },
  { 
    id: 'decline_bench_press_barbell', 
    name: 'Decline Barbell Bench Press', 
    category: 'strength', 
    equipment: ['barbell', 'bench'], 
    muscle_groups: ['chest', 'triceps'],
    weightConversion: { 
      from: 'barbell', 
      to: 'dumbbell', 
      ratio: 0.4,
      note: 'Rule of thumb: Dumbbells require more stabilizer muscles, so you typically use lighter weight per arm'
    }
  },
  { 
    id: 'decline_bench_press_dumbbell', 
    name: 'Decline Dumbbell Bench Press', 
    category: 'strength', 
    equipment: ['dumbbell', 'bench'], 
    muscle_groups: ['chest', 'triceps']
  },
  { 
    id: 'chest_flyes_dumbbell', 
    name: 'Dumbbell Chest Flyes', 
    category: 'strength', 
    equipment: ['dumbbell', 'bench'], 
    muscle_groups: ['chest']
  },
  { 
    id: 'chest_flyes_cable', 
    name: 'Cable Chest Flyes', 
    category: 'strength', 
    equipment: ['cable_machine'], 
    muscle_groups: ['chest']
  },
  { 
    id: 'push_ups', 
    name: 'Push-ups', 
    category: 'bodyweight', 
    equipment: [], 
    muscle_groups: ['chest', 'triceps', 'shoulders']
  },
  { 
    id: 'diamond_push_ups', 
    name: 'Diamond Push-ups', 
    category: 'bodyweight', 
    equipment: [], 
    muscle_groups: ['chest', 'triceps']
  },
  { 
    id: 'wide_push_ups', 
    name: 'Wide Push-ups', 
    category: 'bodyweight', 
    equipment: [], 
    muscle_groups: ['chest', 'shoulders']
  },

  // SHOULDER EXERCISES
  { 
    id: 'overhead_press_barbell', 
    name: 'Barbell Overhead Press', 
    category: 'strength', 
    equipment: ['barbell'], 
    muscle_groups: ['shoulders', 'triceps'],
    weightConversion: { from: 'barbell', to: 'dumbbell', ratio: 0.4, note: 'Rule of thumb: use 40% of barbell weight for dumbbells' }
  },
  { 
    id: 'overhead_press_dumbbell', 
    name: 'Dumbbell Overhead Press', 
    category: 'strength', 
    equipment: ['dumbbell'], 
    muscle_groups: ['shoulders', 'triceps']
  },
  { 
    id: 'arnold_press', 
    name: 'Arnold Press', 
    category: 'strength', 
    equipment: ['dumbbell'], 
    muscle_groups: ['shoulders', 'triceps']
  },
  { 
    id: 'lateral_raises_dumbbell', 
    name: 'Dumbbell Lateral Raises', 
    category: 'strength', 
    equipment: ['dumbbell'], 
    muscle_groups: ['shoulders']
  },
  { 
    id: 'lateral_raises_cable', 
    name: 'Cable Lateral Raises', 
    category: 'strength', 
    equipment: ['cable_machine'], 
    muscle_groups: ['shoulders']
  },
  { 
    id: 'front_raises_dumbbell', 
    name: 'Dumbbell Front Raises', 
    category: 'strength', 
    equipment: ['dumbbell'], 
    muscle_groups: ['shoulders']
  },
  { 
    id: 'front_raises_plate', 
    name: 'Plate Front Raises', 
    category: 'strength', 
    equipment: ['weight_plate'], 
    muscle_groups: ['shoulders']
  },
  { 
    id: 'rear_delt_flyes_dumbbell', 
    name: 'Dumbbell Rear Delt Flyes', 
    category: 'strength', 
    equipment: ['dumbbell'], 
    muscle_groups: ['shoulders']
  },
  { 
    id: 'rear_delt_flyes_cable', 
    name: 'Cable Rear Delt Flyes', 
    category: 'strength', 
    equipment: ['cable_machine'], 
    muscle_groups: ['shoulders']
  },
  { 
    id: 'face_pulls', 
    name: 'Face Pulls', 
    category: 'strength', 
    equipment: ['cable_machine'], 
    muscle_groups: ['shoulders', 'rhomboids']
  },

  // BACK EXERCISES
  { 
    id: 'pull_ups', 
    name: 'Pull-ups', 
    category: 'bodyweight', 
    equipment: ['pull_up_bar'], 
    muscle_groups: ['lats', 'biceps', 'rhomboids']
  },
  { 
    id: 'chin_ups', 
    name: 'Chin-ups', 
    category: 'bodyweight', 
    equipment: ['pull_up_bar'], 
    muscle_groups: ['lats', 'biceps', 'rhomboids']
  },
  { 
    id: 'lat_pulldowns', 
    name: 'Lat Pulldowns', 
    category: 'strength', 
    equipment: ['cable_machine'], 
    muscle_groups: ['lats', 'biceps']
  },
  { 
    id: 'barbell_rows', 
    name: 'Barbell Rows', 
    category: 'strength', 
    equipment: ['barbell'], 
    muscle_groups: ['lats', 'biceps', 'rhomboids'],
    weightConversion: { from: 'barbell', to: 'dumbbell', ratio: 0.4, note: 'Rule of thumb: use 40% of barbell weight for dumbbells' }
  },
  { 
    id: 'dumbbell_rows', 
    name: 'Dumbbell Rows', 
    category: 'strength', 
    equipment: ['dumbbell'], 
    muscle_groups: ['lats', 'biceps', 'rhomboids']
  },
  { 
    id: 't_bar_rows', 
    name: 'T-Bar Rows', 
    category: 'strength', 
    equipment: ['t_bar_machine'], 
    muscle_groups: ['lats', 'biceps', 'rhomboids']
  },
  { 
    id: 'cable_rows', 
    name: 'Cable Rows', 
    category: 'strength', 
    equipment: ['cable_machine'], 
    muscle_groups: ['lats', 'biceps', 'rhomboids']
  },
  { 
    id: 'deadlift_barbell', 
    name: 'Barbell Deadlift', 
    category: 'strength', 
    equipment: ['barbell'], 
    muscle_groups: ['hamstrings', 'glutes', 'lats', 'traps'],
    weightConversion: { from: 'barbell', to: 'dumbbell', ratio: 0.4, note: 'Rule of thumb: use 40% of barbell weight for dumbbells' }
  },
  { 
    id: 'deadlift_dumbbell', 
    name: 'Dumbbell Deadlift', 
    category: 'strength', 
    equipment: ['dumbbell'], 
    muscle_groups: ['hamstrings', 'glutes', 'lats', 'traps']
  },
  { 
    id: 'romanian_deadlift_barbell', 
    name: 'Romanian Barbell Deadlift', 
    category: 'strength', 
    equipment: ['barbell'], 
    muscle_groups: ['hamstrings', 'glutes'],
    weightConversion: { from: 'barbell', to: 'dumbbell', ratio: 0.4, note: 'Rule of thumb: use 40% of barbell weight for dumbbells' }
  },
  { 
    id: 'romanian_deadlift_dumbbell', 
    name: 'Romanian Dumbbell Deadlift', 
    category: 'strength', 
    equipment: ['dumbbell'], 
    muscle_groups: ['hamstrings', 'glutes']
  },

  // BICEPS EXERCISES
  { 
    id: 'bicep_curls_barbell', 
    name: 'Barbell Bicep Curls', 
    category: 'strength', 
    equipment: ['barbell'], 
    muscle_groups: ['biceps', 'forearms'],
    weightConversion: { from: 'barbell', to: 'dumbbell', ratio: 0.5, note: 'Rule of thumb: use 50% of barbell weight for dumbbells' }
  },
  { 
    id: 'bicep_curls_dumbbell', 
    name: 'Dumbbell Bicep Curls', 
    category: 'strength', 
    equipment: ['dumbbell'], 
    muscle_groups: ['biceps', 'forearms']
  },
  { 
    id: 'bicep_curls_ez_bar', 
    name: 'EZ Bar Bicep Curls', 
    category: 'strength', 
    equipment: ['ez_bar'], 
    muscle_groups: ['biceps', 'forearms'],
    weightConversion: { 
      from: 'ez_bar', 
      to: 'dumbbell', 
      ratio: 0.5,
      note: 'Rule of thumb: EZ bar weight distributed between arms, but dumbbells require more stabilizer engagement'
    }
  },
  { 
    id: 'hammer_curls', 
    name: 'Hammer Curls', 
    category: 'strength', 
    equipment: ['dumbbell'], 
    muscle_groups: ['biceps', 'forearms']
  },
  { 
    id: 'preacher_curls_barbell', 
    name: 'Barbell Preacher Curls', 
    category: 'strength', 
    equipment: ['barbell', 'preacher_bench'], 
    muscle_groups: ['biceps'],
    weightConversion: { 
      from: 'barbell', 
      to: 'dumbbell', 
      ratio: 0.5,
      note: 'Rule of thumb: Dumbbells require more stabilizer muscles, so you typically use lighter weight per arm'
    }
  },
  { 
    id: 'preacher_curls_dumbbell', 
    name: 'Dumbbell Preacher Curls', 
    category: 'strength', 
    equipment: ['dumbbell', 'preacher_bench'], 
    muscle_groups: ['biceps']
  },
  { 
    id: 'concentration_curls', 
    name: 'Concentration Curls', 
    category: 'strength', 
    equipment: ['dumbbell'], 
    muscle_groups: ['biceps']
  },
  { 
    id: 'cable_curls', 
    name: 'Cable Bicep Curls', 
    category: 'strength', 
    equipment: ['cable_machine'], 
    muscle_groups: ['biceps']
  },

  // TRICEPS EXERCISES
  { 
    id: 'tricep_dips', 
    name: 'Tricep Dips', 
    category: 'strength', 
    equipment: ['dip_bars'], 
    muscle_groups: ['triceps']
  },
  { 
    id: 'skull_crushers_barbell', 
    name: 'Barbell Skull Crushers', 
    category: 'strength', 
    equipment: ['barbell', 'bench'], 
    muscle_groups: ['triceps'],
    weightConversion: { 
      from: 'barbell', 
      to: 'dumbbell', 
      ratio: 0.5,
      note: 'Rule of thumb: Dumbbells require more stabilizer muscles, so you typically use lighter weight per arm'
    }
  },
  { 
    id: 'skull_crushers_dumbbell', 
    name: 'Dumbbell Skull Crushers', 
    category: 'strength', 
    equipment: ['dumbbell', 'bench'], 
    muscle_groups: ['triceps']
  },
  { 
    id: 'tricep_pushdowns', 
    name: 'Tricep Pushdowns', 
    category: 'strength', 
    equipment: ['cable_machine'], 
    muscle_groups: ['triceps']
  },
  { 
    id: 'overhead_tricep_extensions_dumbbell', 
    name: 'Dumbbell Overhead Tricep Extensions', 
    category: 'strength', 
    equipment: ['dumbbell'], 
    muscle_groups: ['triceps']
  },
  { 
    id: 'overhead_tricep_extensions_cable', 
    name: 'Cable Overhead Tricep Extensions', 
    category: 'strength', 
    equipment: ['cable_machine'], 
    muscle_groups: ['triceps']
  },

  // LEG EXERCISES
  { 
    id: 'squats_barbell', 
    name: 'Barbell Squats', 
    category: 'strength', 
    equipment: ['barbell'], 
    muscle_groups: ['quads', 'glutes', 'hamstrings'],
    weightConversion: { from: 'barbell', to: 'dumbbell', ratio: 0.4, note: 'Rule of thumb: use 40% of barbell weight for dumbbells' }
  },
  { 
    id: 'squats_dumbbell', 
    name: 'Dumbbell Squats', 
    category: 'strength', 
    equipment: ['dumbbell'], 
    muscle_groups: ['quads', 'glutes', 'hamstrings']
  },
  { 
    id: 'front_squats_barbell', 
    name: 'Barbell Front Squats', 
    category: 'strength', 
    equipment: ['barbell'], 
    muscle_groups: ['quads', 'glutes'],
    weightConversion: { from: 'barbell', to: 'dumbbell', ratio: 0.4, note: 'Rule of thumb: use 40% of barbell weight for dumbbells' }
  },
  { 
    id: 'front_squats_dumbbell', 
    name: 'Dumbbell Front Squats', 
    category: 'strength', 
    equipment: ['dumbbell'], 
    muscle_groups: ['quads', 'glutes']
  },
  { 
    id: 'leg_press', 
    name: 'Leg Press', 
    category: 'strength', 
    equipment: ['leg_press_machine'], 
    muscle_groups: ['quads', 'glutes']
  },
  { 
    id: 'leg_extensions', 
    name: 'Leg Extensions', 
    category: 'strength', 
    equipment: ['leg_extension_machine'], 
    muscle_groups: ['quads']
  },
  { 
    id: 'leg_curls_lying', 
    name: 'Lying Leg Curls', 
    category: 'strength', 
    equipment: ['leg_curl_machine'], 
    muscle_groups: ['hamstrings']
  },
  { 
    id: 'leg_curls_seated', 
    name: 'Seated Leg Curls', 
    category: 'strength', 
    equipment: ['leg_curl_machine'], 
    muscle_groups: ['hamstrings']
  },
  { 
    id: 'lunges_dumbbell', 
    name: 'Dumbbell Lunges', 
    category: 'strength', 
    equipment: ['dumbbell'], 
    muscle_groups: ['quads', 'glutes', 'hamstrings']
  },
  { 
    id: 'lunges_bodyweight', 
    name: 'Bodyweight Lunges', 
    category: 'bodyweight', 
    equipment: [], 
    muscle_groups: ['quads', 'glutes', 'hamstrings']
  },
  { 
    id: 'step_ups', 
    name: 'Step-ups', 
    category: 'strength', 
    equipment: ['dumbbell', 'bench'], 
    muscle_groups: ['quads', 'glutes']
  },
  { 
    id: 'calf_raises_standing', 
    name: 'Standing Calf Raises', 
    category: 'strength', 
    equipment: ['dumbbell'], 
    muscle_groups: ['calves']
  },
  { 
    id: 'calf_raises_seated', 
    name: 'Seated Calf Raises', 
    category: 'strength', 
    equipment: ['calf_raise_machine'], 
    muscle_groups: ['calves']
  },
  { 
    id: 'good_mornings', 
    name: 'Good Mornings', 
    category: 'strength', 
    equipment: ['barbell'], 
    muscle_groups: ['hamstrings', 'glutes'],
    weightConversion: { from: 'barbell', to: 'dumbbell', ratio: 0.4, note: 'Rule of thumb: use 40% of barbell weight for dumbbells' }
  },

  // CORE EXERCISES
  { 
    id: 'planks', 
    name: 'Planks', 
    category: 'bodyweight', 
    equipment: [], 
    muscle_groups: ['abs', 'obliques'],
    isTimeBased: true
  },
  { 
    id: 'side_planks', 
    name: 'Side Planks', 
    category: 'bodyweight', 
    equipment: [], 
    muscle_groups: ['abs', 'obliques'],
    isTimeBased: true
  },
  { 
    id: 'wall_sits', 
    name: 'Wall Sits', 
    category: 'bodyweight', 
    equipment: [], 
    muscle_groups: ['quads', 'glutes'],
    isTimeBased: true
  },
  { 
    id: 'crunches', 
    name: 'Crunches', 
    category: 'bodyweight', 
    equipment: [], 
    muscle_groups: ['abs']
  },
  { 
    id: 'sit_ups', 
    name: 'Sit-ups', 
    category: 'bodyweight', 
    equipment: [], 
    muscle_groups: ['abs']
  },
  { 
    id: 'leg_raises', 
    name: 'Leg Raises', 
    category: 'bodyweight', 
    equipment: [], 
    muscle_groups: ['abs']
  },
  { 
    id: 'russian_twists', 
    name: 'Russian Twists', 
    category: 'bodyweight', 
    equipment: [], 
    muscle_groups: ['abs', 'obliques']
  },
  { 
    id: 'mountain_climbers', 
    name: 'Mountain Climbers', 
    category: 'bodyweight', 
    equipment: [], 
    muscle_groups: ['abs', 'obliques', 'shoulders'],
    isTimeBased: true
  },
  { 
    id: 'burpees', 
    name: 'Burpees', 
    category: 'bodyweight', 
    equipment: [], 
    muscle_groups: ['full_body', 'cardiovascular']
  },
  { 
    id: 'ab_wheel_rollouts', 
    name: 'Ab Wheel Rollouts', 
    category: 'bodyweight', 
    equipment: ['ab_wheel'], 
    muscle_groups: ['abs', 'obliques']
  },

  // CARDIO EXERCISES
  { 
    id: 'running', 
    name: 'Running', 
    category: 'cardio', 
    equipment: ['treadmill'], 
    muscle_groups: ['quads', 'hamstrings', 'calves', 'cardiovascular'],
    isTimeBased: true
  },
  { 
    id: 'cycling', 
    name: 'Cycling', 
    category: 'cardio', 
    equipment: ['bike', 'stationary_bike'], 
    muscle_groups: ['quads', 'hamstrings', 'calves', 'cardiovascular'],
    isTimeBased: true
  },
  { 
    id: 'rowing', 
    name: 'Rowing', 
    category: 'cardio', 
    equipment: ['rowing_machine'], 
    muscle_groups: ['lats', 'biceps', 'quads', 'hamstrings', 'cardiovascular'],
    isTimeBased: true
  },
  { 
    id: 'jump_rope', 
    name: 'Jump Rope', 
    category: 'cardio', 
    equipment: ['jump_rope'], 
    muscle_groups: ['calves', 'quads', 'cardiovascular'],
    isTimeBased: true
  },
  { 
    id: 'elliptical', 
    name: 'Elliptical', 
    category: 'cardio', 
    equipment: ['elliptical_machine'], 
    muscle_groups: ['quads', 'hamstrings', 'calves', 'cardiovascular'],
    isTimeBased: true
  },
  { 
    id: 'stair_master', 
    name: 'Stair Master', 
    category: 'cardio', 
    equipment: ['stair_master'], 
    muscle_groups: ['quads', 'glutes', 'calves', 'cardiovascular'],
    isTimeBased: true
  },

  // FLEXIBILITY EXERCISES
  { 
    id: 'stretching', 
    name: 'Stretching', 
    category: 'flexibility', 
    equipment: [], 
    muscle_groups: ['full_body'],
    isTimeBased: true
  },
  { 
    id: 'yoga', 
    name: 'Yoga', 
    category: 'flexibility', 
    equipment: ['yoga_mat'], 
    muscle_groups: ['full_body'],
    isTimeBased: true
  },
  { 
    id: 'foam_rolling', 
    name: 'Foam Rolling', 
    category: 'flexibility', 
    equipment: ['foam_roller'], 
    muscle_groups: ['full_body'],
    isTimeBased: true
  },

  // COMPOUND MOVEMENTS
  { 
    id: 'clean_and_press_barbell', 
    name: 'Barbell Clean and Press', 
    category: 'strength', 
    equipment: ['barbell'], 
    muscle_groups: ['quads', 'glutes', 'shoulders', 'traps'],
    weightConversion: { from: 'barbell', to: 'dumbbell', ratio: 0.4, note: 'Rule of thumb: use 40% of barbell weight for dumbbells' }
  },
  { 
    id: 'clean_and_press_dumbbell', 
    name: 'Dumbbell Clean and Press', 
    category: 'strength', 
    equipment: ['dumbbell'], 
    muscle_groups: ['quads', 'glutes', 'shoulders', 'traps']
  },
  { 
    id: 'thrusters', 
    name: 'Thrusters', 
    category: 'strength', 
    equipment: ['dumbbell'], 
    muscle_groups: ['quads', 'glutes', 'shoulders']
  },
  { 
    id: 'snatch_barbell', 
    name: 'Barbell Snatch', 
    category: 'strength', 
    equipment: ['barbell'], 
    muscle_groups: ['quads', 'glutes', 'shoulders', 'traps'],
    weightConversion: { from: 'barbell', to: 'dumbbell', ratio: 0.4, note: 'Rule of thumb: use 40% of barbell weight for dumbbells' }
  },
  { 
    id: 'snatch_dumbbell', 
    name: 'Dumbbell Snatch', 
    category: 'strength', 
    equipment: ['dumbbell'], 
    muscle_groups: ['quads', 'glutes', 'shoulders', 'traps']
  }
];

export const searchExercises = (query: string): ExerciseOption[] => {
  if (!query.trim()) return [];
  
  const searchTerm = query.toLowerCase();
  return EXERCISE_DATABASE.filter(exercise => 
    exercise.name.toLowerCase().includes(searchTerm) ||
    exercise.category.toLowerCase().includes(searchTerm) ||
    exercise.muscle_groups.some(muscle => muscle.toLowerCase().includes(searchTerm)) ||
    exercise.equipment.some(eq => eq.toLowerCase().includes(searchTerm))
  ).slice(0, 15); // Increased limit to 15 results
};

export const getExerciseById = (id: string): ExerciseOption | undefined => {
  return EXERCISE_DATABASE.find(exercise => exercise.id === id);
};

// Helper function to convert weights between equipment types
export const convertWeight = (weight: number, fromEquipment: string, toEquipment: string): number => {
  const exercise = EXERCISE_DATABASE.find(ex => 
    ex.weightConversion?.from === fromEquipment && ex.weightConversion?.to === toEquipment
  );
  
  if (exercise?.weightConversion) {
    return weight * exercise.weightConversion.ratio;
  }
  
  return weight; // No conversion found, return original weight
};






