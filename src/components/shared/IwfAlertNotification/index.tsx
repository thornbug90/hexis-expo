import React from "react";
import { BatteryChargingIcon } from "../../icons/general";
import { View, Text, Dimensions } from "react-native";
import tw from "../../../lib/tw";
import Animated, { SlideInRight } from "react-native-reanimated";

const IwfAlertNotification = ({ added }: { added: boolean }) => {
  const { width, height } = Dimensions.get("window");
  return (
    <Animated.View
      entering={SlideInRight}
      style={[
        tw`mx-4 py-2 mt-2 rounded-xl mx-2 absolute ${
          added ? "bg-[#1E3054]" : "bg-[#4B3023]"
        }`,
        { width: width - 15, top: height / 1.125 },
      ]}
    >
      <View style={tw`flex-row px-2 py-2 items-center`}>
        <View style={tw`pr-2`}>
          <BatteryChargingIcon
            color={
              added ? tw.color("activeblue") : tw.color("carbcodemedium-100")
            }
          />
        </View>
        <View>
          <Text style={tw`text-base text-white font-poppins-medium`}>
            {`${
              added
                ? "Intra Workout Fuelling Added"
                : "Intra Workout Fuelling Removed"
            }`}
          </Text>
          <Text style={tw`text-white text-xxs font-poppins-medium`}>
            Your Fuel Plan has been updated.
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

export default IwfAlertNotification;
