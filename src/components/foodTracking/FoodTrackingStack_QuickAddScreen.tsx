import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import ActionSheet, {
  registerSheet,
  SheetManager,
  SheetProvider,
  SheetProps,
} from "react-native-actions-sheet";
import React, { useState } from "react";

import tw from "../../lib/tw";
import IconButton from "../shared/IconButton";
import SvgChevronLeft from "../icons/general/ChevronLeft";
import TickIcon from "../icons/general/TickIcon";
import TextInput from "../shared/TextInput";
import { Portion, Nutritics_Obj_Type } from "../../generated/graphql";
import Button from "../shared/Button";

import useAddNutriticsObject from "../../hooks/useAddNutriticsObject";
import useUpdateNutriticsObject from "../../hooks/useUpdateNutriticsObject";
import Loading from "../shared/LoadingScreen";
import Label from "../shared/Label";
import decimalParser from "../../utils/decimalParser";
import { decimalValidate } from "../../utils/validation";

type Props = {
  route: Props;
  navigation: Props;
  loggedItems: Props;
};
interface TErrorTxt {
  macros: string;
  kcals: string;
  weight: string;
}
function quickAddPortions(props: SheetProps) {
  const Item = ({ setPortion, portion, value }) => (
    <TouchableOpacity
      onPress={() => {
        setPortion({ value: value, name: portion.name, unit: portion.unit });
        SheetManager.hide("quickAddPortions");
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
              setPortion={props.payload?.setPortion}
              value={props.payload?.value}
            />
          )}
          keyExtractor={(item, index) => String(index)}
        />
      </View>
    </ActionSheet>
  );
}
registerSheet("quickAddPortions", quickAddPortions);
const FoodTrackingStack_QuickAddScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const getNutrients = (foodObj: any) => {
    var kcals = 0;
    var carbs = 0;
    var protein = 0;
    var fat = 0;

    if (foodObj) {
      const stdRatio = foodObj.portions[0].value / 100;
      for (let i in foodObj.nutrients) {
        if (foodObj.nutrients[i].slug == "Energy") {
          const energy = foodObj.nutrients[i];
          for (let j in energy.nutrients) {
            if (energy.nutrients[j].slug == "energyKcal")
              kcals = decimalParser(energy.nutrients[j].value * stdRatio, 2);
          }
        }
        if (foodObj.nutrients[i].slug == "Macronutrients") {
          const energy = foodObj.nutrients[i];
          for (let j in energy.nutrients) {
            if (energy.nutrients[j].slug == "carbohydrate")
              carbs = decimalParser(energy.nutrients[j].value * stdRatio, 3);
            if (energy.nutrients[j].slug == "protein")
              protein = decimalParser(energy.nutrients[j].value * stdRatio, 3);
            if (energy.nutrients[j].slug == "fat")
              fat = decimalParser(energy.nutrients[j].value * stdRatio, 3);
          }
        }
      }
    }
    return { kcals, carbs, protein, fat };
  };
  const foodObj = route.params.foodObject;
  let isLiquid = false;
  let portionIndex = 0;

  const nutrients = getNutrients(foodObj);
  const [saving, setSaving] = useState(false);
  const [foodName, setFoodName] = useState<string>(foodObj ? foodObj.name : "");
  const [kcals, setKcals] = useState<number>(nutrients.kcals);
  const [carbs, setCarbs] = useState<number>(nutrients.carbs);
  const [protein, setProtein] = useState<number>(nutrients.protein);
  const [fat, setFat] = useState<number>(nutrients.fat);
  const [errorTxt, setErrorText] = useState<TErrorTxt>({
    macros: "",
    weight: "",
    kcals: "",
  });
  const portions = [
    { name: "Serving", unit: "g", value: 1 },
    { name: "Cup", unit: "g", value: 1 },
    { name: "Tbsp", unit: "g", value: 1 },
    { name: "Tsp", unit: "g", value: 1 },
  ];
  if (foodObj) {
    isLiquid = foodObj.tags.filter((tag) => tag.name == "Liquid")[0]["checked"];
    portionIndex = portions.findIndex(
      (portion) => portion.name == foodObj.portions[0].name
    );
    portions[portionIndex].value = foodObj.portions[0].value;
  }
  const [portion, setPortion] = useState<Portion>(portions[portionIndex]);
  const [liquid, setLiquid] = useState<boolean>(foodObj ? isLiquid : false);
  const [quantity, setQuantity] = useState<string>("1");
  const { addNutriticsObject } = useAddNutriticsObject();
  const { updateNutriticsObject } = useUpdateNutriticsObject();

  const [kcalsTxt, setKcalsTxt] = useState<string>(kcals ? String(kcals) : "");
  const [carbsTxt, setCarbsTxt] = useState<string>(carbs ? String(carbs) : "");
  const [proteinTxt, setProteinTxt] = useState<string>(
    protein ? String(protein) : ""
  );
  const [fatTxt, setFatTxt] = useState<string>(fat ? String(fat) : "");
  const [weightTxt, setWeightTxt] = useState<string>(
    portion.value ? String(portion.value) : ""
  );

  const onAdd = () => {
    if (weightTxt === "" || weightTxt === "0") {
      setErrorText((prev) => ({
        ...prev,
        weight: "Weight is required.",
      }));
      return;
    } else {
      setErrorText((prev) => ({
        ...prev,
        weight: "",
      }));
    }
    if (kcalsTxt === "" || kcalsTxt === "0") {
      setErrorText((prev) => ({
        ...prev,
        kcals: "Calories is required.",
      }));
      return;
    } else {
      setErrorText((prev) => ({
        ...prev,
        kcals: "",
      }));
    }
    if (fatTxt === "" && carbsTxt === "" && proteinTxt === "") {
      setErrorText((prev) => ({
        ...prev,
        macros: "Any macros value is required.",
      }));
      return;
    } else {
      setErrorText((prev) => ({
        ...prev,
        macros: "",
      }));
    }
    setSaving(true);
    const tempPortion = { ...portion };
    tempPortion.value = decimalParser(portion.value / Number(quantity), 4);
    const stdValRatio = portion.value / 100;

    addNutriticsObject(
      {
        input: {
          type: Nutritics_Obj_Type.Food,
          name: foodName,
          quantity: { name: "100g", value: 100, unit: "g" },
          nutrients: [
            {
              name: "Energy",
              slug: "Energy",
              nutrients: [
                {
                  name: "kcals",
                  slug: "kcals",
                  value: decimalParser(kcals / stdValRatio, 4),
                  unit: "kcal",
                },
              ],
            },
            {
              name: "Macronutrients",
              slug: "Macronutrients",
              nutrients: [
                {
                  name: "Carbohydrate",
                  slug: "carbohydrate",
                  value: decimalParser(Number(carbsTxt) / stdValRatio, 4),
                  unit: "g",
                },
                {
                  name: "Protein",
                  slug: "protein",
                  value: decimalParser(Number(proteinTxt) / stdValRatio, 4),
                  unit: "g",
                },
                {
                  name: "Fat",
                  slug: "fat",
                  value: decimalParser(Number(fatTxt) / stdValRatio, 4),
                  unit: "g",
                },
              ],
            },
          ],
          portions: [tempPortion],
          liquid: liquid,
        },
      },
      {
        onSuccess: () => {
          setSaving(false);
          navigation.goBack();
          route.params.goToMyFood();
        },
      }
    );
  };
  const onEdit = () => {
    if (weightTxt === "" || weightTxt === "0") {
      setErrorText((prev) => ({
        ...prev,
        weight: "Weight is required.",
      }));
      return;
    } else {
      setErrorText((prev) => ({
        ...prev,
        weight: "",
      }));
    }
    if (kcalsTxt === "" || kcalsTxt === "0") {
      setErrorText((prev) => ({
        ...prev,
        kcals: "Calories is required.",
      }));
      return;
    } else {
      setErrorText((prev) => ({
        ...prev,
        kcals: "",
      }));
    }
    if (fatTxt === "" && carbsTxt === "" && proteinTxt === "") {
      setErrorText((prev) => ({
        ...prev,
        macros: "Any macros value is required.",
      }));
      return;
    } else {
      setErrorText((prev) => ({
        ...prev,
        macros: "",
      }));
    }
    setSaving(true);
    let tempPortion = { ...portion };
    tempPortion.value = decimalParser(portion.value / Number(quantity), 4);
    const valRatio = portion.value / 100;
    updateNutriticsObject(
      {
        id: foodObj.id,
        input: {
          type: Nutritics_Obj_Type.Food,
          name: foodName,
          quantity: { name: "100g", value: 100, unit: "g" },
          nutrients: [
            {
              name: "Energy",
              slug: "Energy",
              nutrients: [
                {
                  name: "kcals",
                  slug: "kcals",
                  value: decimalParser(kcals / valRatio, 4),
                  unit: "kcal",
                },
              ],
            },
            {
              name: "Macronutrients",
              slug: "Macronutrients",
              nutrients: [
                {
                  name: "Carbohydrate",
                  slug: "carbohydrate",
                  value: decimalParser(carbs / valRatio, 4),
                  unit: "g",
                },
                {
                  name: "Protein",
                  slug: "protein",
                  value: decimalParser(protein / valRatio, 4),
                  unit: "g",
                },
                {
                  name: "Fat",
                  slug: "fat",
                  value: decimalParser(fat / valRatio, 4),
                  unit: "g",
                },
              ],
            },
          ],
          portions: [tempPortion],
          liquid: liquid,
        },
      },
      {
        onSuccess: () => {
          setSaving(false);
          navigation.goBack();
          route.params.goToMyFood();
        },
      }
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={tw`flex-1`}
    >
      {saving ? (
        <Loading />
      ) : (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SheetProvider>
            <View style={tw`flex-1 px-5`}>
              <View
                style={tw`flex flex-row mt-17  border-b border-gray-200 justify-between`}
              >
                <IconButton
                  Icon={SvgChevronLeft}
                  onPress={() => {
                    navigation.goBack();
                  }}
                  variant="transparent"
                  size="xsmall"
                />
              </View>
              <View>
                <Text
                  style={tw`px-1 py-3 mt-2 text-white text-lg font-semibold `}
                >
                  Quick Add
                </Text>
                <Text style={tw`px-1 mb-5 text-white  `}>
                  Add the macro and kcal values of your food. Once it has been
                  added it will be available in search.
                </Text>
              </View>
              <ScrollView>
                <View>
                  <View style={tw`mt-3 flex flex-row justify-between`}>
                    <View style={tw`flex grow`}>
                      <TextInput
                        value={foodName}
                        onChangeText={setFoodName}
                        bgColor="bg-background-300"
                        label="Food Name"
                        returnKeyType="done"
                      />
                    </View>
                    <View style={tw`mx-2`}>
                      <Label text="Liquid?"></Label>
                      <TouchableOpacity
                        onPress={() => {
                          setLiquid(!liquid);
                          setPortion({ ...portion, unit: liquid ? "ml" : "g" });
                        }}
                      >
                        <View
                          style={tw`bg-background-300  w-14 h-14 ml-2 rounded-xl`}
                        >
                          {liquid ? <TickIcon style={tw`m-5`} /> : <></>}
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={tw`flex flex-row justify-between`}>
                    <View style={tw`w-5/12`}>
                      <TextInput
                        value={quantity}
                        onChangeText={(text) => {
                          decimalValidate(text, setQuantity);
                        }}
                        keyboardType="number-pad"
                        returnKeyType="done"
                        textAlign="center"
                        size={"lg"}
                        label={"Quantity"}
                      />
                    </View>
                    <View
                      style={tw` w-6/12 
                  `}
                    >
                      <Label text="Portion Name"></Label>
                      <TouchableOpacity
                        onPress={() => {
                          SheetManager.show("quickAddPortions", {
                            payload: {
                              portions: portions,
                              setPortion: setPortion,
                              value: String(portion.value),
                            },
                          });
                        }}
                      >
                        <View
                          style={tw`bg-background-300 rounded-larger py-4 px-4 grow `}
                        >
                          <Text style={tw`text-lg pl-3 pt-0.5 text-white`}>
                            {portion.name}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {errorTxt.weight && (
                    <Text
                      style={tw`text-red font-base font-poppins-medium mb-2`}
                    >
                      {errorTxt.weight}
                    </Text>
                  )}
                  <View>
                    <TextInput
                      value={weightTxt}
                      onChangeText={(text) =>
                        decimalValidate(text, setWeightTxt)
                      }
                      onEndEditing={(event) =>
                        setPortion({
                          ...portion,
                          value: Number(event.nativeEvent.text),
                        })
                      }
                      bgColor="bg-background-300"
                      keyboardType="numeric"
                      label={`Weight for ${quantity} ${portion.name}`}
                      returnKeyType="done"
                      rightText={liquid ? "ml" : "g"}
                    />
                  </View>
                  {errorTxt.kcals && (
                    <Text
                      style={tw`text-red font-base font-poppins-medium mb-2`}
                    >
                      {errorTxt.kcals}
                    </Text>
                  )}
                  <View>
                    <TextInput
                      value={kcalsTxt}
                      onChangeText={(text) =>
                        decimalValidate(text, setKcalsTxt)
                      }
                      onEndEditing={(event) =>
                        setKcals(Number(event.nativeEvent.text))
                      }
                      bgColor="bg-background-300"
                      keyboardType="numeric"
                      label={`Kcals for ${quantity} ${portion.name}`}
                      returnKeyType="done"
                    />
                  </View>
                  {errorTxt.macros && (
                    <Text
                      style={tw`text-red font-base font-poppins-medium mb-2`}
                    >
                      {errorTxt.macros}
                    </Text>
                  )}
                  <View>
                    <TextInput
                      value={carbsTxt}
                      onChangeText={(text) =>
                        decimalValidate(text, setCarbsTxt)
                      }
                      onEndEditing={(event) =>
                        setCarbs(Number(event.nativeEvent.text))
                      }
                      bgColor="bg-background-300"
                      keyboardType="numeric"
                      label={`Carbs(g) for ${quantity} ${portion.name}`}
                      returnKeyType="done"
                    />
                  </View>
                  <View>
                    <TextInput
                      value={proteinTxt}
                      onChangeText={(text) =>
                        decimalValidate(text, setProteinTxt)
                      }
                      onEndEditing={(event) =>
                        setProtein(Number(event.nativeEvent.text))
                      }
                      bgColor="bg-background-300"
                      keyboardType="numeric"
                      label={`Protein(g) for ${quantity} ${portion.name}`}
                      returnKeyType="done"
                    />
                  </View>
                  <View>
                    <TextInput
                      value={fatTxt}
                      onChangeText={(text) => decimalValidate(text, setFatTxt)}
                      onEndEditing={(event) =>
                        setFat(Number(event.nativeEvent.text))
                      }
                      bgColor="bg-background-300"
                      keyboardType="numeric"
                      label={`Fat(g) for ${quantity} ${portion.name}`}
                      returnKeyType="done"
                    />
                  </View>
                  <View style={tw`mt-3 pb-20`}>
                    <Button
                      label={foodObj ? "Save" : "Add"}
                      onPress={foodObj ? onEdit : onAdd}
                    ></Button>
                  </View>
                </View>
              </ScrollView>
            </View>
          </SheetProvider>
        </TouchableWithoutFeedback>
      )}
    </KeyboardAvoidingView>
  );
};

export default FoodTrackingStack_QuickAddScreen;
