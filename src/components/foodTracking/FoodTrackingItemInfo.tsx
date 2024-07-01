import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Platform,
  TouchableOpacity,
  FlatList,
} from "react-native";
import tw from "../../lib/tw";

import TextInput from "../shared/TextInput";
import Button from "../shared/Button";
import ActionSheet, {
  registerSheet,
  SheetManager,
  SheetProvider,
  SheetProps,
} from "react-native-actions-sheet";

import { NutriticsObject, Nutrient, Portion } from "../../generated/graphql";
import Label from "../shared/Label";
import decimalParser from "../../utils/decimalParser";
import { decimalValidate } from "../../utils/validation";

const onPress = () => {};

const getNutrientsSummaryItems = (
  nutrient: Nutrient,
  portion: Portion,
  multiplier: number,
  quantity: number,
  screen: string,
  index: any
) => {
  var name = "";
  if (nutrient?.slug == "carbohydrate") name = "C";
  if (nutrient?.slug == "fat") name = "F";
  if (nutrient?.slug == "protein") name = "P";
  if (nutrient?.slug == "energyKcal") name = " ";
  const duplications = screen == "search" ? multiplier : quantity;
  if (name != "") {
    return (
      <View key={index} style={tw`flex flex-none mr-3`}>
        <Text style={tw`text-xxs text-white`}>
          {`${name} `}
          {decimalParser(
            ((nutrient.value || 0) / 100) *
              (portion?.value || 0) *
              duplications,
            0
          )}
          {nutrient.unit == "kcal" ? ` ${nutrient.unit}` : `${nutrient.unit}`}
        </Text>
      </View>
    );
  }
};

function PortionSheet(props: SheetProps) {
  const Item = ({ setSelectedPortion, portion }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedPortion(portion);
        SheetManager.hide("portions-sheet");
      }}
    >
      <View style={tw`border-b border-gray-400`}>
        <Text style={tw`text-center mt-4 mb-4 text-xl text-white`}>
          {portion.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
  return (
    <ActionSheet id={props.sheetId} containerStyle={tw`bg-gray-500`}>
      <View style={tw`mb-5`}>
        <FlatList
          data={props.payload?.portions}
          renderItem={({ item, index }) => (
            <Item
              portion={item}
              setSelectedPortion={props.payload?.setSelectedPortion}
            />
          )}
          keyExtractor={(item, index) => String(index)}
        />
      </View>
    </ActionSheet>
  );
}

type Props = {
  name: string;
  portions: Portion[];
  nutrients: Nutrient[];
  multiplier: number;
  setMultiplier: Function;
  quantity: number;
  setQuantity: Function;
  screen: string;
  selectedPortion: Portion;
  setSelectedPortion: Function;
  view: "detail" | "minimal";
  mainNav: any;
  foodObject: any;
  userFoodOnly: boolean;
  refetchFoodItems: Function;
};
const FoodInfo: React.FC<Props> = ({
  portions,
  name,
  nutrients,
  multiplier,
  setMultiplier,
  quantity,
  setQuantity,
  screen,
  selectedPortion,
  setSelectedPortion,
  view = "minimal",
  mainNav = undefined,
  foodObject = undefined,
  userFoodOnly = false,
  refetchFoodItems,
}) => {
  const [valueErrorMessage, setValueErrorMessage] = useState("");
  const [numericVal, setNumericVal] = useState("");
  const [portionName, setPortionName] = useState(selectedPortion.name);
  const contextId = Math.floor(Math.random() * 90000) + 10000;
  useEffect(() => {
    registerSheet("portions-sheet", PortionSheet, `${contextId}`);
  });
  useEffect(() => {
    setPortionName(selectedPortion.name);
  }, [selectedPortion]);

  useEffect(() => {
    if (screen == "search") setNumericVal(String(multiplier));
    else setNumericVal(String(quantity));
  }, [quantity, multiplier]);

  const openQuickEdit = () => {
    mainNav.navigate("FoodTrackingStack_QuickAddScreen", {
      goToMyFood: () => {
        refetchFoodItems();
        mainNav.navigate("MyFoodScreen", {
          keywords: " ",
        });
      },
      foodObject: foodObject,
    });
  };
  return (
    <SheetProvider context={`${contextId}`}>
      <View>
        {view == "minimal" && (
          <View style={tw`flex mb-1 ml-1`}>
            <Text style={tw`text-white font-medium text-base mb-2`}>
              {name}
            </Text>
          </View>
        )}
        {view == "detail" && (
          <View style={tw`justify-between flex flex-row`}>
            <Text style={tw`text-white my-8 text-xl w-65 font-semibold`}>
              {name}
            </Text>
            {userFoodOnly && (
              <View style={tw`my-8`}>
                <Button
                  label={"Edit"}
                  variant="secondary2"
                  padding={true}
                  size="small"
                  onPress={openQuickEdit}
                />
              </View>
            )}
          </View>
        )}
        <View style={tw`flex flex-row `}>
          <View style={tw`flex mb-2 ${view == "detail" ? "w-18" : "w-12"}`}>
            <TextInput
              value={numericVal}
              onChangeText={(text) => {
                decimalValidate(text, setNumericVal);
              }}
              onEndEditing={(event) => {
                if (Number(event.nativeEvent.text) <= 0) {
                  if (screen == "search") setMultiplier(1);
                  else setQuantity(0);
                } else {
                  if (screen == "search")
                    setMultiplier(Number(event.nativeEvent.text));
                  else {
                    //setQuantity(-1);
                    setQuantity(Number(event.nativeEvent.text));
                  }
                }
              }}
              keyboardType="numeric"
              returnKeyType="done"
              error={valueErrorMessage}
              textAlign="center"
              size={view == "detail" ? "lg" : "sm"}
              label={view == "detail" ? "Quantity" : ""}
            />
          </View>
          <View
            style={tw`ml-2 ${view == "detail" ? "grow flex flex-auto" : ""}`}
          >
            {view == "detail" && <Label text={"Serving"} />}
            <TouchableOpacity
              onPress={() => {
                SheetManager.show("portions-sheet", {
                  payload: {
                    portions: portions,
                    setSelectedPortion: setSelectedPortion,
                  },
                });
              }}
            >
              <View
                style={tw`bg-background-300 rounded-larger
                ${
                  view == "detail"
                    ? "py-4 px-4"
                    : Platform.OS === "android"
                    ? "h-9"
                    : "h-7.5"
                }
                ${view == "detail" ? "grow" : "min-w-35"}`}
              >
                <Text
                  style={tw`
                  ${view == "detail" ? "text-lg px-3 pt-0.5 " : "px-3 pt-2"}
                  text-white`}
                >
                  {portionName}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        {view == "minimal" && (
          <View style={tw`flex flex-row ml-1 mb-3`}>
            {nutrients.map((nutrient) => {
              if (
                nutrient?.slug == "Energy" ||
                nutrient?.name == "Macronutrients"
              ) {
                const summary = [];
                for (let i in nutrient?.nutrients) {
                  summary.push(
                    getNutrientsSummaryItems(
                      nutrient?.nutrients[i],
                      selectedPortion,
                      multiplier,
                      quantity,
                      screen,
                      i
                    )
                  );
                }
                return summary;
              }
            })}
          </View>
        )}
      </View>
    </SheetProvider>
  );
};

export default FoodInfo;
