import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { SafeAreaView, View } from "react-native";
import ActivityList from "../../../components/activities/ActivityList";
import activities from "../../../lib/activities";
import tw from "../../../lib/tw";
import { PrimaryStackParamsList } from "../PrimaryStack";

type Props = NativeStackScreenProps<
  PrimaryStackParamsList,
  "PrimaryStack_ActivitiesListModal"
>;

const PrimaryStack_ActivitiesListModal: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { screenName, index, workoutId, showOther } = route.params;
  const onPress = (activityId: keyof typeof activities) => {
    // @ts-ignore
    navigation.navigate(screenName, {
      index,
      activityId,
      workoutId,
      showOther,
    });
  };

  return (
    <SafeAreaView style={tw`flex-1`}>
      <View style={tw`flex-1`}>
        <ActivityList onPress={onPress} showOtherActivity={showOther} />
      </View>
    </SafeAreaView>
  );
};

export default PrimaryStack_ActivitiesListModal;
