import { isBefore, set } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableWithoutFeedback,
  Dimensions,
  ScrollView,
  Pressable,
} from "react-native";
import { isEmpty } from "rambda";
import currency from "currency.js";
import {
  CarbRange,
  Carb_Code,
  Meal,
  MealVerification,
} from "../../generated/graphql";
import tw, { carbCodeGradients } from "../../lib/tw";
import { PlusIcon } from "../icons/general";
import decimalParser from "../../utils/decimalParser";
import PencilIcon from "../icons/general/PencilIcon";
import SvgTrash from "../icons/general/Trash";
import { formatTimeHourMinute } from "../../utils/date";
import useFoodLog from "../../hooks/useFoodLog";

type Props = {
  meal: (Meal & { mealVerification?: MealVerification | null }) | null;
  onPressVerify?: () => void;
  onPressMeal?: () => void;
  onPressAdHocMeal?: () => void;
  onPressDeleteAdHocMeal?: () => void;
  active?: boolean;
  carbRange?: CarbRange;
};
const isBetweenInclusive = (
  min: number | undefined,
  max: number | undefined,
  carb: number
) => min! <= carb && carb <= max!;

const CarbCodeCard: React.FC<Props> = ({
  active,
  onPressMeal,
  onPressVerify,
  onPressAdHocMeal,
  onPressDeleteAdHocMeal,
  meal,
  carbRange,
}) => {
  const { data: foodLog } = useFoodLog(meal?.mealVerification);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollInit = () => scrollViewRef.current?.scrollTo({ x: 0 });
  const [scrollX, setScrollX] = useState(0);
  const [trackedCarb, setTrackedCarb] = useState<number>(0);
  const screenWidth = Dimensions.get("window").width - 32;
  const handleScroll = (event: any) => {
    const currentScrollX = event.nativeEvent.contentOffset.x;
    if (currentScrollX < scrollX) {
      scrollInit();
    }
    setScrollX(event.nativeEvent.contentOffset.x);
  };
  const MealText = ({
    children,
    index,
  }: {
    children: React.ReactNode;
    index?: number;
  }) => (
    <Text
      style={tw`text-white text-xxs font-poppins-${
        index === 0 ? "semibold" : "light"
      } tracking-[0.25px]`}
    >
      {children}
    </Text>
  );

  const mealDetails = [
    { value: meal?.energy ?? 0, unit: " kcal" },
    { value: meal?.carb ?? 0, unit: "g C" },
    { value: meal?.protein ?? 0, unit: "g P" },
    { value: meal?.fat ?? 0, unit: "g F" },
  ];
  const OptionalButtonGroup: () => React.JSX.Element = () => (
    <View style={tw`flex-row items-stretch`}>
      <Pressable
        onPress={() => {
          onPressAdHocMeal?.();
          scrollInit();
        }}
      >
        <View
          style={tw`flex-row items-center justify-center px-3 bg-pichart-carbs rounded-lg shadow w-10 h-14 ml-2.5`}
        >
          <View style={tw`w-6 h-6`}>
            <PencilIcon color={tw.color("white")} />
          </View>
        </View>
      </Pressable>
      <Pressable
        onPress={() => {
          onPressDeleteAdHocMeal?.();
          scrollInit();
        }}
      >
        <View
          style={tw`flex-row items-center justify-center py-[5px] px-3 bg-red rounded-lg shadow w-10 h-14 ml-2.5`}
        >
          <View style={tw`w-6 h-6`}>
            <SvgTrash color={tw.color("white")} />
          </View>
        </View>
      </Pressable>
    </View>
  );

  useEffect(() => {
    if (foodLog) {
      let carb = 0;
      const foodObjects = foodLog?.foodObjects;
      const portions = foodLog?.portions;
      const quantities = foodLog?.quantities;

      foodObjects?.forEach((foodObject, index) => {
        const foodMacros = foodObject?.nutrients.find(
          (i) => i?.slug === "Macronutrients"
        );
        const foodCarbsPer100g = foodMacros?.nutrients?.find(
          (value) => value?.slug === "carbohydrate"
        );
        const foodCarbs = currency(foodCarbsPer100g?.value || "")
          .multiply(currency(portions[index]?.value || ""))
          .multiply(currency(quantities[index] || ""))
          .divide(100);
        carb += foodCarbs.value;
      });
      setTrackedCarb(carb);
    }
  }, [foodLog]);

  const trackedCarbCode = meal?.mealVerification
    ? isBetweenInclusive(carbRange?.highMin, carbRange?.highMax, trackedCarb)
      ? Carb_Code.High
      : isBetweenInclusive(
          carbRange?.medMin || 0,
          carbRange?.medMax,
          trackedCarb
        )
      ? Carb_Code.Medium
      : Carb_Code.Low
    : Carb_Code.Unspecified;
  if (!meal) return null;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      ref={scrollViewRef}
      onScroll={handleScroll}
    >
      <View style={tw`flex-row`}>
        <View
          style={tw`flex-row items-stretch mb-3 w-${screenWidth / 4} h-14 `}
        >
          {!isEmpty(
            carbCodeGradients?.[
              meal?.carbCode as keyof typeof carbCodeGradients
            ]
          ) && (
            <TouchableWithoutFeedback onPress={onPressMeal}>
              <LinearGradient
                start={{ x: 0, y: -1 }}
                end={{ x: 1, y: 1 }}
                colors={
                  carbCodeGradients[
                    meal.carbCode as keyof typeof carbCodeGradients
                  ]
                }
                style={tw`pt-2 px-4 pb-2 rounded-lg shadow flex-1 mr-2`}
              >
                <View
                  style={tw.style([
                    active
                      ? "bg-activeblue-500 border-activeblue-100 h-10 justify-between"
                      : "h-10 justify-between",
                  ])}
                >
                  <View style={tw`flex-row justify-between items-center`}>
                    <Text
                      style={tw`text-sm text-white font-poppins-medium tracking-[0.7px] pb-1`}
                    >
                      {meal.mealName}
                    </Text>
                    <Text
                      style={tw`text-xxs text-white font-poppins-medium tracking-[0.5px]`}
                    >
                      {formatTimeHourMinute(meal.time)}
                    </Text>
                  </View>

                  <View
                    style={tw`flex-row items-center gap-2 
                  `}
                  >
                    {mealDetails.map((detail, index) => (
                      <React.Fragment key={index}>
                        <MealText index={index}>
                          {detail.value}
                          {detail.unit}
                        </MealText>
                        {index < mealDetails.length - 1 && (
                          <MealText>{"\u2022"}</MealText>
                        )}
                      </React.Fragment>
                    ))}
                  </View>
                </View>
              </LinearGradient>
            </TouchableWithoutFeedback>
          )}
          <TouchableWithoutFeedback
            onPress={() => {
              onPressVerify?.();
            }}
          >
            {!meal.mealVerification || meal.mealVerification.skipped ? (
              <View
                style={{
                  ...tw`bg-background-300 border border-background-600 rounded-lg shadow w-10 items-center justify-center`,
                }}
              >
                {meal.mealVerification?.skipped ? (
                  <>
                    <Text style={tw`text-xs text-white font-poppins-medium`}>
                      0
                    </Text>
                    <Text style={tw`text-xxs text-white font-poppins-regular`}>
                      kcal
                    </Text>
                  </>
                ) : (
                  <View style={tw`w-5 h-5`}>
                    <PlusIcon color={tw.color("white")} />
                  </View>
                )}
              </View>
            ) : carbCodeGradients?.[
                meal?.mealVerification
                  ?.carbCode! as keyof typeof carbCodeGradients
              ] ? (
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                colors={
                  carbCodeGradients[
                    trackedCarbCode as keyof typeof carbCodeGradients
                  ]
                }
                style={tw`rounded-lg shadow w-10`}
              >
                <View
                  style={{
                    ...tw`items-center justify-center flex-1`,
                  }}
                >
                  <Text
                    style={tw`text-xs text-white font-poppins-medium tracking-wide`}
                  >
                    {decimalParser(meal.mealVerification.energy as number, 0)}
                  </Text>
                  <Text style={tw`text-xxs text-white font-poppins-regular`}>
                    kcal
                  </Text>
                </View>
              </LinearGradient>
            ) : (
              <></>
            )}
          </TouchableWithoutFeedback>
        </View>
        {meal?.id && <OptionalButtonGroup />}
      </View>
    </ScrollView>
  );
};

export default CarbCodeCard;
