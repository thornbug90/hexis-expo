import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import LifestyleActivityList from "../../../components/profile/LifestyleActivityList";
import Button from "../../../components/shared/Button";
import ProgressIndicator from "../../../components/shared/ProgressIndicator";
import Wrapper from "../../../components/shared/Wrapper";
import { Lifestyle_Activity } from "../../../generated/graphql";
import useUser from "../../../hooks/useUser";
import tw from "../../../lib/tw";

import { OnboardingStackParamsList } from "../OnboardingStack";

type Props = NativeStackScreenProps<
  OnboardingStackParamsList,
  "Onboarding_LifestyleActivityScreen"
>;

const Onboarding_LifestyleActivityScreen: React.FC<Props> = ({
  navigation,
}) => {
  const { user, updateUser } = useUser();

  useEffect(() => {
    if (user) {
      if (user.lifestyleActivity) {
        setLifestyleActivity(user.lifestyleActivity);
      }
    }
  }, [user]);

  const [lifestyleActivity, setLifestyleActivity] =
    useState<Lifestyle_Activity>();

  const onNavigate = () => {
    updateUser({
      input: {
        lifestyleActivity,
      },
    });

    navigation.navigate("Onboarding_TotalActivityDurationScreen");
  };
  return (
    <Wrapper>
      <View style={tw`mx-4 flex-1`}>
        <ProgressIndicator currentScreen={3} />
        <Text style={tw`text-white font-poppins-regular text-lg mb-4 mt-8`}>
          Lifestyle Patterns
        </Text>
        <Text
          style={tw`text-white font-poppins-regular tracking-wider text-sm mb-1`}
        >
          How active are you each day?
        </Text>
        <Text
          style={tw`text-white font-poppins-regular tracking-wider text-xs mb-12`}
        >
          (not including purposeful exercise)
        </Text>

        <LifestyleActivityList
          active={lifestyleActivity}
          onPress={setLifestyleActivity}
        />
      </View>
      <View style={tw`mx-4 mt-8`}>
        <Button
          size="medium"
          disabled={!lifestyleActivity}
          label="Next"
          onPress={onNavigate}
        />
      </View>
    </Wrapper>
  );
};

export default Onboarding_LifestyleActivityScreen;
