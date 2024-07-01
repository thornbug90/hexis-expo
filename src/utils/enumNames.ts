import {
  Meal_Name,
  Workout_Slot,
  Sex,
  Carb_Code,
  Lifestyle_Activity,
  Total_Activity_Duration,
  Goal,
  Workout_Intensity,
  Weight_Unit,
  Meal_Type,
} from "../generated/graphql";

const mealNames = {
  [Meal_Name.AmSnack]: "AM Snack",
  [Meal_Name.Breakfast]: "Breakfast",
  [Meal_Name.Lunch]: "Lunch",
  [Meal_Name.PmSnack]: "PM Snack",
  [Meal_Name.Dinner]: "Dinner",
  [Meal_Name.PreBedSnack]: "Pre-Bed Snack",
  [Meal_Name.IntraFuelling]: "INTRA WORKOUT FUEL",
};

const workoutSlots = {
  [Workout_Slot.BeforeAmSnack]: "Before AM Snack",
  [Workout_Slot.BeforeBreakfast]: "Before Breakfast",
  [Workout_Slot.BeforeLunch]: "Before Lunch",
  [Workout_Slot.BeforePmSnack]: "Before PM Snack",
  [Workout_Slot.BeforeDinner]: "Before Dinner",
  [Workout_Slot.BeforePreBedSnack]: "Before Pre-Bed Snack",
};

const lifestyleActivities = {
  [Lifestyle_Activity.Sedentary]: "Sedentary",
  [Lifestyle_Activity.LightlyActive]: "Lightly Active",
  [Lifestyle_Activity.Active]: "Active",
  [Lifestyle_Activity.ProAthlete]: "Pro Athlete",
};

const carbCodes = {
  [Carb_Code.Low]: "Low",
  [Carb_Code.Medium]: "Medium",
  [Carb_Code.High]: "High",
};

const goals = {
  [Goal.Lose]: "Lose",
  [Goal.Maintain]: "Maintain",
  [Goal.Gain]: "Gain",
};

const activityDurations = {
  [Total_Activity_Duration.ZeroToThreeHours]: "0-3 Hours",
  [Total_Activity_Duration.ThreeToSixHours]: "3-6 Hours",
  [Total_Activity_Duration.SixToNineHours]: "6-9 Hours",
  [Total_Activity_Duration.NineToTwelveHours]: "9-12 Hours",
  [Total_Activity_Duration.TwelvePlusHours]: "12+ Hours",
};

const workoutIntensity = {
  [Workout_Intensity.Light]: "Light",
  [Workout_Intensity.Moderate]: "Moderate",
  [Workout_Intensity.Hard]: "Hard",
};

export const convertMealName = (mealName: Meal_Name) => mealNames[mealName];
export const convertMealNamebyCarbCode = (carbCode: Carb_Code) => {
  switch (carbCode) {
    case Carb_Code.Low:
      return "Low Meal";
    case Carb_Code.Medium:
      return "Medium Meal";
    case Carb_Code.High:
      return "High Meal";
  }
};
export const convertCarbCode = (carbCode: Carb_Code) =>
  carbCodes[carbCode as keyof typeof carbCodes];
export const convertLifestyleActivities = (activity: Lifestyle_Activity) =>
  lifestyleActivities[activity];
export const convertSex = (sex: Sex) => (sex === Sex.Male ? "Male" : "Female");
export const convertTotalActivityDuration = (
  duration: Total_Activity_Duration
) => activityDurations[duration];
export const convertMealType = (mealType: Meal_Type) =>
  mealType === Meal_Type.Main ? "Main" : "Snack";
export const convertGoal = (goal: Goal) => goals[goal];
export const convertWorkoutIntensity = (intensity: Workout_Intensity) =>
  workoutIntensity[intensity as keyof typeof workoutIntensity];
export const convertWeightUnit = (unit: Weight_Unit) =>
  unit === Weight_Unit.Kg ? "kg" : "lbs";
