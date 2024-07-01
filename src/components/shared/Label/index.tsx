import React from "react";
import { Text, View } from "react-native";
import tw from "../../../lib/tw";

const Label: React.FC<{ text: string; onboarding?: boolean }> = ({
  text,
  onboarding = false,
}) => {
  return (
    <View>
      <Text
        style={tw`${
          onboarding ? "text-base" : "text-xs tracking-wider"
        } font-poppins-regular text-white mb-2`}
      >
        {text}
      </Text>
    </View>
  );
};

export default Label;
