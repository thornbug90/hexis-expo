import "react-native-url-polyfill/auto";
import {
  getBuildNumber,
  getVersion,
  getSystemName,
  getSystemVersion,
} from "react-native-device-info";
import {
  createClient,
  SignInWithIdTokenCredentials,
} from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { GetConfigDocument, GetConfigQuery } from "../generated/graphql";
import client from "./graphql";

const getConfig = async ({ input }: { input: any }) => {
  const res: GetConfigQuery = await client.request(GetConfigDocument, {
    input,
  });

  return res;
};
let supabaseClientInstance: any;

const getSupabaseConfig = async () => {
  //check app config
  let url = Constants.expoConfig!.extra!.SUPABASE_URL;
  let anon = Constants.expoConfig!.extra!.SUPABASE_ANON_KEY;
  let sharedKey = Constants.expoConfig!.extra!.SHARED_KEY;
  let environment = Constants.expoConfig!.extra!.ENVIRONMENT;
  let checkFlag = false;

  // try to initiate
  try {
    const testClient = createClient(url, anon);

    const { error } = await testClient.auth.signInWithIdToken({
      provider: "google",
      token: "fake",
    });

    if (error?.message === "Invalid API key") checkFlag = false;
    else checkFlag = true;
  } catch (error) {
    checkFlag = false;
  }
  const getConfigInput = {
    sharedKey,
    // environment,
    // os: getSystemName(),
    // osVersion: getSystemVersion(),
    // appVersion: getVersion(),
    // appBuild: getBuildNumber(),
  };
  if (!checkFlag) {
    // fetch new config
    const remoteConfig = await getConfig({ input: getConfigInput });
    anon = remoteConfig.getConfig.SupabaseAnonKey;
  }

  return { SUPABASE_URL: url, SUPABASE_ANON_KEY: anon };
};
const supabaseClient = async () => {
  const supabaseConfig = await getSupabaseConfig();
  if (!supabaseClientInstance)
    supabaseClientInstance = createClient(
      supabaseConfig.SUPABASE_URL,
      supabaseConfig.SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storage: AsyncStorage,
        },
      }
    );
  return supabaseClientInstance;
};

export default supabaseClient;
