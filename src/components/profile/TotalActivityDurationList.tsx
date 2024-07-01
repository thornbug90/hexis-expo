import React from "react";
import { Total_Activity_Duration } from "../../generated/graphql";
import Card from "../shared/Card";
import { View } from "react-native";
import tw from "../../lib/tw";

const totalActivityDurations = [
  {
    title: "0 - 3 hours",

    duration: Total_Activity_Duration.ZeroToThreeHours,
  },
  {
    title: "3 - 6 hours",

    duration: Total_Activity_Duration.ThreeToSixHours,
  },
  {
    title: "6 - 9 hours",

    duration: Total_Activity_Duration.SixToNineHours,
  },
  {
    title: "9 - 12 hours",
    duration: Total_Activity_Duration.NineToTwelveHours,
  },
  {
    title: "12+ hours",
    duration: Total_Activity_Duration.TwelvePlusHours,
  },
];

type Props = {
  active?: Total_Activity_Duration;
  onPress: (t: Total_Activity_Duration) => void;
};
const TotalActivityDurationList: React.FC<Props> = ({ active, onPress }) => {
  return (
    <>
      {totalActivityDurations.map((i) => (
        <View key={i.duration} style={tw`mb-1`}>
          <Card
            moreRounded={true}
            text={i.title}
            active={active === i.duration}
            key={i.duration}
            onPress={() => onPress(i.duration)}
          />
        </View>
      ))}
    </>
  );
};

export default TotalActivityDurationList;
