import React, { useEffect, useState } from "react";
import { TouchableWithoutFeedback, View, Text } from "react-native";
import useUser from "../../hooks/useUser";

import activities from "../../lib/activities";
import tw from "../../lib/tw";
import { PlusIcon } from "../icons/general";

const ActivityCardSelection = (props: {
  disabled?: boolean;
  currentActivityId?: keyof typeof activities;
  onLastCardPress?: () => void;
  onActivitySelect?: (id: keyof typeof activities) => void;
}) => {
  const { user } = useUser();

  const [currentActivities, setCurrentActivities] = useState<
    ({ activityId: string; primary: boolean } | null)[]
  >([]);

  useEffect(() => {
    if (user && user.favouriteActivities) {
      const userActivities = [...user.favouriteActivities].sort((item) =>
        item?.primary ? 1 : 0
      );

      setCurrentActivities(userActivities);
    }
  }, [user]);

  const isAFavouriteActivity =
    currentActivities.findIndex((item) => {
      return item!.activityId === props.currentActivityId;
    }) !== -1;

  return (
    <View style={tw`flex-row justify-between items-center`}>
      {Array.from(Array(4)).map((_item, index) => {
        if (currentActivities[index] && currentActivities !== null) {
          return (
            <ActivityCard
              disabled={props.disabled}
              key={index}
              onPress={() => {
                if (props.onActivitySelect) {
                  props.onActivitySelect(
                    currentActivities[index]!
                      .activityId as keyof typeof activities
                  );
                }
              }}
              active={
                props.currentActivityId === currentActivities[index]!.activityId
              }
              id={
                currentActivities[index]!.activityId as keyof typeof activities
              }
            />
          );
        } else {
          return <ActivityCard key={index} />;
        }
      })}

      <ActivityCard
        disabled={props.disabled}
        showPlus={isAFavouriteActivity || props.currentActivityId === undefined}
        id={!isAFavouriteActivity ? props.currentActivityId : undefined}
        active={props.currentActivityId && !isAFavouriteActivity}
        onPress={props.onLastCardPress}
      />
    </View>
  );
};

const ActivityCard = (props: {
  disabled?: boolean;
  onPress?: () => void;
  id?: keyof typeof activities;
  active?: boolean;
  showPlus?: boolean;
}) => (
  <TouchableWithoutFeedback disabled={props.disabled} onPress={props.onPress}>
    <View
      style={tw.style([
        `w-14 h-14 bg-background-500 p-2 border border-background-100 rounded-lg items-center justify-center`,
        props.active ? "border-activeblue-100" : "",
      ])}
    >
      {props.id ? (
        activities[props.id].icon({
          color: tw.color(props.active ? "activeblue-100" : "background-100"),
        })
      ) : props.showPlus ? (
        <View style={tw`w-6 h-6`}>
          <PlusIcon color={tw.color("background-100")} />
        </View>
      ) : null}
    </View>
  </TouchableWithoutFeedback>
);

export default ActivityCardSelection;
