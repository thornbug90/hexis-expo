import React, { useEffect, useState } from "react";
import tw from "../../lib/tw";
import { basket } from "../../navigation/primary/screens/PrimaryStack_FoodTrackingScreen";
import FoodItem from "./FoodTrackingItem";
import {
  Meal_Type,
  Nutritics_Obj_Type,
  NutriticsObject,
} from "../../generated/graphql";
import Loading from "../shared/LoadingScreen";
import { Text, ScrollView, View } from "react-native";
import useNutriticsSearch from "../../hooks/useNutriticsSearch";
import { MaterialTopTabScreenProps } from "@react-navigation/material-top-tabs";
import { FoodTrackingStackParamsList } from "./FoodTrackingMenu";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type Props = MaterialTopTabScreenProps<
  FoodTrackingStackParamsList,
  "SearchScreen"
>;

const SearchScreen: React.FC<Props> = ({ route, navigation }) => {
  const [searchResults, setSearchResults] = useState();
  const [keywords, setKeywords] = useState(route.params.keywords);
  const [reloadFlag, setReloadFlag] = useState(route.params.keywords);
  const [foodItems, setFoodItems] = useState<NutriticsObject[]>();
  const [userFoodOnly, setUserFoodOnly] = useState(
    route.params.title == "My Foods" ? true : false
  );
  const { loading, data, refetch } = useNutriticsSearch(
    keywords,
    Nutritics_Obj_Type.Food,
    userFoodOnly,
    route.params.loggedItems.meal.mealType ?? undefined
  );
  var noResultsMessage = `No recently logged foods were found.`;
  if (keywords != "")
    noResultsMessage = `Sorry, no matches were found for: ${keywords}`;

  useEffect(() => {
    route.params.updateLoggedItemsBadge();
  }, []);

  useEffect(() => {
    if (route.params.keywords !== " ") setKeywords(route.params.keywords);
    else setReloadFlag(" ");
  }, [route.params.keywords]);

  return (
    <View style={tw`justify-center flex-auto`}>
      {loading ? (
        <Loading />
      ) : data && data.length > 0 ? (
        <KeyboardAwareScrollView>
          {keywords == "" && !userFoodOnly && (
            <View>
              <Text style={tw`text-sm text-gray-300 px-4 py-2 mt-1`}>
                Recently Added
              </Text>
            </View>
          )}

          {data.map((foodObj, index) => {
            if (foodObj)
              return (
                <FoodItem
                  key={foodObj.id}
                  foodObj={foodObj}
                  screen={"search"}
                  loggedFoodItems={route.params.loggedItems}
                  updateLoggedItemsBadge={route.params.updateLoggedItemsBadge}
                  navigation={navigation}
                  userFoodOnly={userFoodOnly}
                  refetchFoodItems={refetch}
                  basketId={""}
                ></FoodItem>
              );
          })}
        </KeyboardAwareScrollView>
      ) : (
        <Text style={tw`text-white text-center`}>
          {userFoodOnly
            ? "You have not yet added any My Food items."
            : noResultsMessage}
        </Text>
      )}
    </View>
  );
};

export default SearchScreen;
