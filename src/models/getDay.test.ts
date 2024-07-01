import { athlete, workout, mealNutrition, coachNote } from "../__test__/common.fixture";
import { Day } from "../schema/day";
// const dayNutrition = {}
const dayResponse = {
  date: new Date(),
  macros: {
    energy: 1,
    fat: 1,
    carb: 1,
    protein: 1,
    energyCurrent: 1,
    fatCurrent: 1,
    carbsCurrent: 1,
    proteinCurrent: 1,
  },
  meals: [mealNutrition, mealNutrition],
  workouts: [workout, workout],
  carbRanges: {
    main_ranges: {
      low_min: 1,
      low_max: 1,
      med_min: 1,
      med_max: 1,
      high_min: 1,
      high_max: 1,
    },
    snack_ranges: {
      low_min: 1,
      low_max: 1,
      med_min: 1,
      med_max: 1,
      high_min: 1,
      high_max: 1,
    },
  },
  fuelCoach: ["123", "123"],
  intraFuellingRecommendations: [
    {
      meal_id: "123",
      display_unit: "kg",
      title: "123",
      message: "123",
      details: "123",
      workout_id: "",
      kcal: 0,
      fat: 0,
      carbs: 0,
      protein: 0,
    },
  ],
  dayNotes: [coachNote, coachNote],
  dayNutrition: {
    id: "day nutrition id",
    userId: "user id",
    day: new Date("24-04-10T00:00:00Z"),
    carbsPerKg: 0,
  },
};

import getDay from "./getDay";

describe("getDay", () => {
  describe("getDay", () => {
    it.skip("should call the engine and get day macros and carb codes", () => {
      const date = new Date("2024-03-20T10:30:00.000Z");
      expect(getDay(date, athlete.gotrueId)).resolves.toMatchObject<Day>(dayResponse);
    });
  });
});
