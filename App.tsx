import "react-native-gesture-handler";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import firebase, { ReactNativeFirebase } from "@react-native-firebase/app";
import messaging from "@react-native-firebase/messaging";
import { StatusBar } from "expo-status-bar";
import {
  LinkingOptions,
  NavigationContainer,
  RouteProp,
  useNavigationContainerRef,
} from "@react-navigation/native";
import { LayoutAnimation, Platform } from "react-native";
import * as Sentry from "sentry-expo";
import Constants from "expo-constants";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAtom, useAtomValue } from "jotai";
import * as Linking from "expo-linking";
import codePush from "react-native-code-push";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import useFonts from "./src/hooks/useFonts";
import navigationTheme from "./src/lib/themes/navigation";
import useAuthListener from "./src/hooks/useAuthListener";
import UnauthenticatedStack from "./src/navigation/unauthenticated/UnauthenticatedStack";
import ErrorBoundary from "./src/components/error/ErrorBoundaryApp";
import Loading from "./src/components/shared/LoadingScreen";
import PrimaryStack, {
  PrimaryStackParamsList,
} from "./src/navigation/primary/PrimaryStack";
import { addIWFAlert, appLoadedAtom, removeIWFAlert } from "./src/store";
import useRefetchDay from "./src/hooks/useRefetchDay";
import useAuth from "./src/hooks/useAuth";
import { getTimezone } from "./src/utils/date";
import useUser from "./src/hooks/useUser";
import IwfAlertNotification from "./src/components/shared/IwfAlertNotification";
import {
  notificationListener,
  requestUserPermission,
} from "./src/lib/pushNotification";
import {
  AnalyticsProvider,
  useAnalytics,
} from "@segment/analytics-react-native";
import segmentClient from "./src/lib/segment";
import AppUpdateScreen from "./src/components/shared/AppUpdateScreen";
import { getVersion } from "react-native-device-info";
import useConfig from "./src/hooks/useConfig";

Sentry.init({
  dsn: Constants.expoConfig!.extra!.SENTRY_DSN,
  enableInExpoDevelopment: true,
  enableNativeCrashHandling: true,
  debug: true,
});

const queryClient = new QueryClient();

const prefix = Linking.createURL("");
// Needs this for token parsing - since we're dealing with global shims, TS is going to be a little weird.
// eslint-disable-next-line
global.Buffer = global.Buffer || require("buffer").Buffer;

const parseSupabaseUrl = (url: string) => {
  let parsedUrl = url;
  if (url.includes("#")) {
    parsedUrl = url.replace("#", "?");
  }
  return parsedUrl;
};

// Initialize Firebase
export const RNfirebaseConfig: ReactNativeFirebase.FirebaseAppOptions = {
  apiKey: "AIzaSyDnEaNCnas7z-e6rFls5Tv8YBjDW1B1kKc",
  projectId: "hexis-notifications",
  messagingSenderId: "233325199185",
  appId: "1:233325199185:android:a0eb706f402a0179791d70",
  databaseURL: "https://hexis-notifications-default-rtdb.firebaseio.com",
  storageBucket: "hexis-notifications.appspot.com",
};

if (!firebase.apps.length) firebase.initializeApp(RNfirebaseConfig);

const initializeFirebase = () => {
  if (!firebase.apps.length) firebase.initializeApp(RNfirebaseConfig);
};

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("Message handled in the background!", remoteMessage);
});

const InnerApp = () => {
  const navigationRef = useNavigationContainerRef();
  const routeNameRef = useRef<string>(null);
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  const [appLoaded] = useAtom(appLoadedAtom);
  const ready = useFonts();
  const { loggedIn, loginWithToken, resettingPassword } = useAuth();
  const { updateUser } = useUser();
  const [refetchDay, setRefetchDay] = useRefetchDay();
  const showAddIWFAlert = useAtomValue(addIWFAlert);
  const showRemoveIWFAlert = useAtomValue(removeIWFAlert);
  const { updateRequired, config, appVersion, isConfigLoading } = useConfig();

  useEffect(() => {
    initializeFirebase();
    requestUserPermission();
    notificationListener();
  }, []);

  useEffect(() => {
    if (loggedIn) {
      updateUser({
        input: {
          timezone: getTimezone(),
        },
      });
    }
  }, [loggedIn]);

  const refetcher = () => {
    queryClient.invalidateQueries({ queryKey: ["dayByDate"] });
    queryClient.invalidateQueries({ queryKey: ["liveGraphByDate"] });

    setRefetchDay(false);
  };

  const getInitialURL = async () => {
    const url = await Linking.getInitialURL();

    if (url !== null) {
      return parseSupabaseUrl(url);
    }
    return url;
  };

  const subscribe = (listener: (url: string) => void) => {
    const onReceiveURL = ({ url }: { url: string }) => {
      const transformedUrl = parseSupabaseUrl(url);
      const parsedUrl = Linking.parse(transformedUrl);
      const access_token = parsedUrl.queryParams?.access_token;
      const refresh_token = parsedUrl.queryParams?.refresh_token;
      if (
        typeof access_token === "string" &&
        typeof refresh_token === "string"
      ) {
        void loginWithToken({ access_token, refresh_token });
      }

      // CompressionStream;
      listener(transformedUrl);
    };
    const subscription = Linking.addEventListener("url", onReceiveURL);

    return () => {
      subscription.remove();
    };
  };

  const linking = {
    prefixes: [prefix],
    config: {
      screens: {
        Unauthenticated_PasswordResetScreen: "ResetPassword",
        PrimaryStack_CalendarModal: "PrimaryStack_CalendarModal",
        PrimaryStack_InformationRequiredScreen: "InformationRequiredScreen",
      },
    },
    getInitialURL,
    subscribe,
  };

  useEffect(() => {
    if (refetchDay) {
      refetcher();
    }
  }, [refetchDay]);
  const { track } = useAnalytics();

  return ready && appLoaded ? (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        // @ts-ignore
        routeNameRef.current = navigationRef.getCurrentRoute()?.name;
      }}
      onStateChange={() => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = navigationRef.getCurrentRoute()?.name;

        if (previousRouteName !== currentRouteName) {
          // The line below uses the expo-firebase-analytics tracker
          // https://docs.expo.io/versions/latest/sdk/firebase-analytics/
          // Change this line to use another Mobile analytics SDK
          track("APP_PAGE_CHANGE", {
            from: previousRouteName,
            to: currentRouteName,
          });
        }

        // Save the current route name for later comparison
        // @ts-ignore
        routeNameRef.current = currentRouteName;
      }}
      theme={navigationTheme}
      linking={linking}
    >
      {!updateRequired &&
        !isConfigLoading &&
        !resettingPassword &&
        loggedIn &&
        navigationRef.current && (
          <PrimaryStack
            navigation={
              navigationRef.current as unknown as NativeStackNavigationProp<
                PrimaryStackParamsList,
                "PrimaryStack",
                undefined
              >
            }
            route={
              (routeNameRef.current as unknown as RouteProp<
                PrimaryStackParamsList,
                "PrimaryStack"
              >) || "PrimaryStack"
            } // Provide a default value for the route prop
          />
        )}

      {/* Notification toasts triggered when an IWF is added/removed */}
      {showAddIWFAlert && <IwfAlertNotification added={true} />}
      {showRemoveIWFAlert && <IwfAlertNotification added={false} />}

      {(!loggedIn || resettingPassword) &&
        !isConfigLoading &&
        !updateRequired &&
        navigationRef.current && <UnauthenticatedStack />}
      {(!navigationRef.current || isConfigLoading) && !updateRequired && (
        <Loading backgroundColor="#18152D" />
      )}
      {updateRequired && !isConfigLoading && (
        <AppUpdateScreen
          appVersion={appVersion}
          updateLink={config?.updateLink ?? undefined}
        />
      )}
    </NavigationContainer>
  ) : (
    <Loading backgroundColor="#18152D" />
  );
};

function App() {
  useAuthListener();

  return (
    <>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AnalyticsProvider client={segmentClient}>
            <InnerApp />
          </AnalyticsProvider>
        </QueryClientProvider>
        <StatusBar style="light" />
      </ErrorBoundary>
    </>
  );
}

export default codePush(Sentry.Native.wrap(App));
