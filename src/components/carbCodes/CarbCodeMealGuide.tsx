import React from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
} from "react-native";
import tw from "../../lib/tw";
import { Carb_Code, Meal_Name, Meal_Type } from "../../generated/graphql";
import { getMealImage } from "../../../assets/mealguides";
const instaRecipe = require("../../../assets/mealguides/insta-recipe.jpg");
import {
  convertCarbCode,
  convertMealName,
  convertMealType,
} from "../../utils/enumNames";
import * as Linking from "expo-linking";

const ListItem: React.FC<{ message: string }> = ({ message }) => {
  return (
    <View style={tw`flex-row`}>
      <Text style={tw`text-white`}>{"\u2022"}</Text>
      <Text style={tw`font-poppins-regular text-sm text-white flex-1 pl-2`}>
        {message}
      </Text>
    </View>
  );
};
type Props = {
  images?: string[];
  messages: string[];
  carbCode: Carb_Code;
  mealType?: Meal_Type;
  slot?: Meal_Name;
  carbRange?: string;
  color?: string;
  ranges?: number[];
  instaLink?: boolean;
};
const CarbCodeGuide: React.FC<Props> = ({
  color,
  instaLink = true,
  messages,
  carbCode,
  mealType,
  carbRange,
  ranges,
}) => {
  return (
    <View>
      <Text style={tw`text-white text-lg font-poppins-light`}>
        <Text style={tw` font-poppins-semibold text-${color ?? "white"}`}>
          {convertCarbCode(carbCode)}
        </Text>{" "}
        Carb {mealType && convertMealType(mealType)} Guide
      </Text>

      <View
        style={tw`flex-row items-center border-b mr-44 pb-1 border-${
          color ?? "white"
        }`}
      >
        <Text style={tw`text-white text-sm`}>
          {carbRange ??
            (ranges
              ? `${Math.round(ranges[0])} - ${
                  carbCode === Carb_Code.High ? "∞" : Math.round(ranges[1])
                }`
              : "")}
          g carbs
        </Text>
      </View>

      <View style={tw`py-5`}>
        {messages.map((message, index) => {
          return <ListItem key={index} message={message} />;
        })}
      </View>

      <ScrollView indicatorStyle="white" horizontal pagingEnabled>
        <>
          {mealType === Meal_Type.Main && (
            <>
              <Image
                style={tw`w-60 h-60 rounded-lg ml-8 mr-4`}
                source={getMealImage(`${carbCode.toLowerCase()}plate`)}
              />
              <Image
                style={tw`w-60 h-60 rounded-lg ml-4 mr-4`}
                source={getMealImage(`${carbCode.toLowerCase()}guide`)}
              />
            </>
          )}
          {instaLink && (
            <TouchableOpacity
              onPress={() => {
                Linking.openURL("https://www.instagram.com/hexis.recipes/");
              }}
            >
              <Image
                style={tw`w-60 h-60 rounded-lg ml-4 mr-4`}
                source={instaRecipe}
              />
            </TouchableOpacity>
          )}
        </>
      </ScrollView>
    </View>
  );
};

export default CarbCodeGuide;
