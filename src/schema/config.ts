import { gql } from "apollo-server";

type Config = {
  SupabaseAnonKey: string;
  latestVersion: string;
  requireUpdate: boolean;
  updateLink?: string;
};

type GetConfigInput = {
  sharedKey: string;
  os: string;
  osVersion: string;
  appVersion: string;
  appBuild: string;
  environment: string;
  userId?: string;
};

const typeDefs = gql`
  type Config {
    SupabaseAnonKey: String
    latestVersion: String
    requireUpdate: Boolean
    updateLink: String
  }
  input GetConfigInput {
    sharedKey: String
    environment: String
    os: String
    osVersion: String
    appVersion: String
    appBuild: String
    userId: ID
  }

  type Query {
    getConfig(input: GetConfigInput): Config!
  }
`;

const resolvers = {
  Query: {
    getConfig: (input: GetConfigInput) => {
      input;
      // TODO: use input to decide which config vars to be sent. Add all config vars here
      const latestVersion = process.env.APP_LATEST_VERSION as string;
      const requireUpdate = process.env.APP_FORCE_UPDATE === "TRUE" ? true : false;

      const config: Config = {
        SupabaseAnonKey:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiYndsdnVuYXptYW13c2pod3J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU1Njg2MjQsImV4cCI6MjAyMTE0NDYyNH0.MVOcOzeDOJi7m1B9nasrr-R76MxdiRAtCkifdD-tHCQ(((999",
        latestVersion,
        requireUpdate: requireUpdate,
      };

      return config;
    },
  },
};

export default { typeDefs, resolvers };
