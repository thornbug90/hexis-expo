import {
  Text,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
} from "react-native";
import tw from "../../../lib/tw";
import React from "react";
type Props = {
  variant?:
    | "primary"
    | "secondary"
    | "secondary2"
    | "ghost"
    | "dark"
    | "danger";
  size?: "large" | "small" | "medium";
  label: string;
  disabled?: boolean;
  onPress?: () => void;
  style?: any;
  loading?: boolean;
  padding?: boolean;
  icon?: any;
};

const Button: React.FC<Props> = ({
  label,
  disabled = false,
  onPress,
  variant = "primary",
  size = "large",
  style = "",
  loading = false,
  padding = false,
  icon,
}) => {
  const Icon = icon;
  return (
    <TouchableWithoutFeedback disabled={disabled} onPress={onPress}>
      <View
        style={tw.style([
          `rounded-lg shadow py-4 px-4 items-center justify-center border mb-4`,
          disabled ? "opacity-75" : "",
          variant === "primary"
            ? "bg-activeblue-100 border-activeblue-100"
            : "",
          variant === "ghost" ? "bg-transparent border-transparent" : "",
          variant === "dark" ? "bg-background-500 border-transparent" : "",
          variant === "secondary2"
            ? "bg-background-200 border-transparent"
            : "",
          variant === "secondary"
            ? "bg-activeblue-500 border-activeblue-100"
            : "",
          variant === "danger" ? "bg-red border-red" : "",
          size === "small" ? "py-2 px-2" : "",
          size === "medium" ? "p-3" : "",
          style,
        ])}
      >
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : Icon ? (
          <Icon height={24} width={24} />
        ) : (
          <Text
            style={tw.style([
              `font-poppins-medium text-white`,
              size === "small" ? "text-sm" : "",
              padding ? `px-3` : "",
            ])}
          >
            {label}
          </Text>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Button;
