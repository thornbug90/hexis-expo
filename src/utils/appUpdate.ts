import { Linking, Platform } from "react-native";
import { getApplicationName, getBundleId } from "react-native-device-info";
import { getCountry } from "react-native-localize";
import { HEXIS_APP_STORE_ID } from "../constants/urls";

export const openInStore = async (config: {
  appStoreConfig: {
    appName: string;
    appId: string;
    storeLocale: string;
  };
  playStoreConfig: {
    appId: string;
  };
}) => {
  let storeLink = "";
  if (Platform.OS === "ios")
    storeLink = `https://apps.apple.com/${config.appStoreConfig.storeLocale}/app/${config.appStoreConfig.appName}/id${config.appStoreConfig.appId}`;
  else if (Platform.OS === "android")
    storeLink = `https://play.google.com/store/apps/details?id=${config.playStoreConfig.appId}`;

  await Linking.openURL(storeLink);
};

export const gotoAppUpdate = (updateLink?: string) => {
  if (updateLink) Linking.openURL(updateLink);
  let appId = getBundleId();
  if (Platform.OS === "ios") appId = HEXIS_APP_STORE_ID;
  const appName = getApplicationName();
  let storeLocale = "gb";
  if (Platform.OS === "ios") storeLocale = getCountry();

  try {
    openInStore({
      playStoreConfig: { appId },
      appStoreConfig: {
        appId,
        appName,
        storeLocale,
      },
    });
  } catch (e) {}
};
