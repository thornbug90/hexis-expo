import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import TotalActivityDurationList from "../../../components/profile/TotalActivityDurationList";
import Button from "../../../components/shared/Button";
import ProgressIndicator from "../../../components/shared/ProgressIndicator";
import Wrapper from "../../../components/shared/Wrapper";
import { Total_Activity_Duration } from "../../../generated/graphql";
import useUser from "../../../hooks/useUser";
import tw from "../../../lib/tw";

import { OnboardingStackParamsList } from "../OnboardingStack";

type Props = NativeStackScreenProps<
  OnboardingStackParamsList,
  "Onboarding_TotalActivityDurationScreen"
>;

const Onboarding_TotalActivityDurationScreen: React.FC<Props> = ({
  navigation,
}) => {
  const { user, updateUser } = useUser();

  useEffect(() => {
    if (user && user.totalActivityDuration) {
      setTotalActivityDuration(user.totalActivityDuration);
    }
  }, [user]);

  const [totalActivityDuration, setTotalActivityDuration] = useState<
    Total_Activity_Duration | undefined
  >();

  const onNavigate = () => {
    updateUser({
      input: {
        totalActivityDuration,
      },
    });

    navigation.navigate("Onboarding_FavouriteWorkoutsScreen");
  };
  return (
    <Wrapper>
      <View style={tw`mx-4 flex-1`}>
        <ProgressIndicator currentScreen={4} />
        <Text style={tw`text-white font-poppins-regular text-lg mb-4 mt-8`}>
          Workout Patterns
        </Text>
        <Text
          style={tw`text-white font-poppins-regular tracking-wider text-sm mb-12 max-w-70`}
        >
          How many hours a week do you workout on average?
        </Text>

        <TotalActivityDurationList
          active={totalActivityDuration}
          onPress={setTotalActivityDuration}
        />
      </View>
      <View style={tw`mx-4 mt-8`}>
        <Button
          size="medium"
          disabled={!totalActivityDuration}
          label="Next"
          onPress={onNavigate}
        />
      </View>
    </Wrapper>
  );
};

export default Onboarding_TotalActivityDurationScreen;
