import React from "react";
import { View, Text } from "react-native";
import tw from "../../lib/tw";
import KcalInfo from "./KcalInfo";

const DayLargest: React.FC<{ deficit?: number; surplus?: number }> = ({
  deficit,
  surplus,
}) => {
  if (!deficit && !surplus) return null;
  return (
    <View style={tw`p-4 bg-background-400 shadow rounded-lg mb-4`}>
      <Text style={tw`font-poppins-medium text-lg mb-2 text-white`}>
        Day's Largest
      </Text>
      <View style={tw`flex flex-row justify-between`}>
        <KcalInfo
          kcal={Math.round(deficit!)}
          text="Deficit"
          subtitle=" (lowest kcals)"
        />
        <KcalInfo
          kcal={Math.round(surplus!)}
          text="Surplus"
          subtitle=" (highest kcals)"
        />
      </View>
    </View>
  );
};

export default DayLargest;
