import { CARB_CODE, MEAL_NUTRITION_STATUS, MEAL_SUB_TYPE, MEAL_TYPE } from "@prisma/client";
import { AuthenticationError, gql, UserInputError } from "apollo-server";
import prisma from "../lib/prisma";
import authenticated from "../middleware/authenticated";
import { updateFoodLog, FoodLogInput, deleteFoodLog } from "../models/nutritics";
import { getLiteralDate } from "../utils/dates";
import getDay from "../models/getDay";

type VerifyMealInput = {
  skipped?: boolean;
  carbCode?: CARB_CODE;
  time?: Date;
  kcal?: number;
  log?: FoodLogInput;
  mealNutritionId: string;
};

type UpdateVerifyMealInput = {
  skipped?: boolean;
  carbCode?: CARB_CODE;
  time?: Date;
  kcal?: number;
  log?: FoodLogInput;
};

type MealInput = {
  mealName?: string;
  time: Date;
  mealType: MEAL_TYPE;
  mealSubType?: MEAL_SUB_TYPE;
  dayId: string;
};

const typeDefs = gql`
  type Meal {
    id: ID!
    mealName: String
    time: Time
    carbCode: CARB_CODE!
    energy: Float
    carb: Float
    fat: Float
    protein: Float
    mealType: MEAL_TYPE
    mealSubType: MEAL_SUB_TYPE
    mealVerification: MealVerification
    status: MEAL_NUTRITION_STATUS
  }

  type MealVerification {
    id: ID!
    skipped: Boolean
    carbCode: CARB_CODE
    time: DateTime
    energy: Float
    mealNutritionId: ID
  }

  input MealInput {
    mealName: String
    time: Time!
    mealType: MEAL_TYPE!
    mealSubType: MEAL_SUB_TYPE
    dayId: ID!
  }

  input FoodLogInput {
    foodObjects: [String]!
    quantities: [Float]!
    portions: [String]!
  }

  input VerifyMealInput {
    skipped: Boolean
    carbCode: CARB_CODE
    time: DateTime
    kcal: Float
    log: FoodLogInput
    mealNutritionId: ID
  }

  input UpdateVerifyMealInput {
    skipped: Boolean
    carbCode: CARB_CODE
    time: DateTime
    kcal: Float
    log: FoodLogInput
  }

  type Mutation {
    addMeal(input: MealInput!): Day!
    updateMeal(id: ID!, input: MealInput!): Day!
    deleteMeal(id: ID!): Day!
    verifyMeal(input: VerifyMealInput!): MealVerification!
    updateVerifyMeal(id: ID!, input: UpdateVerifyMealInput!): MealVerification!
    deleteVerifyMeal(id: ID!): Boolean
  }
`;

const resolvers = {
  Mutation: {
    addMeal: authenticated(async (_, { input }: { input: MealInput }, { req: { gotrueId } }) => {
      const user = await prisma.user.findUnique({
        where: { gotrueId },
        select: {
          id: true,
          created: true,
        },
      });

      if (!user) throw new AuthenticationError("Must be logged in.");

      const mealNutrition = await prisma.mealNutrition.create({
        data: {
          ...input,
          mealSubType: MEAL_SUB_TYPE.UNSPECIFIED,
          status: MEAL_NUTRITION_STATUS.ACTIVE,
        },
        include: { dayNutrition: true },
      });

      if (!mealNutrition) throw new UserInputError("Could not create the meal.");

      const currentDate = getLiteralDate(mealNutrition.dayNutrition.day);

      return await getDay(currentDate, gotrueId);
    }),
    updateMeal: authenticated(async (_, { id, input }: { id: string; input: MealInput }, { req: { gotrueId } }) => {
      const user = await prisma.user.findUnique({
        where: { gotrueId },
        select: {
          id: true,
        },
      });

      if (!user) throw new AuthenticationError("Must be logged in.");

      const mealNutrition = await prisma.mealNutrition.update({
        where: { id },
        data: {
          ...input,
        },
        include: { dayNutrition: true },
      });

      if (!mealNutrition) throw new UserInputError("No meal verification found.");

      const currentDate = getLiteralDate(mealNutrition.dayNutrition.day);

      return await getDay(currentDate, gotrueId);
    }),
    deleteMeal: authenticated(async (_, { id }: { id: string }, { req: { gotrueId } }) => {
      const user = await prisma.user.findUnique({
        where: { gotrueId },
        select: {
          id: true,
        },
      });

      if (!user) throw new AuthenticationError("Must be logged in.");

      const mealNutrition = await prisma.mealNutrition.findUnique({
        where: { id: id },
        include: { dayNutrition: true },
      });
      if (!mealNutrition) throw new UserInputError("No meal to delete.");

      if (mealNutrition.mealTemplateId) {
        await prisma.mealNutrition.update({
          where: { id },
          data: {
            status: MEAL_NUTRITION_STATUS.DELETED,
          },
        });
      } else {
        await prisma.mealNutrition.delete({ where: { id: id }, include: { dayNutrition: true } });
      }

      const currentDate = getLiteralDate(mealNutrition.dayNutrition.day);

      return await getDay(currentDate, gotrueId);
    }),
    updateVerifyMeal: authenticated(async (_, { id, input }: { id: string; input: UpdateVerifyMealInput }, { req: { gotrueId } }) => {
      const user = await prisma.user.findUnique({
        where: { gotrueId },
        select: {
          id: true,
          mealVerifications: {
            where: { id },
          },
        },
      });

      if (!user) throw new AuthenticationError("Must be logged in.");

      if (user.mealVerifications.length === 0) throw new UserInputError("No meal verification found.");

      const mealVerification = await prisma.mealVerification.update({
        where: { id },
        data: {
          skipped: input.skipped,
          carbCode: input.carbCode,
          time: input.time,
          energy: input.kcal,
        },
      });
      if (input.log) await updateFoodLog(input.log, id);

      return mealVerification;
    }),
    deleteVerifyMeal: authenticated(async (_, { id }: { id: string }, { req: { gotrueId } }) => {
      const user = await prisma.user.findUnique({
        where: { gotrueId },
        select: { id: true, mealVerifications: { where: { id } } },
      });

      if (!user) throw new AuthenticationError("Must be logged in.");
      if (user.mealVerifications.length === 0) throw new UserInputError("No meal verification found.");

      await prisma.mealVerification.delete({ where: { id } });
      await deleteFoodLog(id);

      return true;
    }),

    verifyMeal: authenticated(async (_, { input }: { input: VerifyMealInput }, { req: { gotrueId } }) => {
      const user = await prisma.user.findUnique({
        where: { gotrueId },
        select: {
          id: true,
        },
      });

      if (!user) throw new AuthenticationError("You must be logged in");

      const verification = await prisma.mealVerification.create({
        data: {
          skipped: input.skipped,
          carbCode: input.carbCode,
          time: input.time,
          energy: input.kcal,
          mealNutritionId: input.mealNutritionId,
          userId: user.id,
        },
      });
      if (input.log) await updateFoodLog(input.log, verification.id);
      return verification;
    }),
  },
  Meal: {
    mealVerification: (meal: any) => meal.mealVerification,
  },
};

export default { typeDefs, resolvers };
