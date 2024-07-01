import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { useAnalytics } from "@segment/analytics-react-native";
import currency from "currency.js";
import Wrapper from "../../../components/shared/Wrapper";

import {
  Carb_Code,
  Maybe,
  NutriticsObject,
  Portion,
  Meal_Name,
  Meal_Type,
  CarbRange,
} from "../../../generated/graphql";
import useAppDate from "../../../hooks/useAppDate";
import useVerifyMeal from "../../../hooks/useVerifyMeal";
import { getLiteralDateString, setLiteralDateTime } from "../../../utils/date";
import Header from "../../../components/foodTracking/FoodTrackingHeader";
import { convertMealName } from "../../../utils/enumNames";
import { PrimaryStackParamsList } from "../PrimaryStack";
import Menu from "../../../components/foodTracking/FoodTrackingMenu";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Footer from "../../../components/foodTracking/FoodTrackingFooter";
import useFoodLog from "../../../hooks/useFoodLog";
import Loading from "../../../components/shared/LoadingScreen";
import decimalParser from "../../../utils/decimalParser";
import generateRandomString from "../../../utils/generateRandomString";
import { View } from "react-native";
import { format } from "date-fns";

type Props = NativeStackScreenProps<
  PrimaryStackParamsList,
  "PrimaryStack_FoodTrackingModal"
>;

type basket = {
  id: string;
  foodItem: NutriticsObject;
  quantity: number;
  selectedPortion: Maybe<Portion>;
}[];
export type mealVery = {
  id?: string;
  time?: Date;
  carbCode?: Carb_Code;
  kcal?: string;
};

const PrimaryStack_FoodTrackingModal: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { track } = useAnalytics();
  const { verifyMeal, updateVerifyMeal } = useVerifyMeal(
    route.params.mealVerification
  );
  const [localMealTime, setLocalMealTime] = useState<Date | undefined>(
    undefined
  );
  const mealN = route.params.meal;

  const [appDate] = useAppDate();
  const [mealVerification, setMealVerification] = useState<mealVery>({
    time: new Date(),
    carbCode: Carb_Code.Low,
    kcal: "0",
  });
  let range: Partial<CarbRange> = {};
  if (route.params.ranges) {
    const isSnack = route.params?.meal?.mealType === Meal_Type.Snack;
    range = route.params.ranges[isSnack ? "snackRange" : "mainRange"];
  }
  useEffect(() => {
    if (!route.params.mealVerification) {
      const { energy, carbCode } = route.params.meal;
      const time = localMealTime
        ? format(localMealTime, "HH:mm:ss.SSS[Z]")
        : route.params.meal.time
        ? `${route.params.meal.time}Z`
        : route.params.meal.time;

      console.log(`NO Veri time is: ${JSON.stringify(time)}`);

      setMealVerification({
        time: time
          ? setLiteralDateTime(time, getLiteralDateString(appDate))
          : time,
        kcal: energy ? energy.toFixed(0) : "0",
        carbCode,
      });
      time;
    }

    if (
      route.params.mealVerification &&
      route.params.mealVerification.skipped
    ) {
      const verificationTime =
        route.params.mealVerification?.time.split("T")[1];
      const time = localMealTime
        ? format(localMealTime, "HH:mm:ss.SSS[Z]")
        : verificationTime
        ? `${verificationTime}Z`
        : verificationTime;

      const { id } = route.params.mealVerification;

      console.log(`Skipped Veri time is: ${JSON.stringify(time)}`);

      setMealVerification({
        id,
        time: time
          ? setLiteralDateTime(time, getLiteralDateString(appDate))
          : time,
        carbCode: Carb_Code.Low,
        kcal: "0",
      });
    }

    if (
      route.params.mealVerification &&
      !route.params.mealVerification.skipped
    ) {
      const { id, carbCode, energy } = route.params.mealVerification;
      const time = localMealTime
        ? localMealTime
        : route.params.mealVerification.time;

      console.log(`Exist Veri time is: ${JSON.stringify(time)}`);

      setMealVerification({
        id,
        time: time ? new Date(time) : time,
        kcal: energy!.toString(),
        carbCode: carbCode!,
      });
    }
  }, [route]);

  const intraMealRecommendations = route.params.intraFuellingRecommendations;

  const onSkipMeal = async () => {
    route.params.setWaitingSubScreen(true);
    if (mealVerification.id) {
      updateVerifyMeal({
        id: mealVerification.id,
        input: {
          kcal: null,
          skipped: true,
          time: mealVerification.time,
          carbCode: null,
          log: {
            foodObjects: [],
            quantities: [],
            portions: [],
          },
        },
      });
    } else {
      verifyMeal({
        input: {
          kcal: null,
          skipped: true,
          time: mealVerification.time,
          carbCode: null,
          mealNutritionId: route.params?.meal?.id!,
        },
      });
    }

    track("MEAL_VERIFIED", {
      kcal: undefined,
      skipped: true,
      actualCarbCode: undefined,
      expectedCarbCode: route.params.meal.carbCode,
    });

    await truncateLoggedItems();

    navigation.goBack();
  };
  const onVerifyMeal = async () => {
    // calculate kcal and carbCode
    const currentBasket: basket = await getLoggedItems();
    var kcals = 0;
    var carbs = 0;
    const foodObjs = [];
    const portions = [];
    const quantities = [];

    for (let item in currentBasket) {
      const foodEnergy = currentBasket[item].foodItem.nutrients.filter(
        (i) => i?.slug == "Energy"
      )[0];
      const foodMacros = currentBasket[item].foodItem.nutrients.filter(
        (i) => i?.slug == "Macronutrients"
      )[0];
      const foodKcals = foodEnergy?.nutrients?.filter(
        (i) => i?.slug == "energyKcal"
      )[0];
      const foodCarbs = foodMacros?.nutrients?.filter(
        (i) => i?.slug == "carbohydrate"
      )[0];

      const spv = currentBasket[item].selectedPortion?.value ?? 0;
      const quant = currentBasket[item].quantity;
      const fkv = foodKcals?.value ?? 0;
      const fcv = foodCarbs?.value ?? 0;
      const kDiv = fkv / 100;
      const cDiv = fcv / 100;

      kcals += spv * quant * kDiv;
      kcals = decimalParser(kcals, 3);
      carbs += spv * quant * cDiv;
      carbs = decimalParser(carbs, 3);

      foodObjs.push(currentBasket[item].foodItem.id);
      portions.push(JSON.stringify(currentBasket[item].selectedPortion));
      quantities.push(currentBasket[item].quantity);
    }
    let loggedCarbCode = mealVerification.carbCode;
    if (carbs <= range?.lowMax!) {
      loggedCarbCode = Carb_Code.Low;
    } else if (carbs > range?.lowMax! && carbs <= range?.medMax!) {
      loggedCarbCode = Carb_Code.Medium;
    } else if (carbs > range?.medMax!) {
      loggedCarbCode = Carb_Code.High;
    }

    route.params.setWaitingSubScreen(true);
    if (mealVerification.id) {
      updateVerifyMeal({
        id: mealVerification.id,
        input: {
          kcal: Number(kcals),
          skipped: false,
          time: mealVerification.time,
          carbCode: loggedCarbCode,
          log: {
            foodObjects: foodObjs,
            quantities: quantities,
            portions: portions,
          },
        },
      });
    } else {
      verifyMeal({
        input: {
          kcal: Number(kcals),
          skipped: false,
          time: mealVerification.time,
          carbCode: loggedCarbCode,
          log: {
            foodObjects: foodObjs,
            quantities: quantities,
            portions: portions,
          },
          mealNutritionId: route.params?.meal?.id!,
        },
      });
    }

    track("MEAL_VERIFIED", {
      kcal: `${kcals}`,
      skipped: false,
      actualCarbCode: mealVerification.carbCode,
      expectedCarbCode: route.params.meal.carbCode,
    });

    setMealVerification({ ...mealVerification, kcal: `${kcals}` });
    await truncateLoggedItems();

    navigation.goBack();
  };
  const addLoggedItems = async (
    foodObj: NutriticsObject,
    selectedPortion?: Portion,
    quantity: number = 1
  ) => {
    var loggedItems: basket = await getLoggedItems();
    var thePortion: Maybe<Portion> = foodObj.portions[0];
    if (selectedPortion) thePortion = selectedPortion;
    const index = loggedItems.findIndex(
      (item) =>
        item.foodItem.id === foodObj.id &&
        item.selectedPortion?.name === selectedPortion?.name
    );
    if (index != -1) {
      loggedItems[index].quantity += quantity;
    } else {
      loggedItems.push({
        id: generateRandomString(20),
        foodItem: foodObj,
        quantity: quantity,
        selectedPortion: thePortion,
      });
    }
    await saveLoggedItems(loggedItems);
  };
  const removeLoggedItems = async (
    basketItemId: string,
    quantity: number = -1
  ) => {
    var loggedItems: basket = await getLoggedItems();
    var quantDelta = quantity;
    loggedItems.map((item, index) => {
      if (item.id == basketItemId) {
        if (quantDelta > 0) quantDelta = loggedItems[index].quantity - quantity;
        if (quantDelta < 1) loggedItems.splice(index, 1);
        else {
          loggedItems[index].quantity -= quantity;
        }
      }
    });

    await saveLoggedItems(loggedItems);
    var loggedItemsN: basket = await getLoggedItems();
  };
  const truncateLoggedItems = async () => {
    try {
      await AsyncStorage.removeItem("loggedItems");
    } catch (error) {
      // Error saving data
    }
  };
  const getLoggedItems = async (): Promise<basket> => {
    var loggedItems: basket = [];
    try {
      const loggedItemsStr = await AsyncStorage.getItem("loggedItems");
      if (loggedItemsStr !== null) {
        // We have data!!
        loggedItems = JSON.parse(loggedItemsStr);
      }
    } catch (error) {
      // Error retrieving data
    }
    return loggedItems;
  };
  const saveLoggedItems = async (loggedItems: basket) => {
    try {
      await AsyncStorage.setItem("loggedItems", JSON.stringify(loggedItems));
    } catch (error) {
      // Error saving data
    }
  };
  const onSkipConfirmation = () => {
    truncateLoggedItems();
    onSkipMeal();
  };

  return (
    <View style={{ flex: 1 }}>
      <Header
        mealName={route.params.meal?.mealName ?? "Unknown"}
        goBack={async () => {
          await truncateLoggedItems();
          navigation.goBack();
        }}
        verificationId={mealVerification.id}
        setWaitingSubScreen={route.params.setWaitingSubScreen}
      ></Header>
      <Menu
        addLoggedItems={addLoggedItems}
        removeLoggedItems={removeLoggedItems}
        getLoggedItems={getLoggedItems}
        saveLoggedItems={saveLoggedItems}
        mealVerification={route.params.mealVerification}
        goTo={(screenName: any, params: any) => {
          navigation.navigate(screenName, params);
        }}
        meal={route.params.meal}
        intrafuellingRecommendations={intraMealRecommendations}
      ></Menu>
      <Footer
        mealVerification={mealVerification}
        setMealVerification={setMealVerification}
        setLocalMealTime={(input: any) => {
          console.log(`setLocalTime: ${input} JSON:${JSON.stringify(input)}`);
          setLocalMealTime(input);
        }}
        onSkip={onSkipConfirmation}
        onSave={onVerifyMeal}
      />
    </View>
  );
};

export default PrimaryStack_FoodTrackingModal;
export { basket };
