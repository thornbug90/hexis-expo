import {
  Text,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
} from "react-native";
import tw from "../../../lib/tw";

type Props = {
  variant?: "primary" | "secondary" | "ghost" | "dark" | "transparent";
  size?: "large" | "small" | "medium" | "xsmall";
  Icon: React.FC;
  disabled?: boolean;
  onPress?: () => void;
  style?: any;
  loading?: boolean;
};

const IconButton: React.FC<Props> = ({
  Icon,
  disabled = false,
  onPress,
  variant = "primary",
  size = "large",
  style = "",
  loading = false,
}) => {
  var iconSize = "h-9 w-9";
  if (size == "xsmall") iconSize = "h-5 w-5";
  return (
    <TouchableWithoutFeedback disabled={disabled} onPress={onPress}>
      <View
        style={tw.style([
          `rounded-lg shadow py-2 px-4 items-center justify-center ${
            variant == "transparent" ? "" : "border"
          } mb-2`,
          disabled ? "opacity-75" : "",
          variant === "primary"
            ? "bg-activeblue-100 border-activeblue-100"
            : "",
          variant === "ghost" ? "bg-transparent border-transparent" : "",
          variant === "dark" ? "bg-background-500 border-transparent" : "",
          variant === "secondary"
            ? "bg-activeblue-500 border-activeblue-100"
            : "",
          size === "xsmall" ? "py-2 px-1" : "",
          size === "small" ? "py-2 px-2" : "",
          size === "medium" ? "p-3" : "",
          style,
        ])}
      >
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Icon style={tw`${iconSize}`} color={tw.color("white")} />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default IconButton;
