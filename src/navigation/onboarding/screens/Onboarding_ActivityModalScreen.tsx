import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { SafeAreaView, View } from "react-native";
import ActivityList from "../../../components/activities/ActivityList";
import ProgressIndicator from "../../../components/shared/ProgressIndicator";
import activities from "../../../lib/activities";
import tw from "../../../lib/tw";
import { OnboardingStackParamsList } from "../OnboardingStack";

type Props = NativeStackScreenProps<
  OnboardingStackParamsList,
  "Onboarding_ActivityModalScreen"
>;

const Onboarding_ActivityModalScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { screenName, index } = route.params;
  const onPress = (activityId: keyof typeof activities) => {
    navigation.navigate(screenName, { index, activityId });
  };

  return (
    <SafeAreaView style={tw`flex-1`}>
      <View style={tw`flex-1`}>
        <ActivityList onPress={onPress} />
      </View>
    </SafeAreaView>
  );
};

export default Onboarding_ActivityModalScreen;
