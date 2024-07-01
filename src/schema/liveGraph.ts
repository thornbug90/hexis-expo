import { AuthenticationError, gql } from "apollo-server";
import prisma from "../lib/prisma";
import authenticated from "../middleware/authenticated";
import getLiveGraph from "../models/getLiveGraph";
import * as controller from "../controllers/liveGraph";

const typeDefs = gql`
  type LiveGraphPoint {
    time: Time!
    data: Float!
  }

  type LiveGraph {
    graph: [LiveGraphPoint]!
    predictedEnd: Float!
  }

  type Query {
    liveGraph(date: DateTime!): LiveGraph!
    liveGraphClient(date: DateTime!, id: String!): LiveGraph!
  }
`;

const resolvers = {
  Query: {
    liveGraph: authenticated(async (_, { date }: { date: string | number | undefined }, { req: { gotrueId } }) => {
      const user = await prisma.user.findUnique({ where: { gotrueId }, select: { created: true, timezone: true } });
      if (!user) throw new AuthenticationError("Must be logged in.");

      const currentDate = controller.getDate(date, user);

      return await getLiveGraph(currentDate, gotrueId);
    }),

    liveGraphClient: authenticated(async (_, { date, id }: { date: string | number | undefined; id: string | undefined }) => {
      const user = await prisma.user.findUnique({ where: { id }, select: { created: true, timezone: true, gotrueId: true } });
      if (!user) throw new AuthenticationError("Must be logged in.");

      const gotrueId = user?.gotrueId ?? "";

      const currentDate = controller.getDate(date, user);

      return await getLiveGraph(currentDate, gotrueId);
    }),
  },
};

export default { typeDefs, resolvers };
