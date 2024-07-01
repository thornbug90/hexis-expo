import { User, UserActivity } from "@prisma/client";
import { gql } from "apollo-server";
import prisma from "../lib/prisma";
import authenticated from "../middleware/authenticated";

const typeDefs = gql`
  type Activity {
    id: ID!
    slug: String!
    name: String
  }

  type FavouriteActivity {
    activityId: ID!
    activity: Activity!
    primary: Boolean!
  }

  extend type User {
    favouriteActivities: [FavouriteActivity]!
  }
  extend type Child {
    favouriteActivities: [FavouriteActivity]!
  }

  input FavouriteActivityInput {
    activityId: ID!
    primary: Boolean!
  }

  type Mutation {
    updateFavouriteActivities(input: [FavouriteActivityInput!]!): [FavouriteActivity]!
  }
`;

const resolvers = {
  Mutation: {
    updateFavouriteActivities: authenticated(
      async (_, { input }: { input: { activityId: string; primary: boolean }[] }, { req: { gotrueId } }) => {
        try {
          const user = await prisma.user.findUnique({
            where: { gotrueId },
            select: {
              id: true,
              favouriteActivities: true,
            },
          });

          await prisma.userActivity.deleteMany({
            where: {
              userId: user!.id!,
            },
          });

          await prisma.userActivity.createMany({
            data: input.map(i => ({ ...i, userId: user!.id })),
          });

          const activities = await prisma.userActivity.findMany({
            where: { userId: user!.id },
          });

          return activities;
        } catch (err) {
          console.error(err);
          return [];
        }
      },
    ),
  },
  User: {
    favouriteActivities: (user: User) => {
      return prisma.userActivity.findMany({
        where: { userId: user.id },
      });
    },
  },
  Child: {
    favouriteActivities: (user: User) => {
      return prisma.userActivity.findMany({
        where: { userId: user.id },
      });
    },
  },
  FavouriteActivity: {
    activity: (userActivity: UserActivity) => {
      return prisma.activity.findUnique({
        where: { id: userActivity.activityId },
      });
    },
  },
};

export default { typeDefs, resolvers };
