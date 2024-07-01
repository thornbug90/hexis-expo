import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Button from "../../../components/shared/Button";
import Card from "../../../components/shared/Card";
import Label from "../../../components/shared/Label";
import Wrapper from "../../../components/shared/Wrapper";
import { Goal } from "../../../generated/graphql";
import tw from "../../../lib/tw";
import { convertGoal } from "../../../utils/enumNames";
import { ProfileStackParamsList } from "../ProfileStack";
import GoalList from "../../../components/profile/GoalList";
import ProfileHeader from "../../../components/profile/ProfileHeader";
type Props = NativeStackScreenProps<
  ProfileStackParamsList,
  "Profile_GoalScreenModal"
>;

const goals = [Goal.Lose, Goal.Maintain, Goal.Gain];

const Profile_GoalScreenModal: React.FC<Props> = ({ navigation, route }) => {
  useEffect(() => {
    setCurrentGoal(route.params.goal);
  }, [route]);

  const [currentGoal, setCurrentGoal] = useState<Goal>();

  return (
    <Wrapper>
      <View style={tw`mx-4 mt-4 flex-1`}>
        <ProfileHeader text="Your Carb Codes will be tailored to your goals to ensure you are fuelled to perform when it matters while progressing you towards your body composition targets." />
        <GoalList active={currentGoal} onPress={setCurrentGoal} />
      </View>
      <View style={tw`mx-4`}>
        <Button
          label="Done"
          size="small"
          onPress={() =>
            navigation.navigate("Profile_GoalScreen", { goal: currentGoal! })
          }
        />
      </View>
    </Wrapper>
  );
};

export default Profile_GoalScreenModal;
