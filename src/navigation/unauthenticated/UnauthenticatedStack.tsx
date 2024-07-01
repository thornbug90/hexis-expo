import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import React, { useEffect } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableWithoutFeedback,
} from "react-native";
import { ArrowLeftIcon, LogoIcon } from "../../components/icons/general";
import tw from "../../lib/tw";
import Unauthenticated_MembershipInactiveScreen from "./screens/Unauthenticated_MembershipInactiveScreen";
import Unauthenticated_PasswordRecoveryScreen from "./screens/Unauthenticated_PasswordRecoveryScreen";
import Unauthenticated_PasswordResetScreen from "./screens/Unauthenticated_PasswordResetScreen";
import Unauthenticated_SignInScreen from "./screens/Unauthenticated_SignInScreen";
import Unauthenticated_WelcomeScreen from "./screens/Unauthenticated_WelcomeScreen";
import Unauthenticated_AppIntroSliders from "./screens/Unauthenticated_AppIntroSliders";

import * as Linking from "expo-linking";
import { PrimaryStackParamsList } from "../primary/PrimaryStack";
import { useNavigation } from "@react-navigation/native";
import { useAtom } from "jotai";
import useUser from "../../hooks/useUser";
import { isLoggedInAtom, resettingPasswordAtom } from "../../store";
import { QueryClient } from "@tanstack/react-query";
import { getLiteralDate } from "../../utils/date";
import * as Sentry from "sentry-expo";
export type UnauthenticatedStackParamsList = {
  Unauthenticated_SignInScreen: undefined;
  Unauthenticated_WelcomeScreen: undefined;
  Unauthenticated_MembershipInactiveScreen: undefined;
  Unauthenticated_PasswordRecoveryScreen: undefined;
  Unauthenticated_PasswordResetScreen: undefined;
  PrimaryStack: undefined;
  OnboardingStack: undefined;
};

const UnauthenticatedStackNavigator =
  createNativeStackNavigator<UnauthenticatedStackParamsList>();

// type Props = NativeStackScreenProps<
//   UnauthenticatedStackParamsList,
//   "Unauthenticated_MembershipInactiveScreen"
// >;
type Props = NativeStackScreenProps<
  PrimaryStackParamsList,
  "UnauthenticatedStack"
>;

const queryClient = new QueryClient();

const UnauthenticatedStack = () => {
  queryClient.invalidateQueries({ queryKey: ["user"] });
  const { user } = useUser();
  const nav = useNavigation();
  const [loggedIn] = useAtom(isLoggedInAtom);
  const [resettingPassword] = useAtom(resettingPasswordAtom);

  useEffect(() => {
    if (loggedIn && resettingPassword) {
      //@ts-ignore
      return nav.navigate("Unauthenticated_PasswordResetScreen");
    }
    if (user) {
      if (loggedIn && !user?.hasActiveSubscription) {
        console.log({
          message: "user has no subscription -- UNAUTHENTICATED",
          user,
        });
        //@ts-ignore
        return nav.navigate("Unauthenticated_MembershipInactiveScreen", {
          user,
          loggedIn,
        });
      }

      if (loggedIn && user?.onboardingComplete) {
        console.log({
          message: "onboarding complete -- UNAUTHENTICATED",
          user,
        });

        // return nav.reset({ index: 0, routes: [{ name: "PrimaryStack" }] });
        return nav.navigate("PrimaryStack", {
          screen: "PrimaryStack_CarbCodesScreen",
          selectedDate: getLiteralDate(),
        });
      }

      if (loggedIn && !user?.onboardingComplete) {
        console.log({
          message: "onboarding not complete -- UNAUTHENTICATED",
          user,
        });
        // @ts-ignore
        return nav.reset({ index: 0, routes: [{ name: "OnboardingStack" }] });
      }
    }
  }, [user, loggedIn]);

  const UnauthWrapper: React.FC<{
    goBackBtn?: boolean;
    helpLink?: boolean;
    navigate?: () => void;
  }> = ({ goBackBtn, helpLink, navigate }) => {
    return (
      <SafeAreaView style={tw`bg-background-500`}>
        <View style={tw`flex-row justify-between items-center mx-6 py-8`}>
          {goBackBtn && (
            <TouchableWithoutFeedback onPress={navigate}>
              <View style={tw`w-7 h-7`}>
                {/* @ts-ignore */}
                <ArrowLeftIcon color={tw.color("white")} />
              </View>
            </TouchableWithoutFeedback>
          )}
          <View style={tw`flex-row items-center`}>
            <View style={tw`h-6 w-8`}>
              <LogoIcon />
            </View>
            <Text style={tw`text-white font-poppins-semibold text-xl ml-2`}>
              hexis
            </Text>
          </View>
          {helpLink && (
            <TouchableWithoutFeedback
              onPress={() => {
                Linking.openURL("http://hexis.live/support");
              }}
              style={tw`flex items-center justify-center`}
            >
              <Text style={tw`text-white font-poppins-regular text-sm`}>
                Help
              </Text>
            </TouchableWithoutFeedback>
          )}
        </View>
      </SafeAreaView>
    );
  };

  return (
    // TODO: Dynamically redirect to intro screen or welcome screen
    <UnauthenticatedStackNavigator.Navigator initialRouteName="Unauthenticated_WelcomeScreen">
      <UnauthenticatedStackNavigator.Screen
        name="Unauthenticated_SignInScreen"
        options={{
          header: (props) => (
            <UnauthWrapper
              goBackBtn={true}
              helpLink={true}
              navigate={() => props.navigation.goBack()}
            />
          ),
        }}
        component={Unauthenticated_SignInScreen}
      />
      <UnauthenticatedStackNavigator.Screen
        name="Unauthenticated_PasswordRecoveryScreen"
        options={{
          header: (props) => (
            <UnauthWrapper
              goBackBtn={true}
              helpLink={true}
              navigate={() => props.navigation.goBack()}
            />
          ),
        }}
        component={Unauthenticated_PasswordRecoveryScreen}
      />
      <UnauthenticatedStackNavigator.Screen
        name="Unauthenticated_PasswordResetScreen"
        options={{
          header: (props) => <UnauthWrapper helpLink={true} />,
        }}
        component={Unauthenticated_PasswordResetScreen}
      />
      <UnauthenticatedStackNavigator.Screen
        name="Unauthenticated_MembershipInactiveScreen"
        options={{
          header: () => <UnauthWrapper />,
        }}
        component={Unauthenticated_MembershipInactiveScreen}
      />
      <UnauthenticatedStackNavigator.Screen
        name="Unauthenticated_WelcomeScreen"
        options={{ headerShown: false }}
        component={Unauthenticated_WelcomeScreen}
      />
    </UnauthenticatedStackNavigator.Navigator>
  );
};

export default UnauthenticatedStack;
