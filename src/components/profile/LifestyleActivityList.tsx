import React from "react";
import { Lifestyle_Activity } from "../../generated/graphql";
import Card from "../shared/Card";
import { View } from "react-native";
import tw from "../../lib/tw";

const lifestyleActivities = [
  {
    title: "Sedentary",
    content: "Sitting most of the day (e.g. desk job)",
    activity: Lifestyle_Activity.Sedentary,
  },
  {
    title: "Lightly Active",
    content: "A mix of sitting, standing and light activity (e.g. teacher)",
    activity: Lifestyle_Activity.LightlyActive,
  },
  {
    title: "Active",
    content: "Continuous activity throughout the day (e.g. restaurant server)",
    activity: Lifestyle_Activity.Active,
  },
  {
    title: "Pro Athlete",
    content: "In full-time training (e.g. Olympian)",
    activity: Lifestyle_Activity.ProAthlete,
  },
];

type Props = {
  active?: Lifestyle_Activity;
  onPress: (t: Lifestyle_Activity) => void;
};
const TotalActivityDurationList: React.FC<Props> = ({ active, onPress }) => {
  return (
    <>
      {lifestyleActivities.map((i) => (
        <View key={i.activity} style={tw`mb-1`}>
          <Card
            text={i.title}
            rightText={i.content}
            active={active === i.activity}
            key={i.activity}
            onPress={() => onPress(i.activity)}
          />
        </View>
      ))}
    </>
  );
};

export default TotalActivityDurationList;
