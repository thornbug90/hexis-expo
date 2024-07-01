import { Activity, ActivityMet, MealNutrition, Workout } from "@prisma/client";
import { addDays, differenceInMinutes, format, isSameDay, roundToNearestMinutes, subDays } from "date-fns";
import { Workouts, EngineWorkout } from "../../lib/types/engine";

const formatTimes = (time: Date) => format(roundToNearestMinutes(time, { nearestTo: 1 }), "HH:mm");

const formatWorkouts = (
  workouts: (Workout & {
    activity: Activity & { met: ActivityMet[] };
    intraFuellingMeal?: MealNutrition | null;
  })[],
  date: Date,
): Workouts => {
  const dayBefore = subDays(date, 1);
  const dayAfter = addDays(date, 1);

  const allWorkouts = [
    workouts.filter(w => (w.recurring ? w.recurringDay === dayBefore.getDay() : isSameDay(w.start, dayBefore))),
    workouts.filter(w => (w.recurring ? w.recurringDay === dayBefore.getDay() : isSameDay(w.start, date))),
    workouts.filter(w => (w.recurring ? w.recurringDay === dayAfter.getDay() : isSameDay(w.start, dayAfter))),
  ];

  const formattedWorkouts: Record<number, EngineWorkout[]> = {};

  allWorkouts.map((dayWorkouts, index) => {
    const daysFormattedWorkouts: EngineWorkout[] = [];
    if (dayWorkouts.length === 0) formattedWorkouts[index] = [];

    dayWorkouts.map(workout => {
      daysFormattedWorkouts.push({
        id: workout.id,
        timeStart: formatTimes(workout.start),
        intensityRPE: workout.intensityRPE,
        calories: workout?.calories || null,
        isComp: workout.competition,
        isKey: workout.key,
        duration: Math.abs(differenceInMinutes(workout.start, workout.end)),
        intraFuelling: workout.intraFuelling,
        activitySlug: workout.activity.slug,
        activityName: workout.activity.name,
        intraFuelling_meal_id: workout?.intraFuellingMeal?.id ?? null,
        category: workout.activity.category,
        powerAverage: workout.powerAverage,
      });
    });

    formattedWorkouts[index] = daysFormattedWorkouts;
  });

  return formattedWorkouts;
};

export default formatWorkouts;
