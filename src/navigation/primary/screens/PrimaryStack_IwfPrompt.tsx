import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Dimensions, SafeAreaView, View, Text } from "react-native";
import Button from "../../../components/shared/Button";
import tw from "../../../lib/tw";
import { PrimaryStackParamsList } from "../PrimaryStack";
import { useUpdateWorkoutMutation } from "../../../generated/graphql";
import client from "../../../lib/graphql";

const { width, height } = Dimensions.get("screen");
type Props = NativeStackScreenProps<
  PrimaryStackParamsList,
  "PrimaryStack_IwfPrompt"
>;

const PrimaryStack_IwfPrompt: React.FC<Props> = ({ navigation, route }) => {
  const { intraFuelling, id } = route.params;

  const [showTimeClashErrorModal, setShowTimeClashErrorModal] =
    useState<boolean>(false);

  const { mutate: updateWorkout, isLoading: isUpdateWorkoutLoading } =
    useUpdateWorkoutMutation(client, {
      onError(error: any, variables, context) {
        if (error?.response?.errors?.[0]?.extensions?.code === "TIME_CLASH")
          setShowTimeClashErrorModal(true);
      },

      onSuccess: () => {
        navigation.navigate("PrimaryStack_CarbCodesScreen", {
          addedIwf: false,
          removedIwf: true,
        });
      },
    });

  const onContinue = () => {
    updateWorkout({
      id: id!,
      input: {
        intraFuelling: !intraFuelling,
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
            Removing Intra Workout will delete your associated food log.
          </Text>
          <View style={tw`my-2`}>
            <Text
              style={tw`font-poppins-medium font-sm text-white text-center`}
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
            style="w-1/2 font-poppins-medium font-sm text-white text-center mb-0"
            onPress={navigation.goBack}
          />
          <Button
            label="Yes, continue"
            size="medium"
            style="w-1/2 font-poppins-medium font-sm text-white text-center mb-0"
            onPress={onContinue}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PrimaryStack_IwfPrompt;
