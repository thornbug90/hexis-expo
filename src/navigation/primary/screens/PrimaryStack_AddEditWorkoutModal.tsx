import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { format, isBefore } from "date-fns";
import Tooltip from "rn-tooltip";
import { addMinutes, roundToNearestMinutes, set } from "date-fns/esm";
import { useAnalytics } from "@segment/analytics-react-native";
import React, { useEffect, useState, useLayoutEffect } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  View,
  Text,
  TouchableWithoutFeedback,
  Alert,
  Dimensions,
  TextInput,
  Pressable,
} from "react-native";
import dayjs from "dayjs";
import cx from "classnames";
import {
  ChevronDownIcon,
  InfoIcon,
  KeyPerformanceIcon,
  TrophyIcon,
} from "../../../components/icons/general";
import Button from "../../../components/shared/Button";
import Card from "../../../components/shared/Card";
import Label from "../../../components/shared/Label";
import WorkoutDetailItem from "../../../components/workouts/WorkoutDetailItem";
import ErrorModal from "../../../components/shared/ErrorModal";
import Loading from "../../../components/shared/LoadingScreen";
import {
  useCreateRecurringWorkoutMutation,
  useCreateWorkoutMutation,
  useDeleteWorkoutMutation,
  useUpdateWorkoutMutation,
  Workout,
  Workout_Intensity,
  Workout_Source,
  Workout_Status,
} from "../../../generated/graphql";
// import Slider from "@react-native-community/slider";
import { Slider } from "@miblanchard/react-native-slider";
import useAppDate from "../../../hooks/useAppDate";
import useRefetchDay from "../../../hooks/useRefetchDay";
import activities from "../../../lib/activities";
import client from "../../../lib/graphql";
import tw from "../../../lib/tw";
import { PrimaryStackParamsList } from "../PrimaryStack";
import useDay from "../../../hooks/useDay";
import useWorkoutsByDay from "../../../hooks/useWorkoutsByDay";
import {
  getLiteralDate,
  moreThanAWeekAhead,
  isSameDay,
  dateToHHMM,
  getTimeArrayFromDurationString,
  getTimeArrayFromStartString,
} from "../../../utils/date";
import {
  isCompletedWorkout,
  isPlannedWorkout,
  isIncompletedWorkout,
  isWearableWorkout,
  isActualWorkout,
} from "../../../utils/plannedCompletedWorkout";
import IconButton from "../../../components/shared/IconButton";
import SvgChevronRight from "../../../components/icons/general/ChevronRight";
import DateTimePicker from "react-native-modal-datetime-picker";
import SvgTrash from "../../../components/icons/general/Trash";
import WarningIcon from "../../../components/icons/general/WarningIcon";
import PencilIcon from "../../../components/icons/general/PencilIcon";
import { toTitleCase } from "../../../utils/string";
import IntensityInfoModal from "../../../components/workouts/IntensityInfoModal";
import { IdsNeedPowerAvgs, intensityMapping } from "../../../lib/intensity";
type Props = NativeStackScreenProps<
  PrimaryStackParamsList,
  "PrimaryStack_AddEditWorkoutModal"
>;

export interface IWorkout {
  id?: string;
  activityId?: string;
  activity?: {
    id: string;
  };
  start: Date;
  end: Date;
  utcOffset: number;
  intraFuelling?: boolean;
  intraFuellingPrompt?: boolean;
  competition: boolean;
  key: boolean;
  recurring?: boolean;
  source?: Workout_Source | null;
  status?: Workout_Status | null;
  calories?: number | null;
  confirmed?: boolean | null;
  externalReference?: string | null;
  title?: string | null;
  description?: string | null;
  startTime?: string | null;
  powerAverage?: number | null;
  intensityRPE?: number | null;
}
type IActivity = {
  id: string;
  slug: any;
  name: any;
  icon: any;
};
type ErrorMsgs = {
  duration: null | string;
  startTime: null | string;
  activity: null | string;
  startDate: null | string;
};
const PrimaryStack_AddEditWorkoutModal: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { track } = useAnalytics();

  const [isEdit, setIsEdit] = useState<boolean>(false);

  const [_, setRefetchDay] = useRefetchDay();
  const [appDate, setAppDate] = useAppDate();
  const { data: day, loading: dayLoading, refetch } = useDay();
  const [open, setOpen] = useState<boolean>(false);
  const [workoutLoading, setWorkoutLoading] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  let existingWorkout = {} as { workout: IWorkout };
  const showErrorline: string = "border border-1 border-red";
  const currentExistingWorkout = day?.workouts.find(
    (workout) => workout?.id === route.params?.workoutId
  );
  const [duration, setDuration] = useState<string>("");
  const [start, setStart] = useState<string>("");
  const [intensityRPE, setIntensityRPE] = useState<number>(0);
  if (currentExistingWorkout) {
    existingWorkout = { workout: currentExistingWorkout as IWorkout };
  }
  const [visibleError, setVisibleError] = useState<boolean>(false);
  const [selectedActivity, setSelectedActivity] = useState<IActivity | null>(
    null
  );
  const [errorMsgs, setErrorMsgs] = useState<ErrorMsgs>({
    duration: null,
    startTime: null,
    startDate: null,
    activity: null,
  });
  const [showMaxWorkoutsErrorModal, setShowMaxWorkoutsErrorModal] =
    useState<boolean>(false);
  const [focus, setFocus] = useState<boolean>(false);
  const [dateSelected, setDateSelected] = useState<Date>(appDate);
  const { data: workoutsByDay, loading: workoutsByDayLoading } =
    useWorkoutsByDay(dateSelected);
  const [recurring, setRecurring] = useState<boolean>(false);
  const [workout, setWorkout] = useState<IWorkout>({
    start: roundToNearestMinutes(
      dayjs(route.params?.selectedDate || appDate)
        .add(new Date().getHours(), "h")
        .add(new Date().getMinutes(), "m")
        .toDate(),
      { nearestTo: 15 }
    ),
    end: addMinutes(
      roundToNearestMinutes(
        dayjs(route.params?.selectedDate || appDate)
          .add(new Date().getHours(), "h")
          .add(new Date().getMinutes(), "m")
          .toDate(),
        { nearestTo: 15 }
      ),
      30
    ),
    utcOffset: dayjs().utcOffset(),
    competition: false,
    key: false,
    source: Workout_Source.User,
    status: Workout_Status.Active,
    calories: undefined,
    confirmed: false,
    externalReference: undefined,
    title: undefined,
    description: undefined,
    powerAverage: undefined,
    intensityRPE: 0,
  });
  const [showIntensityInfoModal, setShowIntensityInfoModal] =
    useState<boolean>(false);
  const dateToHHMM = (date: Date | string) => {
    return `${new Date(date)
      .getUTCHours()
      .toString()
      .padStart(2, "0")}:${new Date(date)
      .getUTCMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const showValidationError = () => {
    if (workoutLoading === false) {
      setErrorMsgs((prev) => ({
        ...prev,
        startTime: start ? null : "Info required",
        duration: duration ? null : "Info required",
        activity: workout?.activityId ? null : "Info required",
      }));
    }
  };
  const { mutate: createWorkout, isLoading: createWorkoutLoading } =
    useCreateWorkoutMutation(client, {
      onSuccess: async (data) => {
        track("WORKOUT_ADDED", {
          ...workout,
          start: workout.start.toISOString(),
          end: workout.end.toISOString(),
          recurring,
        });

        setRefetchDay(true);
        await refetch();

        // TODO: Delete this as per https://hexisapp.atlassian.net/browse/WEAR1-72
        if (moreThanAWeekAhead(dateSelected)) {
          navigation.navigate("PrimaryStack", {
            screen: "PrimaryStack_CarbCodesScreen",
            selectedDate: getLiteralDate(),
            workoutId: data.createWorkout.id,
          });
        } else {
          navigation.navigate("PrimaryStack", {
            screen: "PrimaryStack_CarbCodesScreen",
            selectedDate: dateSelected,
            workoutId: data.createWorkout.id,
          });
        }
      },
    });

  const ErrorField = ({ error }: { error: string }) => {
    return (
      <View style={tw`flex-row flex-1 gap-2 items-center`}>
        <WarningIcon width={16} height={16} color={tw.color("red")} />
        <Text
          style={tw`text-red text-sm font-poppins-regular tracking-[0.25px] mt-1`}
        >
          {error}
        </Text>
      </View>
    );
  };
  const showConfirmButtonWearables = [
    Workout_Source.AppleHealth,
    Workout_Source.HealthConnect,
    Workout_Source.Wearable,
    Workout_Source.Point,
    Workout_Source.Garmin,
  ];
  const { mutate: createRecurringWorkout } =
    useCreateRecurringWorkoutMutation(client);

  const { mutate: updateWorkout, isLoading: updateWorkoutLoading } =
    useUpdateWorkoutMutation(client, {
      onSuccess: () => {
        track("UPDATE_WORKOUT", {
          ...workout,
          start: workout.start.toISOString(),
          end: workout.end.toISOString(),
        });

        setRefetchDay(true);
        refetch();
        // TODO: Delete this as per https://hexisapp.atlassian.net/browse/WEAR1-72
        if (moreThanAWeekAhead(dateSelected)) {
          navigation.navigate("PrimaryStack", {
            screen: "PrimaryStack_CarbCodesScreen",
            selectedDate: getLiteralDate(),
            workoutId: currentExistingWorkout?.id,
          });
        } else {
          navigation.navigate("PrimaryStack", {
            screen: "PrimaryStack_CarbCodesScreen",
            selectedDate: dateSelected,
            workoutId: currentExistingWorkout?.id,
          });
        }
      },
    });

  // NEW CODE
  const { mutate: deleteWorkout, isLoading: deleteWorkoutLoading } =
    useDeleteWorkoutMutation(client, {
      onSuccess: () => {
        setRefetchDay(true);
        refetch();

        // TODO: Delete this as per https://hexisapp.atlassian.net/browse/WEAR1-72
        if (moreThanAWeekAhead(dateSelected)) {
          navigation.navigate("PrimaryStack", {
            screen: "PrimaryStack_CarbCodesScreen",
            selectedDate: getLiteralDate(),
          });
        } else {
          navigation.navigate("PrimaryStack", {
            screen: "PrimaryStack_CarbCodesScreen",
            selectedDate: dateSelected,
          });
        }
      },
    });
  const changeIntensity = (value: number) => {
    setIntensityRPE(value);
    setWorkout({ ...workout, intensityRPE: value });
  };
  const getDurationTime = (start: string, end: string) => {
    // Split the time strings into hours and minutes
    const startParts = start.split(":").map(Number);
    const endParts = end.split(":").map(Number);

    // Convert both times into minutes
    const startTimeInMinutes = startParts[0] * 60 + startParts[1];
    const endTimeInMinutes = endParts[0] * 60 + endParts[1];

    // Calculate the difference
    let differenceInMinutes = endTimeInMinutes - startTimeInMinutes;

    // Handling cases where the end time is before the start time (e.g., crossing midnight)
    if (differenceInMinutes < 0) {
      differenceInMinutes += 24 * 60; // Assuming a 24-hour format
    }

    // Convert the difference back into hours and minutes format
    const hours = Math.floor(differenceInMinutes / 60);
    const minutes = differenceInMinutes % 60;

    // Format the result
    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");

    return formattedHours == "00" && formattedMinutes == "00"
      ? ""
      : `${formattedHours}h ${formattedMinutes}m`;
  };
  useEffect(() => {
    if (existingWorkout?.workout && existingWorkout?.workout?.id) {
      setVisibleError(true);
      setWorkout({
        id: existingWorkout.workout?.id,
        activityId: existingWorkout.workout?.activity?.id,
        title: existingWorkout.workout?.title,
        description: existingWorkout.workout?.description,
        start: new Date(existingWorkout.workout?.start),
        end: new Date(existingWorkout.workout?.end),
        utcOffset: existingWorkout.workout?.utcOffset!,
        intensityRPE: existingWorkout.workout?.intensityRPE!,
        competition: existingWorkout.workout?.competition!,
        key: existingWorkout.workout?.key!,
        source: existingWorkout.workout?.source!,
        status: existingWorkout.workout?.status!,
        calories: existingWorkout.workout?.calories,
        confirmed: existingWorkout.workout?.confirmed,
        externalReference: existingWorkout.workout?.externalReference,
        powerAverage: existingWorkout.workout?.powerAverage!,
      });

      setSelectedActivity(
        activities[
          existingWorkout.workout?.activity?.id as keyof typeof activities
        ]
      );
      setRecurring(existingWorkout.workout?.recurring!);
      const startTime = dateToHHMM(existingWorkout?.workout?.start);
      const endTime = dateToHHMM(existingWorkout?.workout?.end);
      setDuration(getDurationTime(startTime, endTime));
      setStart(
        existingWorkout?.workout?.startTime ||
          existingWorkout?.workout?.source === Workout_Source.User ||
          existingWorkout?.workout?.source === Workout_Source.Coach
          ? startTime
          : ""
      );
      setIntensityRPE(existingWorkout?.workout?.intensityRPE || 0);
      if (isIncompletedWorkout(existingWorkout?.workout)) {
        navigation.setOptions({
          title: "Edit Workout",
        });
        setIsEdit(true);
      }

      setWorkoutLoading(false);
    }
  }, [dayLoading, existingWorkout?.workout?.id, route?.params?.workoutId]);
  useEffect(() => {
    if (route.params?.workoutId) {
      setWorkout((pre) => ({
        ...pre,
        id: route.params?.workoutId,
      }));
    } else {
      setIsEdit(true);
      setWorkoutLoading(false);
    }
    if (route.params?.activityId) {
      setSelectedActivity(
        activities[route.params.activityId as keyof typeof activities]
      );
      setWorkout((pre) => ({
        ...pre,
        activityId: route?.params?.activityId as keyof typeof activities,
      }));
    }

    if (route.params?.selectedDate) {
      setDateSelected(route.params.selectedDate);
      setAppDate(route.params.selectedDate);
    }

    if (route.params?.goBack) {
      navigation.goBack();
    }
  }, [JSON.stringify(route.params)]);

  useEffect(() => {
    if (start && duration) {
      function getTimeArrayFromString(timeString: string) {
        const regex = /(\d{2})h\s*(\d{2})m/;
        const matches = timeString.match(regex);
        if (matches && matches.length === 3) {
          const hours = parseInt(matches[1]);
          const minutes = parseInt(matches[2]);
          return [hours, minutes];
        } else {
          return [0, 0]; // Invalid input format
        }
      }

      let startDate = new Date(workout?.start);
      let endDate = new Date(workout?.start);
      const startHour = Number(start.split(":")[0]);
      const startMinute = Number(start.split(":")[1]);
      const endHour = (getTimeArrayFromString(duration) as any)[0];
      const endMinute = (getTimeArrayFromString(duration) as any)[1];
      startDate.setUTCHours(startHour);
      startDate.setUTCMinutes(startMinute);
      if (
        startHour + endHour >= 24 ||
        (startHour + endHour == 23 && startMinute + endMinute > 59)
      ) {
        const limitDuration = `${(23 - startHour)
          .toString()
          .padStart(2, "0")}h ${(59 - startMinute)
          .toString()
          .padStart(2, "0")}m`;
        setDuration(limitDuration);
        endDate.setUTCHours(23);
        endDate.setUTCMinutes(59);
      } else {
        endDate.setUTCHours(startHour + endHour);
        endDate.setUTCMinutes(startMinute + endMinute);
        setWorkout((prev) => ({
          ...prev,
          start: startDate,
          end: endDate,
        }));
      }
    }
  }, [start, duration]);

  useEffect(() => {
    if (visibleError) {
      showValidationError();
    }
  }, [workout.activityId, start, duration]);
  const checkNoWorkouts = (workoutDate: Date, workoutDateSelected: Date) => {
    if (!isSameDay(workoutDateSelected, workoutDate)) {
      if (workoutsByDay && workoutsByDay?.length > 1) {
        setShowMaxWorkoutsErrorModal(true);
        return true;
      } else {
        return false;
      }
    }
    return false;
  };

  //for android date picker
  const handleConfirmStart = (value: Date): void => {
    setOpen(false);
    let selectedDate: Date = new Date(value);
    let updatedValue = `${selectedDate
      .getHours()
      .toString()
      .padStart(2, "0")}:${selectedDate
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    setStart(updatedValue);
  };
  const handleConfirmDuration = (value: Date): void => {
    setIsVisible(false);
    let selectedDate: Date = new Date(value);
    let updatedValue = `${selectedDate
      .getHours()
      .toString()
      .padStart(2, "0")}h ${selectedDate
      .getMinutes()
      .toString()
      .padStart(2, "0")}m`;
    setDuration(updatedValue == "00h 00m" ? "" : updatedValue);
  };
  const hideDatePicker = () => {
    setIsVisible(false);
  };
  const removeUnnecessaryFields = (workout: any) => {
    const { id, source, externalReference, ...rest } = workout;
    return { id, ...rest };
  };
  const updateWorkoutWithStatus = (workout: any, status: any) => {
    const { id, ...rest } = removeUnnecessaryFields(workout);
    updateWorkout({
      id: id!,
      input: {
        ...rest,
        status,
      },
    });
  };

  const sliderIntensityTitle = (() => {
    const intenstiyValueArray = Object.keys(intensityMapping)
      .map(Number)
      .reverse();
    for (const intensityValue of intenstiyValueArray) {
      if (intensityRPE >= intensityValue) {
        return intensityMapping[
          intensityValue as keyof typeof intensityMapping
        ];
      }
    }
  })();

  const ranges = [
    { max: 10, position: -16 },
    { max: 20, position: -22 },
    { max: 33, position: -28 },
    { max: 46, position: -34 },
    { max: 60, position: -64 },
    { max: 77, position: -40 },
    { max: 93, position: -52 },
    { max: 100, position: -85 },
  ];

  const intensityTitlePosition =
    ranges.find((range) => intensityRPE < range.max)?.position ?? -64;
  const onSave = () => {
    setVisibleError(true);
    showValidationError();

    const isWorkoutInvalid = !start || !duration || !workout?.activityId;
    const isWorkoutActive =
      !isEdit &&
      !workout?.confirmed &&
      workout?.status === Workout_Status.Active;
    const isEndTimeBeforeStartTime = isBefore(
      new Date(workout.end),
      new Date(workout.start)
    );
    const isWorkoutExists = workout.id;
    const isNoWorkouts = checkNoWorkouts(appDate, workout.start);

    if (isWorkoutInvalid) {
      return;
    }

    if (isIncompletedWorkout(workout) || isWorkoutActive || isWorkoutExists) {
      updateWorkoutWithStatus(workout, Workout_Status.Active);
      return;
    }

    if (isEndTimeBeforeStartTime) {
      return Alert.alert(
        "Error",
        "The end time on your workout is before your start time, please correct this"
      );
    }

    if (!isNoWorkouts) {
      delete workout.status;
      delete workout.confirmed;
      delete workout.externalReference;
      const workoutInput = {
        input: {
          ...workout,
          activityId: workout.activityId || "",
          intensityRPE: intensityRPE,
        },
      };
      recurring
        ? createRecurringWorkout(workoutInput)
        : createWorkout(workoutInput);
    }
  };
  const onDeleteWorkout = () => {
    if (existingWorkout.workout?.intraFuelling) {
      navigation.navigate("PrimaryStack_DeleteIntraWorkoutPrompt", {
        workout: workout as Workout,
        dateSelected: dateSelected,
      });
    } else {
      const { id, ...rest } = workout;
      delete rest.externalReference;
      delete rest.source;
      updateWorkout({
        id: workout.id!,
        input: {
          ...rest,
          status: Workout_Status.Discarded,
        },
      });
    }
  };

  const isCompleted: boolean = isCompletedWorkout(workout);
  const isIncompleted: boolean = isIncompletedWorkout(workout);
  const intensityInfo =
    "During hard workouts you will be breathing heavily and spend time at >80% of your max HR. During moderate workouts you will be slightly breathless and spend time between 70-80% of your max HR. During light workouts you can typically still talk easily and spend time <70% of your max HR.";
  const workoutDetailInfo =
    "Competition refers to competitive events. This also includes games, matches and races. Key performance refers to the most important training events of your week.";
  const isDisabled =
    isEdit || isIncompleted
      ? false
      : (workout.id! && recurring) /* || isPastDay */ ||
        isCompleted ||
        isPlannedWorkout(workout)
      ? true
      : false;
  const height = Dimensions.get("screen").height;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        existingWorkout?.workout?.id &&
        !isIncompletedWorkout(existingWorkout?.workout) &&
        !isEdit && (
          <Pressable
            style={tw`mb-1`}
            onPress={() => {
              setIsEdit(true);
              navigation.setOptions({
                title: "Edit Workout",
              });
            }}
          >
            <PencilIcon />
          </Pressable>
        ),
    });
  }, [navigation, workout, isEdit]);

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={tw`flex-grow`}
      resetScrollToCoords={{ x: 0, y: 0 }}
      scrollEnabled={true}
    >
      <View>
        {dayLoading || workoutsByDayLoading || workoutLoading ? (
          <View
            style={[tw`items-center justify-center`, { height: height - 150 }]}
          >
            <Loading backgroundColor="transparent" />
          </View>
        ) : (
          <View>
            <View style={tw`mx-4`}>
              <>
                <View style={tw`mb-6`}>
                  <View>
                    <TouchableWithoutFeedback
                      onPress={() => {
                        navigation.navigate(
                          "PrimaryStack_ChooseActivityScreen",
                          {
                            workoutId: workout?.id,
                          }
                        );
                      }}
                      disabled={isDisabled}
                    >
                      <View>
                        <View
                          style={tw`flex flex-row justify-between bg-background-370 items-center self-stretch rounded-lg h-16 ${
                            errorMsgs.activity ? showErrorline : ""
                          }`}
                        >
                          <View
                            style={tw`flex flex-row py-3 px-4 items-center gap-3`}
                          >
                            <View style={tw`w-7.5 h-7.5`}>
                              {selectedActivity?.icon && (
                                <selectedActivity.icon
                                  color={tw.color("bg-activeblue-100")}
                                />
                              )}
                            </View>
                            <Text
                              style={tw`font-poppins-light text-base text-white tracking-[0.25px] ${
                                isDisabled ? "opacity-50" : ""
                              }`}
                            >
                              {selectedActivity?.name}
                            </Text>
                          </View>

                          <View>
                            <IconButton
                              Icon={SvgChevronRight}
                              variant="transparent"
                              size="xsmall"
                              style={`bg-background-370 flex mb-0 px-[10px] ${
                                isDisabled ? "opacity-50" : ""
                              }`}
                            />
                          </View>
                        </View>
                        {errorMsgs.activity && (
                          <ErrorField error={errorMsgs.activity} />
                        )}
                      </View>
                    </TouchableWithoutFeedback>

                    <View
                      style={tw`mt-4 bg-background-370 pt-3 pb-2.5 px-4 self-stretch flex justify-center rounded-lg`}
                    >
                      <Text
                        style={tw`font-poppins-medium text-xxs tracking-[1px] text-pichart-carbs`}
                      >
                        WORKOUT TITLE
                      </Text>
                      <TextInput
                        style={tw` rounded-md min-h-6 font-poppins-regular text-white text-base pb-0 ${
                          isDisabled ? "opacity-50" : ""
                        }`}
                        value={workout.title || ""}
                        onChangeText={(value) =>
                          setWorkout({ ...workout, title: value })
                        }
                        placeholder="Untitled Workout"
                        placeholderTextColor={"grey"}
                        returnKeyType={"previous"}
                        editable={!isDisabled}
                      />
                    </View>
                    <View
                      style={tw`mt-4 bg-background-370 py-3 px-4 self-stretch flex justify-center rounded-lg`}
                    >
                      <Text
                        style={tw`font-poppins-medium text-xxs tracking-[1px] text-pichart-carbs`}
                      >
                        DATE
                      </Text>
                      <Text
                        style={tw`font-poppins-light text-white opacity-50 text-base tracking-[0.15px]`}
                      >
                        {new Date(
                          workout?.start.toISOString().replace("Z", "")
                        ).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </Text>
                    </View>
                    {isWearableWorkout(workout) && (
                      <View
                        style={tw`mt-4 bg-background-370 pt-3 pb-2.5 px-4 self-stretch flex justify-center rounded-lg`}
                      >
                        <Text
                          style={tw`font-poppins-medium text-xxs tracking-[1px] text-pichart-carbs`}
                        >
                          CALORIES
                        </Text>
                        <TextInput
                          style={tw` rounded-md min-h-6 font-poppins-regular text-base text-white pb-0 ${
                            isDisabled ? "opacity-50" : ""
                          }`}
                          value={
                            workout.calories ? workout.calories.toString() : ""
                          }
                          onChangeText={(value) =>
                            setWorkout({
                              ...workout,
                              calories: parseInt(value),
                            })
                          }
                          placeholder="Enter Kcal"
                          placeholderTextColor={"grey"}
                          returnKeyType="done"
                          editable={!isDisabled}
                        />
                      </View>
                    )}
                  </View>
                  <View style={tw`flex flex-row gap-3 z-100`}>
                    <View
                      style={tw`mt-4 bg-background-370 py-3 px-4 self-stretch z-100 flex justify-center rounded-lg flex-1 ${
                        errorMsgs.startTime ? showErrorline : ""
                      }`}
                    >
                      <Text
                        style={tw`font-poppins-medium text-xxs tracking-[1px] text-pichart-carbs`}
                      >
                        START TIME
                      </Text>
                      <TouchableWithoutFeedback
                        onPress={() => {
                          if (isEdit) {
                            setOpen(true);
                          }
                        }}
                      >
                        <View style={tw`flex-row items-center justify-between`}>
                          <Text
                            style={tw`font-poppins-light text-white opacity-${
                              !isEdit ? 50 : 100
                            } text-base tracking-[0.15px]`}
                          >
                            {start ? start : "Choose"}
                          </Text>
                          <ChevronDownIcon
                            height={24}
                            width={24}
                            color={tw.color("white")}
                            viewBox="0 0 24 24"
                          />
                        </View>
                      </TouchableWithoutFeedback>
                    </View>

                    <View
                      style={tw`mt-4 bg-background-370 py-3 px-4 self-stretch flex justify-center rounded-lg flex-1 ${
                        errorMsgs.duration ? showErrorline : ""
                      }`}
                    >
                      <Text
                        style={tw`font-poppins-medium text-xxs tracking-[1px] text-pichart-carbs`}
                      >
                        DURATION
                      </Text>
                      <TouchableWithoutFeedback
                        onPress={() => {
                          if (!isEdit) {
                            return;
                          }
                          setIsVisible(true);
                        }}
                      >
                        <Text
                          style={tw`font-poppins-light text-white opacity-${
                            !isEdit ? 50 : 100
                          } text-base tracking-[0.15px]`}
                        >
                          {duration ? duration : "Choose"}
                        </Text>
                      </TouchableWithoutFeedback>
                    </View>
                  </View>
                  <View style={tw`flex-row gap-3`}>
                    <View style={tw`w-1/2`}>
                      {errorMsgs.startTime && (
                        <ErrorField error={errorMsgs.startTime} />
                      )}
                    </View>
                    <View style={tw`w-1/2`}>
                      {errorMsgs.duration && (
                        <ErrorField error={errorMsgs.duration} />
                      )}
                    </View>
                  </View>
                  {IdsNeedPowerAvgs.includes(workout.activityId!) && (
                    <View
                      style={tw`mt-4 bg-background-370 pt-3 pb-2.5 px-4 self-stretch flex justify-center rounded-lg`}
                    >
                      <Text
                        style={tw`font-poppins-medium text-xxs tracking-[1px] text-pichart-carbs`}
                      >
                        AVERAGE POWER
                      </Text>
                      <TextInput
                        style={tw` rounded-md min-h-6 font-poppins-regular text-white pb-0 ${
                          isDisabled ? "opacity-50" : ""
                        }`}
                        value={
                          workout.powerAverage
                            ? `${workout.powerAverage.toString()}${
                                focus ? "" : " W"
                              }`
                            : ""
                        }
                        onChangeText={(value) =>
                          setWorkout({
                            ...workout,
                            powerAverage: value.match(/\d+/g)
                              ? Number(value.match(/\d+/g)?.join(""))
                              : undefined,
                          })
                        }
                        placeholder="000W (optional)"
                        placeholderTextColor={"grey"}
                        returnKeyType="done"
                        keyboardType="numeric"
                        editable={!isDisabled}
                        onFocus={() => {
                          setFocus(true);
                        }}
                        onBlur={() => {
                          setFocus(false);
                        }}
                      />
                    </View>
                  )}
                  <View style={tw`mt-6`}>
                    <View
                      style={tw`flex-row justify-between items-center w-full`}
                    >
                      <View style={tw`flex-row`}>
                        <Label text="Intensity" />

                        <Tooltip
                          actionType="press"
                          popover={
                            <Text
                              style={tw`text-xs text-white font-poppins-regular`}
                            >
                              {intensityInfo}
                            </Text>
                          }
                          withOverlay={false}
                          width={145}
                          height={54}
                          backgroundColor="#7476A6"
                        >
                          <Pressable
                            style={tw`h-4 w-4 ml-2`}
                            onPress={() => setShowIntensityInfoModal(true)}
                          >
                            <InfoIcon color="white" />
                          </Pressable>
                        </Tooltip>
                      </View>
                    </View>
                    <View style={tw`flex-col mt-7.5`}>
                      <Slider
                        disabled={isDisabled}
                        value={intensityRPE}
                        onValueChange={(value: number[]) =>
                          changeIntensity(value[0])
                        }
                        step={1}
                        minimumValue={0}
                        maximumValue={100}
                        minimumTrackTintColor={
                          isDisabled
                            ? tw.color("bg-activeblue-300")
                            : tw.color("bg-activeblue-100")
                        }
                        maximumTrackTintColor={tw.color("bg-background-370")}
                        thumbTintColor={tw.color("bg-white")}
                        trackStyle={tw`h-3 rounded-full `}
                        thumbStyle={tw`w-8 h-8 rounded-full ${
                          isDisabled ? "bg-background-200" : ""
                        }`}
                        renderAboveThumbComponent={() => (
                          <View
                            style={[
                              tw`flex-row py-0.5 px-2 justify-center items-center gap-2 rounded-sm bg-background-300`,
                              {
                                transform: [
                                  { translateY: -8 },
                                  {
                                    translateX: intensityTitlePosition,
                                  },
                                ],
                              },
                            ]}
                          >
                            <Text
                              style={tw`text-white font-poppins-regular tracking-[0.25px] text-xs`}
                            >
                              {sliderIntensityTitle}
                            </Text>
                            <Text
                              style={tw`text-white font-poppins-semibold tracking-[0.25px] text-xs`}
                            >
                              {intensityRPE}
                            </Text>
                          </View>
                        )}
                      />
                    </View>
                  </View>
                  <View style={tw`mt-4`}>
                    <View style={tw`flex-row`}>
                      <Label text="Workout Detail" />
                      <Tooltip
                        actionType="press"
                        popover={
                          <Text
                            style={tw`text-xs text-white font-poppins-regular`}
                          >
                            {workoutDetailInfo}
                          </Text>
                        }
                        withOverlay={false}
                        width={250}
                        height={110}
                        backgroundColor="#7476A6"
                      >
                        <View style={tw`h-4 w-4 ml-2`}>
                          <InfoIcon color="white" />
                        </View>
                      </Tooltip>
                    </View>

                    <WorkoutDetailItem
                      disabled={isDisabled}
                      onChange={(val) => setWorkout({ ...workout, key: val })}
                      leftIcon={KeyPerformanceIcon}
                      label="Key Performance"
                      value={workout.key}
                    />
                    <WorkoutDetailItem
                      disabled={isDisabled}
                      onChange={(val) =>
                        setWorkout({ ...workout, competition: val })
                      }
                      leftIcon={TrophyIcon}
                      label="Competition"
                      value={workout.competition}
                    />
                  </View>
                  <View
                    style={tw`mt-4 bg-background-370 pt-3 pb-1 px-4 self-stretch flex justify-center rounded-lg`}
                  >
                    <Text
                      style={tw`font-poppins-medium text-xxs tracking-[1px] text-pichart-carbs`}
                    >
                      DESCRIPTION
                    </Text>
                    <TextInput
                      style={tw`bg-background-370 rounded-md min-h-12 font-poppins-regular text-white ${
                        isDisabled ? "opacity-50" : ""
                      }`}
                      value={workout.description || ""}
                      onChangeText={(value) =>
                        setWorkout({ ...workout, description: value })
                      }
                      textAlignVertical={"top"}
                      placeholder="Describe your workout"
                      placeholderTextColor={"grey"}
                      returnKeyType="default"
                      multiline={true}
                      numberOfLines={5}
                      editable={!isDisabled}
                    />
                  </View>
                </View>
              </>

              <>
                {existingWorkout.workout?.intraFuelling && (
                  <View>
                    <Text
                      style={tw`text-red font-poppins-semibold pb-4 text-xs`}
                    >
                      Editing may update your Intra Workout Fuelling & Fuel
                      Plan.
                    </Text>
                  </View>
                )}

                {/* save button in here */}
                {!workout.id && (
                  <View style={tw``}>
                    <Button
                      size="small"
                      style="mx-4"
                      variant="primary"
                      label="Save Workout"
                      disabled={
                        createWorkoutLoading || updateWorkoutLoading
                          ? true
                          : workout.id
                          ? false
                          : !workout.activityId
                      }
                      loading={createWorkoutLoading || updateWorkoutLoading}
                      onPress={onSave}
                    />
                  </View>
                )}
                {/* {workout.id && !isPastDay && !recurring && ( */}
                {workout.id && !recurring && (
                  <View style={tw``}>
                    <View style={tw`flex-row mb-2`}>
                      {(isEdit || isIncompletedWorkout(workout)) && (
                        <Button
                          variant="secondary"
                          size="small"
                          style="flex bg-red border-0"
                          disabled={updateWorkoutLoading}
                          loading={updateWorkoutLoading}
                          onPress={onDeleteWorkout}
                          label=""
                          icon={SvgTrash}
                        />
                      )}

                      {((isWearableWorkout(workout) &&
                        !isEdit &&
                        !workout?.confirmed &&
                        isActualWorkout(workout)) ||
                        isEdit) && (
                        <Button
                          size="small"
                          style={cx("flex-1", {
                            "ml-3": isEdit || isIncompletedWorkout(workout),
                            "opacity-20":
                              isEdit && isIncompleted && (!start || !duration),
                          })}
                          variant="primary"
                          label={
                            !isEdit &&
                            workout?.confirmed === false &&
                            isWearableWorkout(workout) &&
                            !isIncompletedWorkout(workout)
                              ? "Confirm"
                              : "Save Workout"
                          }
                          disabled={
                            !start ||
                            !duration ||
                            (isEdit &&
                              (createWorkoutLoading || updateWorkoutLoading)) ||
                            (!workout.id && !workout.activityId)
                          }
                          loading={createWorkoutLoading || updateWorkoutLoading}
                          onPress={onSave}
                        />
                      )}
                    </View>
                  </View>
                )}

                <ErrorModal
                  cancel={false}
                  show={showMaxWorkoutsErrorModal}
                  /* errorMessage={`You have reached your workout capacity (max 2 per day) for ${dayjs(
                      workout.start
                    ).format("dd/MM/yyyy")}`} */
                  errorMessage={`You have reached your workout capacity (max 2 per day) for ${format(
                    getLiteralDate(workout.start),
                    "dd/MM/yyyy"
                  )}`}
                  buttonTitle="OK"
                  onDismiss={() => {
                    setShowMaxWorkoutsErrorModal(false);
                  }}
                  onRedirect={() => setShowMaxWorkoutsErrorModal(false)}
                />
              </>
            </View>
          </View>
        )}

        <DateTimePicker
          isVisible={isVisible}
          mode="time"
          onConfirm={handleConfirmDuration}
          onCancel={hideDatePicker}
          date={
            new Date(
              new Date().setHours(
                getTimeArrayFromDurationString(duration)[0],
                getTimeArrayFromDurationString(duration)[1],
                0,
                0
              )
            )
          }
          locale="en_GB"
          is24Hour={true}
          minuteInterval={5}
          customHeaderIOS={() => (
            <Text style={tw`text-center mt-2 text-gray-300 text-lg`}>
              {`hrs         mins`}
            </Text>
          )}
        />
        <DateTimePicker
          isVisible={open}
          mode="time"
          onConfirm={handleConfirmStart}
          onCancel={() => setOpen(false)}
          date={
            new Date(
              new Date().setHours(
                getTimeArrayFromStartString(start)[0],
                getTimeArrayFromStartString(start)[1],
                0,
                0
              )
            )
          }
          locale="en_GB"
          is24Hour={true}
        />
        <IntensityInfoModal
          visible={showIntensityInfoModal}
          onClose={() => setShowIntensityInfoModal(false)}
        />
        {/* main content ends */}
      </View>
    </KeyboardAwareScrollView>
  );
};

export default PrimaryStack_AddEditWorkoutModal;
