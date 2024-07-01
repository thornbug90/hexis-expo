import { gql, GraphQLClient } from "graphql-request";

import Constants from "expo-constants";

export const client = new GraphQLClient(
  Constants.expoConfig!.extra!.API_ENDPOINT
);

export default client;
