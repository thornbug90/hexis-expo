import { AuthenticationError, gql, UserInputError } from "apollo-server";
import { differenceInCalendarDays, differenceInDays } from "date-fns";
import dayjs from "dayjs";
import prisma from "../lib/prisma";
import authenticated from "../middleware/authenticated";
import getDay, { DayMacros } from "../models/getDay";
import { getLiteralDate } from "../utils/dates";
import renameKeys from "../utils/renameKeys";
import { CoachNotes, DayNutrition, MealNutrition, Workout } from "@prisma/client";
import { CarbRangesOutput, IntraFuellingRecommendation } from "../lib/types/engine";

export type Day = {
  date: Date;
  workouts: Workout[];
  meals: MealNutrition[];
  macros: DayMacros;
  carbRanges: CarbRangesOutput;
  fuelCoach: string[];
  intraFuellingRecommendations: IntraFuellingRecommendation[];
  dayNotes: CoachNotes[];
  dayNutrition: DayNutrition;
};

const typeDefs = gql`
  type IntraFuellingRecommendation {
    workoutId: String
    unit: String
    title: String
    message: String
    details: String
    energy: Float
    fat: Float
    carb: Float
    protein: Float
  }

  type Workout {
    id: ID!
    intensity: WORKOUT_INTENSITY
    intensityRPE: Int
    activity: Activity!
    start: DateTime!
    end: DateTime!
    slot: WORKOUT_SLOT!
    key: Boolean!
    competition: Boolean!
    recurring: Boolean!
    source: WORKOUT_SOURCE
    status: WORKOUT_STATUS
    confirmed: Boolean
    externalReference: ID
    calories: Float
    intraFuelling: Boolean
    intraFuellingPrompt: Boolean
    intraFuellingMeal: Meal
    startTime: Time
    powerAverage: Float
  }

  type DayNutrition {
    id: ID!
    userId: ID!
    day: DateTime
    carbsPerKg: Float
  }

  type Day {
    dayNutrition: DayNutrition
    date: Date!
    workouts: [Workout]!
    meals: [Meal]!
    macros: Macros
    carbRanges: CarbRanges
    fuelCoach: [String]
    intraFuellingRecommendations: [IntraFuellingRecommendation]
    dayNotes: [Note]
  }

  type Macros {
    energyCurrent: Float!
    energy: Float!
    carb: Float!
    fat: Float!
    protein: Float!
    carbsCurrent: Float
    fatCurrent: Float
    proteinCurrent: Float
  }

  type Query {
    day(date: DateTime!): Day
    days(startDate: DateTime!, endDate: DateTime!, id: String!): [Day]
  }
`;

const resolvers = {
  Query: {
    day: authenticated(async (_, { date }: { date: Date }, { req: { gotrueId } }) => {
      const user = await prisma.user.findUnique({
        where: { gotrueId },
        select: {
          created: true,
          onboardingComplete: true,
          timezone: true,
        },
      });

      const currentDate = getLiteralDate(date);

      const userDateCreation = dayjs(user!.created).utc().format("YYYY-MM-DD");
      if (!user) throw new AuthenticationError("Must be logged in.");

      // Prevent getting data from before the user was created (because it DOESN'T exist)
      if (dayjs(currentDate).utc().isBefore(userDateCreation, "date")) {
        throw new UserInputError("Cannot go before creating your account.");
      }

      // Prevent getting data 7 days ahead of current date
      if (differenceInDays(currentDate, new Date()) > 7) throw new UserInputError("Can only get up to 7 days ahead");

      return await getDay(currentDate, gotrueId);
    }),
    days: authenticated(
      async (_: unknown, { startDate, endDate, id }: { startDate: Date; endDate: Date; id: string }, { req: { gotrueId } }) => {
        const user = await prisma.user.findUnique({
          where: { id },
          select: {
            created: true,
            gotrueId: true,
            timezone: true,
          },
        });
        const coach = await prisma.user.findUnique({
          where: { gotrueId },
          select: {
            timezone: true,
          },
        });

        const athGotrueId = user?.gotrueId || "";
        const userDateCreation = new Date(dayjs(user!.created).utc().format("YYYY-MM-DD"));
        if (!user) throw new UserInputError("User not found");
        let currentDate = getLiteralDate(
          new Date(
            `${dayjs(startDate)
              .tz(coach?.timezone ? coach.timezone : "")
              .format("YYYY-MM-DD")}T00:00:00Z`,
          ),
        );

        const lastDate = getLiteralDate(
          new Date(
            `${dayjs(endDate)
              .tz(coach?.timezone ? coach.timezone : "")
              .format("YYYY-MM-DD")}T00:00:00Z`,
          ),
        );

        const results = [];

        // adding padding days before
        const currentDiffCreation = differenceInDays(userDateCreation, currentDate);
        const currentDiffToday = differenceInCalendarDays(currentDate, new Date());
        if (currentDiffCreation || currentDiffToday > 0)
          for (let i = 0; i < (currentDiffCreation || currentDiffToday) && i <= 7; i++) {
            const literalDate = getLiteralDate(currentDate);
            results.push({ date: literalDate, workouts: [], meals: [] });
            currentDate.setDate(currentDate.getDate() + 1);
          }
        if (results.length === 7) return results;

        let minDate = new Date();
        minDate.setDate(minDate.getDate() + 6);
        const lastDiff = differenceInDays(lastDate, new Date());
        if (lastDiff < 6) {
          minDate = lastDate;
        }

        while (currentDate <= minDate && results.length < 7) {
          const literalDate = getLiteralDate(currentDate);

          const dayResult = await getDay(literalDate, athGotrueId);
          results.push(dayResult);

          // Increment the current date by 1 day
          currentDate.setDate(currentDate.getDate() + 1);
        }
        // adding padding days after
        while (results.length < 7) {
          const literalDate = getLiteralDate(currentDate);
          results.push({ date: literalDate, workouts: [], meals: [] });
          currentDate.setDate(currentDate.getDate() + 1);
        }

        return results;
      },
    ),
  },
  Day: {
    macros: (day: any) =>
      day.macros
        ? {
            ...day.macros,
          }
        : null,
    meals: (day: any) => day.meals,
    workouts: (day: any) => day.workouts,
    carbRanges: (day: any) => {
      if (day.carbRanges) {
        day.carbRanges;
        const renameCarbRange = renameKeys({
          low_min: "lowMin",
          low_max: "lowMax",
          med_min: "medMin",
          med_max: "medMax",
          high_min: "highMin",
          high_max: "highMax",
        });

        return {
          mainRange: renameCarbRange(day.carbRanges.main_ranges),
          snackRange: renameCarbRange(day.carbRanges.snack_ranges),
        };
      }
      return null;
    },
    dayNutrition: (day: any) => day.dayNutrition,
  },
};

export default { typeDefs, resolvers };
