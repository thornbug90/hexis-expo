import React, { useEffect, useState } from "react";
import {
  Image,
  Text,
  View,
  ScrollView,
  TouchableNativeFeedback,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PrimaryStackParamsList } from "../PrimaryStack";
import tw, { carbCodeGradients } from "../../../lib/tw";
import Wrapper from "../../../components/shared/Wrapper";
import allActivities from "../../../lib/activities";
import useUser from "../../../hooks/useUser";

type Props = NativeStackScreenProps<
  PrimaryStackParamsList,
  "PrimaryStack_ChooseActivityScreen"
>;
type IActivity = {
  id: string;
  slug: any;
  name: any;
  icon: any;
};

const PrimaryStack_ChooseActivityScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const [activities, setActivities] = useState<IActivity[]>([]);
  const user = useUser();
  const [favouriteActivities, setFavouriteActivites] = useState<IActivity[]>(
    []
  );
  const ActivityItem = ({
    item,
    normal,
  }: {
    item: IActivity;
    normal: boolean;
  }) => {
    const { name = null, icon: Icon } = item;
    const onPress = () => {
      navigation.navigate("PrimaryStack_AddEditWorkoutModal", {
        modalTitle: route.params?.workoutId ? "Edit Workout" : "Add Workout",
        activityId: item.id,
      });
    };
    return (
      <TouchableNativeFeedback onPress={onPress} key={item.id}>
        <View
          key={item.id}
          style={tw`flex flex-row py-3 px-4 items-center gap-${
            normal ? 4 : 2
          } self-stretch rounded-lg bg-background-370 h-14`}
        >
          <View style={tw`w-6 h-6`}>
            {Icon && <Icon color={tw.color("white")} />}
          </View>

          <Text
            style={tw`font-poppins-light text-sm text-white tracking-[0.25px]`}
          >
            {name}
          </Text>
        </View>
      </TouchableNativeFeedback>
    );
  };
  useEffect(() => {
    if (user?.user?.id) {
      const otherAcitivity = "clhry7xug0000x9b1f04e0kwm";
      const favourites = user.user.favouriteActivities
        .map((item: any) => ({
          id: item.activityId,
          slug: allActivities[item.activityId as keyof typeof allActivities]
            ?.slug,
          name: allActivities[item.activityId as keyof typeof allActivities]
            ?.name,
          icon: allActivities[item.activityId as keyof typeof allActivities]
            ?.icon,
        }))
        .filter(
          (activity) =>
            activity.id && activity.slug && activity.name && activity.icon
        );
      setActivities([
        ...Object.values(allActivities)
          .sort((a, b) => {
            return a.name < b.name ? -1 : 1;
          })
          .filter((activity) => activity.id !== otherAcitivity),
        {
          id: otherAcitivity,
          slug: allActivities[otherAcitivity]?.slug,
          name: allActivities[otherAcitivity]?.name,
          icon: allActivities[otherAcitivity]?.icon,
        },
      ]);
      setFavouriteActivites(favourites);
    }
  }, [user?.user?.id]);
  return (
    <Wrapper>
      <View style={tw`flex pt-3 pr-5 pb-6 pl-5 flex-col gap-6`}>
        <View style={tw`flex flex-col gap-3 self-stretch`}>
          <Text
            style={tw`font-poppins-medium text-xs tracking-wide capitalize text-white`}
          >
            Favourites
          </Text>
          {favouriteActivities?.map((favourite, index) => (
            <ActivityItem key={index} item={favourite} normal={false} />
          ))}
        </View>
        <View style={tw`flex flex-col gap-3 self-stretch`}>
          <Text
            style={tw`font-poppins-medium text-xs tracking-wide capitalize text-white`}
          >
            All Activities
          </Text>
          {activities?.map((activity) => (
            <ActivityItem item={activity} normal={true} />
          ))}
        </View>
      </View>
    </Wrapper>
  );
};

export default PrimaryStack_ChooseActivityScreen;
