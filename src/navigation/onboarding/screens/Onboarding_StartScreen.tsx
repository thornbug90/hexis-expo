import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { View } from "react-native";
import { useAtom } from "jotai";

import { OnboardingStackParamsList } from "../OnboardingStack";
import tw from "../../../lib/tw";
import Carousel from "../../../components/onboarding/Carousel";
import Button from "../../../components/shared/Button";
import useUser from "../../../hooks/useUser";
import { isLoggedInAtom } from "../../../store";
import { getTimezone } from "../../../utils/date";

type Props = NativeStackScreenProps<
  OnboardingStackParamsList,
  "Onboarding_StartScreen"
>;

const Onboarding_StartScreen: React.FC<Props> = ({ navigation }) => {
  const [showGetStarted, setShowGetStarted] = useState(false);
  const { user, updateUser, loading } = useUser();
  const nav = useNavigation();
  const [loggedIn] = useAtom(isLoggedInAtom);

  useEffect(() => {
    updateUser({
      input: {
        timezone: getTimezone(),
      },
    });
  }, []);

  useEffect(() => {
    if (loggedIn && user && user?.onboardingComplete) {
      // @ts-ignore
      nav.reset({ index: 0, routes: [{ name: "PrimaryStack" }] });
    } else {
      onNavigate();
    }
  }, [loggedIn, user?.id]);

  const onNavigate = () => {
    navigation.navigate("Onboarding_DOBScreen");
  };

  return (
    <SafeAreaView style={tw`flex-1`}>
      <View style={tw`flex-1 mx-4`}>
        <Carousel setShowGetStarted={setShowGetStarted} />
        {showGetStarted ? (
          <View style={tw`my-4`}>
            <Button onPress={onNavigate} label="Get started" />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

export default Onboarding_StartScreen;
