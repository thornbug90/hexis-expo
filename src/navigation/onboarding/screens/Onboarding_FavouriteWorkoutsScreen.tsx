import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import ActivityCard from "../../../components/profile/ActivityCard";
import Button from "../../../components/shared/Button";
import ProgressIndicator from "../../../components/shared/ProgressIndicator";
import Wrapper from "../../../components/shared/Wrapper";
import { useUpdateFavouriteActivitiesMutation } from "../../../generated/graphql";
import useUser from "../../../hooks/useUser";
import activities from "../../../lib/activities";
import client from "../../../lib/graphql";
import tw from "../../../lib/tw";
import { OnboardingStackParamsList } from "../OnboardingStack";

type Props = NativeStackScreenProps<
  OnboardingStackParamsList,
  "Onboarding_FavouriteWorkoutsScreen"
>;

const Onboarding_FavouriteWorkoutsScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { user } = useUser();
  const { mutate: updateFavouriteActivities } =
    useUpdateFavouriteActivitiesMutation(client);

  useEffect(() => {
    if (user && user.favouriteActivities) {
      const sortedFavActivities = [...user.favouriteActivities]
        .sort((i) => (i?.primary ? 1 : 0))
        .map((i) => i?.activityId) as (keyof typeof activities)[];

      setFavouriteWorkouts(sortedFavActivities);
    }
  }, [user]);

  const onNavigate = () => {
    updateFavouriteActivities({
      input: favouriteWorkouts.map((workout, index) => ({
        activityId: workout,
        primary: index === 0,
      })),
    });
    navigation.navigate("Onboarding_GoalScreen");
  };

  useEffect(() => {
    if (route.params) {
      // Do not save if already exists in our list.
      if (
        route.params.activityId &&
        favouriteWorkouts.findIndex((i) => i === route!.params!.activityId) >= 0
      )
        return;

      // If there is something in that place already
      // We replace it
      if (favouriteWorkouts[route.params.index]) {
        const workouts = [...favouriteWorkouts];
        workouts[route.params.index] = route.params.activityId;
        setFavouriteWorkouts(workouts);
      } else {
        // Else we add to the array
        const workouts = [...favouriteWorkouts];
        workouts.push(route.params.activityId);
        setFavouriteWorkouts(workouts);
      }
    }
  }, [route]);

  const onActivityCardPress = (index: number) => () => {
    navigation.navigate("Onboarding_ActivityModalScreen", {
      index,
      screenName: "Onboarding_FavouriteWorkoutsScreen",
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

  return (
    <Wrapper>
      <View style={tw`mx-4 flex-1`}>
        <ProgressIndicator currentScreen={4} />
        <Text style={tw`text-white font-poppins-regular text-lg mb-4 mt-8`}>
          Workout Patterns
        </Text>
        <Text
          style={tw`text-white font-poppins-regular tracking-wide text-sm mt-2 mb-8`}
        >
          What is your primary sport?
        </Text>
        <ActivityCard
          moreRounded={true}
          onPress={onActivityCardPress(0)}
          id={favouriteWorkouts[0]}
        />

        {/* show other workouts only once primary workout has been selected */}

        {(user?.favouriteActivities.length !== 0 ||
          favouriteWorkouts[0] !== undefined) && (
          <>
            <Text
              style={tw`text-white font-poppins-regular tracking-wide text-sm mt-8 mb-8 max-w-60`}
            >
              Select up to 3 other regular workouts.
            </Text>
            <ActivityCard
              moreRounded={true}
              showRemove={true}
              onRemove={onActivityCardRemove(1)}
              onPress={onActivityCardPress(1)}
              id={favouriteWorkouts[1]}
            />
            <ActivityCard
              moreRounded={true}
              showRemove={true}
              onRemove={onActivityCardRemove(2)}
              onPress={onActivityCardPress(2)}
              id={favouriteWorkouts[2]}
            />
            <ActivityCard
              moreRounded={true}
              showRemove={true}
              onRemove={onActivityCardRemove(3)}
              onPress={onActivityCardPress(3)}
              id={favouriteWorkouts[3]}
            />
          </>
        )}
      </View>
      <View style={tw`mt-4 mx-4`}>
        <Button
          size="medium"
          disabled={!favouriteWorkouts[0] || favouriteWorkouts.length === 0}
          label="Next"
          onPress={onNavigate}
        />
      </View>
    </Wrapper>
  );
};

export default Onboarding_FavouriteWorkoutsScreen;
