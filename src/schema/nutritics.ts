import { gql } from "apollo-server";
import prisma from "../lib/prisma";
import authenticated from "../middleware/authenticated";
import { MEAL_TYPE, NUTRITICS_OBJ_TYPE, NutriticsObject as RawNutriticsObject } from "@prisma/client";
import { convertRawNutriticsObject, convertHexisFoodObject } from "../models/nutritics";

type NutriticsObject = {
  id: string;
  type: NUTRITICS_OBJ_TYPE;
  name: string;
  description: string | null;
  quantity: Portion;
  nutrients: Nutrient[];
  portions: Portion[];
  tags: Tag[];
  liquid: boolean;
};
type Tag = {
  name: string;
  checked: boolean;
};
type Portion = {
  unit: string;
  value: number;
  name: string;
};
type Nutrient = {
  name: string;
  slug: string;
  value?: number;
  percentRI?: number;
  unit?: string;
  nutrients?: Nutrient[];
};
type FoodLog = {
  foodObjects: NutriticsObject[];
  quantities: number[];
  portions: Portion[];
};

type NutriticsObjectInput = {
  type: NUTRITICS_OBJ_TYPE;
  name: string;
  description: string;
  quantity: Portion;
  nutrients: Nutrient[];
  portions: Portion[];
  tags: Tag[];
  liquid: boolean;
};

const typeDefs = gql`
  type Nutrient {
    name: String
    slug: String
    value: Float
    percentRI: Float
    unit: String
    nutrients: [Nutrient]
  }

  type Portion {
    unit: String
    value: Float
    name: String
  }

  type Tag {
    name: String
    checked: Boolean
  }
  input NutrientInput {
    name: String
    slug: String
    value: Float
    unit: String
    nutrients: [NutrientInput]
  }

  input PortionInput {
    unit: String
    value: Float
    name: String
  }

  input TagInput {
    name: String
    checked: Boolean
  }

  type NutriticsObject {
    id: ID!
    type: NUTRITICS_OBJ_TYPE!
    name: String!
    description: String
    quantity: Portion!
    nutrients: [Nutrient]!
    portions: [Portion]!
    tags: [Tag]!
    liquid: Boolean
  }

  type FoodLog {
    foodObjects: [NutriticsObject]!
    quantities: [Float]!
    portions: [Portion]!
  }

  type Query {
    search(nutriticsObjType: NUTRITICS_OBJ_TYPE, keywords: String, userFoodOnly: Boolean, mealType: MEAL_TYPE): [NutriticsObject]
    foodLog(verificationId: String!): FoodLog!
  }

  input NutriticsObjectInput {
    type: NUTRITICS_OBJ_TYPE
    name: String
    description: String
    quantity: PortionInput
    nutrients: [NutrientInput]
    portions: [PortionInput]
    liquid: Boolean
  }

  type Mutation {
    addNutriticsObj(input: NutriticsObjectInput!): NutriticsObject!
    updateNutriticsObj(id: ID!, input: NutriticsObjectInput!): NutriticsObject!
  }

  enum NUTRITICS_OBJ_TYPE {
    food
    recipe
  }
`;

const resolvers = {
  Mutation: {
    addNutriticsObj: authenticated(async (_, { input }: { input: NutriticsObjectInput }, { req: { gotrueId } }) => {
      const user = await prisma.user.findUnique({ where: { gotrueId }, select: { id: true } });
      // save the object locally
      const rawFoodObj = convertHexisFoodObject(input);
      const rawRecord = await prisma.nutriticsObject.create({ data: { ...rawFoodObj, userId: user?.id } });
      return convertRawNutriticsObject(rawRecord);
    }),
    updateNutriticsObj: authenticated(async (_, { id, input }: { id: string; input: NutriticsObjectInput }, { req: { gotrueId } }) => {
      const user = await prisma.user.findUnique({ where: { gotrueId }, select: { id: true } });

      // save the object locally
      const rawFoodObj = convertHexisFoodObject(input);
      const rawRecord = await prisma.nutriticsObject.update({ where: { id: id }, data: { ...rawFoodObj, userId: user?.id } });
      return convertRawNutriticsObject(rawRecord);
    }),
  },
  Query: {
    search: authenticated(
      async (
        _,
        {
          nutriticsObjType,
          keywords,
          userFoodOnly,
          mealType,
        }: { nutriticsObjType: NUTRITICS_OBJ_TYPE; keywords: string; userFoodOnly: boolean; mealType: MEAL_TYPE },
        { req: { gotrueId } },
      ) => {
        nutriticsObjType;
        const user = await prisma.user.findUnique({
          where: { gotrueId },
          select: {
            id: true,
            dayNutrition: {
              select: { mealNutritions: { select: { mealVerification: { select: { id: true } } }, where: { mealType } } },
              take: 7,
              orderBy: { day: "desc" },
            },
          },
        });

        const results: NutriticsObject[] = [];
        let rawResults: RawNutriticsObject[] = [];

        const formatted_keywords_search = keywords.trim().replace(new RegExp(" ", "g"), "&");

        const userMealVerificationIds: string[] = [];
        if (user)
          user.dayNutrition.flatMap(day =>
            day.mealNutritions.flatMap(meal => {
              if (meal.mealVerification?.id) userMealVerificationIds.push(meal.mealVerification?.id);
            }),
          );

        if (userFoodOnly) {
          rawResults = await prisma.nutriticsObject.findMany({ where: { userId: user?.id }, orderBy: { created_at: "desc" } });
        } else if (keywords) {
          rawResults = await prisma.nutriticsObject.findMany({
            where: { AND: { name: { search: formatted_keywords_search }, userId: user?.id } },
          });
          const rawResultsAll = await prisma.nutriticsObject.findMany({
            take: 50,
            where: { name: { search: formatted_keywords_search }, userId: null },
          });
          // This block needs work. It looks like we're storing strings of json objects and then trying to parse them with a default of
          // empty strings, then we're trying to do an key lookup on something which may or may not exist. This is very error prone I think
          // and could be significantly improved if we know more about the type of objects we're storing.
          rawResultsAll.sort((a: RawNutriticsObject, b: RawNutriticsObject) => {
            const aJsonObj = JSON.parse(`${a.JSONObj}`);
            const bJsonObj = JSON.parse(`${b.JSONObj}`);

            if (aJsonObj["popularityScore"] > bJsonObj["popularityScore"]) return -1;
            else if (aJsonObj["popularityScore"] < bJsonObj["popularityScore"]) return 1;
            else return 0;
          });

          rawResults = rawResults.concat(rawResultsAll);
        } else {
          const logs = await prisma.log.findMany({
            where: { verificationId: { in: userMealVerificationIds } },
            include: { nutriticsObject: true },
            orderBy: { id: "desc" },
            take: 15,
          });

          for (const log of logs) {
            const exist = rawResults.filter(obj => obj.id == log.nutriticsObject.id);
            if (exist.length < 1) rawResults.push(log.nutriticsObject);
          }
        }

        // mapping raw nutritics object from DB
        for (const result of rawResults) {
          const convertResult = convertRawNutriticsObject(result);
          if (convertResult) results.push(convertResult);
        }

        return results;
      },
    ),
    foodLog: authenticated(async (_, { verificationId }: { verificationId: string }, { req: { gotrueId } }) => {
      gotrueId;
      const results: FoodLog = { foodObjects: [], quantities: [], portions: [] };

      const logs = await prisma.log.findMany({
        where: { verificationId: verificationId },
        include: { nutriticsObject: true },
      });

      for (const log of logs) {
        const convertResult = convertRawNutriticsObject(log.nutriticsObject);
        if (convertResult) results.foodObjects.push(convertResult);
        results.portions.push(JSON.parse(log.portion) as Portion);
        results.quantities.push(log.quantity);
      }

      return results;
    }),
  },
};

export default { typeDefs, resolvers };
export { NutriticsObject, Portion, Nutrient, Tag, NutriticsObjectInput };
