import React, { useEffect, useState } from "react";
import { FlatList, Text, TouchableWithoutFeedback, View } from "react-native";

import allActivities from "../../lib/activities";
import tw from "../../lib/tw";

const allActivityIds = Object.keys(allActivities).sort((a, b) =>
  allActivities[a as keyof typeof allActivities].name <
  allActivities[b as keyof typeof allActivities].name
    ? -1
    : allActivities[a as keyof typeof allActivities].name >
      allActivities[b as keyof typeof allActivities].name
    ? 1
    : 0
);

type Props = {
  onPress?: (id: keyof typeof allActivities) => void;
  showOtherActivity?: boolean;
};

const ActivityList: React.FC<Props> = ({ onPress, showOtherActivity }) => {
  const [activities, setActivities] = useState(allActivities);
  const [activityIds, setActivitiesIds] = useState(allActivityIds);

  useEffect(() => {
    const otherActivityId = "clhry7xug0000x9b1f04e0kwm";
    const filteredActivityIds = allActivityIds.filter(
      (item) => item !== otherActivityId
    );
    setActivities(allActivities);
    setActivitiesIds(filteredActivityIds);
  }, []);

  return (
    <FlatList
      data={activityIds as (keyof typeof activities)[]}
      keyExtractor={(i) => i}
      renderItem={({ item }: { item: keyof typeof activities }) => {
        const { name = null, icon: Icon } = activities[item];

        return (
          <TouchableWithoutFeedback
            onPress={() => {
              if (onPress) {
                onPress(item);
              }
            }}
          >
            <View>
              <View
                style={tw`flex-row border-b border-background-300 py-4 px-4`}
              >
                <View style={tw`w-6 h-6 mr-4`}>
                  {Icon && (
                    <Icon
                      color={tw.color("activeblue-100")}
                      width={24}
                      height={24}
                    />
                  )}
                </View>

                <Text style={tw`font-poppins-medium text-sm text-white`}>
                  {name}
                </Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        );
      }}
    />
  );
};

export default ActivityList;
