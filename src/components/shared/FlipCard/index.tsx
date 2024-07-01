import React, { useRef, useState } from "react";
import { Animated, TouchableOpacity } from "react-native";
import tw from "../../../lib/tw";

type FlipCardProps = {
  frontCard: React.ReactNode;
  backCard: React.ReactNode;
};

const FlipCard: React.FC<FlipCardProps> = ({ frontCard, backCard }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [flipped, setFlipped] = useState(false);

  const onFlipCard = (): void => {
    setFlipped(!flipped);
    Animated.timing(animatedValue, {
      toValue: flipped ? 0 : 180,
      duration: 800,
      useNativeDriver: false,
    }).start();
  };

  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  return (
    <TouchableOpacity onPress={onFlipCard}>
      <Animated.View
        style={{
          ...tw.style([
            `p-2 bg-background-400 rounded-lg mb-4 shadow`,
            flipped ? "absolute" : "relative",
          ]),
          ...{ backfaceVisibility: "hidden" },
          ...frontAnimatedStyle,
        }}
      >
        {frontCard}
      </Animated.View>
      <Animated.View
        style={{
          ...tw.style([
            `p-4 bg-background-400 rounded-lg mb-4 shadow`,
            !flipped ? "absolute" : "relative",
          ]),
          ...{ backfaceVisibility: "hidden" },
          ...backAnimatedStyle,
        }}
      >
        {backCard}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default FlipCard;
