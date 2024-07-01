import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { F } from "rambda";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Button from "../../../components/shared/Button";
import Card from "../../../components/shared/Card";
import Loading from "../../../components/shared/LoadingScreen";
import Wrapper from "../../../components/shared/Wrapper";
import WorkoutSlotCard from "../../../components/workouts/WorkoutSlotCard";
import {
  Meal_Name,
  Workout,
  WorkoutsByDayQuery,
  Workout_Slot,
  Workout_Status,
} from "../../../generated/graphql";
import useUser from "../../../hooks/useUser";
import useWorkoutsByDay from "../../../hooks/useWorkoutsByDay";
import tw from "../../../lib/tw";

import { PrimaryStackParamsList } from "../PrimaryStack";

let workoutSlotsInOrder = [
  {
    meal: Meal_Name.Breakfast,
    slot: Workout_Slot.BeforeBreakfast,
    disabled: false,
  },
  {
    meal: Meal_Name.AmSnack,
    slot: Workout_Slot.BeforeAmSnack,
    disabled: false,
  },
  { meal: Meal_Name.Lunch, slot: Workout_Slot.BeforeLunch, disabled: false },
  {
    meal: Meal_Name.PmSnack,
    slot: Workout_Slot.BeforePmSnack,
    disabled: false,
  },
  { meal: Meal_Name.Dinner, slot: Workout_Slot.BeforeDinner, disabled: false },
  {
    meal: Meal_Name.PreBedSnack,
    slot: Workout_Slot.BeforePreBedSnack,
    disabled: false,
  },
];

type Props = NativeStackScreenProps<
  PrimaryStackParamsList,
  "PrimaryStack_WorkoutSlotModal"
>;

const PrimaryStack_WorkoutSlotModal: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const onComplete = () => {
    navigation.navigate("PrimaryStack_AddEditWorkoutModal", {
      fuelPlanning: selectedSlot,
      workoutId: route.params.workoutId,
      modalTitle: route.params.workoutId ? "Edit Workout" : "Add Workout",
    });
  };

  const { data: existingWorkouts, loading } = useWorkoutsByDay(
    new Date(route?.params?.date)
  );
  const { user } = useUser();
  const [selectedSlot, setSelectedSlot] = useState<Workout_Slot>();
  const activeExistingWorkout = existingWorkouts?.filter(
    (workout) => workout?.status === Workout_Status.Active
  );

  useEffect(() => {
    if (route.params.fuelPlanning) {
      setSelectedSlot(route.params.fuelPlanning);
    }
  }, [route]);

  if (loading || !user) return <Loading />;

  const Cards = workoutSlotsInOrder.map((workoutSlot) => {
    return (
      <WorkoutSlotCard
        activityId={route.params.activityId!}
        meal={workoutSlot.meal}
        key={workoutSlot.slot}
        active={selectedSlot === workoutSlot.slot}
        onPress={() => setSelectedSlot(workoutSlot.slot)}
        disabled={
          user.mealplan!.meals.findIndex(
            (i) => i!.slot === workoutSlot.meal
          ) === -1 ||
          activeExistingWorkout!.findIndex(
            (i) => i!.slot === workoutSlot.slot
          ) >= 0
        }
      />
    );
  });

  return (
    <Wrapper>
      <View style={tw`mx-4 my-4 flex-1`}>{Cards}</View>
      <View style={tw`flex-row items-center mx-4`}>
        <Button
          size="small"
          style="flex-1 ml-2"
          variant="primary"
          label="Done"
          onPress={onComplete}
        />
      </View>
    </Wrapper>
  );
};

export default PrimaryStack_WorkoutSlotModal;
