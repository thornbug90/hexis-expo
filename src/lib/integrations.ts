import dayjs from "dayjs";
import { Platform } from "react-native";

import {
  Wearable_Status,
  Workout_Source,
  WearableSource,
  useUpdateWearableStatusMutation,
  CreateWorkoutWearableDocument,
  CreateWorkoutWearableMutation,
} from "../generated/graphql";

import {
  initialize,
  requestPermission,
  getGrantedPermissions,
  readRecords,
  ExerciseType,
} from "react-native-health-connect";

import HealthKit, {
  HKWorkoutTypeIdentifier,
  HKQuantityTypeIdentifier,
  HKWorkoutActivityType,
} from "@kingstinct/react-native-healthkit";

const TrainingPeakIcon = require("../../assets/images/integration/TrainingPeakIcon.jpg");
const HealthConnectIcon = require("../../assets/images/integration/HealthConnectIcon.png");
const AppleHealthIcon = require("../../assets/images/integration/AppleHealthIcon.png");
const FitbitIcon = require("../../assets/images/integration/FitbitIcon.png");
const GarminIcon = require("../../assets/images/integration/GarminIcon.png");
const OuraIcon = require("../../assets/images/integration/OuraIcon.jpg");
const PolarIcon = require("../../assets/images/integration/PolarIcon.png");
const WhoopIcon = require("../../assets/images/integration/WhoopIcon.png");
const WithingsIcon = require("../../assets/images/integration/WithingsIcon.png");
import { isNil } from "rambda";
import client from "./graphql";

export type IIntergrationIcon = {
  name: string;
  source: Workout_Source;
  icon: any;
};
export enum Wearable_Source {
  HealthConnect = "Health Connect",
  AppleHealth = "Apple Health",
  TrainingPeaks = "TrainingPeaks",
  Fitbit = "Fitbit",
  Garmin = "Garmin",
  Oura = "Oura",
  Polar = "Polar",
  Whoop = "Whoop",
  Withings = "Withings",
}
const integrationIcons = [
  {
    name: "TrainingPeaks",
    source: Workout_Source.TrainingPeaks,
    icon: TrainingPeakIcon,
  },
  {
    name: "Health Connect",
    source: Workout_Source.HealthConnect,
    icon: HealthConnectIcon,
  },
  {
    name: "Apple Health",
    source: Workout_Source.AppleHealth,
    icon: AppleHealthIcon,
  },
  // { name: "Fitbit", source: Workout_Source.Fitbit, icon: FitbitIcon },
  { name: "Garmin", source: Workout_Source.Garmin, icon: GarminIcon },
  // { name: "Oura", source: Workout_Source.Oura, icon: OuraIcon },
  // { name: "Polar", source: Workout_Source.Polar, icon: PolarIcon },
  // { name: "Whoop", source: Workout_Source.Whoop, icon: WhoopIcon },
  // { name: "Withings", source: Workout_Source.Withings, icon: WithingsIcon },
];

const requiredAppleHealthPermission = [
  HKWorkoutTypeIdentifier,
  HKQuantityTypeIdentifier.activeEnergyBurned,
  HKQuantityTypeIdentifier.basalEnergyBurned,
];

export const appleHealthPermission = async () => {
  if (Platform.OS !== "ios") return;

  const isAvailable = await HealthKit.isHealthDataAvailable();
  if (!isAvailable) return;

  // request read permission for workout calories
  const permissionGiven = await HealthKit.requestAuthorization(
    requiredAppleHealthPermission
  );

  // call data push here
  return permissionGiven;
};

export const checkAppleHealthConnection = async (wearableId?: string) => {
  let permissionGranted = true;
  try {
    permissionGranted = !!(await appleHealthPermission());

    if (permissionGranted) {
      await Promise.all(
        requiredAppleHealthPermission.map(async (permission) => {
          const isGranted = await HealthKit.authorizationStatusFor(permission);
          if (isGranted < 1) {
            // 0 not Determined
            permissionGranted = false;
          }
        })
      );
    }
  } catch {
    permissionGranted = false;
  }

  if (!permissionGranted && wearableId) {
    //disconnect Apple Health
    const { mutate: updateWearableStatus } =
      useUpdateWearableStatusMutation(client);
    if (wearableId)
      updateWearableStatus({
        input: {
          id: wearableId,
          status: Wearable_Status.Disconnected,
        },
      });
    return;
  }

  return permissionGranted;
};

export const pushWorkoutsAppleHealth = async ({
  from,
  to = new Date(),
  updateHook,
  wearableId,
}: {
  from: Date;
  to?: Date;
  updateHook?: Function;
  wearableId?: string;
}) => {
  if (Platform.OS !== "ios") return [];

  const options = { from, to };
  const workouts = await HealthKit.queryWorkouts(options);
  const workoutsToPush: any[] = [];

  await Promise.all(
    workouts.map(async (workout) => {
      const uuid = workout.uuid;
      const indexOfActivity = Object.values(HKWorkoutActivityType).indexOf(
        workout.workoutActivityType as unknown as HKWorkoutActivityType
      );
      const activityName = Object.keys(HKWorkoutActivityType)[indexOfActivity];
      let startTime = `${dayjs(workout.startDate).format(
        "YYYY-MM-DDTHH:mm:ss.SSS"
      )}Z`;
      let endTime = `${dayjs(workout.endDate).format(
        "YYYY-MM-DDTHH:mm:ss.SSS"
      )}Z`;
      const totalActCals = workout.totalEnergyBurned?.quantity ?? null;
      let totalRestCals: null | number = null;
      const queryStartDate = dayjs(workout.startDate)
        .subtract(5, "minutes")
        .toDate();
      const queryEndDate = dayjs(workout.endDate).add(5, "minutes").toDate();
      const restCals = await HealthKit.queryQuantitySamples(
        HKQuantityTypeIdentifier.basalEnergyBurned,
        {
          from: queryStartDate,
          to: queryEndDate,
          ascending: true,
        }
      );
      const actCals = await HealthKit.queryQuantitySamples(
        HKQuantityTypeIdentifier.activeEnergyBurned,
        {
          from: queryStartDate,
          to: queryEndDate,
          ascending: true,
        }
      );
      restCals.map((rCal) => {
        const restCalQuan = rCal.quantity;
        if (isNil(totalRestCals)) totalRestCals = 0;

        if (
          rCal.sourceRevision?.source.name ===
            workout.sourceRevision?.source.name &&
          rCal.startDate >= workout.startDate &&
          rCal.endDate <= workout.endDate
        )
          totalRestCals += restCalQuan;
      });
      let totalCals = null;
      if (!isNil(totalActCals) || !isNil(totalRestCals))
        totalCals = isNil(totalActCals)
          ? 0 + (isNil(totalRestCals) ? 0 : totalRestCals)
          : totalActCals + (isNil(totalRestCals) ? 0 : totalRestCals);

      workoutsToPush.push({
        id: uuid,
        start: new Date(startTime),
        end: new Date(endTime),
        activity: activityName,
        source: Workout_Source.AppleHealth,
        calories: totalCals ? Math.round(totalCals) : null,
        activityMappingField: "activityName",
        calsLog: ``,
      });
    })
  );
  let addedWorkoutLength = 0;
  if (updateHook) {
    const addedWorkout: CreateWorkoutWearableMutation = await client.request(
      CreateWorkoutWearableDocument,
      {
        input: workoutsToPush,
      }
    );
    if (addedWorkout && addedWorkout.createWorkoutWearable)
      addedWorkoutLength = addedWorkout.createWorkoutWearable.length;
  }
  return addedWorkoutLength;
};

export const healthConnectPermission = async () => {
  if (Platform.OS !== "android") return [];
  // initialize the client
  const isInitialized = await initialize();
  let grantedPermissions: any[] = [];

  // request permissions
  if (isInitialized) {
    grantedPermissions = await requestPermission([
      { accessType: "read", recordType: "ActiveCaloriesBurned" },
      { accessType: "read", recordType: "TotalCaloriesBurned" },
      { accessType: "read", recordType: "ExerciseSession" },
    ]);
  }

  return grantedPermissions.length > 0;
};

export const checkHealthConnectConnection = async (wearableId?: string) => {
  let permissionGrantedFlag = true;
  try {
    const isInitialized = await initialize();
    if (!isInitialized) permissionGrantedFlag = false;
    else {
      let permissionGranted = await getGrantedPermissions();
      if (permissionGranted.length < 1) permissionGrantedFlag = false;
    }
  } catch {
    permissionGrantedFlag = false;
  }

  if (!permissionGrantedFlag && wearableId) {
    //disconnect Apple Health
    const { mutate: updateWearableStatus } =
      useUpdateWearableStatusMutation(client);
    if (wearableId)
      updateWearableStatus({
        input: {
          id: wearableId,
          status: Wearable_Status.Disconnected,
        },
      });
    return;
  }

  return permissionGrantedFlag;
};
export const pushWorkoutsHealthConnect = async ({
  from,
  to = new Date(),
  updateHook,
  wearableId,
}: {
  from: Date;
  to?: Date;
  updateHook?: Function;
  wearableId?: string;
}) => {
  if (Platform.OS !== "android") return [];

  try {
    const isInitialized = await initialize();
    if (!isInitialized) return [];
    const HealthConnectResult = await readRecords("ExerciseSession", {
      timeRangeFilter: {
        operator: "between",
        startTime: from.toISOString(),
        endTime: to.toISOString(),
      },
    });
    const workoutsToPush: any[] = [];
    const TotalCaloriesBurned: any[] = [];
    const ActiveCaloriesBurned: any[] = [];
    await Promise.all(
      HealthConnectResult.map(async (exercise) => {
        TotalCaloriesBurned.push(
          await readRecords("TotalCaloriesBurned", {
            timeRangeFilter: {
              operator: "between",
              startTime: exercise.startTime,
              endTime: exercise.endTime,
            },
          })
        );

        ActiveCaloriesBurned.push(
          await readRecords("ActiveCaloriesBurned", {
            timeRangeFilter: {
              operator: "between",
              startTime: exercise.startTime,
              endTime: exercise.endTime,
            },
          })
        );
      })
    );
    HealthConnectResult.map((exercise, idx) => {
      const startT = `${dayjs(
        exercise.startTime.replace("Z", exercise.startZoneOffset ?? "Z")
      ).format("YYYY-MM-DDTHH:mm:ss.SSS")}Z`;
      const endT = `${dayjs(
        exercise.endTime.replace("Z", exercise.endZoneOffset ?? "Z")
      ).format("YYYY-MM-DDTHH:mm:ss.SSS")}Z`;

      let indexOfActivity = undefined;
      Object.values(ExerciseType).map((val, idx) => {
        if (Number(exercise.exerciseType) == Number(val)) indexOfActivity = idx;
      });

      let activityName = `${exercise.exerciseType}`;
      if (indexOfActivity)
        activityName = Object.keys(ExerciseType)[indexOfActivity];

      let totalCals = 0;
      TotalCaloriesBurned[idx].map((tCal: any) => {
        totalCals += tCal.energy.inKilocalories;
      });
      ActiveCaloriesBurned[idx].map((tCal: any) => {
        totalCals += tCal.energy.inKilocalories;
      });

      workoutsToPush.push({
        id: exercise.metadata?.id,
        start: new Date(startT),
        end: new Date(endT),
        activity: activityName,
        source: Workout_Source.HealthConnect,
        calories: totalCals,
        activityMappingField: "exerciseType",
      });
    });
    if (updateHook) await updateHook({ input: workoutsToPush });
    return workoutsToPush;
  } catch (pushHealthConnectError) {
    console.log({ pushHealthConnectError });
    return undefined;
  }
};

export default integrationIcons;
