import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableWithoutFeedback, Animated } from "react-native";
import tw from "../../lib/tw";
import { ChevronDownIcon, LogoIcon } from "../icons/general";
import { useAnalytics } from "@segment/analytics-react-native";
const FuelMessage: React.FC<{
  inactive?: boolean;
  title: string;
  appendingMessage?: string | null;
  message: string;
}> = ({ inactive = false, title, message, appendingMessage }) => {
  const [show, setShow] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [height, setHeight] = useState<number>(0);
  const flipChevron = (): void => {
    Animated.timing(animatedValue, {
      toValue: show ? 0 : 180,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const chevronInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const fuelMessageHeight = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: [0, height],
  });
  const { track } = useAnalytics();

  const handleOnPress = (): void => {
    track("GUIDED_FUELLING", {
      show: !show,
    });
    setShow(!show);
    flipChevron();
  };

  return (
    <TouchableWithoutFeedback onPress={handleOnPress}>
      <View style={tw`border-b border-background-100 mb-1.5 mt-4 mx-4`}>
        <View style={tw`py-2 flex-row items-center mb-1`}>
          <View style={tw`flex-row flex-1 items-center`}>
            <View style={tw`w-6 h-6 mr-4`}>
              <LogoIcon />
            </View>
            <Text
              style={tw`${
                inactive
                  ? "text-gray-200 text-lg font-poppins-medium "
                  : "font-poppins-semibold text-lg  text-white"
              }`}
            >
              {title}
            </Text>
          </View>
          <Animated.View
            style={[
              tw`w-4 h-4 mr-4`,
              { transform: [{ rotate: chevronInterpolate }] },
            ]}
          >
            <ChevronDownIcon
              color={tw.color(inactive ? "text-gray-200" : "text-white")}
            />
          </Animated.View>
        </View>

        <Animated.View
          style={[
            {
              height: height ? fuelMessageHeight : undefined,
            },
          ]}
        >
          <Text
            onLayout={(e) => {
              if (!height) {
                setHeight(e.nativeEvent.layout.height + 10);
              }
            }}
            style={tw`font-poppins-regular text-sm text-white`}
          >
            {message}
            {appendingMessage ? " " + appendingMessage : null}
          </Text>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default FuelMessage;
