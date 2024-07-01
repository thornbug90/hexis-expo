import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { Dimensions, SafeAreaView, View, Text } from "react-native";
import Button from "../../../components/shared/Button";
import tw from "../../../lib/tw";
import { BatteryChargingIcon } from "../../../components/icons/general";
import { PrimaryStackParamsList } from "../PrimaryStack";

const { width } = Dimensions.get("screen");

type Props = NativeStackScreenProps<
  PrimaryStackParamsList,
  "PrimaryStack_IwfRecommendedModal"
>;

const PrimaryStack_IwfRecommendedModal: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={tw`flex-1 items-center justify-center`}>
      <View
        style={{
          width: width - 64,
          ...tw`p-4 bg-background-300 rounded-lg border border-background-100 shadow relative`,
        }}
      >
        <View
          style={[
            tw`w-18 h-18 flex items-center justify-center bg-background-300 border-2 rounded-full border-white`,
            { position: "absolute", left: width / 2 - 72, top: -35 },
          ]}
        >
          <BatteryChargingIcon color={tw.color("white")} />
        </View>
        <View style={tw`mb-6 mt-12`}>
          <Text
            style={tw`font-poppins-semibold text-white text-lg text-center`}
          >
            Intra Workout Fuelling is Recommended
          </Text>
          <View style={tw`my-4`}>
            <Text
              style={tw`font-poppins-medium text-white text-sm text-center`}
            >
              WHY?
            </Text>
            <Text
              style={tw`font-poppins-medium text-white text-sm text-center`}
            >
              Consuming fuel during your workout will limit fatigue and elevate
              performance.
            </Text>
          </View>
          <View style={tw`my-4`}>
            <Text
              style={tw`font-poppins-medium text-white text-sm text-center`}
            >
              HOW TO ADD
            </Text>
            <Text
              style={tw`font-poppins-medium text-white text-sm text-center`}
            >
              Click the fuel icon to view and add Intra Workout Fuelling to your
              workout
            </Text>
          </View>
        </View>
        <Button label="OK" size="small" onPress={navigation.goBack} />
      </View>
    </SafeAreaView>
  );
};

export default PrimaryStack_IwfRecommendedModal;
