import { Workout, WORKOUT_SLOT, WORKOUT_SOURCE, WORKOUT_STATUS } from "@prisma/client";
import { gql } from "apollo-server";
import prisma from "../lib/prisma";
import authenticated from "../middleware/authenticated";
import { createWorkout } from "../models/workout";
import { CreateWorkoutInput } from "./workouts";

type GroupInput = {
  name: string;
  description: string;
  link: string;
};

const typeDefs = gql`
  type GroupAndMemberCount {
    memberCount: Int!
    group: Group!
  }
  type Group {
    id: ID!
    coach: User!
    name: String!
    description: String
    createdAt: DateTime!
    link: String
    clients: [User]
  }

  type Query {
    groups: [GroupAndMemberCount]!
    groupClients(id: ID!): [User]!
  }

  input CreateGroupInput {
    name: String!
    description: String
    link: String
  }

  input UpdateGroupInput {
    name: String
    description: String
    link: String
  }

  type Mutation {
    deleteGroup(id: ID!): Group!
    updateGroup(id: ID!, input: UpdateGroupInput!): Group!
    createGroup(input: CreateGroupInput!): Group!
    updateClients(id: ID!, clientIds: [String]!): [User]!
    addGroupWorkout(id: ID!, input: CreateWorkoutInput!): [Workout]
  }
`;

const resolvers = {
  Mutation: {
    createGroup: authenticated(async (_, { input }: { input: GroupInput }, { req: { gotrueId } }) => {
      const userObj = await prisma.user.findUnique({
        where: { gotrueId },
      });

      if (!userObj || !userObj.id) throw new Error("user not exist!");

      const group = await prisma.group.create({
        data: {
          ...input,
          createdAt: new Date(),

          coachId: userObj!.id,
        },
        include: { coach: true },
      });

      return group;
    }),
    updateGroup: authenticated(async (_, { id, input }: { id: string; input: GroupInput }, { req: { gotrueId } }) => {
      const userObj = await prisma.user.findUnique({
        where: { gotrueId },
      });
      if (!userObj) throw new Error("user not exist!");

      await prisma.group.updateMany({
        where: { id: id, coachId: userObj.id },
        data: { ...input },
      });

      const updatedGroup = await prisma.group.findUnique({
        where: { id: id },
        include: { coach: true },
      });

      return updatedGroup;
    }),
    deleteGroup: authenticated(async (_, { id }: { id: string }, { req: { gotrueId } }) => {
      const userObj = await prisma.user.findUnique({
        where: { gotrueId },
      });
      if (!userObj) throw new Error("user not exist!");

      const deletedGroup = await prisma.group.findUnique({
        where: { id: id },
        include: { coach: true },
      });

      await prisma.group.deleteMany({
        where: { id: id, coachId: userObj.id },
      });

      return deletedGroup;
    }),
    updateClients: authenticated(async (_, { id, clientIds }: { id: string; clientIds: string[] }, { req: { gotrueId } }) => {
      const userObj = await prisma.user.findUnique({
        where: { gotrueId },
      });
      if (!userObj) throw new Error("user not exist!");

      const clients = await prisma.user.findMany({
        where: { id: { in: clientIds } },
      });

      if (clientIds.length > 0 && (!clients || clients.length < 1)) throw new Error("clients are not exist!");

      const group = await prisma.group.findMany({
        where: { id: id, coachId: userObj.id },
        include: { clients: true },
      });
      if (!group) throw new Error("Group is not exist!");

      let existClient: string[] = [];
      if (group[0].clients) existClient = group[0].clients.map(existClient => existClient.id);

      const clientsGroup: { id: string }[] = [];
      const notClientsGroup: { id: string }[] = [];
      clients.map(client => {
        clientsGroup.push({ id: client.id });
      });
      existClient.map(existClientId => {
        if (!clients.find(eclient => eclient.id == existClientId)) notClientsGroup.push({ id: existClientId });
      });

      const updatedGroup = await prisma.group.update({
        where: { id: group[0].id },
        data: {
          clients: {
            connect: clientsGroup,
            disconnect: notClientsGroup,
          },
        },
        include: { clients: true },
      });

      return updatedGroup.clients;
    }),
    addGroupWorkout: authenticated(async (_, { id, input }: { id: string; input: CreateWorkoutInput }, { req: { gotrueId } }) => {
      const userObj = await prisma.user.findUnique({
        where: { gotrueId },
      });
      if (!userObj) throw new Error("user not exist!");

      const group = await prisma.group.findMany({
        where: { id: id, coachId: userObj.id },
        include: { clients: true },
      });
      if (!group) throw new Error("Group is not exist!");
      const workouts: Workout[] = [];

      await Promise.all(
        group[0].clients.map(async client => {
          workouts.push(
            await createWorkout(
              {
                ...input,
                source: WORKOUT_SOURCE.COACH,
                status: WORKOUT_STATUS.ACTIVE,
                slot: input.slot ? input.slot : WORKOUT_SLOT.UNSPECIFIED,
              },
              client.gotrueId,
              `${userObj?.firstName} ${userObj?.lastName}`,
            ),
          );
        }),
      );
      return workouts;
    }),
  },
  Query: {
    groups: authenticated(async (_, _a, { req: { gotrueId } }) => {
      const userObj = await prisma.user.findUnique({
        where: { gotrueId },
      });
      if (!userObj) throw new Error("user not exist!");

      const groups = await prisma.group.findMany({
        where: { coachId: userObj.id },
        include: {
          coach: true,
          _count: { select: { clients: true } },
        },
      });

      return groups.map(group => ({
        memberCount: group._count.clients,
        group,
      }));
    }),
    groupClients: authenticated(async (_, { id }: { id: string }, { req: { gotrueId } }) => {
      const userObj = await prisma.user.findUnique({
        where: { gotrueId },
      });
      if (!userObj) throw new Error("user not exist!");

      const group = await prisma.group.findUnique({
        where: { id: id },
        include: { clients: true },
      });

      if (group?.clients && group?.clients.length > 0) return group.clients;
      return [];
    }),
  },
};

export default { typeDefs, resolvers };
