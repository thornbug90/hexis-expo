import React from "react";
import FlipCard from "../shared/FlipCard";
import { View, Text } from "react-native";
import tw from "../../lib/tw";
import KcalInfo from "./KcalInfo";
import { CardFlipIcon } from "../icons/general";

type Props = {
  predicted?: number;
  target?: number;
};

const EndOfDay: React.FC<Props> = ({ predicted, target }) => {
  if (!predicted && !target) return null;
  return (
    <FlipCard
      frontCard={
        <View style={tw`px-2 py-2 bg-background-400 shadow rounded-lg mb-4`}>
          <View style={tw`flex flex-row justify-between`}>
            <Text style={tw`font-poppins-medium text-lg mb-2 text-white`}>
              End of Day Kcal Target
            </Text>
            <View style={tw`h-4 w-4`}>
              <CardFlipIcon color={tw.color("white")} />
            </View>
          </View>

          <View style={tw`flex flex-row justify-between`}>
            <KcalInfo kcal={Math.round(target!)} text="End of day target" />
            <KcalInfo
              kcal={Math.round(predicted!)}
              text="Predicted end of day"
              blue={true}
            />
          </View>
        </View>
      }
      backCard={
        <View>
          <View style={tw`flex flex-row justify-between`}>
            <Text style={tw`font-poppins-medium mb-3 text-base text-white`}>
              Kcal Targets
            </Text>
            <View style={tw`h-4 w-4`}>
              <CardFlipIcon color={tw.color("white")} />
            </View>
          </View>
          <Text style={tw`text-white text-xs`}>
            For weight loss it is best to end the day in a deficit (-) where as
            for weight gain it is best to finish in a surplus (+). To maintain
            weight it is best to finish the day in balance (0). This may vary in
            the lead up too, as well as during competition as you may require
            more energy to perform optimally.
          </Text>
        </View>
      }
    />
  );
};

export default EndOfDay;
