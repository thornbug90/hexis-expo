import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Profile_AccountSettings from "./screens/Profile_AccountSettings";
import Profile_BaseScreen from "./screens/Profile_BaseScreen";
import Profile_BiometricsScreen from "./screens/Profile_BiometricsScreen";
import Profile_CarbCodeRangesInfoScreen from "./screens/Profile_CarbCodeRangesInfoScreen";
import Profile_CarbCodeRangesScreen from "./screens/Profile_CarbCodeRangesScreen";
import Profile_SexModal from "./screens/Profile_SexModal";
import Profile_LifestyleScreen from "./screens/Profile_LifestyleScreen";
import Profile_ActivityLevelsModal from "./screens/Profile_ActivityLevelsModal";
import {
  Goal,
  Lifestyle_Activity,
  Sex,
  Total_Activity_Duration,
} from "../../generated/graphql";
import Profile_GoalScreen from "./screens/Profile_GoalScreen";
import Profile_GoalScreenModal from "./screens/Profile_GoalScreenModal";
import Profile_MealPatternsScreen from "./screens/Profile_MealPatternsScreen";
import Profile_FavouriteActivities from "./screens/Profile_FavouriteActivities";
import Profile_ActivitiesListModal from "./screens/Profile_ActivitiesListModal";
import activities from "../../lib/activities";
import Profile_ActivityDurationScreen from "./screens/Profile_ActivityDurationScreen";
import Profile_Integration from "./screens/Profile_Integrations";
import React from "react";
import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import tw from "../../lib/tw";
import { Platform } from "react-native";
export type ProfileStackParamsList = {
  Profile_BaseScreen: undefined;
  Profile_AccountSettings: undefined;
  Profile_CarbCodeRangesScreen: undefined;
  Profile_CarbCodeRangesInfoScreen: undefined;
  Profile_Integration: undefined;
  Profile_LifestyleScreen?: { lifestyleActivity: Lifestyle_Activity };
  Profile_ActivityLevelsModal: { lifestyleActivity?: Lifestyle_Activity };
  Profile_GoalScreen?: { goal: Goal };
  Profile_GoalScreenModal: { goal: Goal };
  Profile_BiometricsScreen?: {
    sex: Sex;
    genderIdentity?: string;
  };
  Profile_SexModal: undefined;
  Profile_MealPatternsScreen: undefined;
  Profile_FavouriteActivities?: {
    activityId?: keyof typeof activities;
    index?: number;
    activityDuration?: Total_Activity_Duration;
  };
  Profile_ActivitiesListModal: {
    screenName: keyof ProfileStackParamsList;
    index?: number;
  };
  Profile_ActivityDurationScreen: {
    activityDuration?: Total_Activity_Duration;
  };
};

const ProfileStackNavigator =
  createNativeStackNavigator<ProfileStackParamsList>();

const ProfileStack = () => {
  const nav = useNavigation();
  return (
    <ProfileStackNavigator.Navigator>
      <ProfileStackNavigator.Screen
        name="Profile_BaseScreen"
        options={{
          title: "Profile",
        }}
        component={Profile_BaseScreen}
      />
      <ProfileStackNavigator.Screen
        options={{
          title: "Carb Code Ranges",
        }}
        name="Profile_CarbCodeRangesScreen"
        component={Profile_CarbCodeRangesScreen}
      />
      <ProfileStackNavigator.Screen
        options={{
          title: "The Carb Code System",
        }}
        name="Profile_CarbCodeRangesInfoScreen"
        component={Profile_CarbCodeRangesInfoScreen}
      />
      <ProfileStackNavigator.Screen
        options={{
          title: "Integrations",
          headerLeft: (props) => (
            <HeaderBackButton
              onPress={() => {
                nav.navigate("Profile_BaseScreen");
              }}
            />
          ),
        }}
        name="Profile_Integration"
        component={Profile_Integration}
      />

      <ProfileStackNavigator.Screen
        options={{
          title: "Account",
        }}
        name="Profile_AccountSettings"
        component={Profile_AccountSettings}
      />
      <ProfileStackNavigator.Screen
        options={{
          title: "Lifestyle",
        }}
        name="Profile_LifestyleScreen"
        component={Profile_LifestyleScreen}
      />
      <ProfileStackNavigator.Screen
        options={{
          title: "Lifestyle Activity",
          presentation: "modal",
        }}
        name="Profile_ActivityLevelsModal"
        component={Profile_ActivityLevelsModal}
      />
      <ProfileStackNavigator.Screen
        options={{
          title: "Biometrics",
        }}
        name="Profile_BiometricsScreen"
        component={Profile_BiometricsScreen}
      />
      <ProfileStackNavigator.Screen
        options={{
          headerShown: true,
          title: "Edit Meal Pattern",
          contentStyle: tw`bg-background-500`,
          headerStyle: tw`bg-background-500`,
          headerTitleAlign: "center",
          headerTitleStyle: tw`font-poppins-semibold text-[18px] leading-[27px] tracking-[.25px]`,
        }}
        name="Profile_MealPatternsScreen"
        component={Profile_MealPatternsScreen}
      />

      <ProfileStackNavigator.Screen
        options={{
          title: "Goal",
        }}
        name="Profile_GoalScreen"
        component={Profile_GoalScreen}
      />
      <ProfileStackNavigator.Screen
        name="Profile_FavouriteActivities"
        options={{
          title: "Favourite Activities",
        }}
        component={Profile_FavouriteActivities}
      />
      <ProfileStackNavigator.Screen
        name="Profile_ActivityDurationScreen"
        options={{
          title: "Weekly Activity Duration",
          headerBackTitleVisible: false,
        }}
        component={Profile_ActivityDurationScreen}
      />
      <ProfileStackNavigator.Screen
        options={{
          title: "Sex",
          presentation: "modal",
        }}
        name="Profile_SexModal"
        component={Profile_SexModal}
      />
      <ProfileStackNavigator.Screen
        options={{
          title: "Change weight goal",
          presentation: "modal",
        }}
        name="Profile_GoalScreenModal"
        component={Profile_GoalScreenModal}
      />
      <ProfileStackNavigator.Screen
        options={{
          title: "Activities",
          presentation: "modal",
        }}
        name="Profile_ActivitiesListModal"
        component={Profile_ActivitiesListModal}
      />
    </ProfileStackNavigator.Navigator>
  );
};

export default ProfileStack;
