import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { SafeAreaView, View } from "react-native";
import ActivityList from "../../../components/activities/ActivityList";
import activities from "../../../lib/activities";
import tw from "../../../lib/tw";
import { ProfileStackParamsList } from "../ProfileStack";

type Props = NativeStackScreenProps<
  ProfileStackParamsList,
  "Profile_ActivitiesListModal"
>;

const Profile_ActivitiesListModal: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { screenName, index } = route.params;
  const onPress = (activityId: keyof typeof activities) => {
    // @ts-ignore
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

export default Profile_ActivitiesListModal;
