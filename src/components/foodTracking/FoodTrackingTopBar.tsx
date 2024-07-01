import * as React from "react";
import { useState } from "react";
import { Animated, TouchableOpacity, View } from "react-native";
import {
  Carb_Code,
  IntraFuellingRecommendation,
  Meal_Name,
  NutriticsObject,
  Portion,
} from "../../generated/graphql";
import tw from "../../lib/tw";
import { basket } from "../../navigation/primary/screens/PrimaryStack_FoodTrackingScreen";
import LogBar from "./FoodTrackingLogBar";
import SearchBox from "./FoodTrackingSearchBox";

type TabProps = {
  focusAnim: any;
  title: string;
  quantity: number;
  tab: "search" | "log";
  onPress: () => void;
  selectedTab: string;
};
const Tab: React.FC<TabProps> = ({
  selectedTab,
  focusAnim,
  title,
  quantity,
  tab,
  onPress,
}) => {
  return (
    <View style={tw`content-around`}>
      <TouchableOpacity onPress={onPress}>
        <Animated.View
          style={tw`py-1 ${
            title === selectedTab ? "border-b border-white" : ""
          }`}
        >
          <Animated.View style={tw`flex flex-row justify-center`}>
            <Animated.View style={tw`justify-center `}>
              <Animated.Text
                style={tw`${
                  title === selectedTab ? "text-white" : "text-gray-200"
                } m-2 text-xs text-center `}
              >
                {title}
              </Animated.Text>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const calculateMacros = (loggedItems: basket, setLoggedMacros: Function) => {
  var totalKcals = 0;
  var totalCarbs = 0;
  var totalProtein = 0;
  var totalFat = 0;
  for (let j in loggedItems) {
    const loggedItem = loggedItems[j];
    const foodQuantity = loggedItem.foodItem.quantity;
    const selectedPortion = loggedItem.selectedPortion;
    const nutrients = loggedItem.foodItem.nutrients;
    const quantity = loggedItem.quantity;

    const kcals = nutrients
      .filter((nutrient) => nutrient?.slug == "Energy")[0]
      ?.nutrients?.filter(
        (subNutrient) => subNutrient?.slug == "energyKcal"
      )[0];
    const carbs = nutrients
      .filter((nutrient) => nutrient?.slug == "Macronutrients")[0]
      ?.nutrients?.filter(
        (subNutrient) => subNutrient?.slug == "carbohydrate"
      )[0];
    const protein = nutrients
      .filter((nutrient) => nutrient?.slug == "Macronutrients")[0]
      ?.nutrients?.filter((subNutrient) => subNutrient?.slug == "protein")[0];
    const fat = nutrients
      .filter((nutrient) => nutrient?.slug == "Macronutrients")[0]
      ?.nutrients?.filter((subNutrient) => subNutrient?.slug == "fat")[0];

    totalKcals +=
      (kcals?.value! / foodQuantity.value!) *
      selectedPortion?.value! *
      quantity;
    totalCarbs +=
      (carbs?.value! / foodQuantity.value!) *
      selectedPortion?.value! *
      quantity;
    totalProtein +=
      (protein?.value! / foodQuantity.value!) *
      selectedPortion?.value! *
      quantity;
    totalFat +=
      (fat?.value! / foodQuantity.value!) * selectedPortion?.value! * quantity;
  }
  setLoggedMacros({
    kcals: totalKcals,
    carbs: totalCarbs,
    protein: totalProtein,
    fat: totalFat,
  });
};
const TabBar = (props: any) => {
  const {
    navigationState,
    navigation,
    position,
    goTo,
    meal,
    updateLogBars,
    intrafuellingRecommendation,
  } = props;
  const [quantity, setQuantity] = useState(0);
  const [plannedMacros, setPlannedMacros] = useState({
    kcals: meal.energy,
    carbs: meal.carb,
  });
  const [loggedMacros, setLoggedMacros] = useState({
    kcals: 0,
    carbs: 0,
    protein: 0,
    fat: 0,
  });
  const searchScreen = navigationState.routes.filter(
    (i: any) => i.name == "SearchScreen"
  )[0];
  const logScreen = navigationState.routes.filter(
    (i: any) => i.name == "LogScreen"
  )[0];

  const [tabSelected, setTabSelected] = useState<string>("Search");
  const setTab = (index: number) => {
    if (index == 0) setTabSelected("Search");
    if (index == 1) setTabSelected("My Foods");
    if (index == 2) setTabSelected("Log");
  };

  React.useEffect(() => {
    setTab(navigationState.index);
  }, [navigationState.index]);

  React.useEffect(() => {
    if (logScreen) {
      logScreen.params.loggedItems.getLoggedItems().then((items: basket) => {
        setQuantity(items.length);
        calculateMacros(items, setLoggedMacros);
      });
    }
  }, [props]);

  return (
    <View>
      <LogBar
        quantity={quantity}
        loggedMacros={loggedMacros}
        plannedMacros={plannedMacros}
        goTo={goTo}
        selectedTab={tabSelected}
        updateLogBars={updateLogBars}
      ></LogBar>
      <View
        style={tw`flex flex-row justify-around items-center bg-background-300 border-b-2 border-background-500`}
      >
        {navigationState.routes.map((route: any, index: number) => {
          if (route.name == "LogScreen") return;

          return (
            <View style={tw`grow`} key={route.key}>
              <Tab
                selectedTab={tabSelected}
                focusAnim={"focusAnim"}
                title={route.params.title}
                tab={route.params.title.toLowerCase()}
                quantity={quantity}
                onPress={() => {
                  setTabSelected(route.params.title);
                  navigation.navigate(route.name);
                }}
              />
            </View>
          );
        })}
      </View>
      <View style={tw``}>
        <SearchBox
          search={searchScreen.params.setKeywords}
          nav={navigation}
          goTo={goTo}
          mealSlot={meal.slot}
        ></SearchBox>
      </View>
    </View>
  );
};

export default TabBar;
