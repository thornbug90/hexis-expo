import { useEffect, useState } from "react";
import { View, Text, Pressable, TouchableOpacity } from "react-native";
import tw from "../../lib/tw";
import { CancelIcon, PlusIcon } from "../icons/general";
import TextInput from "../shared/TextInput";
import Button from "../shared/Button";
import { Nutrient, Portion } from "../../generated/graphql";
import RNPieChart from "react-native-pie-chart";
import decimalParser from "../../utils/decimalParser";

type Props = {
  nutrients: Nutrient[];
  multiplier: number;
  portion: Portion;
};

const PieChart: React.FC<Props> = ({ nutrients, multiplier, portion }) => {
  const widthAndHeight = 130;
  const sliceColor = ["#359CEF", "#E73D5B", "#FDD015"];
  const [series, setSeries] = useState([100, 100, 100]);
  const [macroExtracted, setMacroExtracted] = useState(false);
  const [kcal, setKcal] = useState(0);
  const [macros, setMacros] = useState({
    carbs: 0,
    protein: 0,
    fat: 0,
  });
  useEffect(() => {
    nutrients.map((nutrient) => {
      if (nutrient.name == "Macronutrients") {
        const carbohydrate = nutrient.nutrients?.filter(
          (innerNutrient) => innerNutrient?.slug == "carbohydrate"
        )[0];
        const protein = nutrient.nutrients?.filter(
          (innerNutrient) => innerNutrient?.slug == "protein"
        )[0];
        const fat = nutrient.nutrients?.filter(
          (innerNutrient) => innerNutrient?.slug == "fat"
        )[0];

        console.log(
          `carbohydrate:${JSON.stringify(
            carbohydrate
          )}, protein:${JSON.stringify(protein)}, fat:${JSON.stringify(fat)}`
        );

        setMacros({
          carbs: (carbohydrate?.value / 100) * portion.value * multiplier,
          protein: (protein?.value / 100) * portion.value * multiplier,
          fat: (fat?.value / 100) * portion.value * multiplier,
        });

        setMacroExtracted(true);
      }
    });
  }, [multiplier, portion]);

  useEffect(() => {
    nutrients.map((nutrient) => {
      if (nutrient.name == "Energy") {
        var kcalT = nutrient.nutrients?.filter(
          (innerNutrient) => innerNutrient?.slug == "energyKcal"
        )[0];
        const relativeKcal = (kcalT?.value / 100) * portion.value * multiplier;
        setKcal(relativeKcal);
        const carbKcal =
          ((macros.carbs * 4) / relativeKcal / 100) *
          portion.value *
          multiplier;
        const proteinKcal =
          ((macros.protein * 4) / relativeKcal / 100) *
          portion.value *
          multiplier;
        const fatKcal =
          ((macros.fat * 9) / relativeKcal / 100) * portion.value * multiplier;
        if (macroExtracted && (carbKcal > 0 || proteinKcal > 0 || fatKcal > 0))
          setSeries([carbKcal, proteinKcal, fatKcal]);
      }
    });
  }, [macros]);

  return (
    <View style={tw`flex flex-row my-5`}>
      <View style={tw`flex grow pr-10`}>
        <View style={tw`absolute z-10 py-8.5 px-8 w-33 `}>
          <Text style={tw`text-white text-xl text-center font-semibold`}>
            {decimalParser(kcal, 0)}
          </Text>
          <Text style={tw`text-white text-xl text-center font-light`}>
            Kcal
          </Text>
        </View>
        <RNPieChart
          widthAndHeight={widthAndHeight}
          series={series}
          sliceColor={sliceColor}
          doughnut={true}
          coverRadius={0.8}
          coverFill={"#18152D"}
        />
      </View>
      <View style={tw`flex grow`}>
        <View>
          <View style={tw`flex flex-row justify-between py-2`}>
            <View style={tw`flex flex-row`}>
              <View
                style={tw`flex bg-pichart-carbs h-6 w-6 rounded-full mr-3`}
              ></View>

              <Text
                style={tw`flex  grow  text-white text-left text-lg font-light`}
              >
                Carbs
              </Text>
            </View>
            <Text style={tw`flex  text-white text-center text-lg font-bold`}>
              {decimalParser(macros.carbs, 1)}g
            </Text>
          </View>
          <View style={tw`flex flex-row justify-between py-2`}>
            <View style={tw`flex flex-row`}>
              <View
                style={tw`flex bg-pichart-protein h-6 w-6 rounded-full mr-3`}
              ></View>

              <Text style={tw`flex   text-white text-left text-lg font-light`}>
                Protein
              </Text>
            </View>
            <Text style={tw`flex text-white text-center text-lg font-bold`}>
              {decimalParser(macros.protein, 1)}g
            </Text>
          </View>
          <View style={tw`flex flex-row justify-between py-2`}>
            <View style={tw`flex flex-row`}>
              <View
                style={tw`flex bg-pichart-fat h-6 w-6 rounded-full mr-3`}
              ></View>

              <Text style={tw`flex text-white text-left text-lg font-light`}>
                Fat
              </Text>
            </View>
            <Text style={tw`flex text-white text-center text-lg font-bold`}>
              {decimalParser(macros.fat, 1)}g
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default PieChart;
