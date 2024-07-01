import {
  Dimensions,
  Text,
  View,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import currency from "currency.js";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import tw from "../../../lib/tw";
import Button from "../../../components/shared/Button";
import {
  CancelIcon,
  HardIntensityIcon,
  KeyPerformanceIcon,
  LightIntensityIcon,
  ModerateIntensityIcon,
  TrophyIcon,
} from "../../../components/icons/general";
import { PrimaryStackParamsList } from "../PrimaryStack";
import activities from "../../../lib/activities";
import { useUpdateWorkoutMutation } from "../../../generated/graphql";
import client from "../../../lib/graphql";
import { intensityBarIcons } from "../../../lib/intensity";

type Props = NativeStackScreenProps<
  PrimaryStackParamsList,
  "PrimaryStack_FuelingStrategyModal"
>;

const PrimaryStack_FuelingStrategyScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { workout, intraFuellingRecommendations } = route.params;

  const getTime = (date: string) => {
    let [hours, minutes] = date.split("T")[1].slice(0, 8).split(":");

    return `${hours}:${minutes}`;
  };

  const getTimeDifference = (date1: string, date2: string) => {
    let [hours, minutes] = date1.split("T")[1].slice(0, 8).split(":");

    let [hours1, minutes1] = date2.split("T")[1].slice(0, 8).split(":");

    let minDiff = (Number(minutes) - Number(minutes1)) / 60;

    let hourDiff = Number(hours) - Number(hours1);

    return Math.abs(minDiff + hourDiff);
  };

  const startTime = getTime(workout?.start);

  const endTime = getTime(workout?.end);

  const timeDifference = getTimeDifference(workout?.start, workout?.end);

  const { icon: Icon, name = null } =
    activities?.[workout?.activity.id as keyof typeof activities];

  const { height } = Dimensions.get("window");

  const [showTimeClashErrorModal, setShowTimeClashErrorModal] =
    useState<boolean>(false);

  const { mutate: updateWorkout, isLoading: isUpdateWorkoutLoading } =
    useUpdateWorkoutMutation(client, {
      onError(error: any, variables, context) {
        console.log(error?.response?.errors?.[0]?.extensions?.code);
        if (error?.response?.errors?.[0]?.extensions?.code === "TIME_CLASH")
          setShowTimeClashErrorModal(true);
      },

      onSuccess: () => {
        navigation.navigate("PrimaryStack_CarbCodesScreen", {
          addedIwf: !workout?.intraFuelling,
          removedIwf: !!workout?.intraFuelling,
        });
      },
    });

  const handleUpdateIwf = () => {
    if (workout?.intraFuelling && workout?.mealVerification?.id)
      return navigation.navigate("PrimaryStack_IwfPrompt", {
        id: workout?.id,
        intraFuelling: workout?.intraFuelling,
      });

    updateWorkout({
      id: workout?.id!,
      input: {
        intraFuelling: !workout?.intraFuelling,
      },
    });
  };

  const onCancel = () => {
    navigation.goBack();
  };

  const isCarbsPerHour = intraFuellingRecommendations?.unit === "g/hr";
  const IntensityIcon = intensityBarIcons.find(
    (icon) => workout?.intensityRPE! < icon.max
  )?.Icon;
  return (
    <SafeAreaView>
      <ScrollView>
        <View style={[tw`mt-8`]}>
          <TouchableWithoutFeedback onPress={onCancel}>
            <View
              style={tw`absolute top--10 self-center mt-1 rounded-full border-5 border-background-500 z-10`}
            >
              <View style={tw`p-3 self-center bg-activeblue-100 rounded-full`}>
                <View style={tw`h-8 w-8`}>
                  <CancelIcon color={tw.color("white")} />
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
          <View
            style={[
              tw`rounded-xl bg-background-300 px-4 relative justify-center items-center gap-y-5`,
              { height: (height * 2.7) / 5 },
            ]}
          >
            <View style={tw`w-full py-8 absolute top-0`}>
              <View style={tw`w-full py-1 items-center mt-3`}>
                <Text
                  style={tw`text-white p-0.5 text-sm font-poppins-semibold`}
                >
                  Fuelling Strategy
                </Text>
              </View>
              <View
                style={tw`w-full flex-row justify-between items-center mt-2`}
              >
                <View style={tw`flex-row gap-x-2`}>
                  {Icon && (
                    <Icon color={tw.color("activeblue-100")} style={tw`w-6`} />
                  )}
                  <Text style={tw`text-white p-0.5 font-poppins-semibold`}>
                    {name}
                  </Text>
                  {IntensityIcon && (
                    <IntensityIcon
                      color={tw.color("white")}
                      width={14}
                      height={10}
                    />
                  )}
                  {workout?.key && (
                    <KeyPerformanceIcon
                      color={tw.color("white")}
                      style={tw`w-5 mb-2`}
                    />
                  )}
                  {workout?.competition && (
                    <TrophyIcon
                      color={tw.color("white")}
                      style={tw`w-5 mb-2`}
                    />
                  )}
                </View>
                <View style={tw`flex-row`}>
                  <Text style={tw`text-white p-0.5 font-poppins-medium`}>
                    {startTime}
                  </Text>
                  <Text style={tw`text-white p-0.5 font-poppins-medium`}>
                    -
                  </Text>
                  <Text style={tw`text-white p-0.5 font-poppins-medium`}>
                    {endTime}
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={tw`border-4 border-activeblue-100 rounded-full h-48 w-48 mt-10 relative top-6 justify-center items-center`}
            >
              <Text style={tw`text-3xl text-white font-poppins-medium`}>
                {isCarbsPerHour
                  ? currency(intraFuellingRecommendations?.carb || 0, {
                      precision: 0,
                    }).divide(timeDifference).value
                  : currency(intraFuellingRecommendations?.carb || 0, {
                      precision: 0,
                    }).value}
                g
              </Text>
              <Text style={tw`text-sm text-white font-poppins-regular`}>
                {isCarbsPerHour ? "Carbs per hour" : "Carbs"}
              </Text>
            </View>
            <View
              style={tw`flex flex-row justify-evenly absolute bottom-4 w-full`}
            >
              <Text style={tw`text-white font-poppins-medium`}>
                {`${
                  currency(intraFuellingRecommendations?.energy || 0, {
                    precision: 0,
                  }).value
                } kcal`}
              </Text>
              <View style={tw`w-0.5 bg-activeblue-100 mx-2`} />
              <Text style={tw`text-white font-poppins-medium`}>
                {`${
                  currency(intraFuellingRecommendations?.carb || 0, {
                    precision: 0,
                  }).value
                }g Carbs`}
              </Text>
              <View style={tw`w-0.5 bg-activeblue-100 mx-2`} />
              <Text style={tw`text-white font-poppins-medium`}>
                {`${
                  currency(intraFuellingRecommendations?.protein || 0, {
                    precision: 0,
                  }).value
                }g Protein`}
              </Text>
              <View style={tw`w-0.5 bg-activeblue-100 mx-2`} />
              <Text style={tw`text-white font-poppins-medium`}>
                {`${
                  currency(intraFuellingRecommendations?.fat || 0, {
                    precision: 0,
                  }).value
                }g Fat`}
              </Text>
            </View>
          </View>
          <View
            style={[
              tw`bg-background-500 p-4 pb-20 `,
              { height: "auto", minHeight: (height * 2.2) / 5 },
            ]}
          >
            <Text style={tw`text-lg text-white mb-4 font-poppins-semibold`}>
              {intraFuellingRecommendations?.title}
            </Text>
            <Text style={tw`text-sm text-white mb-4 font-poppins-regular`}>
              {intraFuellingRecommendations?.message}
            </Text>
            <Text style={tw`text-sm text-white mb-4 font-poppins-regular`}>
              {intraFuellingRecommendations?.details}
            </Text>
          </View>
        </View>
      </ScrollView>
      <View
        style={[
          tw`bg-background-300 h-20 absolute bottom-0 w-full flex flex-row justify-center p-4`,
        ]}
      >
        <Button
          label={`${
            !workout?.intraFuelling
              ? "Add Intra Workout Fuelling"
              : "Remove Intra Workout Fuelling"
          }`}
          style="mx-4 h-14 p-2 relative bottom-1.3 w-full"
          onPress={handleUpdateIwf}
        />
      </View>
    </SafeAreaView>
  );
};

export default PrimaryStack_FuelingStrategyScreen;
