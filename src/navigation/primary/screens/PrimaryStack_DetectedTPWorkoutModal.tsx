import React, { useState } from "react";
import Modal from "react-native-modal";
import tw from "../../../lib/tw";
import { View, Text, TouchableNativeFeedback } from "react-native";
import Button from "../../../components/shared/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Workout } from "../../../generated/graphql";
import WorkoutCard from "../../../components/workouts/WorkoutCard";
import { TickIcon } from "../../../components/icons/general";
import { hi } from "date-fns/locale";
interface Props {
  show: boolean;
  onDismiss: () => void;
  workout?: Workout;
}
const DetectedTPWorkoutModal: React.FC<Props> = ({
  show,
  onDismiss,
  workout,
}) => {
  const [check, setCheck] = useState<boolean>(false);

  const handleNeverShowForAllWorkouts = async () => {
    await AsyncStorage.setItem("hideModalForAllWorkouts", "true");
  };
  const handleNeverShowForThisWorkout = async () => {
    const hiddenWorkoutIds =
      JSON.parse(await AsyncStorage.getItem("hiddenWorkoutIds")) || [];
    console.log(hiddenWorkoutIds, "hiddenWorkoutIds");
    // Add the current workout ID to the list
    if (workout?.id) {
      hiddenWorkoutIds.push(workout?.id);
    }

    // Save the updated list
    await AsyncStorage.setItem(
      "hiddenWorkoutIds",
      JSON.stringify(hiddenWorkoutIds)
    );
  };
  const onPress = () => {
    check ? handleNeverShowForAllWorkouts() : handleNeverShowForThisWorkout();
    onDismiss();
  };
  const onPressWorkout = () => {
    handleNeverShowForThisWorkout();
    onDismiss();
  };
  return (
    <Modal
      isVisible={show}
      onDismiss={onPressWorkout}
      onBackdropPress={onPressWorkout}
      hasBackdrop={true}
    >
      <View
        style={tw`flex w-[335px] p-6 justify-center items-center gap-6 rounded-xl bg-background-500 mx-auto`}
      >
        <Text
          style={tw`text-almostWhite text-center text-xl font-poppins-medium tracking-[0.25px]`}
        >
          We have detected a completed workout
        </Text>
        <View style={tw`self-stretch`}>
          <WorkoutCard workout={workout} onPress={() => {}} activeWorkout />
        </View>

        <Text
          style={tw`text-almostWhite text-center font-sm font-poppins-light tracking-[0.25px]`}
        >
          We have detected a completed workout so we have updated your plan
          accordingly based on the new data.
        </Text>
        <View
          style={tw`flex-row items-center justify-between py-3 px-4 rounded-lg bg-background-370 rounded-xl self-stretch`}
        >
          <Text
            style={tw`text-white text-base tracking-[0.25px] font-poppins-regular`}
          >
            Don't show me again
          </Text>
          <TouchableNativeFeedback
            onPress={() => {
              setCheck((prev) => !prev);
            }}
          >
            <View
              style={tw`flex-row w-6 h-6 py-3 px-4 justify-center items-center rounded bg-[#4E4B66]`}
            >
              {check && <TickIcon color={tw.color("white")} />}
            </View>
          </TouchableNativeFeedback>
        </View>

        <Button
          size="small"
          label="Thanks"
          style={"self-stretch"}
          variant="primary"
          onPress={onPress}
        />
      </View>
    </Modal>
  );
};

export default DetectedTPWorkoutModal;
