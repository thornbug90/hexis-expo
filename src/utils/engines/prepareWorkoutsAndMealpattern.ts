import { addDays, endOfDay, isBefore, isSameDay, startOfDay, subDays } from "date-fns";
import { WORKOUT_STATUS } from "@prisma/client";
import prisma from "../../lib/prisma";
import formatMealplan from "./formatMealplan";
import formatWorkouts from "./formatWorkouts";
import { checkAnyMealVerifications, collectDayNutrition, collectMealsNutritions } from "../../models/getDay";
import dayjs from "dayjs";
import { initiateMealPlan } from "../../models/mealPlan";

const prepareWorkoutsAndMealpattern = async (date: Date, gotrueId: string) => {
  const user = await prisma.user.findUnique({
    where: { gotrueId },
    include: {
      favouriteActivities: {
        where: { primary: true },
        include: {
          activity: true,
        },
      },
      mealplan: {
        include: {
          mealTemplates: true,
        },
      },
      userAudit: {
        orderBy: {
          date: "asc",
        },
        include: { primaryActivity: true },
      },
      workouts: {
        where: {
          status: WORKOUT_STATUS.ACTIVE,
          OR: [
            {
              start: {
                gte: startOfDay(subDays(date, 1)),
                lte: endOfDay(addDays(date, 1)),
              },
              recurring: false,
            },
            {
              recurring: true,
              recurringDeleted: null,
              recurringInterval: "WEEKLY",
              recurringDay: {
                in: [date.getDay(), subDays(date, 1).getDay(), addDays(date, 1).getDay()],
              },
            },
          ],
        },
        include: {
          activity: {
            include: {
              met: true,
            },
          },
          intraFuellingMeal: true,
        },
      },
    },
  });

  if (
    !user ||
    !user.sex ||
    !user.goal ||
    !user.sleepTime ||
    !user.wakeTime ||
    !user.dob ||
    !user.height ||
    !user.lifestyleActivity ||
    !user.weight ||
    !user.mealplan
  )
    return null;

  //////////////////////////// Prepare user profile ////////////////////////////
  // We map over the audit table to find the values for the current day.
  const userProfile = {
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
    primaryActivityId: user.favouriteActivities[0].activityId,
    primaryActivity: user.favouriteActivities[0].activity,
  };

  let dayBeforeMealplanId: string = "";
  let currentDayMealplanId: string = "";
  let dayAfterMealplanId: string = "";

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

  //////////////////////// Prepare Day nutrition records ////////////////////////
  const dayBeforeDate = dayjs(date).subtract(1, "day").toDate();
  const dayAfterDate = dayjs(date).add(1, "day").toDate();

  const dayBeforeNutrition = await collectDayNutrition(dayBeforeDate, user.id);
  const dayCurrentNutrition = await collectDayNutrition(date, user.id);
  const dayAfterNutrition = await collectDayNutrition(dayAfterDate, user.id);

  //////////////////////////// Prepare meal pattern ////////////////////////////
  // First look at meal plans, then intrafuelling in workouts, then
  // ad-hoc meals in mealNutritions
  // TODO: consolodate the three calls for three days into one with the day as varible

  //0) initiateMealPlan to make sure there are initial meals
  await initiateMealPlan(user);

  // 1) Meal Plans for the three days
  if (!currentDayMealplanId) currentDayMealplanId = dayBeforeMealplanId;
  if (!dayAfterMealplanId) dayAfterMealplanId = currentDayMealplanId;

  const daysMeals = await collectMealsNutritions(
    [dayBeforeNutrition, dayCurrentNutrition, dayAfterNutrition],
    [dayBeforeMealplanId, currentDayMealplanId, dayAfterMealplanId],
    user.id,
  );

  const mealpattern0 = formatMealplan(daysMeals.before);
  const mealpattern1 = formatMealplan(daysMeals.current);
  const mealpattern2 = formatMealplan(daysMeals.after);

  //////////////////////////// Prepare Workouts ////////////////////////////
  const workouts = formatWorkouts(user.workouts, date);

  return {
    workouts,
    mealpatterns: [mealpattern0, mealpattern1, mealpattern2],
    user: { ...user, ...userProfile } as typeof user,
    isVerified: checkAnyMealVerifications(daysMeals.current),
  };
};

export default prepareWorkoutsAndMealpattern;
