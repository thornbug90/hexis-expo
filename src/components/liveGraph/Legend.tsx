import React from "react";
import { View, Text } from "react-native";
import tw from "../../lib/tw";
import {
  LegendLoggedMealIcon,
  LegendPastLine,
  LegendPlannedMealIcon,
  LegendPredictedLine,
  LegendWorkoutLine,
} from "../icons/general";

const Legend = () => {
  return (
    <View style={tw`p-4 bg-background-400 shadow rounded-lg mb-4`}>
      <View
        style={tw`font-poppins-medium text-lg text-white flex flex-row flex-wrap`}
      >
        <View style={tw`flex flex-row items-center`}>
          <LegendPastLine />
          <Text style={tw`text-white`}>&nbsp;Past&nbsp;&nbsp;</Text>
        </View>
        <View style={tw`flex flex-row items-center`}>
          <LegendPredictedLine />
          <Text style={tw`text-white`}>&nbsp;Predicted&nbsp;&nbsp;</Text>
        </View>
        <View style={tw`flex flex-row items-center`}>
          <LegendWorkoutLine />
          <Text style={tw`text-white`}>&nbsp;Workout&nbsp;&nbsp;</Text>
        </View>
        <View style={tw`flex flex-row items-center`}>
          <LegendPlannedMealIcon />
          <Text style={tw`text-white`}>&nbsp;Planned Meal&nbsp;&nbsp;</Text>
        </View>
        <View style={tw`flex flex-row items-center`}>
          <LegendLoggedMealIcon />
          <Text style={tw`text-white`}>&nbsp;Logged Meal</Text>
        </View>
      </View>
    </View>
  );
};

export default Legend;
