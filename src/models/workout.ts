import prisma from "../lib/prisma";
import {
  WORKOUT_SOURCE,
  WORKOUT_STATUS,
  WORKOUT_INTENSITY,
  WORKOUT_SLOT,
  WEIGHT_UNIT,
  SEX,
  Workout,
  MealplanMeal,
  User,
  TOTAL_ACTIVITY_DURATION,
  MEAL_TYPE,
  MEAL_SUB_TYPE,
  MEAL_NUTRITION_STATUS,
  CARB_CODE,
  MealNutrition,
} from "@prisma/client";

import { WorkoutInput, UpdateWorkoutInput } from "../schema/workouts";
import { getEndOfDay, getStartOfDay } from "../utils/dates";

import { calculateInput, intensityRPEConverter, isTrainingPeaksWorkout } from "./workoutHelper";
import { sendPushNotification } from "../utils/notification";
import { WorkoutTP } from "../lib/types/tp";
import { isNil } from "rambda";
import { isAfter } from "date-fns";
import fs from "fs";

////////////////////////////////////////////////////////////////////////////////////
//////  Resolve user's workouts
////////////////////////////////////////////////////////////////////////////////////

const resolveWorkouts = async (from: Date, to: Date, gotrueId: string): Promise<Workout[]> => {
  const user = await prisma.user.findUnique({
    where: {
      gotrueId,
    },
    select: {
      id: true,
      mealplanId: true,
      weight: true,
      weightUnit: true,
      sex: true,
    },
  });
  let activeWorkouts: Workout[] = [];

  if (user) {
    const dateDiff = to.valueOf() - from.valueOf();
    const rangDays = Math.ceil(dateDiff / (1000 * 60 * 60 * 24));
    let oneDayFrom = getStartOfDay(from);
    let oneDayTo = getEndOfDay(from);

    for (let i = 0; i < rangDays; i++) {
      // get all workouts for one day
      const allDayWorkouts = await prisma.workout.findMany({
        where: {
          userId: user.id,
          start: {
            gte: oneDayFrom,
            lte: oneDayTo,
          },
          NOT: {
            status: {
              in: [WORKOUT_STATUS.DISCARDED],
            },
          },
        },
        orderBy: { start: "asc" },
      });

      const dayActiveWorkouts = await resolveDayWorkouts(allDayWorkouts, user as User);

      if (dayActiveWorkouts.length > 0) activeWorkouts = [...activeWorkouts, ...dayActiveWorkouts];

      oneDayFrom = getStartOfDay(new Date(oneDayTo.valueOf() + 1));
      oneDayTo = getEndOfDay(oneDayFrom);
    }
  }

  return activeWorkouts;
};

const resolveDayWorkouts = async (allDayWorkouts: Workout[], user: User): Promise<Workout[]> => {
  user;
  const resolvedWorkouts: Workout[] = [];

  // Wearable Workout and CONFIRMED
  const wearableConfirmedWorkout = allDayWorkouts.filter(
    workout =>
      workout.source != WORKOUT_SOURCE.USER &&
      workout.source != WORKOUT_SOURCE.COACH &&
      workout.confirmed &&
      workout.status !== WORKOUT_STATUS.DISCARDED &&
      workout.status !== WORKOUT_STATUS.INCOMPLETE,
  );
  for (let i = 0; i < wearableConfirmedWorkout.length; i++) {
    const activatedWorkout = await activateWorkout(wearableConfirmedWorkout[i], allDayWorkouts);
    if (activatedWorkout) resolvedWorkouts.push(wearableConfirmedWorkout[i]);
  }

  // User workout and CONFIRMED
  // Planned workouts
  const userConfirmedWorkouts = allDayWorkouts.filter(
    workout =>
      (workout.source === WORKOUT_SOURCE.USER ||
        workout.source === WORKOUT_SOURCE.COACH ||
        (workout.source === WORKOUT_SOURCE.TRAINING_PEAKS && !workout.confirmed)) &&
      //      workout.confirmed &&
      workout.status !== WORKOUT_STATUS.DISCARDED &&
      workout.status !== WORKOUT_STATUS.INCOMPLETE,
  );
  for (let i = 0; i < userConfirmedWorkouts.length; i++) {
    const activatedWorkout = await activateWorkout(userConfirmedWorkouts[i], allDayWorkouts);
    if (activatedWorkout) resolvedWorkouts.push(userConfirmedWorkouts[i]);
  }

  return resolvedWorkouts;
};

const activateWorkout = async (workout: Workout, workoutList: Workout[]): Promise<boolean> => {
  if (workout.status != WORKOUT_STATUS.DISCARDED) {
    workout.status = WORKOUT_STATUS.ACTIVE;
    await prisma.workout.update({
      where: { id: workout.id },
      data: { ...workout },
    });

    // discard conflicting workouts
    const conflictingWorkouts = await determineClashes(workout, workout.userId);
    for (let i = 0; i < conflictingWorkouts.length; i++) {
      // discard in DB
      await prisma.workout.update({
        where: { id: conflictingWorkouts[i].id },
        data: { status: WORKOUT_STATUS.DISCARDED },
      });
      // discard meal nutrition
      await prisma.mealNutrition.update({
        where: { wrokoutId: conflictingWorkouts[i].id },
        data: { status: MEAL_NUTRITION_STATUS.DELETED },
      });
      // discard in current list
      const discardedWorkouts = workoutList.filter(workout => workout.id == conflictingWorkouts[i].id);
      discardedWorkouts[0].status = WORKOUT_STATUS.DISCARDED;
    }
  }
  return true;
};

type WORKOUT_TYPES = WorkoutTP[] | unknown[];
export const importedWorkoutDataProcessor = async (importedWorkouts: WORKOUT_TYPES, userId: string, sourceToProcess: string) => {
  switch (sourceToProcess) {
    case "TrainingPeaks":
      if (isTrainingPeaksWorkoutArray(importedWorkouts)) {
        console.log("perform training peaks related processing. Number of workouts is:", importedWorkouts.length, userId);
        return await createWorkoutTP(importedWorkouts, userId);
      } else {
        console.error("importedWorkouts", importedWorkouts);
        throw new Error("workouts provided do not match expected TP shape");
      }
    default:
      console.log("perform any processing not related to an provider");
      console.log("or log an error.");
  }
  return [];
};
const isTrainingPeaksWorkoutArray = (workouts: unknown[]): workouts is WorkoutTP[] => {
  return workouts.every(workout => isTrainingPeaksWorkout(workout));
};

////////////////////////////////////////////////////////////////////////////////////
//////  TrainingPeaks create workout function
////////////////////////////////////////////////////////////////////////////////////
export const createWorkoutTP = async (input: WorkoutTP[], user_id: string): Promise<Workout[]> => {
  // Check if workout already exists
  const references = input.map((workout): string => `${workout.Id}`);
  const existingWorkouts = await prisma.workout.findMany({
    where: { externalReference: { in: [...references] }, userId: user_id },
  });

  // check User existence
  const user = await prisma.user.findUnique({
    where: { id: user_id },
  });
  if (!user) throw new Error(`Can not find the Hexis user by user_id (${user_id}).`);
  const targetedUser = user;

  // Getting activity ID
  const activities = input.map(workout => workout.WorkoutType?.toLowerCase() || "");
  const activityIds = await prisma.mapping.findMany({
    where: { field2: "WorkoutType", value2: { in: [...activities] } },
    select: { value1: true, value2: true },
  });

  const createdWorkouts: Workout[] = [];

  await Promise.all(
    input.map(async (payload: WorkoutTP) => {
      const workoutInput = await calculateInput(payload, existingWorkouts, activityIds);

      // If there's a workout, create it. If not, it's possible it's a day off, so it's skipped.
      if (workoutInput) {
        const createdWO = await createWorkout(workoutInput, targetedUser.gotrueId, "", targetedUser);
        createdWorkouts.push(createdWO);
      }
    }),
  );
  return createdWorkouts;
};

////////////////////////////////////////////////////////////////////////////////////
//////  Common workout creation function
////////////////////////////////////////////////////////////////////////////////////
const createWorkout = async (workoutInput: WorkoutInput, gotrueId: string, coachFullName: string = "", userRecord?: User | undefined) => {
  const user = userRecord
    ? userRecord
    : await prisma.user.findUnique({
        where: {
          gotrueId,
        },
        select: {
          id: true,
          sex: true,
          weight: true,
          weightUnit: true,
          mealplanId: true,
          totalActivityDuration: true,
        },
      });
  // split day-crossing workout
  let dayCrossingWorkout = undefined;

  if (
    workoutInput.start.getUTCDay() != workoutInput.end.getUTCDay() ||
    workoutInput.start.getUTCMonth() != workoutInput.end.getUTCMonth() ||
    workoutInput.start.getUTCFullYear() != workoutInput.end.getUTCFullYear()
  ) {
    dayCrossingWorkout = { ...workoutInput };
    workoutInput.end = getEndOfDay(workoutInput.start);
    dayCrossingWorkout.start = getStartOfDay(new Date(workoutInput.end.valueOf() + 1));
  }

  //  determine new workout intensity
  if (
    workoutInput.intensity === WORKOUT_INTENSITY.UNSPECIFIED &&
    !isNil(workoutInput.calories) &&
    workoutInput.source != WORKOUT_SOURCE.USER &&
    workoutInput.source != WORKOUT_SOURCE.COACH &&
    user?.sex &&
    user?.weight &&
    user?.totalActivityDuration
  ) {
    const intensityRPE = await determineIntensity(user.weight, user.weightUnit, user.sex, workoutInput, user.totalActivityDuration);
    workoutInput.intensity = intensityRPE.intensity;
    workoutInput.intensityRPE = intensityRPE.RPE;
  }

  if (workoutInput.intensity == WORKOUT_INTENSITY.UNSPECIFIED) {
    workoutInput.status = WORKOUT_STATUS.INCOMPLETE;
  }

  // determine time clashes

  const clashingWorkouts = await determineClashes(workoutInput, user?.id);
  workoutInput = await handleClashingWorkouts(workoutInput, clashingWorkouts);

  // copy intra info and intra log to the wearable if only on clashing workout
  let intraInfo = { intraFuelling: false };
  let intraFuellingMeal = undefined;
  if (clashingWorkouts.length === 1 && workoutInput.source != WORKOUT_SOURCE.USER && workoutInput.source != WORKOUT_SOURCE.COACH) {
    intraInfo = { intraFuelling: clashingWorkouts[0].intraFuelling };
    intraFuellingMeal = await prisma.mealNutrition.findUnique({
      where: { wrokoutId: clashingWorkouts[0].id },
      include: { mealVerification: true, nutrients: true },
    });
  }

  // determine the intra fuelling prompt
  const intraFuellingPrompt = await workoutIntraFuellingPrompt(
    workoutInput.activityId,
    workoutInput.competition,
    workoutInput.key,
    workoutInput.intensityRPE,
    Math.abs(workoutInput.end.getTime() - workoutInput.start.getTime()) / 36e5,
    workoutInput.intensity,
  );

  const workout = await prisma.workout.create({
    data: {
      userId: user!.id,
      slot: workoutInput.slot,
      activityId: workoutInput.activityId,
      start: workoutInput.start,
      end: workoutInput.end,
      utcOffset: workoutInput.utcOffset,
      intensity: workoutInput.intensity,
      key: workoutInput.key,
      competition: workoutInput.competition,
      source: workoutInput.source,
      status: workoutInput.status,
      externalReference: workoutInput.externalReference,
      calories: workoutInput.calories,
      intraFuellingPrompt: intraFuellingPrompt,
      intraFuelling: intraFuellingPrompt ?? intraInfo.intraFuelling,
      title: workoutInput.title,
      description: workoutInput.description,
      confirmed: workoutInput.confirmed,
      startTime: workoutInput.startTime,
      powerAverage: workoutInput.powerAverage ?? undefined,
      intensityRPE: workoutInput.intensityRPE,
    },
  });

  // send notification if source is COACH
  if (workout.source === WORKOUT_SOURCE.COACH) {
    await sendPushNotification(
      user?.id ?? "",
      "Hexis",
      `🏋️ Your latest workouts have landed and your personalised nutrition LIVE! Tap to review your plan by ${
        coachFullName ?? "your coach"
      } 🥙`,
    );
  }

  // create Intrafuelling mealNutrition
  if (intraFuellingMeal && workout.status === WORKOUT_STATUS.ACTIVE) {
    const { wrokoutId: _, id: __, mealVerification, nutrients, ...intraFuellingMealRest } = intraFuellingMeal;
    const newIntreaFuellingMeal = await prisma.mealNutrition.create({
      data: { ...intraFuellingMealRest, wrokoutId: workout.id },
    });
    if (mealVerification) {
      const { id: _, ...verificationRest } = mealVerification;

      await prisma.mealVerification.create({
        data: { ...verificationRest, mealNutritionId: newIntreaFuellingMeal.id },
      });
    }
    if (nutrients && nutrients.length > 0) {
      await prisma.nutrients.createMany({
        data: nutrients.map(nutrient => {
          const { id: _, ...restNutrient } = nutrient;
          return { ...restNutrient, mealNutritionId: newIntreaFuellingMeal.id };
        }),
      });
    }
  }

  // auto add intra Fuelling Meal
  if (workout.intraFuelling && workout.status === WORKOUT_STATUS.ACTIVE && !intraFuellingMeal)
    addIntraFuellingMeal(workout.userId, workout.start, workout.id);

  // crossDay workouts
  if (dayCrossingWorkout) createWorkout(dayCrossingWorkout, gotrueId);

  return workout;
};

////////////////////////////////////////////////////////////////////////////////////
//////  Handling clashing workouts (Auto resolving them) function
////////////////////////////////////////////////////////////////////////////////////
export const handleClashingWorkouts = async (
  workoutInput: WorkoutInput,
  clashingWorkouts: (Workout & { intraFuellingMeal: MealNutrition | null })[],
) => {
  const plannedSources: WORKOUT_SOURCE[] = [WORKOUT_SOURCE.COACH, WORKOUT_SOURCE.USER, WORKOUT_SOURCE.TRAINING_PEAKS];
  const isIncomingPlanned = plannedSources.includes(workoutInput.source) && !workoutInput.confirmed;
  let discardIncoming = false;
  await Promise.all(
    clashingWorkouts.map(async workout => {
      const isPlanned = plannedSources.includes(workout.source) && !workout.confirmed;
      discardIncoming = false;

      if (!isPlanned && isIncomingPlanned) {
        discardIncoming = true;
        console.log("Discard because exist is actual and comming is planned");
      }
      if (
        isPlanned &&
        isIncomingPlanned &&
        (isAfter(workout.start, workoutInput.start) ||
          (workout.source === WORKOUT_SOURCE.TRAINING_PEAKS && workoutInput.source !== WORKOUT_SOURCE.TRAINING_PEAKS))
      ) {
        discardIncoming = true;
        console.log("Discard because exist is starts after comming or exist is TP but comming is not TP");
      }
      if (!isPlanned && !isIncomingPlanned && isAfter(workout.start, workoutInput.start)) {
        discardIncoming = true;
        console.log("Discard because exist is starts after comming oand both are actual");
      }

      if (!discardIncoming) {
        await prisma.workout.update({
          where: {
            id: workout.id,
          },
          data: { status: WORKOUT_STATUS.DISCARDED },
        });
        if (workout.intraFuellingMeal)
          try {
            await prisma.mealNutrition.update({
              where: {
                wrokoutId: workout.id,
              },
              data: { status: MEAL_NUTRITION_STATUS.DELETED },
            });
          } catch {
            console.log("Can't discard the intrafuelling meal");
          }
      }
    }),
  );

  if (discardIncoming) workoutInput.status = WORKOUT_STATUS.DISCARDED;

  return workoutInput;
};

////////////////////////////////////////////////////////////////////////////////////
//////  Workout Slot determination function
////////////////////////////////////////////////////////////////////////////////////
export const determineSlot = async (mealplanId: string, workout: WorkoutInput | Workout): Promise<WORKOUT_SLOT> => {
  // determine new workout SLOT
  let SLOT = workout.slot;
  if (workout.source === WORKOUT_SOURCE.TRAINING_PEAKS && !workout.startTime) {
    return SLOT;
  }

  const mealplanMeals = await prisma.mealplanMeal.findMany({
    where: {
      mealplanId: mealplanId,
    },
    orderBy: { time: "asc" },
  });

  const startTime = new Date(0);
  startTime.setUTCHours(workout.start.getUTCHours());
  startTime.setUTCMinutes(workout.start.getUTCMinutes());
  startTime.setUTCSeconds(workout.start.getUTCSeconds());
  startTime.setUTCMilliseconds(workout.start.getUTCMilliseconds());

  let selectedMeal: MealplanMeal;
  let flag = false;
  mealplanMeals.map(meal => {
    if (flag) return;
    selectedMeal = meal;

    if (startTime < selectedMeal.time) {
      SLOT = WORKOUT_SLOT[`BEFORE_${selectedMeal.slot}` as keyof typeof WORKOUT_SLOT];
      flag = true;
    }
  });
  if (mealplanMeals.length > 0 && !flag) {
    selectedMeal = mealplanMeals[mealplanMeals.length - 1];
    SLOT = WORKOUT_SLOT[`BEFORE_${selectedMeal.slot}` as keyof typeof WORKOUT_SLOT];
  }

  return SLOT;
};

////////////////////////////////////////////////////////////////////////////////////
//////  Workout Intensity determination function
////////////////////////////////////////////////////////////////////////////////////
type intensityParam = {
  slug: string;
  gender: SEX;
  total_activity_duration: TOTAL_ACTIVITY_DURATION;
  wtHeavy: number[];
  wtLight: number[];
  metDiffs: number[];
};
type intensityTypes = { intensity: WORKOUT_INTENSITY; RPE: number };
const determineIntensity = async (
  weight: number,
  weightUnit: WEIGHT_UNIT,
  gender: SEX,
  workout: WorkoutInput | Workout,
  totalActivityDuration: TOTAL_ACTIVITY_DURATION,
): Promise<intensityTypes> => {
  // convert weight to KG
  let weightKG = weight;
  if (weightUnit == WEIGHT_UNIT.LBS) {
    weightKG = weightKG * 0.45359237;
  }

  const kcalOutput = workout.calories ? workout.calories : 0;
  let timeDiff = 0;
  if (kcalOutput > 0) {
    // getting the duration as the diff between end ans start of the workout
    timeDiff = workout.end.getTime() - workout.start.getTime(); //diff in milliseconds
    timeDiff = Math.floor(timeDiff / 1000); // diff in seconds
    timeDiff = Math.floor(timeDiff / 60); // diff in minutes
  }

  // get right category intensity
  // get Activity details from DB
  const workoutActivity = await prisma.activity.findUnique({
    where: {
      id: workout.activityId,
    },
    select: {
      slug: true,
    },
  });

  // fetch relevent parameters from the JSON file
  const intensityParameters: intensityParam[] = JSON.parse(
    fs.readFileSync(require.resolve("../constant/intensity_parameters.json"), "utf8"),
  ) as intensityParam[];
  const targtedParam: intensityParam | undefined = intensityParameters.filter(
    (activity: intensityParam) =>
      activity.slug === workoutActivity?.slug && activity.total_activity_duration === totalActivityDuration && activity.gender === gender,
  )?.[0];

  const returnedIntensity: intensityTypes = { intensity: workout.intensity ?? WORKOUT_INTENSITY.UNSPECIFIED, RPE: 0 };
  if (targtedParam) {
    const sexIdx = { FEMALE: 0, MALE: 1 }[gender];
    const threshold = 95 ** sexIdx * 75 ** (1 - sexIdx);
    const adjusted_time =
      Number(timeDiff <= 90) * timeDiff +
      (9 + 0.9 * timeDiff) * Number(timeDiff > 90) * Number(timeDiff <= 150) +
      (22.5 + 0.81 * timeDiff) * Number(timeDiff > 150);
    const kcalPerMin = kcalOutput / ((adjusted_time * 3.5) / 200);
    const met = Math.min(Math.max(targtedParam.wtLight[5], kcalPerMin / weight), targtedParam.wtLight[6]);
    let intensityRPE =
      targtedParam.wtLight[0] * met +
      targtedParam.wtLight[1] * met ** 2 +
      targtedParam.wtLight[2] * met ** 3 +
      targtedParam.wtLight[3] * met ** 4 +
      targtedParam.wtLight[4];

    if (weight > threshold && targtedParam.wtHeavy != targtedParam.wtLight) {
      const metDiffs = targtedParam.metDiffs;
      const metDiff = intensityRPE <= 20 ? metDiffs[0] : intensityRPE >= 60 ? metDiffs[2] : metDiffs[1];
      const met = Math.min(Math.max(targtedParam.wtHeavy[5], (kcalPerMin - threshold * metDiff) / weight), targtedParam.wtHeavy[6]);
      intensityRPE =
        targtedParam.wtHeavy[0] * met +
        targtedParam.wtHeavy[1] * met ** 2 +
        targtedParam.wtHeavy[2] * met ** 3 +
        targtedParam.wtHeavy[3] * met ** 4 +
        targtedParam.wtHeavy[4];
    }

    intensityRPE = Math.min(Math.max(0, Math.round(intensityRPE)), 100);
    returnedIntensity.RPE = intensityRPE;
    const intensity = intensityRPEConverter(intensityRPE);
    returnedIntensity.intensity = intensity;
  }

  return returnedIntensity;
};

////////////////////////////////////////////////////////////////////////////////////
//////  Workout Clashes determination and conflicting function
////////////////////////////////////////////////////////////////////////////////////
const determineClashes = async (
  workout: WorkoutInput | UpdateWorkoutInput | Workout,
  userId?: string,
  id?: string,
): Promise<(Workout & { intraFuellingMeal: MealNutrition | null })[]> => {
  // determine workout clashes
  // update all current workouts that are in conflict with the current one
  // Filter conflicted workouts for three cases (OR as a combiner):
  // 1. Start date of current workouts between start and end data of new workout
  // 2. End date of current workouts between start and end data of new workout
  // 3. Start and end date of new workout between start and end date of current workouts
  // 4. Workout status must NOT be WORKOUT_STATUS.DISCARDED
  if (!userId) return [];

  let clashingWorkouts = await prisma.workout.findMany({
    where: {
      userId,
      OR: [
        {
          start: {
            gte: workout.start,
            lte: workout.end,
          },
        },
        {
          end: {
            gte: workout.start,
            lte: workout.end,
          },
        },
        {
          AND: [
            {
              start: {
                lte: workout.start,
              },
            },
            {
              end: {
                gte: workout.end,
              },
            },
          ],
        },
      ],
      NOT: {
        status: {
          in: [WORKOUT_STATUS.WAITING, WORKOUT_STATUS.INCOMPLETE, WORKOUT_STATUS.DISCARDED],
        },
      },
    },
    include: { intraFuellingMeal: true },
  });

  if (id) clashingWorkouts = clashingWorkouts.filter(existingWorkout => existingWorkout.id !== id);

  if ("id" in workout) return clashingWorkouts.filter(selectedWorkout => selectedWorkout.id !== workout?.id);

  return clashingWorkouts;
};

////////////////////////////////////////////////////////////////////////////////////
//////  Workout Clashes determination and conflicting function
////////////////////////////////////////////////////////////////////////////////////
const determineClashesOnActiveWorkouts = async (
  workout: WorkoutInput | UpdateWorkoutInput | Workout,
  user?: {
    workouts: Workout[];
    id: string;
  } | null,
  id?: string,
): Promise<Workout[]> => {
  // determine workout clashes on active workouts
  // update all current workouts that are in conflict with the current one
  // Filter conflicted workouts for three cases (OR as a combiner):
  // 1. Start date of current workouts between start and end data of new workout
  // 2. End date of current workouts between start and end data of new workout
  // 3. Start and end date of new workout between start and end date of current workouts
  // 4. Workout status must be ACTIVE
  if (!user?.id) return [];

  if (!workout.start || !workout.end) return [];
  let activeClashingWorkouts = await prisma.workout.findMany({
    where: {
      userId: user.id,
      OR: [
        {
          start: {
            gte: new Date(workout.start),
            lte: new Date(workout.end),
          },
        },
        {
          end: {
            gte: new Date(workout.start),
            lte: new Date(workout.end),
          },
        },
        {
          AND: [
            {
              start: {
                lte: new Date(workout.start),
              },
            },
            {
              end: {
                gte: new Date(workout.end),
              },
            },
          ],
        },
      ],
      status: {
        in: [WORKOUT_STATUS.ACTIVE],
      },
    },
  });

  if (id) activeClashingWorkouts = activeClashingWorkouts.filter(existingWorkout => existingWorkout.id !== id);

  if ("id" in workout) return activeClashingWorkouts.filter(selectedWorkout => selectedWorkout.id !== workout?.id);

  return activeClashingWorkouts;
};

////////////////////////////////////////////////////////////////////////////////////
//////  Activate WAITING workouts
////////////////////////////////////////////////////////////////////////////////////
// to remove this function since we switch to auto resolving. this function relying on
// confirmed as and integraty rank flag but confirmes is switched to be used as a flag
// for completed workouts or planned ones
const activateWaitingWorkout = async (workout: Workout) => {
  const workouts = await prisma.workout.findMany({
    where: {
      userId: workout.userId,
      start: { gte: getStartOfDay(workout.start) },
      end: { lte: getEndOfDay(workout.start) },
      status: WORKOUT_STATUS.WAITING,
    },
    orderBy: {
      start: "asc",
    },
  });

  // get highest integrity (CONFIRMED=TRUE)
  let highestIntegrityWorkouts = workouts.filter(workout => workout.confirmed == true);

  if (highestIntegrityWorkouts.length < 1) {
    highestIntegrityWorkouts = workouts;
  }

  await prisma.workout.update({
    where: { id: highestIntegrityWorkouts?.[0]?.id },
    data: { status: WORKOUT_STATUS.ACTIVE },
  });
};

////////////////////////////////////////////////////////////////////////////////////
//////  Activate WAITING workouts
////////////////////////////////////////////////////////////////////////////////////
const workoutIntraFuellingPrompt = async (
  activityId: string,
  competition: boolean,
  key: boolean,
  RPE: number,
  duration: number | undefined,
  intensity?: WORKOUT_INTENSITY,
) => {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
  });

  if (!activity || activity.slug == "other") return false;
  if (!duration || duration === 0) return false;

  const intraValues = {
    competition: {
      HARD: activity?.intraCompHard,
      MODERATE: activity.intraCompModerate,
      LIGHT: activity.intraCompLight,
      UNSPECIFIED: Math.pow(10, 1000),
    },
    normal: {
      HARD: activity?.intraHard,
      MODERATE: activity.intraModerate,
      LIGHT: activity.intraLight,
      UNSPECIFIED: Math.pow(10, 1000),
    },
  };

  let convertedIntensity = intensity;
  if (!convertedIntensity || convertedIntensity === WORKOUT_INTENSITY.UNSPECIFIED) convertedIntensity = intensityRPEConverter(RPE);
  if (key || competition) return intraValues.competition[convertedIntensity] <= duration;
  else return intraValues.normal[convertedIntensity] <= duration;
};

////////////////////////////////////////////////////////////////////////////////////
//////  add Intra fuelling meal
////////////////////////////////////////////////////////////////////////////////////
const addIntraFuellingMeal = async (userId: string, day: Date, workoutId: string) => {
  const dayNutrition = await prisma.dayNutrition.findUnique({
    where: { userId_day: { userId, day } },
  });
  if (dayNutrition) {
    await prisma.mealNutrition.create({
      data: {
        dayId: dayNutrition.id,
        mealName: "Intra Workout Fuelling",
        mealType: MEAL_TYPE.INTRA_FUELLING,
        mealSubType: MEAL_SUB_TYPE.UNSPECIFIED,
        status: MEAL_NUTRITION_STATUS.ACTIVE,
        carbCode: CARB_CODE.UNSPECIFIED,
        wrokoutId: workoutId,
      },
    });
  }
};

////////////////////////////////////////////////////////////////////////////////////
//////  Delete Intra fuelling meal and its verivication workouts
////////////////////////////////////////////////////////////////////////////////////
const deleteIntraFuellingMeal = async (workoutId: string) => {
  const mealNutrition = await prisma.mealNutrition.findFirst({
    where: { wrokoutId: workoutId },
    include: { mealVerification: true, nutrients: true, dayNutrition: true },
  });
  if (mealNutrition && mealNutrition.mealVerification)
    await prisma.mealVerification.delete({
      where: { id: mealNutrition.mealVerification.id },
    });
  if (mealNutrition && mealNutrition.nutrients)
    await prisma.nutrients.deleteMany({
      where: {
        mealNutritionId: mealNutrition.id,
      },
    });
  if (mealNutrition)
    await prisma.mealNutrition.delete({
      where: { id: mealNutrition.id },
    });
};
export {
  addIntraFuellingMeal,
  deleteIntraFuellingMeal,
  determineClashes,
  activateWaitingWorkout,
  resolveWorkouts,
  createWorkout,
  determineClashesOnActiveWorkouts,
  workoutIntraFuellingPrompt,
};
