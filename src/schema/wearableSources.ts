import { WEARABLE_PLATFORM, WEARABLE_SOURCE_TYPE, WEARABLE_STATUS } from "@prisma/client";
import { gql } from "apollo-server";
import prisma from "../lib/prisma";
import authenticated from "../middleware/authenticated";
import { createIntegration } from "../models/integration";
import { getRefreshOrAccessToken } from "../lib/helpers/auth";
import * as controller from "../controllers/wearableSources";

type UpdateWearableStatusInput = {
  id: string;
  status?: WEARABLE_STATUS;
  code?: string;
};
export type CreateWearableInput = {
  userId: string;
  name: string;
  description: string;
  image: string;
  authorizationUrl?: string;
  status: WEARABLE_STATUS;
  platform: WEARABLE_PLATFORM;
  type: WEARABLE_SOURCE_TYPE;
};

export type OnDemandSyncInput = {
  providers: string[];
  userId?: string; // Optional. If the on demand sync is called for by a coach, then the userId needs to be provided.
};

export type WearableSyncStatus = {
  provider: string;
  status: string;
  message: string;
};

const typeDefs = gql`
  type wearableSource {
    id: ID!
    userId: String!
    name: String!
    description: String!
    image: String!
    authorizationUrl: String
    status: WEARABLE_STATUS!
    platform: String!
    updatedAt: DateTime!
    type: WEARABLE_SOURCE_TYPE
  }

  type WearableSyncStatus {
    provider: String!
    status: String!
    message: String!
  }
  type Query {
    wearableSources: [wearableSource]!
    onDemandSync(input: OnDemandSyncInput!): [WearableSyncStatus]
  }

  input UpdateWearableStatusInput {
    id: ID!
    status: WEARABLE_STATUS
    code: String
  }

  input OnDemandSyncInput {
    providers: [ID]!
    userId: String
  }

  type Mutation {
    updateWearableSource(input: UpdateWearableStatusInput!): wearableSource!
  }
`;

const resolvers = {
  Mutation: {
    updateWearableSource: authenticated(async (_, { input }: { input: UpdateWearableStatusInput }, { req: { gotrueId } }) => {
      const userObj = await prisma.user.findUnique({
        where: { gotrueId },
        include: { wearables: { where: { id: input.id } } },
      });
      if (!userObj || userObj.wearables.length < 1) throw new Error("user does not exist or wrong wearable!");

      let newStatus: WEARABLE_STATUS = WEARABLE_STATUS.DISCONNECTED;
      if (input.status && input.status === WEARABLE_STATUS.CONNECTED) {
        newStatus = WEARABLE_STATUS.CONNECTED;
      }
      let code: string | null = input.code ?? null;

      // get refresh token for TrainingPeaks
      if (userObj.wearables[0].name === "TrainingPeaks" && newStatus === WEARABLE_STATUS.CONNECTED && code) {
        code = await getRefreshOrAccessToken(code, "refresh", "TrainingPeaks");
      }

      if (userObj.wearables[0].name === "TrainingPeaks" && newStatus === WEARABLE_STATUS.DISCONNECTED) {
        code = null;
      }

      const wearableSourceUpdated = await prisma.wearableSource.update({
        where: { id: input.id },
        data: {
          status: newStatus,
          code,
        },
      });

      return wearableSourceUpdated;
    }),
  },
  Query: {
    wearableSources: authenticated(async (_, __, { req: { gotrueId } }) => {
      const user = await prisma.user.findUnique({
        where: { gotrueId },
        select: {
          id: true,
        },
      });

      if (!user) throw new Error("user not exist!");

      const existingWearableSources = await prisma.wearableSource.findMany({
        where: {
          userId: user.id,
        },
      });

      let response = existingWearableSources;
      const missingSources: string[] = [];

      const existNames = existingWearableSources.map(rawDataSource => rawDataSource.name);
      const requiredSources = `${process.env.USER_AVAILABLE_INTEGRATION_SOURCES}`?.split(";");

      requiredSources.reduce((acc, curr) => {
        if (!existNames.includes(curr)) acc.push(curr);
        return acc;
      }, missingSources);
      response = response.concat(await createIntegration(missingSources, user.id, existingWearableSources));

      return response.filter(dataSource => dataSource && requiredSources.filter(source => source === dataSource?.name).length > 0);
    }),
    onDemandSync: authenticated(async (_: unknown, { input }: { input: OnDemandSyncInput }, { req }) => {
      const coachProvidedUserId = input.userId;
      const user = await prisma.user.findFirst({
        where: { ...(!coachProvidedUserId && { gotrueId: req.gotrueId }), ...(coachProvidedUserId && { id: coachProvidedUserId }) },
        include: { wearables: { where: { status: WEARABLE_STATUS.CONNECTED, id: { in: [...input.providers] } } } },
      });
      if (!user) throw new Error("User does not exist");

      // This block is unnecessary since the request is wrapped in an authenticated block. But due to the way Prisma wraps requests we can't
      // convince Typescript the object & key exists, so we use it to make TS compiler happy.
      if (!(req.headers && "authorization" in req.headers && typeof req.headers.authorization === "string")) {
        console.error("this should never be hit.");
        throw new Error("missing authorization header in request");
      }

      return await controller.onDemandSync(user.wearables, user.id);
    }),
  },
};

export default { typeDefs, resolvers };
