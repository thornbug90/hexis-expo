import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { Text, View } from "react-native";
import Button from "../../../components/shared/Button";
import ProgressIndicator from "../../../components/shared/ProgressIndicator";
import Wrapper from "../../../components/shared/Wrapper";
import { OnboardingStackParamsList } from "../OnboardingStack";
import tw from "../../../lib/tw";
import useUser from "../../../hooks/useUser";
import useRefetchDay from "../../../hooks/useRefetchDay";
import useAppDate from "../../../hooks/useAppDate";
import { getTimezone } from "../../../utils/date";

type Props = NativeStackScreenProps<
  OnboardingStackParamsList,
  "Onboarding_CompleteScreen"
>;

const Onboarding_CompleteScreen: React.FC<Props> = ({ navigation }) => {
  const [_, setRefetchDay] = useRefetchDay();
  const { updateUser } = useUser();
  const [appDate] = useAppDate();

  const onPress = () => {
    setRefetchDay(true);
    updateUser({
      input: {
        onboardingComplete: appDate,
        timezone: getTimezone(),
      },
    });
    // @ts-ignore
    navigation.navigate("Unauthenticated_AppIntroSliders");
  };

  return (
    <Wrapper>
      <View style={tw`flex-1 mx-4 pt-4`}>
        <ProgressIndicator currentScreen={6} />
        <Text style={tw`text-white text-2xl font-poppins-semibold my-4`}>
          Setup complete!
        </Text>
        <Text style={tw`text-white font-poppins-regular`}>
          Start adding workouts to update your Carb Codes!
        </Text>
      </View>
      <View style={tw`mx-4 mb-4`}>
        <Button onPress={onPress} label="Let's go!" />
      </View>
    </Wrapper>
  );
};

export default Onboarding_CompleteScreen;
