import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { mealNutrition } from "../../__test__/common.fixture";
import { ExtendedMeal } from "../../models/getDay";
import formatMealplan from "./formatMealplan";

dayjs.extend(utc);
describe("formatMealplan", () => {
  const meals: ExtendedMeal[] = [mealNutrition, mealNutrition];
  const formatMealplanResponse = [
    {
      meal_id: mealNutrition.id,
      type: mealNutrition.mealType,
      sub_type: mealNutrition.mealSubType,
      timing: dayjs(mealNutrition.time).utc().format("HH:mm"),
      is_verified: false,
    },
    {
      meal_id: mealNutrition.id,
      type: mealNutrition.mealType,
      sub_type: mealNutrition.mealSubType,
      timing: dayjs(mealNutrition.time).utc().format("HH:mm"),
      is_verified: false,
    },
  ];
  it("should format mealplan to engine's format.", () => {
    expect(formatMealplan(meals)).toEqual(formatMealplanResponse);
  });
});
