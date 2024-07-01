import { Workout, Workout_Source, Workout_Status } from "../generated/graphql";

export const isPlannedWorkout: Function = (workout: Workout): boolean => {
  // planned workout sources
  if (
    workout.source === Workout_Source.User ||
    workout.source === Workout_Source.Coach
  ) {
    return true;
  }
  if (
    workout.source === Workout_Source.TrainingPeaks &&
    workout.confirmed === false
  ) {
    return true;
  }
  return false;
};

export const isActualWorkout: Function = (workout: Workout): boolean =>
  !isPlannedWorkout(workout);

export const isCompletedWorkout: Function = (workout: Workout): boolean => {
  if (isActualWorkout(workout) && workout.status !== Workout_Status.Incomplete)
    return true;
  return false;
};

export const isIncompletedWorkout: Function = (workout: Workout): boolean =>
  workout.status === Workout_Status.Incomplete &&
  !(
    workout.source === Workout_Source.User ||
    workout.source === Workout_Source.Coach
  );

export const isWearableWorkout: Function = (workout: Workout): boolean => {
  const notWearableSources = [
    Workout_Source.User,
    Workout_Source.Coach,
    Workout_Source.TrainingPeaks,
  ];
  return (
    !workout?.source ||
    !notWearableSources.includes(workout.source) ||
    (workout.source === Workout_Source.TrainingPeaks &&
      workout.confirmed === true)
  );
};
