import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import ActivityCard from "../../../components/profile/ActivityCard";
import Button from "../../../components/shared/Button";
import Card from "../../../components/shared/Card";
import Label from "../../../components/shared/Label";
import Wrapper from "../../../components/shared/Wrapper";
import {
  Total_Activity_Duration,
  useUpdateFavouriteActivitiesMutation,
} from "../../../generated/graphql";
import useUser from "../../../hooks/useUser";
import activities from "../../../lib/activities";
import client from "../../../lib/graphql";
import tw from "../../../lib/tw";
import { convertTotalActivityDuration } from "../../../utils/enumNames";
import { ProfileStackParamsList } from "../ProfileStack";

type Props = NativeStackScreenProps<
  ProfileStackParamsList,
  "Profile_FavouriteActivities"
>;

const Profile_FavouriteActivities: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { mutate: updateFavouriteActivities } =
    useUpdateFavouriteActivitiesMutation(client);

  const { user, updateUser } = useUser();

  const onSave = () => {
    updateFavouriteActivities({
      input: favouriteWorkouts.map((workout, index) => ({
        activityId: workout,
        primary: index === 0,
      })),
    });
    if (route.params?.activityDuration) {
      updateUser({
        input: {
          totalActivityDuration,
        },
      });
    }

    navigation.goBack();
  };

  const onCancel = () => {
    navigation.goBack();
  };

  useEffect(() => {
    if (route.params?.index || route.params?.activityId) {
      // Do not save if already exists in our list.
      if (
        route.params.activityId &&
        favouriteWorkouts.findIndex((i) => i === route!.params!.activityId) >= 0
      )
        return;

      // If there is something in that place already
      // We replace it
      if (favouriteWorkouts[route.params.index!]) {
        const workouts = [...favouriteWorkouts];
        workouts[route.params.index!] = route.params.activityId!;
        setFavouriteWorkouts(workouts);
      } else {
        // Else we add to the array
        const workouts = [...favouriteWorkouts];
        workouts.push(route.params.activityId!);
        setFavouriteWorkouts(workouts);
      }
    }
    if (route.params?.activityDuration) {
      setTotalActivityDuration(route.params.activityDuration);
    }
  }, [route]);

  useEffect(() => {
    if (user && user.favouriteActivities) {
      const sortedFavActivities = [...user.favouriteActivities]
        .sort((i) => (i?.primary ? 1 : 0))
        .map((i) => i?.activityId);

      setFavouriteWorkouts(sortedFavActivities as (keyof typeof activities)[]);
    }
    if (user && user.totalActivityDuration) {
      setTotalActivityDuration(user.totalActivityDuration);
    }
  }, [user]);

  const onActivityCardPress = (index: number) => () => {
    navigation.navigate("Profile_ActivitiesListModal", {
      index,
      screenName: "Profile_FavouriteActivities",
    });
  };

  const onActivityCardRemove = (index: number) => () => {
    const workouts = [...favouriteWorkouts];
    workouts.splice(index, 1);
    setFavouriteWorkouts(workouts);
  };

  const [favouriteWorkouts, setFavouriteWorkouts] = useState<
    (keyof typeof activities)[]
  >([]);

  const [totalActivityDuration, setTotalActivityDuration] =
    useState<Total_Activity_Duration>();
  return (
    <Wrapper>
      <View style={tw`mx-4 flex-1`}>
        <Text style={tw`text-white font-poppins-regular text-lg mb-2 mt-4`}>
          Workout Patterns
        </Text>
        <Text style={tw`text-white font-poppins-regular text-sm mb-8`}>
          What is your primary sport?
        </Text>
        <ActivityCard
          onPress={onActivityCardPress(0)}
          id={favouriteWorkouts[0]}
        />

        <Text style={tw`text-white font-poppins-regular text-sm mt-4 mb-8`}>
          Select up to 3 other regular workouts
        </Text>
        <ActivityCard
          showRemove={true}
          onRemove={onActivityCardRemove(1)}
          onPress={onActivityCardPress(1)}
          id={favouriteWorkouts[1]}
        />
        <ActivityCard
          showRemove={true}
          onRemove={onActivityCardRemove(2)}
          onPress={onActivityCardPress(2)}
          id={favouriteWorkouts[2]}
        />
        <ActivityCard
          showRemove={true}
          onRemove={onActivityCardRemove(3)}
          onPress={onActivityCardPress(3)}
          id={favouriteWorkouts[3]}
        />
        <View style={tw`mt-4 mb-8`}>
          <Label text="Weekly Activity Duration" />
          <Card
            onPress={() =>
              navigation.navigate("Profile_ActivityDurationScreen", {
                activityDuration: user?.totalActivityDuration!,
              })
            }
            text={
              totalActivityDuration
                ? convertTotalActivityDuration(totalActivityDuration)
                : convertTotalActivityDuration(user?.totalActivityDuration!)
            }
          />
        </View>
      </View>

      <View style={tw`flex-row items-center mx-4`}>
        <Button
          size="small"
          style="flex-1 mr-2"
          variant="secondary"
          label="Cancel"
          onPress={onCancel}
        />
        <Button
          size="small"
          style="flex-1 ml-2"
          variant="primary"
          disabled={favouriteWorkouts.length === 0}
          label="Save"
          onPress={onSave}
        />
      </View>
    </Wrapper>
  );
};

export default Profile_FavouriteActivities;
