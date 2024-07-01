import {
  CARB_CODE,
  COACH_NOTE_TYPES,
  DAY_NAMES,
  DayNutrition,
  MEAL_NUTRITION_STATUS,
  MEAL_SUB_TYPE,
  MEAL_TYPE,
  MealNutrition,
  MealTemplate,
  MealVerification,
  NUTRIENTS_SOURCE,
  WORKOUT_STATUS,
  Workout,
} from "@prisma/client";
import { AgeFromDate } from "age-calculator";
import { addDays, differenceInMinutes, isBefore, isSameDay, subDays } from "date-fns";
import * as engines from "../lib/engines";
import { DAY_TIME, DayInput, EngineWorkout } from "../lib/types/engine";
import prisma from "../lib/prisma";
import { getTime, formatTimes, getStartOfDay, getEndOfDay } from "../utils/dates";
import formatMealplan from "../utils/engines/formatMealplan";
import { loggedMacros } from "./nutritics";
import dayjs from "dayjs";
import { findEnumItem } from "../utils/enumFinder";
import { createMealNutritionFromTemplate, initiateMealPlan, mainMeals } from "./mealPlan";

export type DayMacros = {
  energy: number;
  fat: number;
  carb: number;
  protein: number;
  energyCurrent: number;
  fatCurrent: number;
  carbsCurrent: number;
  proteinCurrent: number;
};
export interface ExtendedMeal extends MealNutrition {
  workout?: Workout;
  mealVerification?: MealVerification;
}
export const collectMealsNutritions = async (dayNutrition: DayNutrition[], mealplanId: string[], userId: string) => {
  const dayMeals: {
    before: MealNutrition[];
    current: MealNutrition[];
    after: MealNutrition[];
  } = { before: [], current: [], after: [] };

  // 1) Meal Plans for the three days
  dayMeals.before = await collectDayMealTemplates(dayNutrition[0], mealplanId[0]);
  dayMeals.current = await collectDayMealTemplates(dayNutrition[1], mealplanId[1]);
  dayMeals.after = await collectDayMealTemplates(dayNutrition[2], mealplanId[2]);

  // 2) Intrafuelling meals
  (await collectIntraFuellingMeals(dayNutrition[0], userId)).map(meal => dayMeals.before.push(meal));
  (await collectIntraFuellingMeals(dayNutrition[1], userId)).map(meal => dayMeals.current.push(meal));
  (await collectIntraFuellingMeals(dayNutrition[2], userId)).map(meal => dayMeals.after.push(meal));

  // 3) collect ad-hoc meals
  (await collectAdhocMeals(dayNutrition[0])).map(meal => dayMeals.before.push(meal));
  (await collectAdhocMeals(dayNutrition[1])).map(meal => dayMeals.current.push(meal));
  (await collectAdhocMeals(dayNutrition[2])).map(meal => dayMeals.after.push(meal));

  return dayMeals;
};

const collectDayMealTemplates = async (dateNutrition: DayNutrition, dayMealplanId: string) => {
  const meals: MealNutrition[] = [];
  const dayNameStr = dayjs(dateNutrition.day).format("dddd").toUpperCase();
  const dayName = findEnumItem(DAY_NAMES, dayNameStr);
  if (!dayName) throw new Error("Day not found. Provided data:" + String(dateNutrition.day));
  const dayMealplan = await prisma.mealplan.findUnique({
    where: {
      id: dayMealplanId,
    },
    include: {
      mealTemplates: {
        where: { dayName: dayName },
      },
      mealplanMeals: true,
    },
  });

  let templates: MealTemplate[] = [];

  if (dayMealplan && dayMealplan.mealTemplates?.length > 0) templates = dayMealplan.mealTemplates;
  else if (dayMealplan && dayMealplan.mealplanMeals.length > 0)
    // create template
    templates = await prisma.$transaction(
      dayMealplan.mealplanMeals.map(planMeal =>
        prisma.mealTemplate.create({
          data: {
            mealType: mainMeals.includes(planMeal.slot as string) ? MEAL_TYPE.MAIN : MEAL_TYPE.SNACK,
            dayName: dayName,
            mealSubType: planMeal.slot as MEAL_SUB_TYPE,
            mealplanId: dayMealplan.id,
            mealName: planMeal.slot as string,
            time: planMeal.time,
          },
        }),
      ),
    );

  (await createMealNutritionFromTemplate(templates, dateNutrition)).map(mealNutrition => meals.push(mealNutrition));

  return meals;
};

const collectIntraFuellingMeals = async (dateNutrition: DayNutrition, userId: string) => {
  const meals: MealNutrition[] = [];
  const startOfTheDay = dayjs(dateNutrition.day).startOf("day").toDate();
  const endOfTheDay = dayjs(dateNutrition.day).endOf("day").toDate();
  const workouts = await prisma.workout.findMany({
    where: {
      userId: userId,
      start: { gte: startOfTheDay, lte: endOfTheDay },
    },
    include: {
      intraFuellingMeal: { include: { mealVerification: true } },
    },
  });

  workouts?.map(workout => {
    if (workout.intraFuellingMeal) meals.push(workout.intraFuellingMeal);
  });

  return meals;
};

const collectAdhocMeals = async (dateNutrition: DayNutrition) => {
  const mealsNutrition = await prisma.mealNutrition.findMany({
    where: {
      dayNutrition: dateNutrition,
      mealTemplateId: null,
      status: MEAL_NUTRITION_STATUS.ACTIVE,
      NOT: { mealType: MEAL_TYPE.INTRA_FUELLING },
    },
    include: { mealVerification: true },
  });

  return mealsNutrition ?? [];
};

export const collectDayNutrition = async (dayDate: Date, userId: string) => {
  const dayNutrition = await prisma.dayNutrition.upsert({
    where: {
      userId_day: {
        userId: userId,
        day: dayDate,
      },
    },
    update: {},
    create: { userId: userId, day: dayDate },
  });

  return dayNutrition;
};

export const checkAnyMealVerifications = (meals: ExtendedMeal[]) => {
  let isVerified = false;
  meals.map(meal => {
    if (isVerified) return;
    if (meal.mealVerification) isVerified = true;
  });
  return isVerified;
};

export const isPastFuture = (date: Date) => {
  const today = dayjs().format("YYYY-MM-DD");
  let isPastOrFuture = DAY_TIME.TODAY;
  if (dayjs(date).startOf("day").isAfter(today)) isPastOrFuture = DAY_TIME.FUTURE;
  if (dayjs(date).startOf("day").isBefore(today)) isPastOrFuture = DAY_TIME.PAST;

  return isPastOrFuture;
};

const getDay = async (date: Date, gotrueId: string) => {
  const user = await prisma.user.findUnique({
    where: { gotrueId },
    include: {
      favouriteActivities: {
        where: {
          primary: true,
        },
        include: {
          activity: true,
        },
      },
      dayNutrition: {
        where: {
          day: {
            gte: getStartOfDay(date),
            lte: getEndOfDay(date),
          },
        },
        include: {
          mealNutritions: {
            include: { mealVerification: true, mealTemplate: true, nutrients: true },
          },
        },
      },
      workouts: {
        where: {
          OR: [
            {
              start: {
                gte: getStartOfDay(subDays(date, 1)),
                lte: getEndOfDay(addDays(date, 1)),
              },
              recurring: false,
            },
            {
              recurring: true,
            },
          ],
        },
        orderBy: {
          start: "asc",
        },
        include: {
          activity: {
            include: {
              met: true,
            },
          },
          intraFuellingMeal: {
            include: { mealVerification: true },
          },
        },
      },
      userAudit: {
        orderBy: {
          date: "asc",
        },
        include: { primaryActivity: true },
      },
    },
  });

  if (!user) return null;

  //////////////////////// Prepare Day nutrition records ////////////////////////
  const dayBeforeDate = dayjs(date).subtract(1, "day").toDate();
  const dayAfterDate = dayjs(date).add(1, "day").toDate();

  const dayBeforeNutrition = await collectDayNutrition(dayBeforeDate, user.id);
  let dayCurrentNutrition = await collectDayNutrition(date, user.id);
  const dayAfterNutrition = await collectDayNutrition(dayAfterDate, user.id);

  //////////////////////////// Prepare user profile ////////////////////////////
  let dayBeforeMealplanId: string = "";
  let currentDayMealplanId: string = "";
  let dayAfterMealplanId: string = "";

  // We map over the audit table to find the values for the current day.
  const userProfile: any = {
    dob: user.dob,
    goal: user.goal,
    weight: user.weight,
    height: user.height,
    sex: user.sex,
    sleepTime: user.sleepTime,
    wakeTime: user.wakeTime,
    totalActivityDuration: user.totalActivityDuration,
    lifestyleActivity: user.lifestyleActivity,
    mealplanId: user.mealplanId,
    primaryActivityId: user?.favouriteActivities?.[0]?.activityId,
    primaryActivity: user?.favouriteActivities?.[0]?.activity,
  };

  user.userAudit.map(audit => {
    if (isBefore(audit.date, date) || isSameDay(audit.date, date)) {
      userProfile.dob = audit.dob ?? userProfile.dob;
      userProfile.goal = audit.goal ?? userProfile.goal;
      userProfile.weight = audit.weight ?? userProfile.weight;
      userProfile.height = audit.height ?? userProfile.height;
      userProfile.sex = audit.sex ?? userProfile.sex;
      userProfile.sleepTime = audit.sleepTime ?? userProfile.sleepTime;
      userProfile.wakeTime = audit.wakeTime ?? userProfile.wakeTime;
      userProfile.totalActivityDuration = audit.totalActivityDuration ?? userProfile.totalActivityDuration;
      userProfile.lifestyleActivity = audit.lifestyleActivity ?? userProfile.lifestyleActivity;
      userProfile.mealplanId = audit.mealplanId ?? userProfile.mealplanId;
      userProfile.primaryActivityId = audit.primaryActivityId ?? userProfile.primaryActivityId;
      userProfile.primaryActivity = audit.primaryActivity ?? userProfile.primaryActivity;
    }

    if (isSameDay(audit.date, date) && audit.mealplanId) {
      currentDayMealplanId = audit.mealplanId;
    }
    if (isBefore(audit.date, date) && audit.mealplanId) {
      dayBeforeMealplanId = audit.mealplanId;
    }
    if (isSameDay(audit.date, addDays(date, 1)) && audit.mealplanId) {
      dayAfterMealplanId = audit.mealplanId;
    }
  });

  //////////////////////////// Prepare meal pattern ////////////////////////////
  // First look at meal plans, then intrafuelling in workouts, then
  // ad-hoc meals in mealNutritions
  // TODO: consolodate the three calls for three days into one with the day as varible

  // 0) to make sure there are initial meals
  const newUser = await initiateMealPlan(user);

  // 1) Meal Plans for the three days
  if (!currentDayMealplanId && dayBeforeMealplanId) currentDayMealplanId = dayBeforeMealplanId;
  else currentDayMealplanId = newUser.mealplanId ?? "";
  if (!dayAfterMealplanId) dayAfterMealplanId = currentDayMealplanId;

  const daysMeals = await collectMealsNutritions(
    [dayBeforeNutrition, dayCurrentNutrition, dayAfterNutrition],
    [dayBeforeMealplanId, currentDayMealplanId, dayAfterMealplanId],
    user.id,
  );

  const formattedDayBeforeMealplan = formatMealplan(daysMeals.before);
  const formattedCurrentDayMealplan = formatMealplan(daysMeals.current);
  const formattedDayAfterMealplan = formatMealplan(daysMeals.after);
  const mealplans = {
    0: formattedDayBeforeMealplan,
    1: formattedCurrentDayMealplan,
    2: formattedDayAfterMealplan,
  };

  //////////////////////////// Prepare Workouts ////////////////////////////
  // create a template (dictionary) of three days of workouts, The current
  // day (index 1), the day before (index 0,) and the day after (index 2)
  // we need to fill this three days template dictionary with correspanding
  // active workouts. we need to keep this dictionary format to match the
  // engine input
  // TODO: consolidtae this code with the one inside format workout
  const workouts: {
    0: EngineWorkout[];
    1: EngineWorkout[];
    2: EngineWorkout[];
  } = { 0: [], 1: [], 2: [] };
  user?.workouts
    ?.filter(workout => workout.status === WORKOUT_STATUS.ACTIVE)
    ?.map(workout => {
      const formattedWorkout: EngineWorkout = {
        id: workout.id,
        calories: workout.calories || null,
        intensityRPE: workout.intensityRPE,
        timeStart: formatTimes(workout.start),
        duration: Math.abs(differenceInMinutes(workout.start, workout.end)),
        isKey: workout.key,
        isComp: workout.competition,
        intraFuelling: workout.intraFuelling,
        activitySlug: workout.activity.slug,
        activityName: workout.activity.name,
        category: workout.activity.category,
        powerAverage: workout.powerAverage,
        intraFuelling_meal_id: workout.intraFuellingMeal?.id ?? null,
      };

      if (isSameDay(workout.start, subDays(date, 1))) {
        workouts[0].push(formattedWorkout);
      } else if (isSameDay(workout.start, date)) {
        workouts[1].push(formattedWorkout);
      } else {
        workouts[2].push(formattedWorkout);
      }

      return workout;
    });

  //////////////////////////// Prepare is day time ////////////////////////////
  const isPastOrFuture = isPastFuture(date);

  //////////////////////// Prepare yesterday carb per kg ////////////////////////////
  let yesterdayCarbsPerKg = null;
  const yesterday = dayjs(date).subtract(1, "day").toDate();
  const yesterdayNutrition = await prisma.dayNutrition.findFirst({
    where: { day: yesterday, userId: user.id },
  });
  if (yesterdayNutrition) {
    yesterdayCarbsPerKg = yesterdayNutrition.carbsPerKg ?? null;
  }
  /////////////////////////// Prepare DAY INPUT ///////////////////////////////
  const dayInput: DayInput = {
    lifestyle_activity: userProfile.lifestyleActivity ?? user.lifestyleActivity,
    weight_today: userProfile.weight ?? user.weight,
    weight_yesterday: userProfile.weight ?? user.weight, //TODO: figure out yesterday weight
    height: (userProfile.height ?? user.height) / 100,
    goal: userProfile.goal ?? user.goal,
    gender: userProfile.sex ?? user.sex,
    age: new AgeFromDate(userProfile.dob ?? user.dob).age,
    total_activity_duration: userProfile.totalActivityDuration ?? user.totalActivityDuration,
    sleep: getTime(userProfile.sleepTime) ?? getTime(user.sleepTime!),
    wake: getTime(userProfile.wakeTime) ?? getTime(user.wakeTime!),
    is_verified: checkAnyMealVerifications(daysMeals.current),
    meal_patterns: mealplans,
    workouts: workouts,
    carbs_g_per_kg_yesterday: yesterdayCarbsPerKg,
    isPastOrFuture,
    category: userProfile.primaryActivity.category,
  };
  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////// CALL DAY ENGINE /////////////////////////////////
  const engineResult = await engines.day(dayInput);
  //////////////////////////////////////////////////////////////////////////////

  // Update day info
  if (engineResult.macros.carbs_g_per_kg !== dayCurrentNutrition.carbsPerKg)
    dayCurrentNutrition = await prisma.dayNutrition.update({
      where: {
        userId_day: {
          userId: user.id,
          day: date,
        },
      },
      data: {
        carbsPerKg: engineResult.macros.carbs_g_per_kg,
      },
    });

  // Update day macros
  await prisma.$transaction(
    engineResult.macros.macros.map(nutrient => {
      return prisma.nutrients.upsert({
        where: {
          source_dayNutritionId_mealNutritionId_name: {
            source: NUTRIENTS_SOURCE.HEXIS,
            dayNutritionId: dayCurrentNutrition.id,
            mealNutritionId: "",
            name: nutrient.name,
          },
        },
        update: {
          value: nutrient.value,
        },
        create: {
          dayNutritionId: dayCurrentNutrition.id,
          source: NUTRIENTS_SOURCE.HEXIS,
          name: nutrient.name,
          value: nutrient.value,
        },
      });
    }),
  );

  // update meals carb code and macros
  await prisma.$transaction(
    engineResult.meals.map(mealCarbCode => {
      return prisma.mealNutrition.update({
        where: { id: mealCarbCode.meal_id },
        data: { carbCode: mealCarbCode.carb_code ?? CARB_CODE.UNSPECIFIED },
      });
    }),
  );
  const allMacros = engineResult.meals.flatMap(mealCarbCode =>
    mealCarbCode.macros.flatMap(macro => ({
      ...macro,
      meal_id: mealCarbCode.meal_id,
    })),
  );
  await prisma.$transaction(
    allMacros.map(nutrient => {
      return prisma.nutrients.upsert({
        where: {
          source_dayNutritionId_mealNutritionId_name: {
            source: NUTRIENTS_SOURCE.HEXIS,
            dayNutritionId: dayCurrentNutrition.id,
            mealNutritionId: nutrient.meal_id,
            name: nutrient.name,
          },
        },
        update: {
          value: nutrient.value,
        },
        create: {
          mealNutritionId: nutrient.meal_id,
          dayNutritionId: dayCurrentNutrition.id,
          source: NUTRIENTS_SOURCE.HEXIS,
          name: nutrient.name,
          value: nutrient.value,
        },
      });
    }),
  );

  const mealIds = daysMeals.current.map(meal => meal.id);
  const dayMeals: {}[] = [];
  const meals = await prisma.mealNutrition.findMany({
    where: { id: { in: mealIds } },
    include: { mealVerification: true, nutrients: true, dayNutrition: true },
  });

  let energyCurrent = 0;
  let fatCurrent = 0;
  let carbsCurrent = 0;
  let proteinCurrent = 0;
  const addMacro = (name: string, value: number) => {
    if (name === "energy") energyCurrent += value;
    if (name === "fat") fatCurrent += value;
    if (name === "carbs") carbsCurrent += value;
    if (name === "protein") proteinCurrent += value;
  };

  //carbohydrate is mostly used to transform data from Nutritics to Hexis. Hexis uses carb.

  await Promise.all(
    meals
      .filter(meal => meal.status === MEAL_NUTRITION_STATUS.ACTIVE)
      .map(async meal => {
        const mealVerification = meal?.mealVerification;
        if (mealVerification?.energy) {
          addMacro("energy", mealVerification?.energy);
          addMacro("fat", await loggedMacros(mealVerification.id, "fat"));
          addMacro("carbs", await loggedMacros(mealVerification.id, "carbohydrate"));
          addMacro("protein", await loggedMacros(mealVerification.id, "protein"));
        }
        dayMeals.push({
          ...meal,
          energy: Math.round(meal.nutrients.find(nutrient => nutrient.name === "energy")?.value ?? 0),
          fat: Math.round(meal.nutrients.find(nutrient => nutrient.name === "fat")?.value ?? 0),
          carb: Math.round(meal.nutrients.find(nutrient => nutrient.name === "carb")?.value ?? 0),
          protein: Math.round(meal.nutrients.find(nutrient => nutrient.name === "protein")?.value ?? 0),
        });
      }),
  );
  const macros: DayMacros = {
    energy: engineResult.macros.macros.find(nutrient => nutrient.name === "energy")?.value ?? 0,
    fat: engineResult.macros.macros.find(nutrient => nutrient.name === "fat")?.value ?? 0,
    carb: engineResult.macros.macros.find(nutrient => nutrient.name === "carb")?.value ?? 0,
    protein: engineResult.macros.macros.find(nutrient => nutrient.name === "protein")?.value ?? 0,
    energyCurrent,
    fatCurrent,
    carbsCurrent,
    proteinCurrent,
  };

  const sameDayWorkouts = user.workouts.filter(workout => isSameDay(workout.start, date));
  // Attach intra-fuelling meal details
  const daysWorkouts = sameDayWorkouts.map(workout => {
    let workoutInstance = { ...workout };
    meals.map(meal => {
      if (meal.id === workout.intraFuellingMeal?.id) {
        const intraFuellingMeal = { ...workout.intraFuellingMeal };
        for (const key of ["energy", "fat", "carb", "protein"]) {
          Object.assign(intraFuellingMeal, { [key]: meal.nutrients.find(nutrient => nutrient.name === key)?.value ?? 0 });
        }

        workoutInstance = { ...workoutInstance, intraFuellingMeal: intraFuellingMeal };
      }
    });
    return workoutInstance;
  });

  const intraFuellingRecommendations = engineResult?.intraworkout_fuelling?.map(recommendation => {
    const { workout_id, display_unit, carbs, kcal, ...rest } = recommendation;
    const workoutId: string = workout_id;
    return { ...rest, workoutId, unit: display_unit, carb: carbs, energy: kcal };
  });
  const notes = await prisma.coachNotes.findMany({
    where: {
      clientId: user.id,
      type: COACH_NOTE_TYPES.DAY,
      dayNoteDay: {
        gte: getStartOfDay(date),
        lte: getEndOfDay(date),
      },
    },
  });

  return {
    date,
    macros,
    meals: dayMeals,
    workouts: daysWorkouts,
    carbRanges: engineResult.ranges,
    fuelCoach: engineResult.fuel_coach,
    intraFuellingRecommendations: intraFuellingRecommendations,
    dayNotes: notes,
    dayNutrition: dayCurrentNutrition,
  };
};

export default getDay;
