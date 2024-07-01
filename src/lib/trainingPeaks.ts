import { WEARABLE_STATUS } from "@prisma/client";
import dayjs from "dayjs";
import prisma from "./prisma";
import { getRefreshOrAccessToken } from "./helpers/auth";
import { getTpWorkoutsDay } from "./helpers/workouts";
import { createWorkoutTP } from "../models/workout";
import { get, set } from "node-global-storage";
import { WorkoutTP } from "./types/tp";

export const trainingPeaksCronjob = async () => {
  console.log("TrainingPeaks Cronjob Started");
  // get all connected wearables
  const TPWearables = await prisma.wearableSource.findMany({
    where: {
      name: "TrainingPeaks",
      status: WEARABLE_STATUS.CONNECTED,
      NOT: { code: null },
    },
  });

  if (TPWearables.length < 1) return;

  Promise.all(
    TPWearables.map(async tpUser => {
      if (!tpUser.code) return;
      const accessToken = await getRefreshOrAccessToken(tpUser.code, "access", "TRAINING_PEAKS");
      const workouts = await getTpWorkoutsDay(accessToken, dayjs().format("YYYY-MM-DD"), tpUser.id);
      if (!workouts) return;
      createWorkouts(workouts, tpUser.id);
    }),
  );
};

export const createWorkouts = (workouts: WorkoutTP[], userId: string) => {
  if (workouts.length > 0) {
    const workoutsToCreate = uniqueWorkouts(workouts);

    if (workoutsToCreate && workoutsToCreate.length > 0) {
      createWorkoutTP(workoutsToCreate, userId);
      const processedWorkoutIds = workoutsToCreate.map(processedWorkout => processedWorkout.Id);
      const list = get("processingTPWorkouts") as WorkoutTP[];

      // Remove the created workouts from the "processingTPWorkouts"
      set(
        "processingTPWorkouts",
        list.filter(workout => !processedWorkoutIds.includes(workout.Id)),
      );
    }
  }
};

// Now that we have a list of workouts from the api (tpRawWorkouts), let's remove workouts which are already
// being processed. If they're already processing, we skip, if not, we add them to the "processingTPWorkouts"
// global storage. We then return the unique workouts, which aren't processed to be created.
const uniqueWorkouts = (receivedWorkouts: WorkoutTP[]) => {
  const processingWorkouts: WorkoutTP[] = (get("processingTPWorkouts") as WorkoutTP[]) ?? [];
  const uniques: WorkoutTP[] = [];
  receivedWorkouts.forEach(workout => {
    if (!processingWorkouts.some(existingWorkout => existingWorkout.Id === workout.Id)) {
      uniques.push(workout);
      processingWorkouts.push(workout);
    }
  });
  // Update the global storage variable with the new array
  set("processingTPWorkouts", processingWorkouts);
  return uniques;
};
