import {
  View,
  Text,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import FoodInfo from "./FoodTrackingItemInfo";
import tw from "../../lib/tw";
import IconButton from "../shared/IconButton";
import SvgChevronLeft from "../icons/general/ChevronLeft";
import ItemActions from "./FoodTrackingItemActions";
import PieChart from "./FoodTrackingPieChart";
import { useEffect, useState } from "react";
import decimalParser from "../../utils/decimalParser";

type Props = {
  route: Props;
  navigation: Props;
  loggedItems: Props;
};
const FoodItemDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const foodObject = route.params.foodObject;
  const multiplier = route.params.multiplier;
  const quantity = route.params.quantity;
  const screen = route.params.screen;
  const selectedPortion = route.params.selectedPortion;
  const setMultiplier = route.params.setMultiplier;
  const setQuantity = route.params.setQuantity;
  const setSelectedPortion = route.params.setSelectedPortion;
  const addFoodItem = route.params.addFoodItem;
  const removeFoodItem = route.params.removeFoodItem;
  const userFoodOnly = route.params.userFoodOnly;
  const [hasTags, setHasTags] = useState(false);
  const [multiplierT, setMultiplierT] = useState(multiplier);
  const [selectedPortionT, setSelectedPortionT] = useState(selectedPortion);
  const [valuesMultiplier, setValuesMultiplier] = useState(
    (1 / 100) * selectedPortion.value * multiplier
  );
  const [detailQuantity, setDetailQuantity] = useState(quantity);
  useEffect(() => {
    setValuesMultiplier((1 / 100) * selectedPortionT.value * multiplierT);
  }, [selectedPortionT, multiplierT]);

  return (
    <View style={tw`mx-5`}>
      <View
        style={tw`flex flex-row mt-17  border-b border-gray-200 justify-between`}
      >
        <IconButton
          Icon={SvgChevronLeft}
          onPress={() => {
            if (!Keyboard.isVisible()) {
              setQuantity(detailQuantity);
              navigation.goBack();
            }
          }}
          variant="transparent"
          size="xsmall"
        />
        <ItemActions
          quantity={quantity}
          view={"detail"}
          screen={screen}
          addFoodItem={() => {
            if (Keyboard.isVisible()) return;
            addFoodItem(multiplierT, selectedPortionT);
            navigation.goBack();
          }}
          removeFoodItem={removeFoodItem}
        />
      </View>
      <ScrollView>
        <FoodInfo
          id={foodObject.id}
          key={foodObject.id}
          name={foodObject.name}
          nutrients={foodObject.nutrients}
          portions={foodObject.portions}
          multiplier={multiplier}
          setMultiplier={(m) => {
            setMultiplier(m);
            setMultiplierT(m);
          }}
          quantity={detailQuantity}
          setQuantity={setDetailQuantity}
          screen={screen}
          selectedPortion={selectedPortionT}
          setSelectedPortion={(s) => {
            setSelectedPortion(s);
            setSelectedPortionT(s);
          }}
          view={"detail"}
          mainNav={navigation}
          foodObject={foodObject}
          userFoodOnly={userFoodOnly}
          refetchFoodItems={route.params.refetchFoodItems}
        />
        <PieChart
          nutrients={foodObject.nutrients}
          multiplier={multiplierT}
          portion={selectedPortionT}
        />
        <View style={tw`border-b border-gray-200 grow `} />
        <View style={tw`mt-4 mb-4`}>
          <Text style={tw`text-white text-base mb-3`}>
            Allergens & Properties
          </Text>
          <View style={tw`flex flex-row flex-wrap`}>
            {foodObject.tags.map((tag) => {
              if (tag.checked) {
                if (!hasTags) setHasTags(true);
                return (
                  <View style={tw`m-1 flex-none`}>
                    <Text
                      style={tw` text-sky-200 underline font-semibold text-sm text-center`}
                    >
                      {tag.name}
                    </Text>
                  </View>
                );
              }
            })}
            {!hasTags && (
              <View style={tw`flex flex-auto`}>
                <Text style={tw`px-1 text-gray-300 text-center`}>No tags</Text>
              </View>
            )}
          </View>
        </View>
        <View style={tw`border-b border-gray-200 grow `} />
        <View style={tw`mt-4`}>
          {foodObject.nutrients.map((nutrient, idx1) => {
            return (
              <View key={idx1 + nutrient.name}>
                <View style={tw`flex grow mb-2 mt-3`}>
                  <Text style={tw`text-white font-bold`}>{nutrient.name}</Text>
                </View>
                {nutrient.nutrients.map((mainNutrient, idx2) => {
                  return (
                    <View key={idx2 + mainNutrient.name}>
                      <View
                        style={tw`flex grow flex-row justify-between mb-1 mt-2`}
                      >
                        <Text style={tw`pl-2 text-white text-center`}>
                          {mainNutrient.name.split("(")[0]}
                        </Text>
                        <Text style={tw`text-white text-center`}>
                          {decimalParser(
                            mainNutrient.value * valuesMultiplier,
                            4
                          )}
                          {mainNutrient.unit}
                        </Text>
                      </View>
                      {mainNutrient.nutrients &&
                      mainNutrient.nutrients.length > 0
                        ? mainNutrient.nutrients.map((subNutrient, idx3) => {
                            return (
                              <View
                                key={idx3 + subNutrient.name}
                                style={tw`flex grow flex-row justify-between mb-1 mt-2`}
                              >
                                <Text
                                  style={tw`text-white text-center italic font-light pl-2`}
                                >
                                  {subNutrient.name.split("(")[0]}
                                </Text>
                                <Text
                                  style={tw`text-white italic font-light text-center`}
                                >
                                  {decimalParser(
                                    subNutrient.value * valuesMultiplier,
                                    4
                                  )}
                                  {subNutrient.unit}
                                </Text>
                              </View>
                            );
                          })
                        : null}
                    </View>
                  );
                })}
              </View>
            );
          })}
          <View style={tw`mb-40`}></View>
        </View>
      </ScrollView>
    </View>
  );
};

export default FoodItemDetailsScreen;
