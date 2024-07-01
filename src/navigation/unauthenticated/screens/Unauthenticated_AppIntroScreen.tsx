import React from "react";
import { Text, View, Image } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import Wrapper from "../../../components/shared/Wrapper";
import tw from "../../../lib/tw";
import Button from "../../../components/shared/Button";
import AppIntroGetStarted from "../../../../assets/app_intro_getting_started.png";
import { PrimaryStackParamsList } from "../../primary/PrimaryStack";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<
  PrimaryStackParamsList,
  "Unauthenticated_AppIntroScreen"
>;

const Unauthenticated_AppIntroScreen: React.FC<Props> = ({ navigation }) => {
  const handleStartAppIntro = async () => {
    // await AsyncStorage.setItem("hasAppIntroduced", "true");
    return navigation.reset({
      index: 0,
      routes: [{ name: "OnboardingStack" }],
    });
  };

  return (
    <Wrapper>
      <View style={tw`px-4 pt-5 h-full flex justify-between`}>
        <View>
          <Text style={tw`text-white text-2xl font-poppins-semibold mb-8`}>
            Maximise your performance.
          </Text>

          <Text style={tw`text-white text-sm font-poppins-regular mb-8`}>
            Fuel smarter, perform better and recover faster with 24/7
            personalised nutrition tailored to your workouts, lifestyle and
            goals.
          </Text>
        </View>

        <View style={tw`flex flex-row justify-center mb-8`}>
          <Image source={AppIntroGetStarted} style={tw`w-[300px] h-[200px]`} />
        </View>

        <Button label="Next" size="medium" onPress={handleStartAppIntro} />
      </View>
    </Wrapper>
  );
};

export default Unauthenticated_AppIntroScreen;
