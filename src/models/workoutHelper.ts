import { MEAL_NUTRITION_STATUS, WORKOUT_INTENSITY, WORKOUT_SLOT, WORKOUT_SOURCE, WORKOUT_STATUS, Workout } from "@prisma/client";
import { WorkoutTP } from "../lib/types/tp";
import prisma from "../lib/prisma";
import { hexisDayjs } from "../utils/dates";
import { isNil } from "rambda";
import { WorkoutInput } from "../schema/workouts";
import dayjs from "dayjs";

type activityId = {
  value1: string;
  value2: string;
};

export const isTrainingPeaksWorkout = (obj: unknown): obj is WorkoutTP => {
  if (obj !== null && typeof obj === "object") {
    return "WorkoutDay" in obj && obj.WorkoutDay !== undefined && "Completed" in obj && obj.Completed !== undefined;
  }
  return false;
};

export const calculateInput = async (payload: WorkoutTP | Workout, existingWorkouts: Workout[], activityIds: activityId[]) => {
  if (process.env.FLAGS_TRIGGER_BASED_SYNC === "true") {
    // Do something that's based on this flag.
    return;
  }

  if (isTrainingPeaksWorkout(payload)) {
    // check if it is a day off discard it
    if (payload.WorkoutType?.toLocaleLowerCase() === "day off") return;

    // completed version of workout created
    const existingWorkout = existingWorkouts.filter((workout: Workout) => workout.externalReference === `${payload.Id}`);
    if (existingWorkout.length == 2 || (existingWorkout.length == 1 && (existingWorkout[0]?.confirmed || !payload.Completed))) {
      return;
    }

    //assign a default activity ID  (Other) if activityId is null
    let activityId: string = activityIds?.filter(activity => activity.value2 === payload.WorkoutType?.toLocaleLowerCase())?.[0]?.value1;
    if (!activityId) activityId = "clhry7xug0000x9b1f04e0kwm";

    // check if there is a planned active workout then deactivate it
    if (existingWorkout.length == 1) {
      await prisma.workout.update({
        where: { id: existingWorkout?.[0]?.id },
        data: { status: WORKOUT_STATUS.DISCARDED },
      });
      // discard meal nutrition
      try {
        await prisma.mealNutrition.update({
          where: { wrokoutId: existingWorkout?.[0]?.id },
          data: { status: MEAL_NUTRITION_STATUS.DELETED },
        });
      } catch {
        console.log("Can't deactivate mealnutrition.");
      }
    }
    let status: WORKOUT_STATUS = WORKOUT_STATUS.ACTIVE;

    const tpStartTime = payload.StartTime ?? payload.StartTimePlanned;
    if (!tpStartTime) status = WORKOUT_STATUS.INCOMPLETE;

    const startTime = tpStartTime ?? payload.WorkoutDay;
    // duration
    const duration = (payload.TotalTime ?? payload.TotalTimePlanned ?? 0) * 60 * 60;

    const timezoneOffset = 0;
    const workoutStartTZ = `${hexisDayjs(startTime).format("YYYY-MM-DDTHH:mm:ss.SSS")}Z`;
    const workoutEndTZ = `${hexisDayjs(startTime).add(duration, "second").format("YYYY-MM-DDTHH:mm:ss.SSS")}Z`;

    // calculate intensity incase of calories and caloriesPlanned are undefiled
    let RPE = 0;
    let tpIntensity: WORKOUT_INTENSITY = WORKOUT_INTENSITY.UNSPECIFIED;
    if (
      (payload.Completed && (payload.IF || (!payload.Calories && !isNil(payload.IFPlanned)))) ||
      (!payload.Completed && (!isNil(payload.IF) || !isNil(payload.IFPlanned)))
    ) {
      const tpIntensityFactor = payload.IF ?? payload.IFPlanned ?? 0;
      RPE = tpIfMapping(tpIntensityFactor);

      const intensityIndex = Number(RPE >= 33) + Number(RPE >= 60);
      tpIntensity = [WORKOUT_INTENSITY.LIGHT, WORKOUT_INTENSITY.MODERATE, WORKOUT_INTENSITY.HARD][intensityIndex];
    }

    const workoutInput: WorkoutInput = {
      start: new Date(workoutStartTZ),
      end: new Date(workoutEndTZ),
      utcOffset: timezoneOffset,
      key: false,
      competition: false,
      activityId: activityId,
      calories: payload.Completed ? payload.Calories : payload.CaloriesPlanned,
      duration: duration,
      source: WORKOUT_SOURCE.TRAINING_PEAKS,
      status,
      intensity: tpIntensity,
      intensityRPE: RPE,
      slot: WORKOUT_SLOT.UNSPECIFIED,
      externalReference: `${payload.Id}`,
      confirmed: payload.Completed ? true : false,
      startTime: tpStartTime ? new Date(dayjs(tpStartTime).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")) : undefined,
      title: payload.Title,
      description: payload.Description,
      intraFuelling: !!existingWorkout?.[0]?.intraFuelling,
      powerAverage: payload.PowerAverage,
    };

    return workoutInput;
  } else return;
};

export const intensityRPEConverter = (intensityRPE: number): WORKOUT_INTENSITY => {
  if (intensityRPE <= 20) return WORKOUT_INTENSITY.LIGHT;
  if (intensityRPE > 20 && intensityRPE < 60) return WORKOUT_INTENSITY.MODERATE;
  if (intensityRPE >= 60) return WORKOUT_INTENSITY.HARD;

  return WORKOUT_INTENSITY.UNSPECIFIED;
};
export const intensityConverter = (intensity: WORKOUT_INTENSITY): number => {
  if (intensity === WORKOUT_INTENSITY.LIGHT) return 20;
  if (intensity === WORKOUT_INTENSITY.MODERATE) return 33;
  if (intensity === WORKOUT_INTENSITY.HARD) return 60;

  return 0;
};

export const tpIfMapping = (x: number) => {
  let y: number;
  if (x < 0.6) {
    y = 60.1109248 / (1 + Math.exp(-5.95965948 * (x - 0.71908639))) + 0.18371452;
  } else if (x < 0.75) {
    y = 86.66666667 * x + -32;
  } else if (x < 0.8) {
    y = 260 * x + -162;
  } else if (x < 0.85) {
    y = 280 * x + -178;
  } else {
    y = 54.1269457 / (1 + Math.exp(-14.19824598 * (x - 0.94300374))) + 48.59346146;
  }

  return Math.round(Math.min(Math.max(y, 0), 100));
};
