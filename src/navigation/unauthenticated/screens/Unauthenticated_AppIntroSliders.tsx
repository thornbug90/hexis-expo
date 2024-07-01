import React, { useRef } from "react";
import {
  View,
  Text,
  ViewStyle,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import AppIntroSlider from "react-native-app-intro-slider";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Wrapper from "../../../components/shared/Wrapper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  AppIntroIcon01,
  AppIntroIcon02,
  AppIntroIcon03,
  AppIntroIcon04,
  AppIntroIcon05,
  AppIntroIcon06,
  AppIntroIcon07,
  AppIntroIcon08,
  AppIntroIcon09,
} from "../../../components/icons/general";
import tw from "../../../lib/tw";
import Button from "../../../components/shared/Button";
import { PrimaryStackParamsList } from "../../primary/PrimaryStack";

type Props = NativeStackScreenProps<
  PrimaryStackParamsList,
  "Unauthenticated_AppIntroSliders"
>;

interface IAppIntroSlide {
  key: string;
  title: string;
  text: string;
  Image: ({
    width,
    height,
    className,
  }: {
    width?: number;
    height?: number;
    className?: ViewStyle;
  }) => JSX.Element;
}

export const ON_BOARDING_SLIDES = [
  {
    key: "1",
    title: "Turn your Workouts into Personalised Nutrition",
    text: "Whether your going all-out or taking it easy, we’ll tailor your plan to your unique demands of your workouts",
    Image: AppIntroIcon01,
  },
  {
    key: "2",
    title: "Start by adding your Workout",
    text: "Click the “+” icon and input the type, duration and intensity of your planned workout",
    Image: AppIntroIcon02,
  },
  {
    key: "3",
    title: "Get your daily nutrition needs ",
    text: "Daily energy, carb, protein and fat recommendations are tailored to the unique demands of each day ",
    Image: AppIntroIcon03,
  },
  {
    key: "4",
    title: "Discover your periodised fuel plan",
    text: "Optimise energy, performance and recovery with easy to follow meal by meal Carb Codes",
    Image: AppIntroIcon04,
  },
  {
    key: "5",
    title: "Check out how to fuel during your workout",
    text: "Power through your workout with personalised Intra Workout Fuelling strategies",
    Image: AppIntroIcon05,
  },
  {
    key: "6",
    title: "Visualise your Live Energy",
    text: "Check out the minute by minute insights into your energy balance in real-time throughout the day",
    Image: AppIntroIcon06,
  },
  {
    key: "7",
    title: "Log meals for a quick check-in",
    text: "Access reliable food data for those moments when you want to dive into the numbers and track your intake",
    Image: AppIntroIcon07,
  },
  {
    key: "8",
    title: "Connect your wearable",
    text: "Turn your workout data into recovery  recommendations in real-time following your workouts",
    Image: AppIntroIcon08,
  },
  {
    key: "9",
    title: "These science backed strategies...",
    text: "Unleash the power of personalised and periodised nutrition day by day and meal by meal",
    Image: AppIntroIcon09,
  },
  {
    key: "10",
    title: "Let’s go!",
    text: "Add your first workout and start maximising your performance now",
    Image: AppIntroIcon09,
  },
];

const createOnBoardingSlides = (): IAppIntroSlide[] => {
  const slides: IAppIntroSlide[] = ON_BOARDING_SLIDES.map(
    ({ key, Image, text, title }) => ({
      key,
      Image,
      text: text,
      title: title,
    })
  );

  return slides;
};

const Unauthenticated_AppIntroSliders: React.FC<Props> = ({ navigation }) => {
  const keyExtractor = (slide: IAppIntroSlide) => slide.key;
  const sliderRef = useRef<AppIntroSlider<IAppIntroSlide> | null>(null);
  const screenHeight = Dimensions.get("window").height;
  const slides = createOnBoardingSlides();

  const handleDone = async () => {
    try {
      await AsyncStorage.setItem("hasAppIntroduced", "true");
      navigation.navigate("PrimaryStack");
    } catch (error) {
      console.log("Error setting hasAppIntroduced in AsyncStorage:", error);
    }
  };

  const handleNextSlide = (nextSlide: number) => () => {
    if (!sliderRef.current) return;

    const maxSlides = slides.length;

    if (nextSlide < maxSlides) sliderRef.current?.goToSlide(nextSlide);
    else handleDone();
  };

  const handleRenderItem = ({
    item: { Image, title, text },
    index,
  }: {
    item: IAppIntroSlide;
    index: number;
  }) => {
    const windowHeight = Dimensions.get("window").height;
    let largeScreen = windowHeight > 800;
    const state = navigation.getState();
    return (
      <View style={tw`p-6 justify-between mt-${largeScreen ? 10 : 2}`}>
        <View style={tw`h-${(screenHeight * 5) / 26}`}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={tw`text-white text-2xl font-poppins-semibold mb-2`}>
              {title}
            </Text>
            <View style={tw`flex flex-row justify-center`}>
              <Image />
            </View>

            <Text style={tw`text-white text-base mb-6`}>{text}</Text>
          </ScrollView>
        </View>
        <View style={tw`mt-2`}>
          <Button
            label="Next"
            size="medium"
            onPress={handleNextSlide(index + 1)}
          />
        </View>
      </View>
    );
  };

  return (
    <AppIntroSlider
      keyExtractor={keyExtractor}
      data={slides}
      renderItem={handleRenderItem}
      showNextButton={false}
      showSkipButton={false}
      showDoneButton={false}
      ref={(ref) => (sliderRef.current = ref)}
    />
  );
};

export default Unauthenticated_AppIntroSliders;
