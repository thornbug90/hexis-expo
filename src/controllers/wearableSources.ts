import dayjs from "dayjs";
import { getRefreshOrAccessToken } from "../lib/helpers/auth";
import { getTpWorkoutsDay } from "../lib/helpers/workouts";
import { WearableSyncStatus } from "../schema/wearableSources";
import { importedWorkoutDataProcessor } from "../models/workout";
import { WorkoutTP } from "../lib/types/tp";
import { WearableSource } from "@prisma/client";

export const onDemandSync = async (providers: WearableSource[], userId: string) => {
  const result: WearableSyncStatus[] = [];
  for (const provider of providers) {
    try {
      let token: string = "";
      let rawWorkouts: WorkoutTP[] | unknown[] | undefined;
      switch (provider.name) {
        case "Apple Health":
          throw new Error("Apple Health is not yet implemented");
        case "Garmin":
          throw new Error("Garmin is not yet implemented");
        case "Health Connect":
          throw new Error("Health Connect is not yet implemented");
        case "TrainingPeaks":
          token = await getRefreshOrAccessToken(provider.code ?? "", "access", provider.name);
          rawWorkouts = await getTpWorkoutsDay(token, dayjs().format("YYYY-MM-DD"), userId);
          break;
        default:
          throw new Error("Unknown provider: " + provider.name);
      }

      let importedWorkoutLength = 0;
      if (rawWorkouts && rawWorkouts.length > 0) {
        const importedWorkouts = await importedWorkoutDataProcessor(rawWorkouts, userId, provider.name);
        importedWorkoutLength = importedWorkouts.length;
      }

      result.push({
        provider: provider.id,
        status: "SUCCESS",
        message: String(importedWorkoutLength),
      });
    } catch (error: unknown) {
      console.error(`could not process workouts from ${provider.name} for user ${userId}.`, String(error));
      result.push({
        provider: provider.id,
        status: "FAILURE",
        message: `${provider.name} is connected. To sync the latest workouts please open the Hexis mobile app.`,
      });
    }
  }

  return result;
};
