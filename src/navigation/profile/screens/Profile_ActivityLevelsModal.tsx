import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import LifestyleActivityList from "../../../components/profile/LifestyleActivityList";
import ProfileHeader from "../../../components/profile/ProfileHeader";
import Button from "../../../components/shared/Button";

import Wrapper from "../../../components/shared/Wrapper";
import { Lifestyle_Activity } from "../../../generated/graphql";
import tw from "../../../lib/tw";

import { ProfileStackParamsList } from "../ProfileStack";

type Props = NativeStackScreenProps<
  ProfileStackParamsList,
  "Profile_ActivityLevelsModal"
>;

const Profile_ActivityLevelsModal: React.FC<Props> = ({
  navigation,
  route,
}) => {
  useEffect(() => {
    setLifestyleActivity(route.params.lifestyleActivity);
  }, [route]);
  const [lifestyleActivity, setLifestyleActivity] =
    useState<Lifestyle_Activity>();

  const onSave = () => {
    navigation.navigate("Profile_LifestyleScreen", {
      lifestyleActivity: lifestyleActivity!,
    });
  };

  return (
    <Wrapper>
      <View style={tw`mx-4 mt-4 flex-1`}>
        <ProfileHeader text=" How active are you each day? (not including purposeful exercise)" />
        <LifestyleActivityList
          active={lifestyleActivity}
          onPress={setLifestyleActivity}
        />
      </View>
      <View style={tw`flex-row items-center mx-4`}>
        <Button
          style="flex-1 ml-2"
          variant="primary"
          label="Done"
          onPress={onSave}
        />
      </View>
    </Wrapper>
  );
};

export default Profile_ActivityLevelsModal;
