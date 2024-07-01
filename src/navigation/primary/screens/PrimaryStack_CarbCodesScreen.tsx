import React, { useLayoutEffect, useRef } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { isAfter, addDays, set } from "date-fns";
import {
  View,
  Text,
  TouchableWithoutFeedback,
  Pressable,
  AppState,
  PanResponder,
  Platform,
} from "react-native";
import { useAnalytics } from "@segment/analytics-react-native";

import dayjs from "dayjs";
import { isBefore } from "date-fns/esm";
import { useEffect, useState } from "react";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useIsFocused } from "@react-navigation/native";
import CarbCodeCard from "../../../components/carbCodes/CarbCodeCard";
import FuelMessage from "../../../components/fuelMessage/FuelMessage";
import NoData from "../../../components/shared/NoData";
import WorkoutCard from "../../../components/workouts/WorkoutCard";
import { BatteryChargingIcon } from "../../../components/icons/general";
import {
  Carb_Code,
  Coach_Note_Types,
  IntraFuellingRecommendation,
  Meal,
  Meal_Name,
  Meal_Nutrition_Status,
  Meal_Type,
  Note,
  useCreateWorkoutWearableMutation,
  useDeleteMealMutation,
  Wearable_Status,
  Workout,
  Workout_Source,
  Workout_Status,
} from "../../../generated/graphql";
import useAppDate from "../../../hooks/useAppDate";
import useDay from "../../../hooks/useDay";
import useUser from "../../../hooks/useUser";
import tw from "../../../lib/tw";
import { PrimaryStackParamsList } from "../PrimaryStack";
import ErrorModal from "../../../components/shared/ErrorModal";
import {
  getLiteralDate,
  getTimezone,
  isUTCDateToday,
  moreThanAWeekAhead,
} from "../../../utils/date";
import WearablePrompt from "../../../components/prompts/WearablePrompt";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  addIWFAlert,
  dayIdAtom,
  isLoadingRefechWorkouts,
  mainHeightAtom,
  removeIWFAlert,
  syncingWearableWorkouts,
  userIdAtom,
} from "../../../store";
import useAthleteNotes from "../../../hooks/useAthleteNotes";
import { AddNoteIcon } from "../../../components/icons/general";
import { truncate } from "../../../utils/truncate";
import { isCompletedWorkout } from "../../../utils/plannedCompletedWorkout";
import {
  Wearable_Source,
  checkAppleHealthConnection,
  checkHealthConnectConnection,
  pushWorkoutsAppleHealth,
  pushWorkoutsHealthConnect,
} from "../../../lib/integrations";
import client from "../../../lib/graphql";
import { IWorkout } from "./PrimaryStack_AddEditWorkoutModal";
import IntegrationReleaseModal from "./PrimaryStack_IntegrationRelease";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useWearableSources from "../../../hooks/useWearableSources";
import AppUpdateModal from "./PrimaryStack_AppUpdateModal";
import SyncWorkoutLoading from "../../../components/LoadingScreens/SyncWorkoutLoading";
import ConnectUpdatingWearableLoading from "../../../components/LoadingScreens/ConnectUpdatingWearableLoading";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Loading from "../../../components/shared/LoadingScreen";
import { syncTP } from "../../../lib/trainingPeaksSync";
dayjs.extend(customParseFormat);

type Props = NativeStackScreenProps<
  PrimaryStackParamsList,
  "PrimaryStack_CarbCodesScreen"
>;
export let publicWearableRefetch: () => void;
export let dayRefetch = () => {};

const PrimaryStack_CarbCodesScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { mutate: deleteMeal } = useDeleteMealMutation(client);
  const appState = useRef(AppState.currentState);
  const [, setAppStateVisible] = useState(appState.current);
  const [isFetchingWearableWorkouts, setIsFetchingWearableWorkouts] = useAtom(
    isLoadingRefechWorkouts
  );
  const [, setDayId] = useAtom(dayIdAtom);
  const { track } = useAnalytics();
  const [waitingSubScreen, setWaitingSubScreen] = useState(false);
  const [localAddedWorkouts, setLocalAddedWorkouts] = useState(0);
  const [showIntegration, setShowIntegration] = useState<boolean>(false);
  const [, setShowDetectedWorkout] = useState<boolean>(false);
  const [openDeleteMealModal, setOpenDeleteMealModal] =
    useState<boolean>(false);
  const { data: day, loading, refetch } = useDay();

  dayRefetch = refetch;
  const [appDate, setAppDate] = useAppDate();
  const [showWorkoutsErrorModal, setShowWorkoutsErrorModal] =
    useState<boolean>(false);
  const setShowAddIWFAlert = useSetAtom(addIWFAlert);
  const setShowRemoveIWFAlert = useSetAtom(removeIWFAlert);
  const [showHeaderBanner, setShowHeaderBanner] = useState<boolean>(false);
  const [wearablePromptVisibility, setWearablePromptVisibility] =
    useState<boolean>(false);
  const [clickedIntraPromptWorkout, setClickedIntraPromptWorkout] = useState<
    string[]
  >([]);
  const [, setSyncingStatus] = useAtom(syncingWearableWorkouts);
  const [syncingIndividualStatus, setSyncingIndividualStatus] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState<Meal>();
  const topPosition = useSharedValue(-120);
  const mainHeight = useAtomValue(mainHeightAtom);
  const mousePositionRef = useRef(0);
  const hiddenHeightRef = useRef(0);
  const isStopUp = useRef(false);
  const isStopDown = useRef(false);
  const directionRef = useRef<string>("");
  const dyRef = useRef(0);
  const mapOpacityRange = (value: number) => {
    "worklet";
    if (value > 0) {
      return 0.3;
    } else {
      return (-7 * value) / 1200 + 0.3;
    }
  };
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: topPosition.value }],
      top: 0,
      position: "absolute",
      zIndex: 1000,
      elevation: 1000,
      display: "flex",
    };
  });
  const opacityAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: mapOpacityRange(topPosition.value),
    };
  });
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
    },
    onStartShouldSetPanResponderCapture: (evt, gestureState) => {
      return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
    },
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
    },
    onPanResponderGrant: () => {
      mousePositionRef.current = topPosition.value;
    },
    onPanResponderMove: (e, { dy }) => {
      if (dyRef.current > dy) {
        directionRef.current = "up";
      } else if (dyRef.current < dy) {
        directionRef.current = "down";
      } else {
        directionRef.current = "";
      }

      if (directionRef.current === "down" && topPosition.value < -120) {
        isStopUp.current = true;
      }
      if (directionRef.current === "up" && topPosition.value > -120) {
        isStopDown.current = true;
      }

      dyRef.current = dy;
      if (dy >= 0) {
        topPosition.value =
          topPosition.value >= -120 && isStopUp.current
            ? -120
            : topPosition.value < 0
            ? mousePositionRef.current + dy
            : Math.sqrt(dy);
      } else {
        topPosition.value =
          topPosition.value <= -120 && isStopDown.current
            ? -120
            : topPosition.value > -120
            ? dy
            : topPosition.value > -120 - hiddenHeightRef.current
            ? mousePositionRef.current + dy
            : -120 - hiddenHeightRef.current;
      }
    },
    onPanResponderRelease: async () => {
      mousePositionRef.current = topPosition.value;
      if (topPosition.value > 0) {
        topPosition.value = withTiming(-120, { duration: 300 });
        setIsFetchingWearableWorkouts(true);
        await wearableRefetch();
      } else if (topPosition.value < 0 && topPosition.value > -120) {
        topPosition.value = withTiming(-120, { duration: 300 });
      } else if (
        hiddenHeightRef.current > 0 &&
        hiddenHeightRef.current + topPosition.value === -120
      ) {
        topPosition.value = withTiming(topPosition.value + 10, {
          duration: 100,
        });
      } else if (topPosition.value === -120) {
        directionRef.current = "";
        isStopDown.current = false;
        isStopUp.current = false;
      }
    },
  });

  const { updateUser, user } = useUser();
  const isFocused = useIsFocused();
  const { notes } = useAthleteNotes({
    athleteId: user?.id || "",
  });

  const { mutate: createWorkoutWearable, isLoading } =
    useCreateWorkoutWearableMutation(client, {
      onSuccess: async (data) => {
        setLocalAddedWorkouts(data.createWorkoutWearable.length);
      },
    });
  const showIntegrationRelease = async () => {
    const integrationRelease = await AsyncStorage.getItem("integrationRelease");
    const expired = new Date().getTime() > new Date("2024-04-20").getTime();
    if ((!integrationRelease || integrationRelease !== "true") && !expired) {
      setShowIntegration(true);
    } else {
      setShowIntegration(false);
    }
  };

  const detectedCompletedTPWorkout = day?.workouts?.find(
    (workout) =>
      workout?.status === Workout_Status.Active &&
      workout?.confirmed === true &&
      workout.source === Workout_Source.TrainingPeaks
  );
  const showDetectedWorkoutModal = async () => {
    if (detectedCompletedTPWorkout?.id) {
      const hideForAll = await AsyncStorage.getItem("hideModalForAllWorkouts");
      if (hideForAll === "true") {
        return setShowDetectedWorkout(false);
      }

      // Check if the modal should be hidden for this specific workout
      const hiddenWorkoutIds =
        JSON.parse((await AsyncStorage.getItem("hiddenWorkoutIds")) || "[]") ||
        [];
      if (
        detectedCompletedTPWorkout?.id &&
        hiddenWorkoutIds.includes(detectedCompletedTPWorkout?.id)
      ) {
        return setShowDetectedWorkout(false);
      }
      // If neither condition is met, show the modal
      return setShowDetectedWorkout(true);
    }
  };
  let {
    data: wearableSources,
    loading: wearablesLoading,
    refetch: wearableRefetch,
  } = useWearableSources();
  const providers: string[] = [];
  user?.wearableSources?.map((source) => {
    if (source?.name === "TrainingPeaks") providers.push(source.id);
  });

  publicWearableRefetch = () => wearableRefetch();
  useEffect(() => {
    const listener = AppState.addEventListener("change", _handleAppStateChange);
    return () => {
      listener.remove();
    };
  }, []);
  useEffect(() => {
    hiddenHeightRef.current = 0;
    if (day?.dayNutrition?.id) {
      setDayId(day?.dayNutrition?.id);
    }
  }, [day?.dayNutrition?.id]);
  const _handleAppStateChange = (nextAppState: any) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState.match(/active/)
    ) {
      setAppDate(getLiteralDate());
      refetch();
    }
    appState.current = nextAppState;
    setAppStateVisible(appState.current);
  };

  //Fetching wearable workouts
  useEffect(() => {
    if (isFetchingWearableWorkouts) {
      syncingWearableFunction();
    }
  }, [isFetchingWearableWorkouts]);

  const syncingWearableFunction = async () => {
    const results = [];
    let result = {};
    console.log({ wearableSources });
    if (wearableSources && wearableSources.length > 0) {
      let healthConnect = wearableSources?.filter(
        (wearable) => wearable?.name === Wearable_Source.HealthConnect
      );
      let appleHealth = wearableSources?.filter(
        (wearable) => wearable?.name === Wearable_Source.AppleHealth
      );
      let trainingPeaks = wearableSources?.filter(
        (wearable) => wearable?.name === Wearable_Source.TrainingPeaks
      );
      const connectionPermissionMsg =
        "You need to give permission to Hexis to access Health data.";

      //trainingpeaks
      const trainingPeaksSource = trainingPeaks?.[0];
      const initialSyncStatus: {
        connected: boolean;
        syncedNumbers: number | string;
        isSynced: boolean;
        wearableSource: Workout_Source;
      } = {
        connected: false,
        syncedNumbers: 0,
        isSynced: false,
        wearableSource: Workout_Source.TrainingPeaks,
      };
      if (
        trainingPeaksSource &&
        trainingPeaksSource.status !== Wearable_Status.Disconnected
      ) {
        console.log("TRAINING PEAKS LOGGING");

        setSyncingIndividualStatus(initialSyncStatus as any);
        result = await syncTP(trainingPeaksSource);

        setSyncingIndividualStatus(result as any);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        results.push(result);
      }

      //health connect
      if (Platform.OS === "android")
        if (
          healthConnect &&
          healthConnect.length > 0 &&
          healthConnect?.[0]?.status !== Wearable_Status.Disconnected
        ) {
          console.log("HEALTH CONNECT LOGGING");
          initialSyncStatus.wearableSource = Workout_Source.HealthConnect;
          setSyncingIndividualStatus(initialSyncStatus as any);
          const wearable = user?.wearableSources.filter(
            (source) => source?.name === "Health Connect"
          )?.[0];
          const healthConnectPermission = await checkHealthConnectConnection(
            wearable?.id
          );

          const healthConnectSyncingWorkouts = healthConnectPermission
            ? await pushWorkoutsHealthConnect({
                from: dayjs().subtract(3, "day").startOf("day").toDate(),
                updateHook: createWorkoutWearable,
              })
            : undefined;

          if (healthConnectSyncingWorkouts === undefined) {
            result = {
              connected: healthConnectPermission,
              syncedNumbers: healthConnectPermission
                ? "Can't retrive Apple Health Data. Try to uninstall Hexis and reinstall it."
                : connectionPermissionMsg,
              isSynced: false,
              wearableSource: Workout_Source.HealthConnect,
            };
          } else {
            result = {
              connected: healthConnectPermission,
              syncedNumbers:
                healthConnectPermission && healthConnectSyncingWorkouts
                  ? healthConnectSyncingWorkouts.length
                  : connectionPermissionMsg,
              isSynced: !!healthConnectSyncingWorkouts,
              wearableSource: Workout_Source.HealthConnect,
            };
          }

          setSyncingIndividualStatus(result as any);
          await new Promise((resolve) => setTimeout(resolve, 1500));
          results.push(result);
        }

      //apple health
      if (Platform.OS === "ios")
        if (
          appleHealth &&
          appleHealth.length > 0 &&
          appleHealth?.[0]?.status !== Wearable_Status.Disconnected
        ) {
          console.log("APPLE LOGGING");
          initialSyncStatus.wearableSource = Workout_Source.AppleHealth;
          setSyncingIndividualStatus(initialSyncStatus as any);
          const wearableId = user?.wearableSources.filter(
            (source) => source?.name === "Apple Health"
          )?.[0]?.id;
          const appleHelathConnection = await checkAppleHealthConnection(
            wearableId
          );

          const appleHealthSyncingWorkouts = appleHelathConnection
            ? await pushWorkoutsAppleHealth({
                from: dayjs().subtract(3, "day").startOf("day").toDate(),
                updateHook: createWorkoutWearable,
              })
            : undefined;
          if (appleHealthSyncingWorkouts === undefined) {
            result = {
              connected: appleHelathConnection,
              syncedNumbers: appleHelathConnection
                ? "Can't retrive Apple Health Data. Try to uninstall Hexis and reinstall it."
                : connectionPermissionMsg,
              isSynced: false,
              wearableSource: Workout_Source.AppleHealth,
            };
          } else {
            result = {
              connected: appleHelathConnection,
              syncedNumbers: appleHelathConnection
                ? appleHealthSyncingWorkouts
                : connectionPermissionMsg,
              isSynced: appleHealthSyncingWorkouts !== undefined,
              wearableSource: Workout_Source.AppleHealth,
            };
          }

          setSyncingIndividualStatus(result as any);
          await new Promise((resolve) => setTimeout(resolve, 1500));
          results.push(result);
        }

      setSyncingStatus(results as []);
      setIsFetchingWearableWorkouts(false);
      setSyncingIndividualStatus(null);
      refetch();
    }
  };
  useEffect(() => {
    showIntegrationRelease();
    showDetectedWorkoutModal();
  }, []);

  useEffect(() => {
    if (route.params?.selectedDate) {
      setAppDate(new Date(route.params.selectedDate));
    }
    updateUser({
      input: {
        timezone: getTimezone(),
      },
    });
  }, [route]);

  //Note Component
  const DailyNote = ({
    id,
    title,
    body,
    dayNoteDay,
  }: {
    id: string;
    title: string;
    body: string;
    dayNoteDay: string;
  }) => {
    return (
      <Pressable
        onPress={() =>
          navigation.navigate("PrimaryStack_NoteScreen", {
            title,
            description: body,
          })
        }
        style={tw`flex items-center mx-4 mt-4`}
      >
        <View
          key={id}
          style={tw`flex bg-background-300 py-3 px-4 rounded-xl w-full min-h-18`}
        >
          <View style={tw`flex flex-row gap-x-2 mb-2`}>
            <View style={tw`pt-1`}>
              <AddNoteIcon width={20} height={20} />
            </View>
            <Text style={tw`font-poppins-medium text-white text-base`}>
              {title}
            </Text>
          </View>
          <View>
            <Text style={tw`text-xxs font-poppins-regular text-white`}>
              {truncate(body, 50, 50)}
            </Text>
          </View>
        </View>
        <View style={tw`border-b border-slate-500 border-2 mt-4 w-15 `} />
      </Pressable>
    );
  };
  const DailyNotes = (dayNotes: Note[]) =>
    dayNotes.map((notes: Note) =>
      DailyNote({
        id: notes.id,
        title: notes.title,
        body: notes.body,
        dayNoteDay: notes.dayNoteDay,
      })
    );

  const dayNotes =
    notes?.getAthleteNotes?.filter(
      (note) => note?.type === Coach_Note_Types.Day
    ) || [];
  const addIwfAlertNotification = async () => {
    await refetch();
    setShowAddIWFAlert(true);
    setTimeout(() => setShowAddIWFAlert(false), 3000);
    navigation.setParams({ addedIwf: false });
  };

  const removeIwfAlertNotification = async () => {
    await refetch();
    setShowRemoveIWFAlert(true);
    setTimeout(() => setShowRemoveIWFAlert(false), 3000);
    navigation.setParams({ removedIwf: false });
  };

  const checkWorkoutIntraPrompt = async (workoutId: string) => {
    const newWorkout = todaysActiveWorkouts?.find(
      (selectedActiveWorkout) =>
        selectedActiveWorkout?.id === workoutId &&
        selectedActiveWorkout?.intraFuellingPrompt === true &&
        selectedActiveWorkout?.source === Workout_Source.User
    );
    if (newWorkout) {
      setShowHeaderBanner(true);
      navigation.setParams({ workoutId: undefined });
    }
  };
  // FIXME: Navigates simultaneously to two different screens (wearable prompt screen and onboarding screen) instead to a wearable prompt screen, hence opted for a card component now
  const checkWearbleOpportunity = (workoutId: string) => {
    const newWorkout = todaysActiveWorkouts?.find(
      (selectedActiveWorkout) =>
        selectedActiveWorkout?.id === workoutId &&
        isCompletedWorkout(selectedActiveWorkout)
    );
    if (newWorkout) {
      setWearablePromptVisibility(true);
      navigation.setParams({ workoutId: undefined });
    }
  };

  const todaysActiveWorkouts = day?.workouts
    .filter((workout) => workout?.status === Workout_Status.Active)
    .sort((a, b) => {
      if (isBefore(new Date(a?.start), new Date(b?.start))) return -1;
      if (isBefore(new Date(b?.start), new Date(a?.start))) return 1;
      return 0;
    })
    .map((workout) => ({
      ...workout,
      time: workout?.start.split("T")[1].split(".")[0],
      isMeal: false,
    }));
  const activeWorkoutWithIntaFuellingPrompt = todaysActiveWorkouts
    ? todaysActiveWorkouts?.filter(
        (x) => x?.intraFuelling === false && x?.intraFuellingPrompt === true
      )
    : [];
  const todaysIncompleteWorkouts = day?.workouts?.filter(
    (workout) => workout?.status === Workout_Status.Incomplete
  );
  const todaysActiveMeals = day?.meals
    ?.filter(
      (meal) =>
        meal?.status === Meal_Nutrition_Status.Active &&
        meal.mealType !== Meal_Type.IntraFuelling
    )
    ?.map((meal) => ({
      ...meal,
      time: meal?.time.split(".")[0],
      isMeal: true,
    }));
  const combinedWorkoutsAndMeals = [
    ...(todaysActiveMeals || []),
    ...(todaysActiveWorkouts || []),
  ];
  const scrollInit = () => {
    topPosition.value = -120;
  };

  useEffect(() => {
    scrollInit();
    if (route.params?.addedIwf) addIwfAlertNotification();
    if (route.params?.removedIwf) removeIwfAlertNotification();
    if (route.params?.workoutId) {
      checkWorkoutIntraPrompt(route.params?.workoutId);
      checkWearbleOpportunity(route.params?.workoutId);
    }
  }, [isFocused, appDate, day]);

  if (loading && waitingSubScreen) {
    setWaitingSubScreen(false);
  }
  // when viewing 7 days ahead show 'unavailable carb code' message
  if (moreThanAWeekAhead(appDate)) return <NoData title="Carb codes" />;

  if (isFetchingWearableWorkouts && syncingIndividualStatus) {
    return (
      <ConnectUpdatingWearableLoading syncingStatus={syncingIndividualStatus} />
    );
  }
  if (loading || waitingSubScreen) {
    return <Loading />;
  }
  if (!day) {
    return <NoData title="Carb Codes" />;
  }
  const navgiateToCalendar = () => {
    navigation.navigate("PrimaryStack", {
      screen: "Calendar",
    });
  };
  const onWorkoutPress = (workout: IWorkout) => {
    navigation.navigate("PrimaryStack_AddEditWorkoutModal", {
      workoutId: workout?.id,
      modalTitle: `${workout?.id ? "View" : "Add"} Workout`,
    });
  };
  const deleteMealPlan = () => {
    deleteMeal({
      deleteMealId: selectedMeal?.id || "",
    });
    refetch();
    setOpenDeleteMealModal(false);
  };
  const iwfHeaderBannerCondition =
    showHeaderBanner &&
    activeWorkoutWithIntaFuellingPrompt.length > 0 &&
    clickedIntraPromptWorkout.length <
      activeWorkoutWithIntaFuellingPrompt.length;

  const incompleteWorkoutElements: (JSX.Element | null)[] =
    todaysIncompleteWorkouts?.map(
      (workout, index) =>
        workout && (
          <View key={index} style={tw`px-5`}>
            {index === 0 && dayNotes?.length == 0 && <View style={tw`mb-4`} />}
            {dayNotes?.length > 0 && <View style={tw`mb-4`} />}
            <WorkoutCard
              key={workout.id}
              workout={workout as Workout}
              onPress={() => onWorkoutPress(workout as IWorkout)}
              setWaitingSubScreen={setWaitingSubScreen}
              setClickedIntraPromptWorkout={setClickedIntraPromptWorkout}
              clickedIntraPromptWorkout={clickedIntraPromptWorkout}
            />
            {index + 1 === todaysIncompleteWorkouts?.length && (
              <View
                style={tw`border-b border-slate-500 border-2 w-15 mx-auto`}
              />
            )}
          </View>
        )
    ) || [];
  day?.meals.map((meal) => {
    if (!meal) return null;
    let ranges = [0, 0];
    if (day.carbRanges) {
      const isSnack = meal.mealType === Meal_Type.Snack;
      const range = day.carbRanges[isSnack ? "snackRange" : "mainRange"];

      if (meal?.carbCode === Carb_Code.Low) {
        ranges = [range.lowMin, range.lowMax];
      } else if (meal.carbCode == Carb_Code.Medium) {
        ranges = [range.medMin!, range.medMax];
      } else if (meal.carbCode === Carb_Code.High) {
        ranges = [range.highMin!, range.highMax];
      }
    }
  });
  const getNumberOfUnresolvedWorkoutsForTheDay = () =>
    day?.workouts?.filter(
      (workout) =>
        workout?.status === Workout_Status.Conflicted ||
        workout?.status === Workout_Status.Waiting
    )?.length || 0;

  const noUnresolvedWorkoutsForTheDay =
    getNumberOfUnresolvedWorkoutsForTheDay() === 0;

  return (
    <>
      <Animated.View style={animatedStyle} {...panResponder.panHandlers}>
        <SyncWorkoutLoading />
        <Animated.View
          style={opacityAnimatedStyle}
          onLayout={(event) => {
            if (event.nativeEvent.layout.height > mainHeight) {
              hiddenHeightRef.current =
                event.nativeEvent.layout.height - mainHeight + 100;
            }
          }}
        >
          {wearablePromptVisibility && (
            <WearablePrompt goBack={() => setWearablePromptVisibility(false)} />
          )}
          {day.fuelCoach &&
            (isUTCDateToday(appDate) ||
              isBefore(appDate, getLiteralDate())) && (
              <FuelMessage
                title={day.fuelCoach[0]!}
                message={day.fuelCoach[1]!}
                appendingMessage={day.fuelCoach[2]}
              />
            )}

          {day.fuelCoach &&
            !isUTCDateToday(appDate) &&
            isAfter(appDate, getLiteralDate()) &&
            isBefore(appDate, addDays(getLiteralDate(), 7)) && (
              <FuelMessage
                inactive={true}
                title="Available on the day"
                message="Check back on the day for your fuel plan insights."
              />
            )}

          {!noUnresolvedWorkoutsForTheDay && (
            <TouchableWithoutFeedback onPress={navgiateToCalendar}>
              <View
                style={[
                  tw`mx-4 py-2 my-4 rounded-xl bg-activeblue-500 border-l-8 border-activeblue-100`,
                ]}
              >
                <View style={tw`flex-row px-2 py-2 items-center`}>
                  <View style={tw`pr-2`}>
                    <BatteryChargingIcon />
                  </View>
                  <View>
                    <Text style={tw`text-base text-white font-poppins-medium`}>
                      Workout Calendar Conflict
                    </Text>
                    <Text style={tw`text-white text-xxs font-poppins-medium`}>
                      Please resolve in Calendar
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          )}

          {iwfHeaderBannerCondition && (
            <TouchableWithoutFeedback
              onPress={() => {
                setShowHeaderBanner(false);
                navigation.navigate("PrimaryStack_IwfRecommendedModal");
              }}
            >
              <View
                style={[
                  tw`mx-4 py-2 mt-4 rounded-xl bg-red bg-opacity-25 border-l-8 border-red`,
                ]}
              >
                <View style={tw`flex-row px-2 py-2 items-center`}>
                  <View style={tw`pr-2`}>
                    <BatteryChargingIcon color={tw.color("red")} />
                  </View>
                  <View>
                    <Text style={tw`text-xs text-white font-poppins-medium`}>
                      Intra Workout Fuelling Recommended
                    </Text>
                    <Text style={tw`text-white text-xxs font-poppins-regular`}>
                      Click Intra fuel icon to view and add
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          )}
          {dayNotes.filter((note) => note !== null).length > 0
            ? DailyNotes(dayNotes.filter((note) => note !== null) as Note[])
            : null}
          {incompleteWorkoutElements}
          <View style={tw`mx-4 mt-4`}>
            {combinedWorkoutsAndMeals &&
              combinedWorkoutsAndMeals.length > 0 &&
              combinedWorkoutsAndMeals
                ?.sort((itemA, itemB) => itemA.time.localeCompare(itemB.time))
                .map((workoutOrMeal) => {
                  if (workoutOrMeal?.isMeal) {
                    const meal = workoutOrMeal as Meal;
                    return (
                      <CarbCodeCard
                        onPressMeal={() => {
                          track("MEAL_GUIDE", {
                            // mealSlot: meal.slot,
                            carbCode: meal?.carbCode,
                          });
                          navigation.navigate(
                            "PrimaryStack_CarbCodeInspirationScreen",
                            {
                              carbCode: meal?.carbCode,
                              mealType: meal?.mealType ?? Meal_Type.Main,
                              ranges: day.carbRanges!,
                            }
                          );
                        }}
                        onPressVerify={() => {
                          const { mealVerification, ...rest } = meal;
                          navigation.navigate(
                            "PrimaryStack_FoodTrackingModal",
                            {
                              meal: rest,
                              mealVerification: mealVerification,
                              setWaitingSubScreen: setWaitingSubScreen,
                              ranges: day.carbRanges!,
                            }
                          );
                        }}
                        onPressAdHocMeal={() => {
                          navigation.navigate("PrimaryStack_AddEditMealModal", {
                            name: meal?.mealName || "",
                            time: meal?.time,
                            id: meal?.id,
                            mealType: meal?.mealType ?? Meal_Type.Main,
                          });
                        }}
                        onPressDeleteAdHocMeal={() => {
                          setSelectedMeal(meal);
                          setOpenDeleteMealModal(true);
                        }}
                        key={`${meal?.mealName}${meal?.time}`}
                        meal={meal}
                        carbRange={
                          meal.mealType === Meal_Type.Snack
                            ? day.carbRanges?.snackRange
                            : day.carbRanges?.mainRange
                        }
                      />
                    );
                  } else {
                    const workout = workoutOrMeal as Workout;
                    let [intraworkoutFuellingRecommendations] = (
                      day.intraFuellingRecommendations || []
                    ).filter((x) => x?.workoutId === workout.id);
                    return (
                      <WorkoutCard
                        key={workout.id}
                        workout={workout}
                        ranges={day.carbRanges!}
                        setWaitingSubScreen={setWaitingSubScreen}
                        intraFuellingRecommendations={
                          intraworkoutFuellingRecommendations as IntraFuellingRecommendation
                        }
                        onPress={() => onWorkoutPress(workout as IWorkout)}
                        setClickedIntraPromptWorkout={
                          setClickedIntraPromptWorkout
                        }
                        clickedIntraPromptWorkout={clickedIntraPromptWorkout}
                      />
                    );
                  }
                })}
          </View>

          <ErrorModal
            cancel={false}
            show={showWorkoutsErrorModal}
            errorMessage="You can not edit workouts on previous days"
            buttonTitle="OK"
            onDismiss={() => {
              setShowWorkoutsErrorModal(false);
            }}
            onRedirect={() => setShowWorkoutsErrorModal(false)}
          />
          <ErrorModal
            titleThick={true}
            show={openDeleteMealModal}
            errorMessage={`Are you sure you want to delete ${selectedMeal?.mealName}?`}
            errorMessageDescription="Removing this meal will deleted any food log and recalculate your Fuel Plan"
            buttonTitle="Yes, remove"
            buttonCancelTitle="No, cancel"
            onDismiss={() => {
              setOpenDeleteMealModal(false);
            }}
            onRedirect={deleteMealPlan}
          />
          <IntegrationReleaseModal
            show={showIntegration}
            navigation={navigation}
            onDismiss={() => {
              AsyncStorage.setItem("integrationRelease", "true");
              setShowIntegration(false);
            }}
          />
          <AppUpdateModal />

          <View style={tw`mx-4`}></View>
        </Animated.View>
      </Animated.View>
    </>
  );
};

export default PrimaryStack_CarbCodesScreen;
