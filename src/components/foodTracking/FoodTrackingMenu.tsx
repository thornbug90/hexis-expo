import React from "react";
import tw from "../../lib/tw";
import { CancelIcon } from "../icons/general";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import SearchScreen from "./FoodTrackingSearchScreen";
import Log from "./FoodTrackingLogScreen";
import TabBar from "./FoodTrackingTopBar";
import { useEffect, useState } from "react";
import useNutriticsSearch from "../../hooks/useNutriticsSearch";
import { basket } from "../../navigation/primary/screens/PrimaryStack_FoodTrackingScreen";
import {
  NutriticsObject,
  MealVerification,
  Meal,
  IntraFuellingRecommendation,
} from "../../generated/graphql";
import FoodItemDetailsScreen from "./FoodItemDetailsScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = {
  addLoggedItems: Function;
  removeLoggedItems: Function;
  getLoggedItems: Function;
  saveLoggedItems: Function;
  mealVerification?: MealVerification | null;
  goTo: Function;
  meal: Meal;
  intrafuellingRecommendations?: IntraFuellingRecommendation;
};
export type FoodTrackingStackParamsList = {
  SearchScreen: {
    title: string;
    keywords: string;
    setKeywords: Function;
    loggedItems: Props;
    updateLoggedItemsBadge: Function;
  };
  MyFoodScreen: {
    title: string;
    keywords: string;
    setKeywords: Function;
    loggedItems: Props;
    updateLoggedItemsBadge: Function;
  };
  LogScreen: {
    title: string;
    loggedItems: Props;
    updateLoggedItemsBadge: Function;
  };
  FoodItemDetailsScreen: {
    loggedItems: Props;
  };
};
const FoodTrackingTabsNavigator =
  createMaterialTopTabNavigator<FoodTrackingStackParamsList>();

const getSearchResults = async (): Promise<NutriticsObject[]> => {
  var searchResults: NutriticsObject[] = [];
  try {
    const searchResultsStr = await AsyncStorage.getItem("searchResults");
    if (searchResultsStr !== null) {
      // We have data!!
      searchResults = JSON.parse(searchResultsStr);
    }
  } catch (error) {
    // Error retrieving data
  }
  return searchResults;
};
const updateSearchResults = async (searchResults: NutriticsObject[]) => {
  try {
    await AsyncStorage.setItem("searchResults", JSON.stringify(searchResults));
  } catch (error) {
    // Error saving data
  }
};
const truncateSearchResults = async () => {
  try {
    await AsyncStorage.removeItem("SearchResults");
  } catch (error) {
    // Error saving data
  }
};

const Menu: React.FC<Props> = (loggedItems) => {
  const [loggedItemsLength, setLoggedItemsLength] = useState(0);
  const [totalQuantities, setTotalQuantities] = useState(0);
  const [searchKeywords, setSearchKeywords] = useState("");
  const [updateLogBars, setUpdateLogBars] = useState("");

  const updateLoggedItemsBadge = (portionName = "") => {
    loggedItems.getLoggedItems().then((items: basket) => {
      setLoggedItemsLength(items.length);
      var tQuantity = 0;
      for (let i in items) {
        tQuantity += items[i].quantity;
      }
      setTotalQuantities(tQuantity);
      setUpdateLogBars(portionName);
    });
  };
  const updateSearchKeywords = (keyword: string) => {
    setSearchKeywords(keyword);
  };

  return (
    <FoodTrackingTabsNavigator.Navigator
      initialRouteName={loggedItemsLength > 0 ? "LogScreen" : "SearchScreen"}
      screenOptions={{
        lazy: false,
        swipeEnabled: false,
      }}
      style={tw`bg-background-500`}
      tabBar={(props) => (
        <TabBar
          goTo={loggedItems.goTo}
          meal={loggedItems.meal}
          updateLogBars={updateLogBars}
          intrafuellingRecommendation={loggedItems.intrafuellingRecommendations}
          {...props}
        />
      )}
    >
      <FoodTrackingTabsNavigator.Screen
        initialParams={{
          title: "Search",
          loggedItems: loggedItems,
          updateLoggedItemsBadge: updateLoggedItemsBadge,
          keywords: searchKeywords,
          setKeywords: updateSearchKeywords,
        }}
        name="SearchScreen"
        component={SearchScreen}
      />
      <FoodTrackingTabsNavigator.Screen
        initialParams={{
          title: "My Foods",
          loggedItems: loggedItems,
          updateLoggedItemsBadge: updateLoggedItemsBadge,
          keywords: searchKeywords,
          setKeywords: updateSearchKeywords,
        }}
        name="MyFoodScreen"
        component={SearchScreen}
      />
      <FoodTrackingTabsNavigator.Screen
        initialParams={{
          title: `Log`,
          loggedItems: loggedItems,
          updateLoggedItemsBadge: updateLoggedItemsBadge,
        }}
        name="LogScreen"
        component={Log}
      />
    </FoodTrackingTabsNavigator.Navigator>
  );
};

export default Menu;
