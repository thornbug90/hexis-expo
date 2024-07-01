import * as React from "react";
import { useState } from "react";
import {
  Animated,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
} from "react-native";

import { Carb_Code } from "../../generated/graphql";
import tw from "../../lib/tw";
import { basket } from "../../navigation/primary/screens/PrimaryStack_FoodTrackingScreen";
import decimalParser from "../../utils/decimalParser";

const LogBar = (props: any) => {
  const {
    navigationState,
    navigation,
    position,
    goTo,
    quantity,
    plannedMacros,
    loggedMacros,
    selectedTab,
    updateLogBars,
  } = props;
  const plannedKcals = plannedMacros.kcals;
  const plannedCarbs = plannedMacros.carbs;
  const kcalsBarLength = plannedKcals
    ? (loggedMacros.kcals / plannedKcals) * 0.5
    : loggedMacros.kcals;
  const kcalsBar = `${kcalsBarLength < 1 ? kcalsBarLength * 100 : 100}%`;
  const carbsBarLength = plannedCarbs
    ? (loggedMacros.carbs / plannedCarbs) * 0.5
    : loggedMacros.carbs;
  const carbsBar = `${carbsBarLength < 1 ? carbsBarLength * 100 : 100}%`;

  return (
    <View
      style={tw`flex flex-row bg-background-300 border-b-2 border-background-500 w-full`}
    >
      <TouchableOpacity
        onPress={() => {
          goTo("LogScreen", {});
        }}
      >
        <View
          style={tw`${"Log" === selectedTab ? "border-b border-white" : ""}`}
        >
          <View
            style={tw`flex h-13 w-17 flex-row justify-around items-center border-r-2 border-background-500 pr-2 `}
          >
            <View style={tw`pl-2 pr-1 justify-center`}>
              <Text style={tw`text-white text-xs`}>Log</Text>
            </View>
            {quantity > 0 && (
              <View
                style={tw`bg-background-green w-5 h-5 font-semibold p-0.5 rounded-full`}
              >
                <Text style={tw`text-white text-xs text-center font-semibold`}>
                  {quantity}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
      <ScrollView horizontal={true} style={tw``}>
        <View style={tw`flex flex-row justify-between `}>
          <View style={tw`w-78 flex-row`}>
            <View style={tw`mx-1 py-2 pl-1.5 w-18/40 mr-2`}>
              <View
                style={tw`flex flex-row mb-1 justify-between items-baseline`}
              >
                <Text style={tw`text-white text-xs`}>
                  {decimalParser(loggedMacros.kcals, 0)} kcal
                </Text>
                <Text style={tw`text-gray-200 text-xxs font-semibold`}>
                  {decimalParser(plannedMacros.kcals, 0)}
                </Text>
              </View>
              <View
                style={tw`flex flex-row w-full bg-background-500 h-3 rounded-sm justify-between`}
              >
                <View
                  style={[
                    { width: `${kcalsBar}` + "" },
                    tw`bg-pichart-carbs h-3 rounded-sm`,
                  ]}
                ></View>
                <View
                  style={[
                    { left: "50%", opacity: 0.7 },
                    tw` absolute border-l  border-white h-3`,
                  ]}
                ></View>
              </View>
            </View>
            <View style={tw`mx-1.5 py-2 w-18/40`}>
              <View
                style={tw`flex flex-row mb-1 justify-between items-baseline `}
              >
                <Text style={tw`text-white text-xs`}>
                  {decimalParser(loggedMacros.carbs, 0)}g Carbs
                </Text>
                <Text style={tw`text-gray-200  text-xxs font-semibold`}>
                  {decimalParser(plannedMacros.carbs, 0)}
                </Text>
              </View>
              <View
                style={tw`flex flex-row w-full bg-background-500 h-3 rounded-sm justify-between`}
              >
                <View
                  style={[
                    { width: carbsBar },
                    tw`bg-pichart-fat h-3 rounded-sm`,
                  ]}
                ></View>
                <View
                  style={[
                    { left: "50%", opacity: 0.7 },
                    tw` absolute border-l  border-white h-3`,
                  ]}
                ></View>
              </View>
            </View>
          </View>
          <View style={tw` py-2 flex flex-row justify-between ml-7 mr-3`}>
            <View style={tw`items-center mr-5`}>
              <Text style={tw`text-white font-bold  text-xs`}>CALORIES</Text>
              <Text style={tw`text-white font-bold`}>
                {decimalParser(loggedMacros.kcals, 0)}
              </Text>
            </View>
            <View style={tw`items-center mr-5`}>
              <Text style={tw`text-white font-bold text-xs`}>CARBS</Text>
              <Text style={tw`text-white font-bold  text-center`}>
                {decimalParser(loggedMacros.carbs, 0)}g
              </Text>
            </View>
            <View style={tw`items-center mr-5`}>
              <Text style={tw`text-white font-bold text-xs`}>PROTEIN</Text>
              <Text style={tw`text-white font-bold text-center`}>
                {decimalParser(loggedMacros.protein, 0)}g
              </Text>
            </View>
            <View style={tw`items-center mr-5`}>
              <Text style={tw`text-white font-bold text-xs`}>FAT</Text>
              <Text style={tw`text-white font-bold text-center `}>
                {decimalParser(loggedMacros.fat, 0)}g
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default LogBar;
