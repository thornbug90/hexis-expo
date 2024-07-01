import React from "react";
import { Text, View } from "react-native";
import tw from "../../lib/tw";
import { CardFlipIcon } from "../icons/general";
import FlipCard from "../shared/FlipCard";

type Props = {
  value: number;
  loggedValue: number;
  title: string;
  long: string;
  short: string;
};

const MacroCard: React.FC<Props> = ({
  value,
  loggedValue,
  title,
  long,
  short,
}) => {
  const progressWidth = `w-${
    loggedValue > value ? value : loggedValue
  }/${value}`;

  var progressColor = "carbs";
  if (title == "Protein") progressColor = "protein";
  if (title == "Fats") progressColor = "fat";

  return (
    <FlipCard
      frontCard={
        <View style={tw`flex-row p-1 items-center `}>
          <View style={{ ...tw`ml-2 grow mr-4` }}>
            <View style={tw`flex flex-row justify-between mb-1`}>
              <Text
                style={tw`text-white font-poppins-medium text-base tracking-wide mb-1`}
              >
                {title}
              </Text>
              <Text style={tw`text-white font-poppins-medium`}>
                {loggedValue.toFixed()}
                <Text style={tw`text-lg`}>/{value.toFixed()}g</Text>
              </Text>
            </View>

            <View style={tw`bg-gray-400 w-full h-2 rounded mb-3`}>
              <View
                style={tw`bg-pichart-${progressColor} h-full absolute ${progressWidth} rounded`}
              ></View>
            </View>
          </View>
          <View style={tw`h-4 w-4 self-start`}>
            <CardFlipIcon color={tw.color("white")} />
          </View>
        </View>
      }
      backCard={
        <View>
          <View style={tw`flex flex-row justify-between`}>
            <Text
              style={tw`text-white font-poppins-medium text-base tracking-wide`}
            >
              {title}
            </Text>
            <View style={tw`h-4 w-4`}>
              <CardFlipIcon color={tw.color("white")} />
            </View>
          </View>
          <Text style={tw`text-white font-poppins-light text-xxs`}>{long}</Text>
        </View>
      }
    />
  );
};

export default MacroCard;
