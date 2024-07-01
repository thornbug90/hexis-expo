import { MEAL_NUTRITION_STATUS, MEAL_TYPE } from "@prisma/client";
import dayjs from "dayjs";
import { ExtendedMeal } from "../../models/getDay";
import { MealPattern } from "../../lib/types/engine";

const formatMealplan = (meals: ExtendedMeal[]): MealPattern[] => {
  const mealpattern: MealPattern[] = [];
  meals.map(meal => {
    const mealTime = meal.mealType === MEAL_TYPE.INTRA_FUELLING ? meal.workout?.start : meal.time;
    let log = undefined;
    if (meal.mealVerification)
      log = {
        skippedMeal: meal.mealVerification.skipped ?? false,
        calories: meal.mealVerification.energy ?? undefined,
        mealTime: meal.mealVerification.time ? dayjs(meal.mealVerification.time).utc().format("HH:mm") : undefined,
      };
    if (meal.status === MEAL_NUTRITION_STATUS.ACTIVE)
      mealpattern.push({
        meal_id: meal.id,
        type: meal.mealType,
        sub_type: meal.mealSubType,
        timing: dayjs(mealTime).utc().format("HH:mm"),
        is_verified: meal.mealVerification ? true : false,
        ...(log && { log }),
        // current macros entred by coach
        // TODO: add coach nutrients here
        //nutrients:meal.nutrients
      });
  });

  return mealpattern;
};

export default formatMealplan;
