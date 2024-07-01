import React, { useEffect, useRef, useState } from "react";
import { View, Dimensions, Text, StyleSheet } from "react-native";
import SnapCarousel, { Pagination } from "react-native-snap-carousel";
import AnimatedLottieView from "lottie-react-native";
import onboarding0 from "../../../assets/lottie/hexis_onboarding_3.json";
import onboarding1 from "../../../assets/lottie/hexis_onboarding_4.json";
import onboarding2 from "../../../assets/lottie/hexis_onboarding_5.json";
import onboarding3 from "../../../assets/lottie/hexis_onboarding_6.json";
import tw from "../../lib/tw";
const data = [
  {
    title: "Fuel your performance.",
    content:
      "Optimise how you fuel, recover and adapt to your workouts with the latest advancement in performance science.",
    animation: onboarding0,
  },
  {
    title: "Personalised Carb Coding.",
    content:
      "Strategically adjust carbohydrate and energy intake to the unique demands of each day.",
    animation: onboarding1,
  },
  {
    title: "Understanding the system.",
    content:
      "Learn how to utilise carbohydrates for enhanced performance and recovery. Hexis colour codes your carb ranges in green, amber and red to help.",
    animation: onboarding2,
  },
  {
    title: "Track your live energy.",
    content:
      "Track and predict your energy status in real time throughout the day.",
    animation: onboarding3,
  },
];

const { width, height } = Dimensions.get("window");

const Carousel: React.FC<{
  setShowGetStarted: (boolean: boolean) => void;
}> = ({ setShowGetStarted }) => {
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    if (activeDot === data.length - 1) {
      setShowGetStarted(true);
    } else {
      setShowGetStarted(false);
    }
  }, [activeDot]);

  return (
    <View style={tw`flex-1 items-center justify-center`}>
      <SnapCarousel
        removeClippedSubviews={false}
        layout="default"
        data={data}
        renderItem={({ item, index }) => (
          <View style={tw`px-4 bg-background-500 flex-1 overflow-hidden`}>
            <View style={tw`pt-10`}>
              <Text style={tw`font-poppins-semibold text-white text-2xl`}>
                {item.title}
              </Text>
              <View style={tw`mr-4 mt-8 max-w-70`}>
                <Text style={tw`font-poppins-regular text-white text-base`}>
                  {item.content}
                </Text>
              </View>
            </View>
            <AnimatedLottieView
              autoSize
              style={[
                { width, height },
                { position: "absolute", top: 0, left: 0 },
                index === 3 ? { transform: [{ scale: 1.1 }] } : {},
                index === 1 || index === 0
                  ? { transform: [{ scale: 1.05 }] }
                  : {},
              ]}
              autoPlay
              source={item.animation}
            />
          </View>
        )}
        sliderWidth={width}
        itemWidth={width}
        itemHeight={height}
        sliderHeight={height}
        hasParallaxImages={true}
        inactiveSlideScale={0.94}
        inactiveSlideOpacity={0.7}
        onSnapToItem={(index) => setActiveDot(index)}
      />
      <Pagination
        dotsLength={data.length}
        dotStyle={tw`bg-carbcodehigh-100 p-1.2 rounded-full`}
        activeDotIndex={activeDot}
      />
    </View>
  );
};

export default Carousel;
