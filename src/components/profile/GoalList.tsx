import React from "react";
import { Goal, Total_Activity_Duration } from "../../generated/graphql";
import Card from "../shared/Card";

const goalsList = [
  {
    title: "Lose",
    content: "Lose weight without compromising performance",
    goal: Goal.Lose,
  },
  {
    title: "Maintain",
    content: "Maintain weight and optimise fuelling to perform and adapt",
    goal: Goal.Maintain,
  },
  {
    title: "Gain",
    content: "Build muscle and increase your overall bodyweight",
    goal: Goal.Gain,
  },
];

type Props = {
  onboarding?: boolean;
  active?: Goal;
  onPress: (t: Goal) => void;
};
const GoalList: React.FC<Props> = ({ active, onPress, onboarding = false }) => {
  return (
    <>
      {active === undefined || !onboarding
        ? goalsList.map((i) => (
            <Card
              text={i.title}
              rightText={i.content}
              active={active === i.goal}
              key={i.goal}
              onPress={() => onPress(i.goal)}
            />
          ))
        : goalsList.map(
            (i) =>
              i.goal === active && (
                <Card
                  text={i.title}
                  rightText={i.content}
                  active={active === i.goal}
                  key={i.goal}
                  onPress={() => onPress(i.goal)}
                />
              )
          )}
    </>
  );
};

export default GoalList;
