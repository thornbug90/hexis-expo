import set from "date-fns/set";
import { Goal, Meal_Name } from "../generated/graphql";

const loseAndMaintain = {
  [Meal_Name.Breakfast]: set(new Date(), {
    hours: 8,
    minutes: 30,
    seconds: 0,
    milliseconds: 0,
  }),
  [Meal_Name.AmSnack]: set(new Date(), {
    hours: 11,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  }),
  [Meal_Name.Lunch]: set(new Date(), {
    hours: 13,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  }),
  [Meal_Name.PmSnack]: set(new Date(), {
    hours: 16,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  }),
  [Meal_Name.Dinner]: set(new Date(), {
    hours: 19,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  }),
  [Meal_Name.PreBedSnack]: set(new Date(), {
    hours: 21,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  }),
};

export const defaultMeals = {
  [Goal.Gain]: {
    [Meal_Name.Breakfast]: set(new Date(), {
      hours: 8,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    }),
    [Meal_Name.AmSnack]: set(new Date(), {
      hours: 10,
      minutes: 30,
      seconds: 0,
      milliseconds: 0,
    }),
    [Meal_Name.Lunch]: set(new Date(), {
      hours: 13,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    }),
    [Meal_Name.PmSnack]: set(new Date(), {
      hours: 16,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    }),
    [Meal_Name.Dinner]: set(new Date(), {
      hours: 19,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    }),
    [Meal_Name.PreBedSnack]: set(new Date(), {
      hours: 21,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    }),
  },
  [Goal.Lose]: loseAndMaintain,
  [Goal.Maintain]: loseAndMaintain,
};

export const defaultMealplans = {
  [Goal.Gain]: {
    [Meal_Name.Breakfast]: defaultMeals[Goal.Gain][Meal_Name.Breakfast],
    [Meal_Name.AmSnack]: defaultMeals[Goal.Gain][Meal_Name.AmSnack],
    [Meal_Name.Lunch]: defaultMeals[Goal.Gain][Meal_Name.Lunch],
    [Meal_Name.PmSnack]: defaultMeals[Goal.Gain][Meal_Name.PmSnack],
    [Meal_Name.Dinner]: defaultMeals[Goal.Gain][Meal_Name.Dinner],
    [Meal_Name.PreBedSnack]: defaultMeals[Goal.Gain][Meal_Name.PreBedSnack],
  },
  [Goal.Maintain]: {
    [Meal_Name.Breakfast]: defaultMeals[Goal.Maintain][Meal_Name.Breakfast],
    [Meal_Name.Lunch]: defaultMeals[Goal.Maintain][Meal_Name.Lunch],
    [Meal_Name.PmSnack]: defaultMeals[Goal.Maintain][Meal_Name.PmSnack],
    [Meal_Name.Dinner]: defaultMeals[Goal.Maintain][Meal_Name.Dinner],
    [Meal_Name.PreBedSnack]: defaultMeals[Goal.Maintain][Meal_Name.PreBedSnack],
  },
  [Goal.Lose]: {
    [Meal_Name.Breakfast]: defaultMeals[Goal.Lose][Meal_Name.Breakfast],
    [Meal_Name.Lunch]: defaultMeals[Goal.Lose][Meal_Name.Lunch],
    [Meal_Name.PmSnack]: defaultMeals[Goal.Lose][Meal_Name.PmSnack],
    [Meal_Name.Dinner]: defaultMeals[Goal.Lose][Meal_Name.Dinner],
  },
};
