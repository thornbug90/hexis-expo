import React, { useEffect } from "react";
import { Image, Text, View, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PrimaryStackParamsList } from "../PrimaryStack";
import tw, { carbCodeGradients } from "../../../lib/tw";
import { Workout, Workout_Status } from "../../../generated/graphql";
import WorkoutCard from "../../../components/workouts/WorkoutCard";
import { getLiteralDate } from "../../../utils/date";
import { isEmpty } from "rambda";
import QuestionIcon from "../../../components/icons/general/QuestionIcon";
import { IWorkout } from "./PrimaryStack_AddEditWorkoutModal";
import useWorkoutsByMonth from "../../../hooks/useWorkoutsByMonth";

type Props = NativeStackScreenProps<
  PrimaryStackParamsList,
  "PrimaryStack_InformationRequiredScreen"
>;
const PrimaryStack_InformationRequiredScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { data: workoutsByMonth, refetch } = useWorkoutsByMonth(
    getLiteralDate(route?.params?.selectMonth)
  );
  const onEditWorkoutPress = (workout: IWorkout) => {
    navigation.navigate("PrimaryStack_AddEditWorkoutModal", {
      workoutId: workout.id,
      selectedDate: getLiteralDate(workout?.start),
      modalTitle: "Edit Workout",
    });
  };
  useEffect(() => {
    refetch();
  }, [route?.params?.selectMonth]);
  const getIncompletedWorkouts: Workout[] = workoutsByMonth?.filter(
    (workout) => (workout?.status === Workout_Status.Incomplete) as boolean
  );
  const incompleteWorkoutsElements = getIncompletedWorkouts
    ?.sort((a, b) => (a?.start > b?.start ? -1 : 1))
    ?.map((workout: Workout) => (
      <View
        style={tw`flex-row justify-center max-w-full items-center gap-2`}
        key={workout.id}
      >
        <View style={tw`grow`}>
          <WorkoutCard
            key={workout.id}
            workout={workout}
            onPress={() => onEditWorkoutPress(workout)}
          />
        </View>
      </View>
    ));
  return (
    <ScrollView>
      {incompleteWorkoutsElements && !isEmpty(incompleteWorkoutsElements) && (
        <View style={tw`flex items-start pt-3 px-5 pb-6`}>
          {incompleteWorkoutsElements}
        </View>
      )}
    </ScrollView>
  );
};

export default PrimaryStack_InformationRequiredScreen;
