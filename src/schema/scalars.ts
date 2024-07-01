import { gql } from "apollo-server";
import { TimeResolver, DateResolver, DateTimeResolver } from "graphql-scalars";
const typeDefs = gql`
  scalar Date
  scalar Time
  scalar DateTime
`;

const resolvers = {
  Date: DateResolver,
  Time: TimeResolver,
  DateTime: DateTimeResolver,
};

export default { typeDefs, resolvers };
