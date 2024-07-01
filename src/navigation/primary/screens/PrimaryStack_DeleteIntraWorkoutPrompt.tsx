import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { Dimensions, SafeAreaView, View, Text } from "react-native";
import { useAnalytics } from "@segment/analytics-react-native";
import Button from "../../../components/shared/Button";
import tw from "../../../lib/tw";
import { PrimaryStackParamsList } from "../PrimaryStack";
import {
  Workout_Status,
  useDeleteWorkoutMutation,
  useUpdateWorkoutMutation,
} from "../../../generated/graphql";
import client from "../../../lib/graphql";
import { getLiteralDate, moreThanAWeekAhead } from "../../../utils/date";
import useDay from "../../../hooks/useDay";
import useRefetchDay from "../../../hooks/useRefetchDay";

const { width, height } = Dimensions.get("screen");
type Props = NativeStackScreenProps<
  PrimaryStackParamsList,
  "PrimaryStack_DeleteIntraWorkoutPrompt"
>;

const PrimaryStack_DeleteIntraWorkoutPrompt: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { track } = useAnalytics();
  const { workout, dateSelected } = route.params;
  const [_, setRefetchDay] = useRefetchDay();

  const { refetch } = useDay();

  const { mutate: updateWorkout } = useUpdateWorkoutMutation(client, {
    onSuccess: () => {
      track("WORKOUT_UPDATED", {
        ...workout,
      });

      setRefetchDay(true);
      refetch();
      if (moreThanAWeekAhead(dateSelected)) {
        // go back twice to carb code screen
        navigation.goBack();
        navigation.goBack();
      } else {
        navigation.goBack();
        navigation.goBack();
      }
    },
  });

  const onContinue = () => {
    const { id, ...rest } = workout;
    delete rest.source;
    delete rest.externalReference;
    updateWorkout({
      id,
      input: {
        ...rest,
        status: Workout_Status.Discarded,
      },
    });
  };

  return (
    <SafeAreaView style={tw`flex-1 items-center justify-center`}>
      <View
        style={{
          width: width - 64,
          ...tw`p-4 bg-background-500 rounded-lg border border-background-100 shadow`,
        }}
      >
        <View style={tw`mb-6`}>
          <Text style={tw`font-poppins-medium text-sm text-white text-center`}>
            Deleting this workout will remove the associated Intra Workout
            Fuelling and update your Fuel Plan.
          </Text>
          <View style={tw`my-2`}>
            <Text
              style={tw`font-poppins-medium text-sm text-white text-center`}
            >
              Are you sure you want to continue?
            </Text>
          </View>
        </View>
        <View style={tw`flex-row justify-center gap-x-2 w-full`}>
          <Button
            label="No"
            size="medium"
            variant="secondary"
            style="w-1/2 font-poppins-medium text-sm text-white text-center mb-0"
            onPress={navigation.goBack}
          />
          <Button
            label="Yes, continue"
            size="medium"
            style="w-1/2 font-poppins-medium text-sm text-white text-center mb-0"
            onPress={onContinue}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PrimaryStack_DeleteIntraWorkoutPrompt;
