import React from "react";
import { Image, Text, View } from "react-native";
import tw from "../../lib/tw";
import primaryIcon from "../../../assets/icon.png";

const SyncWorkoutLoading: React.FC = () => {
  return (
    <View
      style={tw`flex-col px-5 min-h-30 items-center justify-center gap-3 z-50`}
    >
      <Image
        source={primaryIcon}
        style={tw`justify-center items-center w-8 h-8`}
      />
      <Text
        style={tw`text-white text-xs font-poppins-regular tracking-[0.5px]`}
      >
        Pull to sync your workouts
      </Text>
    </View>
  );
};

export default SyncWorkoutLoading;
