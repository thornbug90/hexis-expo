import { AuthenticationError, gql } from "apollo-server";
import prisma from "../lib/prisma";
import authenticated from "../middleware/authenticated";

export type CarbRanges = {
  mainRange: CarbRange;
  snackRange: CarbRange;
};

type CarbRange = {
  lowMin: number;
  lowMax: number;
  medMin: number;
  medMax: number;
  highMin: number;
  highMax: number;
};

const typeDefs = gql`
  type CarbRanges {
    mainRange: CarbRange!
    snackRange: CarbRange!
  }

  type CarbRange {
    lowMin: Float!
    lowMax: Float!
    medMin: Float
    medMax: Float!
    highMin: Float!
    highMax: Float!
  }

  type Query {
    carbRange: CarbRanges
  }
`;

const resolvers = {
  Query: {
    carbRange: authenticated(async (_, _a, { req: { gotrueId } }) => {
      const user = await prisma.user.findUnique({
        where: { gotrueId },
        select: {
          totalActivityDuration: true,
          weight: true,
          favouriteActivities: {
            where: { primary: true },
            include: {
              activity: {
                select: { levelType: true },
              },
            },
          },
        },
      });

      if (!user) throw new AuthenticationError("You must be logged in to do this.");

      if (!user.weight || !user.favouriteActivities[0].activity.levelType || !user.weight) return null;

      /* const carbRanges = await engines.carbRanges({
        activity_level_type: user.favouriteActivities[0].activity.levelType,
        total_activity_duration: user.totalActivityDuration!,
        weight: user.weight!,
      });

      const renameCarbRange = renameKeys({
        low_min: "lowMin",
        low_max: "lowMax",
        med_min: "medMin",
        med_max: "medMax",
        high_min: "highMin",
        high_max: "highMax",
      });
 */
      /*       return {
        mainRange: { ...renameCarbRange(carbRanges.main_ranges), lowMin: 0 },
        snackRange: { ...renameCarbRange(carbRanges.snack_ranges), lowMin: 0 },
      }; */

      // return dummy data
      return {
        mainRange: { lowMin: 0, lowMax: 1, medMin: 2, medMax: 3, highMin: 4, highMax: 5 },
        snackRange: { lowMin: 0, lowMax: 1, medMin: 2, medMax: 3, highMin: 4, highMax: 5 },
      };
    }),
  },
};

export default { typeDefs, resolvers };
