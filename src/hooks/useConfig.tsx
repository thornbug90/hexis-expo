import Constants from "expo-constants";
import { useGetConfigQuery } from "../generated/graphql";
import client from "../lib/graphql";
import {
  getBuildNumber,
  getSystemName,
  getSystemVersion,
  getVersion,
} from "react-native-device-info";
import { useAtom } from "jotai";
import { userIdAtom } from "../store";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useConfig = () => {
  const sharedKey = Constants.expoConfig!.extra!.SHARED_KEY;
  const environment = Constants.expoConfig!.extra!.ENVIRONMENT;
  const [userId] = useAtom(userIdAtom);
  const [updateRequired, setUpdateRequired] = useState(false);
  const [updateNotification, setUpdateNotification] = useState(false);

  const getConfigInput = {
    sharedKey,
    environment,
    os: getSystemName(),
    osVersion: getSystemVersion(),
    appVersion: getVersion(),
    appBuild: getBuildNumber(),
    userId,
  };

  const { data: config, isLoading: isConfigLoading } = useGetConfigQuery(
    client,
    { input: getConfigInput }
  );
  const appVersion = getVersion();
  useEffect(() => {
    if (
      config?.getConfig.requireUpdate &&
      config?.getConfig.latestVersion !== appVersion
    ) {
      setUpdateRequired(true);
    }
    AsyncStorage.getItem("skippedUpdateNotification").then(
      (skippedUpdateNotification) => {
        const appLtestVersion = config?.getConfig.latestVersion;
        if (
          config?.getConfig.latestVersion !== appVersion &&
          skippedUpdateNotification !== config?.getConfig.latestVersion
        ) {
          setUpdateNotification(true);
        }
      }
    );
  }, [config]);

  return {
    updateRequired,
    updateNotification,
    setUpdateNotification,
    appVersion,
    config: config?.getConfig,
    isConfigLoading,
  };
};

export default useConfig;
