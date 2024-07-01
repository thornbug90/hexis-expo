// const interpolate = (x: number, y: number, a: number) => x * (1 - a) + y * a
import React from "react";
import { Text, View } from "react-native";
import tw from "../../lib/tw";

const LiveGraphHeader: React.FC<{ data?: number }> = ({ data }) => {
  return (
    <View
      style={tw`flex-row items-center pb-4  border-b border-background-100 pt-4 mx-4`}
    >
      <View
        style={tw`w-3 h-3 rounded-full bg-carbcodehigh-100 mr-2 shadow-carbcodehigh-100 shadow-2xl`}
      />
      <Text
        style={tw`text-white text-base font-poppins-medium mr-2 tracking-wide`}
      >
        Live Energy:
      </Text>
      <Text style={tw`text-white text-lg font-poppins-semibold mr-1`}>
        {data && data > 0 ? "+" : null}
        {data ? data.toFixed(0) : undefined}
      </Text>
      <Text style={tw`text-white self-start font-poppins-medium text-xxs`}>
        kcal
      </Text>
    </View>
  );
};

export default LiveGraphHeader;
