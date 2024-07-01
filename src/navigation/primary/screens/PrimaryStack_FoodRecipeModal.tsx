import React from "react";
import { Image, Text, View, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PrimaryStackParamsList } from "../PrimaryStack";
import tw, { carbCodeGradients } from "../../../lib/tw";
import Wrapper from "../../../components/shared/Wrapper";
import FoodRecipe from "../../../../assets/mealguides/food-recipe.png";
import CoachMatt from "../../../../assets/coach_matt.png";
import BigBowlFood from "../../../components/icons/general/BigBowlFood";
import { LinearGradient } from "expo-linear-gradient";
type Props = NativeStackScreenProps<
  PrimaryStackParamsList,
  "PrimaryStack_FoodRecipeModal"
>;
const PrimaryStack_FoodRecipeModal: React.FC<Props> = ({ navigation }) => {
  return (
    <>
      <View style={tw`px-6 mt-14`}>
        <Text
          style={tw`text-gray-100 mx-auto font-poppins-semibold text-20 leading-[26px] tracking-wide`}
        >
          Recipes
        </Text>
      </View>
      <ScrollView contentContainerStyle={tw``}>
        <View
          style={tw`mx-5 px-5 mb-15 pb-3 bg-background-370 rounded-3xl mt-25`}
        >
          <View
            style={tw`border-8 rounded-full border-background-500 mt-[-68px] mx-auto w-34 h-34 overflow-hidden grow-0`}
          >
            <View
              style={tw`w-30 h-30 flex items-center bg-background-green justify-center content-center`}
            >
              <BigBowlFood color={tw.color("white")} width={60} height={60} />
            </View>
          </View>
          <View
            style={tw`pt-4 pb-3 px-4 flex justify-center items-center gap-x-6 rounded-3xl`}
          >
            <Text
              style={tw`text-xl text-white font-poppins-semibold  tracking-wide`}
            >
              Coming Soon
            </Text>
            <Text
              style={tw`text-sm text-white font-poppins-light my-6 text-center tracking-wide`}
            >
              We are busy in the kitchen preparing recipes for you! Watch this
              space.
            </Text>
          </View>
          <View style={tw`flex flex-row`}>
            <View style={tw`w-1/2`}>
              <Image
                source={FoodRecipe}
                style={tw`w-full max-h-45 rounded-3x1`}
              />
              <View
                style={tw`absolute top-1 left-1 flex px-2 py-0.5 justify-center items-center gap-2.5 bg-background-300 rounded-[200px] z-1`}
              >
                <Text
                  style={tw`text-xxs text-almostWhite font-poppins-light capitalize`}
                >
                  5 Mins
                </Text>
              </View>
              <LinearGradient
                colors={carbCodeGradients["HIGH"]}
                style={tw`absolute bottom-1 right-1 flex px-2 py-0.5 justify-center items-center rounded-[200px] z-1 bg-carbcodehigh-100`}
              >
                <Text
                  style={tw`text-xxs text-almostWhite font-poppins-light capitalize`}
                >
                  High
                </Text>
              </LinearGradient>
            </View>
            <View
              style={tw`flex px-3 py-3 flex-col items-start gap-2 flex-none w-1/2`}
            >
              <View
                style={tw`flex px-2 py-0.5 justify-center items-center gap-2.5 bg-almostWhite/20 rounded-[200px] z-1`}
              >
                <Text
                  style={tw`text-xxs text-almostWhite font-poppins-light capitalize tracking-wide`}
                >
                  Breakfast
                </Text>
              </View>
              <Text
                style={tw`text-almostWhite font-poppins-light text-sm tracking-wide overflow-hidden`}
                ellipsizeMode="tail"
                numberOfLines={2}
              >
                Pre Workout Power Porridge
              </Text>
              <Text
                style={tw`text-almostWhite font-poppins-extralight text-xxs tracking-wide`}
                numberOfLines={3}
                ellipsizeMode="tail"
              >
                Ideal fuel to delay fatigue during intense workouts
              </Text>

              <View style={tw`flex flex-row items-center gap-1`}>
                <Image
                  source={CoachMatt}
                  style={tw`rounded-full w-6 h-6 rounded-[200px]`}
                />
                <Text
                  style={tw`text-almostWhite text-xxs capitalize flex font-poppins-medium tracking-wide`}
                >
                  Coach Matt
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default PrimaryStack_FoodRecipeModal;
