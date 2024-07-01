import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { useAnalytics } from "@segment/analytics-react-native";
import { differenceInDays, isSameDay } from "date-fns";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  View,
  BackHandler,
} from "react-native";
import dayjs from "dayjs";
import IconButton from "../../components/shared/IconButton";
import SvgChevronLeft from "../../components/icons/general/ChevronLeft";
import {
  ChevronLeft,
  ChevronRight,
  HomeFilledIcon,
  ProfileFilledIcon,
} from "../../components/icons/general";
import Loading from "../../components/shared/LoadingScreen";
import {
  CarbRanges,
  Carb_Code,
  Meal,
  MealVerification,
  Meal_Name,
  NutriticsObject,
  Portion,
  Workout_Slot,
  Workout,
  IntraFuellingRecommendation,
  WearableSource,
  Wearable_Status,
  Meal_Type,
  Workout_Source,
} from "../../generated/graphql";
import useAppDate from "../../hooks/useAppDate";
import useRefetchDay from "../../hooks/useRefetchDay";
import useUser from "../../hooks/useUser";
import tw from "../../lib/tw";
import OnboardingStack from "../onboarding/OnboardingStack";
import ProfileStack from "../profile/ProfileStack";
import PrimaryStack_ActivitiesListModal from "./screens/PrimaryStack_ActivitiesListModal";
import PrimaryStack_AddEditWorkoutModal from "./screens/PrimaryStack_AddEditWorkoutModal";
import PrimaryStack_CalendarModal from "./screens/PrimaryStack_CalendarModal";
import PrimaryStack_CarbCodeInspirationScreen from "./screens/PrimaryStack_CarbCodeInspirationScreen";
import PrimaryStack_IwfRecommendedModal from "./screens/PrimaryStack_IwfRecommendedModal";
import PrimaryStack_CarbCodesScreen, {
  publicWearableRefetch,
} from "./screens/PrimaryStack_CarbCodesScreen";
import PrimaryStack_LiveGraphScreen from "./screens/PrimaryStack_LiveGraph";
import PrimaryStack_MacrosScreen from "./screens/PrimaryStack_MacrosScreen";
import PrimaryStack_VerifyMealModal from "./screens/PrimaryStack_VerifyMealModal";
import PrimaryStack_FoodTrackingModal from "./screens/PrimaryStack_FoodTrackingScreen";
import PrimaryStack_WorkoutSlotModal from "./screens/PrimaryStack_WorkoutSlotModal";
import PrimaryStack_FuelingStrategyModal from "./screens/PrimaryStack_FuelingStrategyModal";
import TabBar from "../../components/shared/TabBar";
import Unauthenticated_MembershipInactiveScreen from "../unauthenticated/screens/Unauthenticated_MembershipInactiveScreen";
import UnauthenticatedStack from "../unauthenticated/UnauthenticatedStack";

import Unauthenticated_AppIntroScreen from "../unauthenticated/screens/Unauthenticated_AppIntroScreen";
import PrimaryStack_FoodRecipeModal from "./screens/PrimaryStack_FoodRecipeModal";

import {
  isLoadingRefechWorkouts,
  isLoggedInAtom,
  syncingWearableWorkouts,
} from "../../store";
import { getLiteralDate, getLiteralDateString } from "../../utils/date";
import FoodItemDetailsScreen from "../../components/foodTracking/FoodItemDetailsScreen";
import FoodTrackingStack_QuickAddScreen from "../../components/foodTracking/FoodTrackingStack_QuickAddScreen";
import PrimaryStack_IwfPrompt from "./screens/PrimaryStack_IwfPrompt";
import PrimaryStack_IwfWearablePrompt from "./screens/PrimaryStack_IwfWearablePrompt";
import PrimaryStack_DeleteIntraWorkoutPrompt from "./screens/PrimaryStack_DeleteIntraWorkoutPrompt";
import Profile_ManageIntegration from "../profile/screens/Profile_ManageIntegration";
import PrimaryStack_NoteScreen from "./screens/PrimaryStack_NoteScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Unauthenticated_AppIntroSliders from "../unauthenticated/screens/Unauthenticated_AppIntroSliders";
import BowlFood from "../../components/icons/general/BowlFood";
import CalendarFilled from "../../components/icons/general/CalendarFilled";
import { Dimensions } from "react-native";
import PrimaryStack_ChooseActivityScreen from "./screens/PrimaryStack_ChooseActivityScreen";
import PrimaryStack_InformationRequiredScreen from "./screens/PrimaryStack_InformationRequiredScreen";
import SyncUpdatedStatusToast from "../../components/toasts/SyncUpdatedStatusToast";
import useDay from "../../hooks/useDay";
import useWearableSources from "../../hooks/useWearableSources";
import OpenCloseCircleButton from "../../components/shared/OpenCloseCircleButton";
import PrimaryStack_AddEditMealModal from "./screens/PrimaryStack_AddEditMealModal";
import { useAtom } from "jotai";

export type PrimaryStackParamsList = {
  HomeStack: undefined;
  PrimaryStack: {
    screen?: string;
    selectedDate?: Date | string;
    workoutId?: string;
  };
  Unauthenticated_AppIntroScreen: undefined;
  Unauthenticated_AppIntroSliders: undefined;
  PrimaryStack_ChooseActivityScreen: {
    workoutId?: string | undefined;
  };
  PrimaryStack_CarbCodeInspirationScreen: {
    carbCode: Carb_Code;
    mealType: Meal_Type;
    ranges: CarbRanges;
  };
  ProfileStack: undefined;
  PrimaryStack_NoteScreen: {
    title: string;
    description: string;
  };
  LiveGraph: undefined;
  OnboardingStack: undefined;
  UnauthenticatedStack: undefined;
  Unauthenticated_MembershipInactivescreen: undefined;
  PrimaryStack_AddEditWorkoutModal?: {
    workoutId?: string;
    fuelPlanning?: Workout_Slot;
    activityId?: string;
    selectedDate?: Date;
    modalTitle?: string;
    workoutSlot?: Workout_Slot | string;
    goBack?: boolean;
  };
  PrimaryStack_ActivitiesListModal: {
    screenName: keyof PrimaryStackParamsList;
    index?: number;
    workoutId?: string;
    showOther?: boolean;
  };
  PrimaryStack_WorkoutSlotModal: {
    date: string;
    fuelPlanning?: Workout_Slot;
    workoutId?: string;
    activityId?: string;
  };
  PrimaryStack_AddEditWorkoutCTA: undefined;
  PrimaryStack_CalendarModal: undefined;
  PrimaryStack_LiveGraphScreen: {
    title?: string;
  };
  PrimaryStack_MacrosScreen: {
    title?: string;
  };
  PrimaryStack_CarbCodesScreen?: {
    selectedDate?: Date | string;
    title?: string;
    addedIwf?: boolean;
    removedIwf?: boolean;
    workoutId?: string;
  };
  PrimaryStack_VerifyMealModal: {
    mealVerification?: MealVerification | null;
    meal: Meal;
  };
  PrimaryStack_FoodTrackingModal: {
    mealVerification?: MealVerification | null;
    meal: Meal;
    keywords?: string;
    setWaitingSubScreen: Function;
    ranges: CarbRanges | null;
    workoutId?: string;
    intraFuellingRecommendations?: IntraFuellingRecommendation;
  };
  PrimaryStack_FuelingStrategyModal: {
    workout?: Workout;
    intraFuellingRecommendations?: IntraFuellingRecommendation;
  };
  PrimaryStack_IwfRecommendedModal: undefined;
  PrimaryStack_FoodRecipeModal: undefined;
  PrimaryStack_IwfPrompt: {
    id?: string;
    intraFuelling?: boolean;
  };
  PrimaryStack_IwfWearablePrompt: undefined;
  PrimaryStack_DeleteIntraWorkoutPrompt: {
    workout: Workout;
    dateSelected: Date;
  };
  Unauthenticated_MembershipInactiveScreen: undefined;
  FoodItemDetailsScreen: {
    foodObject: NutriticsObject;
    multiplier: number;
    quantity: number;
    screen: string;
    selectedPortion: Portion;
    setMultiplier: Function;
    setQuantity: Function;
    setSelectedPortion: Function;
    addFoodItem: Function;
    removeFoodItem: Function;
    refetchFoodItems: Function;
  };
  FoodTrackingStack_QuickAddScreen: undefined;
  BowlFood: undefined;
  Calendar: undefined;
  Profile_ManageIntegration: { item: WearableSource };
  Profile_MealPatternsScreen: undefined;
  PrimaryStack_InformationRequiredScreen: {
    selectMonth?: Date;
  };
  PrimaryStack_AddEditMealModal: {
    id?: string;
    name?: string;
    time?: string;
    mealType?: Meal_Type;
  };
};
export type ISyncedWearables = {
  wearableSource: Workout_Source;
  syncedNumbers: number;
  connected: boolean;
  mealType: Meal_Type;
  isSynced: boolean;
};
type Props = NativeStackScreenProps<PrimaryStackParamsList, "PrimaryStack">;
const DumbComponent = () => <View />;

const NativePrimaryStackNavigator =
  createNativeStackNavigator<PrimaryStackParamsList>();

const TopTabsStackNavigator =
  createMaterialTopTabNavigator<PrimaryStackParamsList>();

const HomeStack = () => (
  <TopTabsStackNavigator.Navigator
    initialRouteName="PrimaryStack_CarbCodesScreen"
    screenOptions={{
      lazy: true,
      swipeEnabled: false,
    }}
    tabBar={(props) => {
      return <TabBar {...props} />;
    }}
  >
    <TopTabsStackNavigator.Screen
      name="PrimaryStack_LiveGraphScreen"
      initialParams={{ title: "Live Energy" }}
      component={PrimaryStack_LiveGraphScreen}
    />
    <TopTabsStackNavigator.Screen
      name="PrimaryStack_CarbCodesScreen"
      initialParams={{ title: "Carb Codes" }}
      component={PrimaryStack_CarbCodesScreen}
    />
    <TopTabsStackNavigator.Screen
      name="PrimaryStack_MacrosScreen"
      initialParams={{ title: "Kcal & Macros" }}
      component={PrimaryStack_MacrosScreen}
    />
  </TopTabsStackNavigator.Navigator>
);

const NativePrimaryStack: React.FC<Props> = () => {
  const { user, loading } = useUser();
  const nav = useNavigation();
  const [loggedIn] = useAtom(isLoggedInAtom);
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Return true to stop default back navigaton
        // Return false to keep default back navigaton
        return true;
      };

      // Add Event Listener for hardwareBackPress
      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () => {
        // Once the Screen gets blur Remove Event Listener
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
      };
    }, [])
  );
  useEffect(() => {
    if (user) {
      const getAppIntroduced = async () => {
        const appIntroduced = await AsyncStorage.getItem("hasAppIntroduced");
        if (loggedIn && appIntroduced && user?.onboardingComplete) {
          console.log({ message: "onboarding complete -- PRIMARY", user });
          // @ts-ignore
          return nav.navigate("PrimaryStack", {
            screen: "PrimaryStack_CarbCodesScreen",
            selectedDate: `${getLiteralDate().toISOString()}`,
          });
        }
        if (loggedIn && !user?.onboardingComplete) {
          nav.navigate("Unauthenticated_AppIntroScreen");
        }
        if (loggedIn && !appIntroduced && user?.onboardingComplete) {
          return nav.navigate("Unauthenticated_AppIntroSliders");
        }

        if (loggedIn && !user?.hasActiveSubscription) {
          console.log({ message: "user has no subscription -- PRIMARY", user });
          //@ts-ignore
          return nav.navigate("Unauthenticated_MembershipInactiveScreen", {
            user,
            loggedIn,
          });
        }
      };
      getAppIntroduced();
    }
  }, [user?.id, loggedIn]);

  if (loading) return <Loading backgroundColor="#18152D" />;
  return (
    <NativePrimaryStackNavigator.Navigator
      screenOptions={{ headerShown: false }}
      // initialRouteName="PrimaryStack"
    >
      <NativePrimaryStackNavigator.Screen
        name="Unauthenticated_AppIntroSliders"
        options={{ headerShown: false }}
        component={Unauthenticated_AppIntroSliders}
      />
      <NativePrimaryStackNavigator.Screen
        name="Unauthenticated_AppIntroScreen"
        options={{ headerShown: false }}
        component={Unauthenticated_AppIntroScreen}
      />

      <NativePrimaryStackNavigator.Screen
        name="OnboardingStack"
        component={OnboardingStack}
      />
      <NativePrimaryStackNavigator.Screen
        name="UnauthenticatedStack"
        component={UnauthenticatedStack}
      />
      <NativePrimaryStackNavigator.Screen
        name="Unauthenticated_MembershipInactiveScreen"
        component={Unauthenticated_MembershipInactiveScreen}
      />
      <NativePrimaryStackNavigator.Screen
        name="PrimaryStack"
        component={PrimaryStack}
      />
      <NativePrimaryStackNavigator.Screen
        options={{
          animation: "slide_from_bottom",
          contentStyle: tw`bg-background-300`,
          headerStyle: tw`bg-background-300`,
        }}
        name="PrimaryStack_FoodTrackingModal"
        component={PrimaryStack_FoodTrackingModal}
      />
      <NativePrimaryStackNavigator.Screen
        options={{
          animation: "slide_from_bottom",
          contentStyle: tw`bg-background-500`,
          headerStyle: tw`bg-background-500`,
        }}
        name="FoodItemDetailsScreen"
        component={FoodItemDetailsScreen}
      />
      <NativePrimaryStackNavigator.Screen
        options={{
          animation: "slide_from_bottom",
          contentStyle: tw`bg-background-500`,
          headerStyle: tw`bg-background-500`,
        }}
        name="FoodTrackingStack_QuickAddScreen"
        component={FoodTrackingStack_QuickAddScreen}
      />
      <NativePrimaryStackNavigator.Screen
        options={{
          presentation: "containedTransparentModal",
          title: "Verify meal",
        }}
        name="PrimaryStack_VerifyMealModal"
        component={PrimaryStack_VerifyMealModal}
      />
      <NativePrimaryStackNavigator.Screen
        options={{
          animation: "slide_from_bottom",
        }}
        name="PrimaryStack_CalendarModal"
        component={PrimaryStack_CalendarModal}
      />
      <NativePrimaryStackNavigator.Screen
        options={{
          presentation: "containedTransparentModal",
          headerShown: false,
        }}
        name="PrimaryStack_CarbCodeInspirationScreen"
        component={PrimaryStack_CarbCodeInspirationScreen}
      />
      <NativePrimaryStackNavigator.Screen
        options={{
          presentation: "containedTransparentModal",
          headerShown: false,
        }}
        name="PrimaryStack_IwfRecommendedModal"
        component={PrimaryStack_IwfRecommendedModal}
      />
      <NativePrimaryStackNavigator.Screen
        options={{
          presentation: "containedTransparentModal",
          headerShown: false,
        }}
        name="PrimaryStack_IwfPrompt"
        component={PrimaryStack_IwfPrompt}
      />
      <NativePrimaryStackNavigator.Screen
        options={{
          presentation: "containedTransparentModal",
          headerShown: false,
        }}
        name="PrimaryStack_DeleteIntraWorkoutPrompt"
        component={PrimaryStack_DeleteIntraWorkoutPrompt}
      />
      <NativePrimaryStackNavigator.Screen
        options={{
          presentation: "containedTransparentModal",
          headerShown: false,
        }}
        name="PrimaryStack_IwfWearablePrompt"
        component={PrimaryStack_IwfWearablePrompt}
      />
      <NativePrimaryStackNavigator.Screen
        options={{
          presentation: "modal",
          headerShown: true,
          title: "Activities",
          contentStyle: tw`bg-background-400`,
          headerStyle: tw`bg-background-400`,
        }}
        name="PrimaryStack_ActivitiesListModal"
        component={PrimaryStack_ActivitiesListModal}
      />
      <NativePrimaryStackNavigator.Screen
        options={{
          presentation: "modal",
          headerShown: true,
          title: "Select a Workout Slot",
          contentStyle: tw`bg-background-400`,
          headerStyle: tw`bg-background-400`,
        }}
        name="PrimaryStack_WorkoutSlotModal"
        component={PrimaryStack_WorkoutSlotModal}
      />
      <NativePrimaryStackNavigator.Screen
        options={{
          presentation: "modal",
          headerShown: true,
          title: "View Note",
          contentStyle: tw`bg-background-400`,
          headerStyle: tw`bg-background-400`,
          headerTitleAlign: "center",
          headerTitleStyle: tw`font-poppins-semibold text-[18px] leading-[27px] tracking-[.25px]`,
          headerLeft: () => (
            <View>
              <IconButton
                Icon={SvgChevronLeft}
                onPress={() => {
                  nav.goBack();
                }}
                variant="transparent"
                size="xsmall"
                style={`bg-background-400 flex mb-0 px-[10px]`}
              />
            </View>
          ),
        }}
        name="PrimaryStack_NoteScreen"
        component={PrimaryStack_NoteScreen}
      />
      <NativePrimaryStackNavigator.Screen
        options={({ route }) => ({
          animation: "slide_from_bottom",
          headerShown: true,
          title: route.params?.modalTitle,
          contentStyle: tw`bg-background-500`,
          headerStyle: tw`bg-background-500`,
          headerTitleAlign: "center",
          headerTitleStyle: tw`font-poppins-semibold text-[18px] leading-[27px] tracking-[.25px]`,
          headerLeft: () => (
            <View>
              <IconButton
                Icon={SvgChevronLeft}
                onPress={() => {
                  nav.goBack();
                }}
                variant="transparent"
                size="xsmall"
                style={`bg-background-500 flex mb-0 px-[10px]`}
              />
            </View>
          ),
        })}
        name="PrimaryStack_AddEditWorkoutModal"
        component={PrimaryStack_AddEditWorkoutModal}
      />
      <NativePrimaryStackNavigator.Screen
        options={{
          animation: "slide_from_bottom",
        }}
        name="PrimaryStack_FuelingStrategyModal"
        component={PrimaryStack_FuelingStrategyModal}
      />
      <NativePrimaryStackNavigator.Screen
        options={({ route }) => ({
          presentation: "modal",
          headerShown: true,
          headerStyle: tw`text-center bg-background-500`,
          title:
            route.params?.item.status === Wearable_Status.Connected
              ? `${route.params?.item.name} Connection`
              : `Connect ${route.params?.item.name}`,
          animation: "slide_from_bottom",
        })}
        name="Profile_ManageIntegration"
        component={Profile_ManageIntegration}
      />
      <NativePrimaryStackNavigator.Screen
        options={{
          animation: "slide_from_bottom",
        }}
        name="PrimaryStack_FoodRecipeModal"
        component={PrimaryStack_FoodRecipeModal}
      />
      <NativePrimaryStackNavigator.Screen
        options={{
          headerShown: true,
          title: "Information Required",
          contentStyle: tw`bg-background-500`,
          headerStyle: tw`bg-background-500`,
          headerTitleAlign: "center",
          headerTitleStyle: tw`font-poppins-semibold text-[18px] leading-[27px] tracking-[.25px]`,
          headerLeft: () => (
            <View>
              <IconButton
                Icon={SvgChevronLeft}
                onPress={() => {
                  nav.goBack();
                }}
                variant="transparent"
                size="xsmall"
                style={`bg-background-500 flex mb-0 px-[10px]`}
              />
            </View>
          ),
        }}
        name="PrimaryStack_InformationRequiredScreen"
        component={PrimaryStack_InformationRequiredScreen}
      />
      <NativePrimaryStackNavigator.Screen
        options={{
          // presentation: "modal",
          headerShown: true,
          title: "Choose Activity",
          contentStyle: tw`bg-background-500`,
          headerStyle: tw`bg-background-500`,
          headerTitleAlign: "center",
          headerTitleStyle: tw`font-poppins-semibold text-[18px] leading-[27px] tracking-[.25px]`,
          headerLeft: () => (
            <View>
              <IconButton
                Icon={SvgChevronLeft}
                onPress={() => {
                  nav.goBack();
                }}
                variant="transparent"
                size="xsmall"
                style={`bg-background-500 flex mb-0 px-[10px]`}
              />
            </View>
          ),
        }}
        name="PrimaryStack_ChooseActivityScreen"
        component={PrimaryStack_ChooseActivityScreen}
      />
      <NativePrimaryStackNavigator.Screen
        options={{
          animation: "slide_from_bottom",
        }}
        name="PrimaryStack_AddEditMealModal"
        component={PrimaryStack_AddEditMealModal}
      />
    </NativePrimaryStackNavigator.Navigator>
  );
};

const PrimaryStackNavigator =
  createBottomTabNavigator<PrimaryStackParamsList>();

const PrimaryStack = () => {
  const { user } = useUser();
  useRefetchDay();
  const [appDate, setAppDate] = useAppDate();
  const navigation = useNavigation();
  const { track } = useAnalytics();
  const [isFetchingWearableWorkouts, setIsFetchingWearableWorkouts] = useAtom(
    isLoadingRefechWorkouts
  );
  const [syncedUpdatedWorkouts, setSyncedUpdatedWorkouts] = useAtom(
    syncingWearableWorkouts
  );
  return (
    <PrimaryStackNavigator.Navigator
      screenListeners={{
        tabPress: (e) => {
          const nav = navigation.getState();

          if (/HomeStack.*/.test(e.target!)) {
            track("HOME_BUTTON", {
              page: nav ? nav.routes[nav.index]?.name : "",
            });
          } else {
            track("PROFILE_BUTTON", {
              page: nav ? nav.routes[nav.index]?.name : "",
            });
          }
        },
      }}
      screenOptions={{
        // headerShown: true,
        tabBarShowLabel: false,
        unmountOnBlur: true,
        tabBarStyle: {
          ...tw`flex flex-wrap bg-background-300 px-7.5 pt-2.5 justify-between h-17.5`,
        },

        header: (props) => {
          const aWeekHead = differenceInDays(appDate, getLiteralDate()) >= 6;
          /*           const userCreated = originalDateTimeTZ(
            user?.created,
            user?.timezone as string
          ); */
          const userCreated = user?.created;

          const isCreatedDay = userCreated
            ? isSameDay(appDate, new Date(userCreated!))
            : false;
          return (
            <SafeAreaView>
              <SyncUpdatedStatusToast
                isFetchingWearableWorkouts={isFetchingWearableWorkouts}
                syncedUpdatedWorkouts={syncedUpdatedWorkouts}
                setSyncedUpdatedWorkouts={setSyncedUpdatedWorkouts}
                setIsFetchingWearableWorkouts={setIsFetchingWearableWorkouts}
                refetch={publicWearableRefetch}
              />
              <View
                style={{
                  ...tw`mt-2 mb-1 mx-22 flex-row items-center justify-center gap-3`,
                  ...{
                    paddingTop:
                      Platform.OS === "android" ? StatusBar.currentHeight : 0,
                  },
                }}
              >
                <TouchableOpacity
                  disabled={isCreatedDay}
                  onPress={() => {
                    setAppDate(
                      dayjs(appDate).utc().subtract(1, "day").toDate()
                    );
                  }}
                >
                  <View
                    style={tw.style([
                      `w-4 h-5 mb-1`,
                      isCreatedDay ? "opacity-75" : "",
                    ])}
                  >
                    <ChevronLeft color={tw.color("white")} />
                  </View>
                </TouchableOpacity>
                <Text
                  style={tw`text-white text-[18px] tracking-wide font-poppins-semibold w-[125px] mb-1 text-center`}
                >
                  {isSameDay(appDate, getLiteralDate())
                    ? "Today"
                    : getLiteralDateString(appDate, "DD MMM YYYY")}
                </Text>
                <TouchableOpacity
                  disabled={aWeekHead}
                  onPress={() => {
                    if (!aWeekHead) {
                      setAppDate(dayjs(appDate).utc().add(1, "day").toDate());
                    }
                  }}
                >
                  <View
                    style={tw.style([
                      `w-4 h-5 mb-1`,
                      aWeekHead ? "opacity-75" : "",
                    ])}
                  >
                    <ChevronRight color={tw.color("white")} />
                  </View>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          );
        },
      }}
    >
      <PrimaryStackNavigator.Screen
        options={{
          tabBarIcon: (props) => {
            return (
              <View
                style={tw`w-10 h-8 absolute -left-1 ${
                  props.focused ? "opacity-100" : "opacity-30"
                }`}
              >
                <HomeFilledIcon color={tw.color("white")} />
              </View>
            );
          },
        }}
        name="HomeStack"
        component={HomeStack}
      />
      <PrimaryStackNavigator.Screen
        options={{
          headerShown: false,
          tabBarIcon: (props) => {
            return (
              <View
                style={tw`w-10 h-8 absolute right-0 ${
                  props.focused ? "opacity-100" : "opacity-30"
                }`}
              >
                <CalendarFilled color={tw.color("white")} />
                {/* <View style={tw`absolute top-0 right-0.4 z-999`}>
                  <RedCarbCode />
                </View> */}
              </View>
            );
          },
        }}
        name="Calendar"
        component={PrimaryStack_CalendarModal}
      />
      <PrimaryStackNavigator.Screen
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
          },
        })}
        options={{
          tabBarIcon: (props) => {
            const navigation = useNavigation();

            const state = navigation.getState();

            const showPlusButton = ["HomeStack", "Calendar"].includes(
              state?.routeNames[state?.index] ?? ""
            );

            if (!showPlusButton) return <></>;

            return <OpenCloseCircleButton navigation={navigation} />;
          },
        }}
        name="PrimaryStack_AddEditWorkoutCTA"
        component={DumbComponent}
      />
      <PrimaryStackNavigator.Screen
        name="BowlFood"
        options={{
          headerShown: false,
          tabBarIcon: (props) => (
            <View
              style={tw`w-10 h-8 absolute left-0 ${
                props.focused ? "opacity-100" : "opacity-30"
              }`}
            >
              <BowlFood color={tw.color("white")} />
            </View>
          ),
        }}
        component={PrimaryStack_FoodRecipeModal}
      />
      <PrimaryStackNavigator.Screen
        name="ProfileStack"
        options={{
          headerShown: false,
          tabBarIcon: (props) => (
            <View
              style={tw`w-10 h-8 absolute right-0 ${
                props.focused ? "opacity-100" : "opacity-30"
              }`}
            >
              <ProfileFilledIcon color={tw.color("white")} />
            </View>
          ),
        }}
        component={ProfileStack}
      />
    </PrimaryStackNavigator.Navigator>
  );
};

export default NativePrimaryStack;
