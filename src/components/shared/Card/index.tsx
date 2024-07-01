import React from "react";
import { View, Text, TouchableWithoutFeedback } from "react-native";
import tw from "../../../lib/tw";

type Props = {
  onboarding?: boolean;
  leftOriented?: boolean;
  text: string;
  rightText?: string;
  onPress?: () => void;
  active?: boolean;
  disabled?: boolean;
  dark?: boolean;
  size?: "small";
  moreRounded?: boolean;
  customColor?: string | undefined;
};

const Card: React.FC<Props> = ({
  onboarding = false,
  leftOriented,
  moreRounded,
  size,
  dark,
  text,
  rightText,
  active,
  onPress,
  disabled = false,
  customColor,
}) => {
  return (
    <TouchableWithoutFeedback disabled={disabled} onPress={onPress}>
      <View
        style={tw.style([
          `mb-4  px-4 ${moreRounded ? "rounded-xl" : "rounded-larger"} shadow`,
          active
            ? "border bg-background-500 border-activeblue-100"
            : "bg-background-300",
          disabled ? "opacity-75" : "",
          customColor ? customColor : dark ? "bg-background-500" : "",
          size === "small" ? "py-3" : "py-4",
        ])}
      >
        {rightText ? (
          <View style={tw`flex-row items-stretch min-h-16`}>
            <View
              style={tw`flex-1 items-center min-w-10 justify-center px-2 border-r border-white`}
            >
              <Text
                style={tw`${
                  active ? "text-white" : "text-gray-200"
                } font-poppins-regular text-lg`}
              >
                {text}
              </Text>
            </View>

            <View style={tw`flex-2 justify-center items-center px-2`}>
              <Text
                style={tw`${
                  active ? "text-white" : "text-gray-200"
                } text-sm font-poppins-medium`}
              >
                {rightText}
              </Text>
            </View>
          </View>
        ) : (
          <View
            style={tw`${leftOriented ? "" : "items-center justify-center"}`}
          >
            <Text
              style={tw`${
                onboarding && !active ? "text-gray-200" : "text-white"
              } text-base font-poppins-regular`}
            >
              {text}
            </Text>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Card;
