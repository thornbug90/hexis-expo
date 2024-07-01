import React from "react";
import { View, Text, TouchableWithoutFeedback } from "react-native";

import activities from "../../lib/activities";
import tw from "../../lib/tw";

const ActivityCard = ({
  id,
  name,
  onSelectActivity = () => {},
}: {
  id: keyof typeof activities;
  name: string;
  onSelectActivity?: () => void;
}) => (
  <TouchableWithoutFeedback onPress={onSelectActivity}>
    <View
      style={tw`bg-background-500 border-background-100 rounded-lg flex-row items-center h-14 w-full`}
    >
      <View style={tw`h-12 w-12 p-2 items-center justify-between`}>
        {activities[id].icon({
          color: tw.color("activeblue-100"),
        })}
      </View>

      <Text style={tw`text-white text-base font-poppins-regular ml-1`}>
        {name}
      </Text>
    </View>
  </TouchableWithoutFeedback>
);

export default ActivityCard;
