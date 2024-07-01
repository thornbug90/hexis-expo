import React from "react";
import {
  TextInputProps,
  TextInput as RNTextInput,
  View,
  Text,
  TouchableWithoutFeedback,
} from "react-native";
import tw from "../../../lib/tw";
import Label from "../Label";

type Props = {
  typed?: boolean;
  placeholder?: string;
  Icon?: React.FC;
  iconPosition?: string;
  bgColor?: string;
  size?: "sm" | "lg";
  underlined?: boolean;
  moreRounded?: boolean;
  label?: string;
  error?: string;
  rightText?: string | object;
  onRightPress?: () => void;
  hideError?: boolean;
} & TextInputProps;

const TextInput: React.FC<Props> = ({
  typed = false,
  placeholder,
  Icon,
  iconPosition,
  underlined,
  moreRounded,
  label,
  error,
  rightText,
  onRightPress,
  style,
  editable = true,
  hideError,
  bgColor,
  size,
  ...rest
}) => {
  var inputStyleStr = "font-poppins-medium text-white flex-1";
  if (size == "sm") inputStyleStr += " text-sm py-1 px-2";
  else inputStyleStr += " text-base py-4 px-4";
  const inputStyle = tw`${inputStyleStr}`;

  if (!iconPosition) iconPosition = "right";
  return (
    <View style={size != "sm" ? tw`mb-4` : tw`mb-1`}>
      {label ? <Label text={label} /> : null}
      <View
        style={tw.style([
          bgColor ? bgColor : "bg-background-300",
          `${
            moreRounded ? "rounded-xl" : "rounded-larger"
          }  flex-row shadow items-center`,
          error ? "border-red" : "",
          !editable ? "opacity-75" : "",
          typed ? "border border-activeblue-100 bg-background-500" : "",
        ])}
      >
        {Icon && iconPosition == "left" && (
          <TouchableWithoutFeedback onPress={onRightPress}>
            <View style={tw`ml-3`}>
              <View style={tw`w-7 h-7`}>
                {/* @ts-ignore */}
                <Icon color={tw.color("white")} />
              </View>
            </View>
          </TouchableWithoutFeedback>
        )}
        <RNTextInput
          placeholder={placeholder}
          placeholderTextColor={tw.color("background-100")}
          editable={editable}
          style={inputStyle}
          {...rest}
        />
        {(rightText || (Icon && iconPosition == "right")) && (
          <TouchableWithoutFeedback onPress={onRightPress}>
            <View style={tw`ml-4 mr-6`}>
              {rightText ? (
                <Text
                  style={tw`font-poppins-regular text-white opacity-60 text-base py-4`}
                >
                  {rightText}
                </Text>
              ) : (
                <View style={tw`w-7 h-7`}>
                  {/* @ts-ignore */}
                  <Icon color={tw.color("white")} />
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        )}
      </View>
      {error ? (
        <Text
          style={tw`text-xs text-red font-poppins-medium py-2 ${
            hideError ? "text-transparent" : ""
          }`}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
};

export default TextInput;
