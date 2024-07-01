import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { F } from "rambda";
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
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
  "PrimaryStack_NoteScreen"
>;

const PrimaryStack_NoteScreen: React.FC<Props> = ({ route, navigation }) => {
  const { title, description } = route.params;
  return (
    <Wrapper>
      <View style={tw`py-6 px-5 flex-1 `}>
        <Text style={tw`font-poppins-semibold text-20 text-white mb-5`}>
          {title}
        </Text>
        <Text style={tw`font-poppins-regular text-sm text-white`}>
          {description}
        </Text>
      </View>
    </Wrapper>
  );
};

export default PrimaryStack_NoteScreen;
