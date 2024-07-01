import React from "react";
import { Text, View } from "react-native";
import { Meal } from "../../generated/graphql";
import tw from "../../lib/tw";
import { CardFlipIcon } from "../icons/general";
import FlipCard from "../shared/FlipCard";

const DayCarbCodes: React.FC<{ meals?: (Meal | null)[] | null }> = ({
  meals,
}) => {
  if (!meals) return null;
  return (
    <FlipCard
      frontCard={
        <View style={tw`h-30 px-2 bg-background-400 shadow rounded-lg`}>
          <View style={tw`mt-2 flex flex-row justify-between`}>
            <Text style={tw`font-poppins-medium text-lg mb-4 text-white`}>
              Carb Code Tracking
            </Text>
            <View style={tw`h-4 w-4`}>
              <CardFlipIcon color={tw.color("white")} />
            </View>
          </View>
          <View style={tw`flex-row justify-between items-center mr-6`}>
            <Text style={tw`font-poppins-medium text-white mr-1`}>
              Planned Meals
            </Text>
            {meals.map((meal, index) => (
              <View
                key={index}
                style={tw`w-5 h-5 rounded-full bg-carbcode${meal!.carbCode.toLowerCase()}-100`}
              />
            ))}
          </View>
          <Text style={tw`text-white text-xs my-1`}>vs.</Text>
          <View style={tw`flex-row items-center justify-between mr-6`}>
            <Text style={tw`font-poppins-medium text-white mr-2`}>
              Logged Meals
            </Text>
            {meals.map((meal, index) => (
              <View
                key={index}
                style={tw.style([
                  `w-5 h-5 rounded-full`,
                  meal?.mealVerification && meal.mealVerification.carbCode
                    ? `bg-carbcode${meal.mealVerification.carbCode.toLowerCase()}-100`
                    : "bg-background-100",
                ])}
              />
            ))}
          </View>
        </View>
      }
      backCard={
        <View style={tw`h-24`}>
          <View style={tw`flex flex-row justify-between`}>
            <Text style={tw`font-poppins-medium text-lg text-white mb-3`}>
              Carb Code Tracking
            </Text>
            <View style={tw`h-4 w-4`}>
              <CardFlipIcon color={tw.color("white")} />
            </View>
          </View>
          <View style={tw`flex-row items-center my-2`}>
            {["low", "medium", "high"].map((code) => (
              <View
                key={code}
                style={tw`w-5 h-5 rounded-full bg-carbcode${code}-100 mr-2`}
              />
            ))}
            <Text style={tw`font-poppins-medium text-xs text-white ml-4`}>
              Carb code of logged meal
            </Text>
          </View>
          <View style={tw`flex-row items-center my-2`}>
            <View style={tw`w-5 h-5 rounded-full bg-background-100 mx-7`} />
            <Text style={tw`font-poppins-medium text-xs text-white ml-6`}>
              Meal skipped/not logged
            </Text>
          </View>
        </View>
      }
    />
  );
};

export default DayCarbCodes;
