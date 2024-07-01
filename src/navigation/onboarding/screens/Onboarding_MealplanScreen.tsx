import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, Dimensions } from "react-native";
import { View, Text, Pressable, ScrollView, Dimensions } from "react-native";
import Button from "../../../components/shared/Button";
import ProgressIndicator from "../../../components/shared/ProgressIndicator";
import Wrapper from "../../../components/shared/Wrapper";

import useUser from "../../../hooks/useUser";
import tw from "../../../lib/tw";
import { OnboardingStackParamsList } from "../OnboardingStack";
import generateRandomString, {
  sortArrayByTime,
} from "../../../utils/generateRandomString";
import MealCard from "../../../components/shared/MealCard";
import CookieIcon from "../../../components/icons/general/CookieIcon";
import DarkBowlFood from "../../../components/icons/general/DarkBowlFood";
import {
  Day_Names,
  MealTemplate,
  Meal_Sub_Type,
  Meal_Type,
  useUpdateMealplanMutation,
} from "../../../generated/graphql";
import client from "../../../lib/graphql";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type Props = NativeStackScreenProps<
  OnboardingStackParamsList,
  "Onboarding_MealplanScreen"
>;
const defaultPatternMeals: MealTemplate[] = [
  {
    id: generateRandomString(10),
    mealName: "Breakfast",
    time: "08:30",
    mealType: Meal_Type.Main,
    mealSubType: Meal_Sub_Type.Breakfast,
    mealplanId: "",
    dayName: Object.values(Day_Names)[0],
  },
  {
    id: generateRandomString(10),
    mealName: "Lunch",
    time: "12:30",
    mealType: Meal_Type.Main,
    mealSubType: Meal_Sub_Type.Lunch,
    mealplanId: "",
    dayName: Object.values(Day_Names)[0],
  },
  {
    id: generateRandomString(10),
    mealName: "Dinner",
    time: "18:30",
    mealType: Meal_Type.Main,
    mealSubType: Meal_Sub_Type.Dinner,
    mealplanId: "",
    dayName: Object.values(Day_Names)[0],
  },
  {
    id: generateRandomString(10),
    mealName: "PM Snack",
    time: "15:30",
    mealType: Meal_Type.Snack,
    mealSubType: Meal_Sub_Type.PmSnack,
    mealplanId: "",
    dayName: Object.values(Day_Names)[0],
  },
];

const Onboarding_MealplanScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useUser();
  const screenHeight = Dimensions.get("window").height;
  const { mutate: updateMealPlan } = useUpdateMealplanMutation(client, {
    onSuccess: () => {
      navigation.navigate("Onboarding_CompleteScreen");
    },
  });
  const [meals, setMeals] = useState<MealTemplate[]>(
    sortArrayByTime(defaultPatternMeals)
  );
  const addEmptyMeal = useCallback(
    (mealType: Meal_Type) => {
      setMeals((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          dayName: Object.values(Day_Names)[0],
          mealType,
          mealName: "",
          time: "00:00",
          mealplanId: "",
          mealSubType: Meal_Sub_Type.Unspecified,
        },
      ]);
    },
    [setMeals]
  );
  const onNavigate = () => {
    const mealPlanItems = Object.values(Day_Names).flatMap((dayName) =>
      meals.map(({ id, mealplanId, ...rest }) => ({
        ...rest,
        dayName,
        time: `${rest.time}:00.000Z`,
      }))
    );
    updateMealPlan({
      input: {
        meals: mealPlanItems,
      },
      clientId: user?.id || "",
    });
  };
  const isDisabled =
    meals.some((meal) => meal.mealName === "" || meal.time === "00:00") ||
    meals.filter((meal) => meal.mealType === Meal_Type.Main).length < 3 ||
    meals.filter((meal) => meal.mealType === Meal_Type.Snack).length < 1;
  return (
    <KeyboardAwareScrollView
      contentContainerStyle={tw`flex-grow`}
      resetScrollToCoords={{ x: 0, y: 0 }}
      scrollEnabled={true}
    >
      <View style={tw`px-5 flex-1`}>
        <ProgressIndicator currentScreen={6} />
        <Text style={tw`text-white font-poppins-semibold text-lg mb-4 mt-8`}>
          Meal Pattern & Timings
        </Text>
        <Text
          style={tw`text-white font-poppins-regular text-sm mb-4 tracking-[0.25px]`}
        >
          Add, name and assign times to your preferred meals and snacks. You can
          customise this later in your Profile.
        </Text>
        <View style={{ height: screenHeight - 350 }}>
          <ScrollView>
            <View style={tw`pb-9`}>
              <View style={tw`gap-y-3`}>
                {meals.map((meal, index) => (
                  <MealCard
                    key={index}
                    index={index}
                    meal={meal}
                    setMeals={setMeals}
                  />
                ))}
              </View>
            </View>
            <View style={tw`flex-row gap-3`}>
              <Pressable
                style={tw`flex-row p-2 justify-center items-center gap-2.5 flex-1 border-[1px] rounded-lg bg-pichart-carbs`}
                onPress={() => addEmptyMeal(Meal_Type.Main)}
              >
                <View style={tw`flex-row gap-3 items-center`}>
                  <DarkBowlFood color={tw.color("white")} style={tw`w-6 h-6`} />
                  <Text
                    style={tw`text-white text-base font-poppins-regular py-0.5 mt-0.5`}
                  >
                    Add Main
                  </Text>
                </View>
              </Pressable>
              <Pressable
                style={tw`flex-row p-2 justify-center items-center gap-2.5 flex-1 border-[1px] rounded-lg border-pichart-carbs`}
                onPress={() => addEmptyMeal(Meal_Type.Snack)}
              >
                <View style={tw`flex-row gap-3 items-center`}>
                  <CookieIcon color={tw.color("white")} style={tw`w-6 h-6`} />
                  <Text
                    style={tw`text-white text-base font-poppins-regular py-0.5 mt-0.5`}
                  >
                    Add Snack
                  </Text>
                </View>
              </Pressable>
            </View>
          </ScrollView>
        </View>
        <View
          style={tw`absolute bottom-0 left-0 right-0 flex justify-center px-5`}
        >
          <Button
            size="medium"
            label="Next"
            onPress={onNavigate}
            disabled={isDisabled}
          />
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default Onboarding_MealplanScreen;
