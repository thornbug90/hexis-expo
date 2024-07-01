import { useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAtom } from "jotai";
import React, { useEffect } from "react";
import useUser from "../../hooks/useUser";
import activities from "../../lib/activities";
import { isLoggedInAtom } from "../../store";
import Onboarding_ActivityModalScreen from "./screens/Onboarding_ActivityModalScreen";
import Onboarding_CompleteScreen from "./screens/Onboarding_CompleteScreen";
import Onboarding_DOBScreen from "./screens/Onboarding_DOBScreen";
import Onboarding_FavouriteWorkoutsScreen from "./screens/Onboarding_FavouriteWorkoutsScreen";
import Onboarding_GoalScreen from "./screens/Onboarding_GoalScreen";
import Onboarding_HeightWeightScreen from "./screens/Onboarding_HeightWeightScreen";
import Onboarding_LifestyleActivityScreen from "./screens/Onboarding_LifestyleActivityScreen";
import Onboarding_MealplanScreen from "./screens/Onboarding_MealplanScreen";
import Onboarding_SexScreen from "./screens/Onboarding_SexScreen";
import Onboarding_SleepWakeScreen from "./screens/Onboarding_SleepWakeScreen";
import Onboarding_StartScreen from "./screens/Onboarding_StartScreen";
import Onboarding_TotalActivityDurationScreen from "./screens/Onboarding_TotalActivityDurationScreen";

export type OnboardingStackParamsList = {
  Onboarding_StartScreen: undefined;
  Onboarding_DOBScreen: undefined;
  Onboarding_SexScreen: undefined;
  Onboarding_HeightWeightScreen: undefined;
  Onboarding_SleepWakeScreen: undefined;
  Onboarding_LifestyleActivityScreen: undefined;
  Onboarding_TotalActivityDurationScreen: undefined;
  Onboarding_FavouriteWorkoutsScreen?: {
    index: number;
    activityId: keyof typeof activities;
  };
  Onboarding_GoalScreen: undefined;
  Onboarding_MealplanScreen: undefined;
  Onboarding_CompleteScreen: undefined;
  Onboarding_ActivityModalScreen: {
    index: number;
    screenName: keyof OnboardingStackParamsList;
  };
};

const OnboardingStackNavigator =
  createNativeStackNavigator<OnboardingStackParamsList>();

const OnboardingStack = () => {
  return (
    <OnboardingStackNavigator.Navigator
      initialRouteName="Onboarding_StartScreen"
      screenOptions={{
        title: "",
        headerBackTitle: "Back",
      }}
    >
      <OnboardingStackNavigator.Screen
        name="Onboarding_StartScreen"
        options={{ headerShown: false }}
        component={Onboarding_StartScreen}
      />
      <OnboardingStackNavigator.Screen
        name="Onboarding_DOBScreen"
        component={Onboarding_DOBScreen}
      />
      <OnboardingStackNavigator.Screen
        name="Onboarding_SexScreen"
        component={Onboarding_SexScreen}
      />
      <OnboardingStackNavigator.Screen
        name="Onboarding_HeightWeightScreen"
        component={Onboarding_HeightWeightScreen}
      />
      <OnboardingStackNavigator.Screen
        name="Onboarding_SleepWakeScreen"
        component={Onboarding_SleepWakeScreen}
      />
      <OnboardingStackNavigator.Screen
        name="Onboarding_LifestyleActivityScreen"
        component={Onboarding_LifestyleActivityScreen}
      />
      <OnboardingStackNavigator.Screen
        name="Onboarding_TotalActivityDurationScreen"
        component={Onboarding_TotalActivityDurationScreen}
      />
      <OnboardingStackNavigator.Screen
        name="Onboarding_FavouriteWorkoutsScreen"
        component={Onboarding_FavouriteWorkoutsScreen}
      />
      <OnboardingStackNavigator.Screen
        name="Onboarding_GoalScreen"
        component={Onboarding_GoalScreen}
      />
      <OnboardingStackNavigator.Screen
        name="Onboarding_MealplanScreen"
        component={Onboarding_MealplanScreen}
      />
      <OnboardingStackNavigator.Screen
        options={{
          headerBackVisible: false,
          title: "",
        }}
        name="Onboarding_CompleteScreen"
        component={Onboarding_CompleteScreen}
      />
      <OnboardingStackNavigator.Screen
        options={{
          presentation: "modal",
        }}
        name="Onboarding_ActivityModalScreen"
        component={Onboarding_ActivityModalScreen}
      />
    </OnboardingStackNavigator.Navigator>
  );
};

export default OnboardingStack;
