import { isConstValueNode } from "graphql";
import React from "react";
import { Text, TouchableWithoutFeedback, View } from "react-native";
import tw from "../../../lib/tw";

type Button = {
  label: string;
  onPress: () => void;
  active: boolean;
  Icon?: React.FC;
};

type Props = {
  disabled?: boolean;
  buttons: Button[];
  size?: "small";
  dark?: boolean;
};

const ButtonGroup: React.FC<Props> = ({ disabled, buttons, size, dark }) => {
  return (
    <View style={tw`flex-row mt-1 mb-4`}>
      {buttons.map((button, index) => (
        <TouchableWithoutFeedback
          disabled={disabled}
          key={index}
          onPress={button.onPress}
        >
          <View
            style={{
              ...tw.style([
                `${
                  dark ? "bg-background-500" : "bg-background-300"
                } flex-row flex-1 justify-center items-center px-2 py-4 `,
                size === "small" ? "py-2" : "",
                button.active
                  ? "bg-background-500 border border-activeblue-100 z-10"
                  : "",
                disabled ? "bg-background-400 border-activeblue-100" : "",
              ]),
              ...(index === 0
                ? {
                    borderTopLeftRadius: 10,
                    borderBottomLeftRadius: 10,
                  }
                : null),
              ...(index === buttons.length - 1
                ? {
                    borderTopRightRadius: 10,
                    borderBottomRightRadius: 10,
                  }
                : null),
            }}
          >
            <Text style={tw`text-white font-poppins-regular text-sm`}>
              {button.label}
            </Text>

            {button.Icon ? (
              <View style={tw`w-5 h-5 ml-4`}>
                {/* @ts-ignore */}
                <button.Icon color={tw.color("white")} />
              </View>
            ) : null}
          </View>
        </TouchableWithoutFeedback>
      ))}
    </View>
  );
};

export default ButtonGroup;
