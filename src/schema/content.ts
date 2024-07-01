import { CARB_CODE, MEAL_TYPE } from "@prisma/client";
import { gql } from "apollo-server";
import authenticated from "../middleware/authenticated";

const imageBaseUrl = process.env.SUPABASE_IMAGE_ASSETS_URL!;

const mealInspiration = {
  messages: {
    main: {
      low: [
        "Low carb meals are predominantly protein and vegetable based.",
        "Best for periods of lower energy requirements.",
        "Can support improvements in body composition and weight management.",
      ],
      medium: [
        "Medium carb meals are traditionally balanced meals.",
        "Best for periods of moderate energy requirements.",
        "Can aid fuelling and recovery for a range of exercise and activity levels.",
      ],
      high: [
        "High carb meals are predominantly carbohydrate based and contain moderate amounts of protein and vegetables.",
        "Best for periods of higher energy requirements.",
        "Ideal to help fuel for, and recover from, big workouts.",
      ],
    },
    snack: {
      low: [
        "Low carb snacks are predominantly protein and/or fat based.",
        "Best for periods of lower energy requirements.",
        "Can support improvements in body composition and weight management.",
      ],
      medium: [
        "Medium carb snacks traditionally contain both carbohydrate and protein.",
        "Best for periods of moderate energy requirements.",
        "Can aid fuelling and recovery for a range of exercise and activity levels. ",
      ],
      high: [
        "High carb snacks are predominantly carbohydrate based.",
        "Best for periods of higher energy requirements.",
        "Ideal to help fuel for, and recover from, big workouts.",
      ],
    },
  },
};

const macroMessages = {
  carbs: {
    short: "Carbohydrates play a vital role in fuelling for and recovering from exercise.",
    long: "Our bodies perform and adapt optimally when we tailor our carbohydrate intake according to the ever changing demands of our workouts, lifestyle and goals.",
  },
  protein: {
    short: "Protein helps maintain, protect and grow lean muscle, as well as supporting repair following exercise.",
    long: "Our bodies work best when we distribute our protein intake evenly throughout the day. Aim to consume a serving of protein every 3-4 hours during the day.",
  },
  fat: {
    short: "High quality fats support hormone production, immune function and aid our body’s absorption of a range of vitamins.",
    long: "High quality fats include mono- and poly-unsaturared fats. These can be typically found in foods such as nuts, seeds, fish, avocados and olive oil.",
  },
};

const typeDefs = gql`
  type MacroMessages {
    carbs: MacrosMessage!
    fat: MacrosMessage!
    protein: MacrosMessage!
  }

  type MacrosMessage {
    short: String!
    long: String!
  }

  type MealInspiration {
    messages: [String!]!
    images: [String!]!
  }

  type CarbCodesInfo {
    type: MEAL_TYPE!
    carbCode: CARB_CODE!
    messages: [String!]!
    images: [String!]!
  }

  type Query {
    macroMessages: MacroMessages!
    mealInspiration(mealType: MEAL_TYPE, carbCode: CARB_CODE): MealInspiration!
    carbCodeSystem: [CarbCodesInfo!]!
  }
`;

const resolvers = {
  Query: {
    macroMessages: authenticated(async () => {
      return macroMessages;
    }),
    carbCodeSystem: authenticated(() => {
      const types: MEAL_TYPE[] = [MEAL_TYPE.MAIN, MEAL_TYPE.SNACK];
      const carbCodes = ["low", "medium", "high"];

      const result: any = [];

      types.map(type => {
        const typeIdx = String(type).toLowerCase();
        carbCodes.map(carbCode => {
          result.push({
            type: type,
            carbCode: carbCode.toUpperCase(),
            messages: mealInspiration.messages[typeIdx as "main" | "snack"][carbCode as "low" | "medium" | "high"],
            images:
              type === MEAL_TYPE.MAIN
                ? [
                    `${imageBaseUrl}/meal_inspiration/${carbCode}_carb_guide.jpg`,
                    `${imageBaseUrl}/meal_inspiration/${carbCode}_carb_plate.jpg`,
                  ]
                : [],
          });
          return;
        });
      });

      return result;
    }),
    mealInspiration: authenticated((_, { mealType, carbCode }: { mealType: MEAL_TYPE; carbCode: CARB_CODE }) => {
      const isSnack = mealType === MEAL_TYPE.SNACK;
      const carbCodeLower = carbCode.toLowerCase();

      return {
        messages: mealInspiration.messages[isSnack ? "snack" : "main"][carbCodeLower as "low" | "medium" | "high"],
        images: [
          `${imageBaseUrl}/meal_inspiration/${carbCodeLower}_carb_guide.jpg`,
          `${imageBaseUrl}/meal_inspiration/${carbCodeLower}_carb_plate.jpg`,
        ],
      };
    }),
  },
};

export default { typeDefs, resolvers };
