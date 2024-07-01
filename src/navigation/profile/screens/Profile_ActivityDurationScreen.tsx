import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Total_Activity_Duration } from "../../../generated/graphql";
import { ProfileStackParamsList } from "../ProfileStack";
import { View, Text } from "react-native";
import tw from "../../../lib/tw";
import Wrapper from "../../../components/shared/Wrapper";
import TotalActivityDurationList from "../../../components/profile/TotalActivityDurationList";
import Button from "../../../components/shared/Button";
import ProfileHeader from "../../../components/profile/ProfileHeader";
type Props = NativeStackScreenProps<
  ProfileStackParamsList,
  "Profile_ActivityDurationScreen"
>;
const Profile_ActivityDurationScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const [totalActivityDuration, setTotalActivityDuration] =
    useState<Total_Activity_Duration>();
  useEffect(() => {
    if (route.params.activityDuration) {
      setTotalActivityDuration(route.params.activityDuration);
    }
  }, [route]);

  return (
    <Wrapper>
      <View style={tw`mx-4 mt-4 flex-1`}>
        <ProfileHeader text="How many hours a week do you workout on average?" />

        <TotalActivityDurationList
          active={totalActivityDuration}
          onPress={setTotalActivityDuration}
        />
      </View>
      <View style={tw`m-4`}>
        <Button
          disabled={!totalActivityDuration}
          label="Done"
          onPress={() =>
            navigation.navigate("Profile_FavouriteActivities", {
              activityDuration: totalActivityDuration,
            })
          }
        />
      </View>
    </Wrapper>
  );
};

export default Profile_ActivityDurationScreen;
