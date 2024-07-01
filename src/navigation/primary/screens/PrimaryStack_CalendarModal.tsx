import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { isBefore } from "date-fns";
import { isEmpty, merge } from "rambda";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  View,
  Text,
  TouchableWithoutFeedback,
  Pressable,
  TextStyle,
  ViewStyle,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { LogBox } from "react-native";
import Modal from "react-native-modal";

import Wrapper from "../../../components/shared/Wrapper";
import useAppDate from "../../../hooks/useAppDate";
import useUser from "../../../hooks/useUser";
import useWorkoutsByMonth from "../../../hooks/useWorkoutsByMonth";
import calendarTheme from "../../../lib/themes/calendar";
import tw from "../../../lib/tw";
import { PrimaryStackParamsList } from "../PrimaryStack";
import WorkoutCard from "../../../components/workouts/WorkoutCard";
import {
  useResolveWorkoutsMutation,
  useUpdateWorkoutMutation,
  Workout,
  Workout_Status,
  useDiscardAllWorkoutsOnGivenDateMutation,
} from "../../../generated/graphql";
import {
  getEndOfDay,
  getLiteralDate,
  getLiteralDateString,
  getStartOfDay,
  originalDateTimeTZ,
} from "../../../utils/date";
import {
  CancelIcon,
  PlusIcon,
  InfoIcon,
  BlockedIcon,
  BlockedGroupIcon,
} from "../../../components/icons/general";
import ErrorModal from "../../../components/shared/ErrorModal";
import client from "../../../lib/graphql";
import useRefetchDay from "../../../hooks/useRefetchDay";
import Button from "../../../components/shared/Button";
import Loading from "../../../components/shared/LoadingScreen";
import { IWorkout } from "./PrimaryStack_AddEditWorkoutModal";

dayjs.extend(utc);

LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
]);

type Props = NativeStackScreenProps<
  PrimaryStackParamsList,
  "PrimaryStack_CarbCodesScreen"
>;

type IMonthWorkouts = Record<
  string,
  {
    marked?: true;
    workouts: Workout[];
    customStyles?: {
      container?: ViewStyle;
      text?: TextStyle;
    };
  }
>;

const PrimaryStack_CalendarModal: React.FC<Props> = ({ navigation }) => {
  const [_, setRefetchDay] = useRefetchDay();
  const [appDate, setAppDate] = useAppDate();
  const { user } = useUser();
  const [selectedDate, setSelectedDate] = useState(appDate);
  const [month, setMonth] = useState(appDate);
  const { data: workoutsByMonth, refetch } = useWorkoutsByMonth(month);
  const [showWorkoutsErrorModal, setShowWorkoutsErrorModal] =
    useState<boolean>(false);
  const [showTimeClashErrorModal, setShowTimeClashErrorModal] =
    useState<boolean>(false);
  const [isShowIncompleteWorkouts, setShowIncompleteWorkouts] =
    useState<boolean>(false);
  const [
    showUnresolvedConflictsErrorModal,
    setShowUnresolvedConflictsErrorModal,
  ] = useState<boolean>(false);
  const [autoResolveInfoModal, setAutoResolveInfoModal] = useState<{
    show: boolean;
    all: boolean;
  }>({ show: false, all: false });
  const [monthWorkouts, setMonthWorkouts] = useState<IMonthWorkouts>({});

  useEffect(() => {
    refetch();
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      refetch();
      return () => {};
    }, [])
  );
  const onSetDay = () => {
    // don't navigate if there are unresolved workouts for the day
    if (!noUnresolvedWorkoutsForTheDay)
      return setShowUnresolvedConflictsErrorModal(true);

    setAppDate(selectedDate);
    navigation.goBack();
  };

  const onSelectCurrentDay = () => {
    if (appDate.getMonth() === month.getMonth()) {
      setSelectedDate(getLiteralDate());
      setAppDate(getLiteralDate());
    } else {
      // TODO: Navigate to current month programmatically
      setMonth(getLiteralDate());

      setSelectedDate(getLiteralDate());
      setAppDate(getLiteralDate());
    }
  };

  const onEditWorkoutPress = (Id: string) => {
    navigation.navigate("PrimaryStack_AddEditWorkoutModal", {
      workoutId: Id,
      selectedDate: selectedDate,
      modalTitle: "View Workout",
    });
  };

  const showIncompletes = () => {
    navigation.navigate("PrimaryStack_InformationRequiredScreen", {
      selectMonth: month,
    });
  };

  const otherWorkouts = monthWorkouts?.[
    getLiteralDateString(selectedDate)
  ]?.workouts
    .sort((a, b) => {
      if (isBefore(new Date(a.start), new Date(b.start))) return -1;
      if (isBefore(new Date(b.start), new Date(a.start))) return 1;
      return 0;
    })
    .filter(
      (workout) =>
        workout.status !== Workout_Status.Active &&
        workout.status !== Workout_Status.Incomplete
    );

  const unresolvedWorkouts = otherWorkouts?.filter(
    (workout) => workout?.status !== Workout_Status.Discarded
  );

  const findUnresolvedDayWorkouts = (
    date: Date,
    workouts: Workout[] = unresolvedWorkouts
  ) =>
    workouts?.filter((workout) =>
      dayjs(workout?.start).utc().isSame(date, "date")
    );

  const getNumberOfUnresolvedWorkouts = () =>
    workoutsByMonth?.filter(
      (workout) =>
        workout?.status === Workout_Status.Conflicted ||
        workout?.status === Workout_Status.Waiting
    )?.length || 0;
  const getIncompletedWorkouts = workoutsByMonth?.filter(
    (workout) => workout?.status === Workout_Status.Incomplete
  );
  const getNumberOfUnresolvedWorkoutsForTheDay = () =>
    findUnresolvedDayWorkouts(appDate, workoutsByMonth as Workout[])?.filter(
      (workout) =>
        workout?.status === Workout_Status.Conflicted ||
        workout?.status === Workout_Status.Waiting
    )?.length || 0;

  const noUnresolvedWorkouts = getNumberOfUnresolvedWorkouts() === 0;
  const noUnresolvedWorkoutsForTheDay =
    getNumberOfUnresolvedWorkoutsForTheDay() === 0;

  const numberOfUnresolvedWorkouts = getNumberOfUnresolvedWorkouts();
  const numberOfUnresolvedWorkoutsForTheDay =
    getNumberOfUnresolvedWorkoutsForTheDay();

  useEffect(() => {
    if (workoutsByMonth) {
      const latestUnresolvedWorkouts = workoutsByMonth?.filter(
        (workout) =>
          workout?.status === Workout_Status.Conflicted ||
          workout?.status === Workout_Status.Waiting
      ) as Workout[];

      const newData: IMonthWorkouts = {};
      workoutsByMonth.map((item) => {
        const date = getLiteralDateString(item?.start);

        // find conflicting workouts for the day
        const unResolvedWorkoutsOfDay = findUnresolvedDayWorkouts(
          item?.start,
          latestUnresolvedWorkouts
        );

        if (newData[date] && newData[date].workouts) {
          newData[date].workouts.push(item as Workout);
        } else {
          newData[getLiteralDateString(item?.start)] = {
            marked: true,
            customStyles: {
              text: {},
              container:
                unResolvedWorkoutsOfDay?.length > 0
                  ? {
                      borderColor: tw.color("red"),
                      borderWidth: 2,
                      elevation: 2,
                    }
                  : {},
            },
            workouts: [item as Workout],
          };
        }
      });
      setMonthWorkouts(newData);
    } else {
      setMonthWorkouts({});
    }
  }, [month, workoutsByMonth]);

  const allActiveWorkouts = monthWorkouts?.[
    getLiteralDateString(selectedDate)
  ]?.workouts
    .sort((a, b) => {
      if (isBefore(new Date(a.start), new Date(b.start))) return -1;
      if (isBefore(new Date(b.start), new Date(a.start))) return 1;
      return 0;
    })
    .filter(
      (workout) =>
        workout.status === Workout_Status.Active ||
        workout.status === Workout_Status.Incomplete
    );
  const activeWorkoutsElements = allActiveWorkouts?.map((workout) => (
    <WorkoutCard
      key={workout.id}
      workout={workout}
      onPress={() => onEditWorkoutPress(workout.id)}
      checkBox
      activeWorkout
      onCheckBoxPress={() => onDiscardWorkout(workout)}
    />
  ));

  const discardedWorkoutsElements = otherWorkouts?.map((workout) => (
    <WorkoutCard
      key={workout.id}
      workout={workout}
      onPress={() => onEditWorkoutPress(workout.id)}
      checkBox
      onCheckBoxPress={() => onActiveWorkout(workout)}
    />
  ));

  const { mutate: updateWorkout, isLoading: isUpdateWorkoutLoading } =
    useUpdateWorkoutMutation(client, {
      onError(error: any, variables, context) {
        console.log(error?.response?.errors?.[0]?.extensions?.code);
        if (error?.response?.errors?.[0]?.extensions?.code === "TIME_CLASH")
          setShowTimeClashErrorModal(true);
      },

      onSuccess: () => {
        setRefetchDay(true);
        refetch();
      },
    });

  const { mutate: resolveWorkouts, isLoading: isResolveWorkoutsLoading } =
    useResolveWorkoutsMutation(client, {
      onSuccess: (data) => {
        console.log("success", data);
        setRefetchDay(true);
        refetch();
        setShowUnresolvedConflictsErrorModal(false);
      },
    });

  const { mutate: discardOtherWorkouts, isLoading: isDiscardWorkoutLoading } =
    useDiscardAllWorkoutsOnGivenDateMutation(client, {
      onSuccess: (data) => {
        console.log("success", data);
        setRefetchDay(true);
        refetch();
        setShowUnresolvedConflictsErrorModal(false);
        // TODO: Delete this as per https://hexisapp.atlassian.net/browse/WEAR1-72
        navigation.navigate("PrimaryStack", {
          screen: "PrimaryStack_CarbCodesScreen",
          selectedDate,
        });
      },
    });
  const onActiveWorkout = (workout: Workout) => {
    const { id, activity, recurring, startTime, ...rest } = workout;
    delete rest.__typename;
    delete rest.source;
    delete rest.externalReference;
    updateWorkout({
      id: workout.id!,
      input: {
        ...(rest as IWorkout),
        activityId: activity.id, // replace 'activity' with 'activityId'
        status: Workout_Status.Active,
      },
    });

    // If the workout is conflicted, discard all other workouts
    if (workout.status === Workout_Status.Conflicted)
      discardOtherWorkouts({
        input: {
          date: dayjs(appDate).format("YYYY-MM-DD"),
        },
      });
  };

  const onDiscardWorkout = (workout: Workout) => {
    updateWorkout({
      id: workout.id!,
      input: {
        status: Workout_Status.Discarded,
      },
    });
  };

  const onAutoResolveToDiscarded =
    (all: boolean = false) =>
    () => {
      const defaultDates = {
        // auto resolve workouts from beginning of time
        from: dayjs(appDate).startOf("month").utc().toDate(),
        // to the end date of the current month
        to: dayjs(appDate).endOf("month").utc().toDate(),
      };

      const specifiedDates = {
        from: getStartOfDay(appDate),
        to: getEndOfDay(appDate),
      };

      const date = all ? defaultDates : specifiedDates;

      console.log("onAutoResolveToDiscarded", {
        input: date,
      });

      resolveWorkouts({
        input: date,
      });
      setShowUnresolvedConflictsErrorModal(false);
    };

  const markedDates = monthWorkouts
    ? merge(monthWorkouts, {
        [getLiteralDateString(selectedDate)]: {
          selected: true,
          marked: !!monthWorkouts[getLiteralDateString(selectedDate)],
          workouts: monthWorkouts[getLiteralDateString(selectedDate)],
          customStyles: {
            text: {},
            container:
              findUnresolvedDayWorkouts(selectedDate)?.length > 0
                ? {
                    borderColor: tw.color("red"),
                    borderWidth: 2,
                    elevation: 2,
                  }
                : {},
          },
        },
      })
    : {
        [getLiteralDateString(selectedDate)]: {
          selected: true,
          customStyles: {
            text: {},
            container:
              findUnresolvedDayWorkouts(selectedDate)?.length > 0
                ? {
                    borderColor: tw.color("red"),
                    borderWidth: 2,
                    elevation: 2,
                  }
                : {},
          },
        },
      };

  const onCloseAutoResolveModal = () =>
    setAutoResolveInfoModal({ show: false, all: false });

  if (isResolveWorkoutsLoading) {
    return <Loading />;
  }
  return (
    <Wrapper
      onRefresh={refetch}
      refreshing={
        isDiscardWorkoutLoading ||
        isUpdateWorkoutLoading ||
        isResolveWorkoutsLoading
      }
      style={{ flex: 1 }}
    >
      <View>
        {/* <Pressable
          onPress={() => {
            // don't navigate if there are unresolved workouts for the day
            if (!noUnresolvedWorkoutsForTheDay)
              return setShowUnresolvedConflictsErrorModal(true);

            navigation.goBack();
          }}
          style={tw`p-0.5 border border-white rounded-full absolute z-10 top-7 left-6`}
        >
          <View style={tw`h-5 w-5`}>
            <CancelIcon color={tw.color("white")} />
          </View>
        </Pressable> */}
        <Pressable
          onPress={showIncompletes}
          style={tw`p-1 absolute z-10 top-6.5 right-5`}
        >
          {/* <PlusIcon color={tw.color("white")} /> */}
          <View
            style={tw`h-6 w-6 flex-row justify-center items-center gap-2.5 shrink-0 rounded-full bg-red`}
          >
            <Text style={tw`text-white`}>
              {(getIncompletedWorkouts?.length as number) > 0
                ? getIncompletedWorkouts?.length
                : 0}
            </Text>
          </View>
        </Pressable>

        <View style={tw`z--10`}>
          <Calendar
            style={tw`mt-5`}
            onMonthChange={(date) => {
              setMonth(new Date(date.dateString));
            }}
            markingType="custom"
            markedDates={markedDates}
            minDate={getLiteralDateString(user?.created)}
            //minDate={originalDateTimeTZ(user?.created, user?.timezone!)}
            onDayPress={(day) => {
              setShowIncompleteWorkouts(false);
              setSelectedDate(getLiteralDate(day.dateString));
              setAppDate(getLiteralDate(day.dateString));
            }}
            //@ts-ignore
            theme={calendarTheme}
          ></Calendar>
          {/* Commented out the AUTO-RESOLVE ALL functionality */}
          {/* numberOfUnresolvedWorkouts > 0 && (
            <View style={tw`flex-row justify-end w-full items-center pr-6`}>
              <Text
                style={tw`${
                  noUnresolvedWorkouts ? "text-red" : "text-carbcodelow-100"
                } font-poppins-semibold py-2`}
                onPress={onAutoResolveToDiscarded(true)}
              >
                AUTO-RESOLVE
              </Text>

              {<TouchableWithoutFeedback
                  onPress={() =>
                    setAutoResolveInfoModal({ show: true, all: true })
                  }
                >
                  <View style={tw`flex w-12 h-10 items-center justify-center`}>
                    <View style={tw`h-6 w-6`}>
                      <InfoIcon
                        color={tw.color(
                          noUnresolvedWorkouts ? "red" : "carbcodelow-100"
                        )}
                      />
                    </View>
                  </View>
                </TouchableWithoutFeedback> 
            </View>
          )*/}
        </View>
      </View>

      <View style={tw`flex-1 justify-between border-t-white border-t mt-2`}>
        <View>
          {/* The 2 Selected Workouts */}
          <View>
            <View>
              <View style={tw`justify-between flex-row mx-4 mt-4`}>
                <Text style={tw`text-white font-poppins-bold`}>Workouts</Text>

                <View
                  style={tw`w-60 flex-row justify-${
                    activeWorkoutsElements?.length < 2 ? "between" : "end"
                  }`}
                >
                  {activeWorkoutsElements?.length < 2 && (
                    <Text style={tw`text-white font-poppins-light`}>
                      Select workouts
                    </Text>
                  )}
                  <TouchableWithoutFeedback onPress={onSetDay}>
                    <Text
                      style={tw`text-white font-poppins-bold text-activeblue-100`}
                    >
                      View
                    </Text>
                  </TouchableWithoutFeedback>
                </View>
              </View>
            </View>

            {activeWorkoutsElements && !isEmpty(activeWorkoutsElements) && (
              <View style={tw`mx-4 mt-4`}>{activeWorkoutsElements}</View>
            )}
          </View>

          {/* Discarded/Other Workouts */}
          {discardedWorkoutsElements && !isEmpty(discardedWorkoutsElements) && (
            <View style={tw`mt-5`}>
              <View style={tw`mx-4 mt-2 flex-row justify-between`}>
                <Text style={tw`text-white font-poppins-medium`}>Other</Text>
                {/* Commented out the AUTO-RESOLVE functionality */}
                {numberOfUnresolvedWorkoutsForTheDay > 0 && (
                  <View style={tw`flex-row justify-between w-38 items-center`}>
                    <TouchableWithoutFeedback
                      onPress={onAutoResolveToDiscarded()}
                      disabled={noUnresolvedWorkoutsForTheDay}
                    >
                      <Text
                        style={tw`${
                          noUnresolvedWorkoutsForTheDay
                            ? "text-red opacity-40"
                            : "text-carbcodelow-100"
                        } font-poppins-semibold py-2`}
                      >
                        AUTO-RESOLVE
                      </Text>
                    </TouchableWithoutFeedback>
                    {/*
                  <TouchableWithoutFeedback
                    onPress={() =>
                      setAutoResolveInfoModal({ show: true, all: false })
                    }
                  >
                    <View style={tw`h-6 w-6`}>
                      <InfoIcon
                        color={tw.color(
                          noUnresolvedWorkoutsForTheDay
                            ? "white"
                            : "carbcodelow-100"
                        )}
                      />
                    </View>
                        </TouchableWithoutFeedback>*/}
                  </View>
                )}
              </View>

              <View style={tw`mx-4 mt-3`}>{discardedWorkoutsElements}</View>
            </View>
          )}
        </View>

        <View>
          <ErrorModal
            cancel={false}
            show={showTimeClashErrorModal}
            errorMessage="Time clash"
            errorMessageDescription="You cannot select this workout because you already have an active workout during this time."
            buttonTitle="OK"
            onRedirect={() => setShowTimeClashErrorModal(false)}
          />
          <ErrorModal
            cancel
            show={showUnresolvedConflictsErrorModal}
            errorMessage="Resolve Calendar Conflict"
            errorMessageDescription="Select your active workouts to solve your current workout calendar conflicts. Ignoring may update your Carb Codes."
            buttonTitle="Resolve now"
            // Resolve workouts for the day
            onRedirect={onAutoResolveToDiscarded()}
            buttonCancelTitle="Ignore"
            // Close modal
            onDismiss={() =>
              discardOtherWorkouts({
                input: {
                  date: dayjs(appDate).format("YYYY-MM-DD"),
                },
              })
            }
          />

          <Modal
            isVisible={autoResolveInfoModal.show}
            onDismiss={onCloseAutoResolveModal}
            onBackdropPress={onCloseAutoResolveModal}
            hasBackdrop={true}
            style={tw`px-6 py-8 flex-col justify-center items-center`}
          >
            <View
              style={tw`flex justify-center items-center bg-background-500 rounded-xl px-6 py-4`}
            >
              {autoResolveInfoModal.all ? (
                <BlockedGroupIcon />
              ) : (
                <BlockedIcon />
              )}

              <Text
                style={tw`text-white font-poppins-regular text-lg mt-2 text-center text-red`}
              >
                Auto-Resolve {autoResolveInfoModal.all ? "All" : ""}
              </Text>

              <Text
                style={tw`text-white font-poppins-regular text-sm mt-2 text-center`}
              >
                {autoResolveInfoModal.all
                  ? `'Auto-resolve all', will resolve any workout conflicts in your calendar, prioritizing wearable data in this process. This may update your Carb Codes.`
                  : "'Auto-resolve' will resolve any workout conflicts on the selected date, prioritizing wearable data in this process. This may update your Carb Codes."}
              </Text>

              <View style={tw`flex-row items-center mt-6`}>
                <Button
                  size="small"
                  style="flex-2 ml-2"
                  variant="primary"
                  label="OK"
                  onPress={onCloseAutoResolveModal}
                />
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </Wrapper>
  );
};

export default PrimaryStack_CalendarModal;
