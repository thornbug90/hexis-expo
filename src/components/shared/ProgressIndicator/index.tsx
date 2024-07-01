import React from "react";
import { View } from "react-native";
import tw from "../../../lib/tw";

type ProgressIndicatorProps = {
  totalScreens?: number;
  currentScreen: number;
};

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  totalScreens = 6,
  currentScreen,
}) => {
  const items = Array.from(Array(totalScreens)).map((item, index) => {
    return (
      <View
        key={index}
        style={tw.style([
          `flex-1 h-0.8 mx-1`,
          index < currentScreen ? "bg-activeblue-100" : "bg-activeblue-400",
        ])}
      />
    );
  });

  return <View style={tw`flex-row items-center -mx-1 my-3`}>{items}</View>;
};

export default ProgressIndicator;
