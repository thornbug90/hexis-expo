import {
  ACTIVITY_LEVEL_TYPE,
  CARB_CODE,
  GOAL,
  LIFESTYLE_ACTIVITY,
  MEAL_SUB_TYPE,
  MEAL_TYPE,
  MealVerification,
  SEX,
  TOTAL_ACTIVITY_DURATION,
} from "@prisma/client";

export type EngineWorkout = {
  id: string;
  calories: number | null;
  intensityRPE: number;
  duration: number;
  timeStart: string;
  isKey: boolean;
  isComp: boolean;
  activitySlug: string;
  activityName: string;
  intraFuelling: boolean;
  intraFuelling_meal_id?: string | null;
  intraVerification?: MealVerification | null;
  powerAverage?: number;
  category: string;
};

export type Workouts = {
  "0"?: EngineWorkout[];
  "1"?: EngineWorkout[];
  "2"?: EngineWorkout[];
};

export type MealPattern = {
  meal_id: string;
  type: MEAL_TYPE;
  sub_type: MEAL_SUB_TYPE;
  timing: string;
  is_verified: boolean;
  macros?: Nutrient[];
  log?: {
    skippedMeal: boolean;
    calories: number | undefined;
    mealTime: string | undefined;
  };
};

export type MealPatterns = {
  "0": MealPattern[];
  "1": MealPattern[];
  "2": MealPattern[];
};

export type IntraFuellingRecommendation = {
  workout_id: string;
  display_unit: string;
  title: string;
  message: string;
  details: string;
  kcal: number;
  fat: number;
  carbs: number;
  protein: number;
};

export type CarbRange = {
  low_min: number;
  low_max: number;
  med_min: number;
  med_max: number;
  high_min: number;
  high_max: number;
};

export type CarbRangesInput = {
  activity_level_type: ACTIVITY_LEVEL_TYPE;
  weight: number;
  total_activity_duration: TOTAL_ACTIVITY_DURATION;
};

export type CarbRangesOutput = {
  main_ranges: CarbRange;
  snack_ranges: CarbRange;
};

export type DayMacrosInput = {
  macros: string[];
  macros_values: number[];
};

export type Nutrient = {
  name: string;
  value: number;
};

export type DayMacrosOutput = {
  macros: Nutrient[];
  carbs_g_per_kg: number;
};

export type MealsOutput = {
  meal_id: string;
  macros: Nutrient[];
  carb_code: CARB_CODE;
};

export enum DAY_TIME {
  TODAY = "TODAY",
  PAST = "PAST",
  FUTURE = "FUTURE",
}

export type DayInput = {
  is_verified: boolean;
  goal: GOAL;
  gender: SEX;
  total_activity_duration: TOTAL_ACTIVITY_DURATION;
  age: number;
  weight_yesterday: number;
  weight_today: number;
  height: number;
  lifestyle_activity: LIFESTYLE_ACTIVITY;
  carbs_g_per_kg_yesterday: number | null;
  isPastOrFuture: DAY_TIME;
  meal_patterns: MealPatterns;
  workouts: Workouts;
  wake: string;
  sleep: string;
  macros?: DayMacrosInput;
  category: string;
};

export type DayOutput = {
  ranges: CarbRangesOutput;
  macros: DayMacrosOutput;
  meals: MealsOutput[];
  fuel_coach: string[];
  intraworkout_fuelling: IntraFuellingRecommendation[];
};

export type LiveGraphOutput = { graph: { [key: string]: number }; predicted_end: number };

export type AthleteInput = {
  gender?: SEX;
  total_activity_duration?: TOTAL_ACTIVITY_DURATION;
  age?: number;
  weight_today?: number;
  height?: number;
  category?: string;
};

export type AthleteOutput = {
  ranges: CarbRangesOutput;
  RMR: number;
  protein_constant: number;
};
