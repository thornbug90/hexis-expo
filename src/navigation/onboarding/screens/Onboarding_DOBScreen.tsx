import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { differenceInYears, subYears } from "date-fns";
import Button from "../../../components/shared/Button";
import DateTimeTextInput from "../../../components/shared/DateTimeTextInput";
import Wrapper from "../../../components/shared/Wrapper";
import tw from "../../../lib/tw";
import { OnboardingStackParamsList } from "../OnboardingStack";

import useUser from "../../../hooks/useUser";
import ProgressIndicator from "../../../components/shared/ProgressIndicator";
type Props = NativeStackScreenProps<
  OnboardingStackParamsList,
  "Onboarding_DOBScreen"
>;

const Onboarding_DOBScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateUser } = useUser();
  const [dob, setDob] = useState<Date | undefined>(new Date(user?.dob));

  useEffect(() => {
    if (user) {
      setDob(new Date(user.dob));
    }
  }, [user]);

  const onNavigate = () => {
    updateUser({
      input: {
        dob,
      },
    });
    navigation.navigate("Onboarding_SexScreen");
  };

  const isUnder16 = dob && differenceInYears(new Date(), dob) < 16;

  return (
    <Wrapper>
      <View style={tw`mx-4 flex-1`}>
        <ProgressIndicator currentScreen={1} />
        <Text style={tw`text-white font-poppins-regular text-lg mb-4 mt-4`}>
          Build your profile
        </Text>
        <Text style={tw`font-poppins-regular text-lg text-white mb-4 mt-4`}>
          Date of Birth
        </Text>
        <DateTimeTextInput
          moreRounded={true}
          label=""
          mode="date"
          error={
            isUnder16
              ? "You must be at least 16 years old to use this app."
              : undefined
          }
          value={dob ?? subYears(new Date(), 30)}
          onChange={setDob}
        />
      </View>
      <View style={tw`mx-4`}>
        <Button
          size="medium"
          disabled={dob === undefined || isUnder16}
          label="Next"
          onPress={onNavigate}
        />
      </View>
    </Wrapper>
  );
};

export default Onboarding_DOBScreen;
