import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { Dimensions, SafeAreaView, View } from "react-native";
import CarbCodeMealGuide from "../../../components/carbCodes/CarbCodeMealGuide";
import Button from "../../../components/shared/Button";
import { Carb_Code, Meal_Name, Meal_Type } from "../../../generated/graphql";
import useMealInspiration from "../../../hooks/useMealInspiration";
import tw from "../../../lib/tw";
import { PrimaryStackParamsList } from "../PrimaryStack";

type Props = NativeStackScreenProps<
  PrimaryStackParamsList,
  "PrimaryStack_CarbCodeInspirationScreen"
>;

const { width } = Dimensions.get("screen");

const PrimaryStack_CarbCodeInspirationScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { data } = useMealInspiration(
    route.params.mealType,
    route.params.carbCode
  );
  let color = `carbcode${route.params.carbCode.toLowerCase()}-100`;
  const [range, setRange] = useState<number[]>();

  const isMeal = (mealType: Meal_Type) => {
    if (mealType === Meal_Type.Main) {
      return true;
    } else {
      return false;
    }
  };
  const isLow = (carbCode: Carb_Code) => {
    if (carbCode === Carb_Code.Low) {
      return true;
    }
  };
  const isMedium = (carbCode: Carb_Code) => {
    if (carbCode === Carb_Code.Medium) {
      return true;
    }
  };
  const isHigh = (carbCode: Carb_Code) => {
    if (carbCode === Carb_Code.High) {
      return true;
    }
  };
  const mainRanges = route.params.ranges.mainRange;
  const snackRanges = route.params.ranges.snackRange;
  useEffect(() => {
    if (isMeal(route.params.mealType)) {
      if (isLow(route.params.carbCode)) {
        setRange([0, mainRanges.lowMax]);
      } else if (isMedium(route.params.carbCode)) {
        setRange([mainRanges.medMin!, mainRanges.medMax]);
      } else if (isHigh(route.params.carbCode)) {
        setRange([mainRanges.highMin!, mainRanges.highMax]);
      }
    } else {
      if (isLow(route.params.carbCode)) {
        setRange([0, snackRanges.lowMax]);
      } else if (isMedium(route.params.carbCode)) {
        setRange([snackRanges.medMin!, snackRanges.medMax]);
      } else if (isHigh(route.params.carbCode)) {
        setRange([snackRanges.highMin, snackRanges.highMax]);
      }
    }
  }, []);

  return (
    <SafeAreaView style={tw`flex-1 items-center justify-center`}>
      <View>
        <View
          style={{
            width: width - 64,
            ...tw`p-4 bg-background-400 rounded-lg border border-background-100 shadow`,
          }}
        >
          <View style={tw`mb-4`}>
            <CarbCodeMealGuide
              images={data?.images ?? []}
              messages={data?.messages ?? []}
              carbCode={route.params.carbCode}
              color={color}
              ranges={range}
              mealType={
                isMeal(route.params.mealType) ? Meal_Type.Main : Meal_Type.Snack
              }
            />
          </View>
          <Button label="Done" size="small" onPress={navigation.goBack} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PrimaryStack_CarbCodeInspirationScreen;
