import { useState } from "react";
import { View, Text, Pressable, TouchableOpacity } from "react-native";
import tw from "../../lib/tw";
import { CancelIcon, PlusIcon } from "../icons/general";
import TextInput from "../shared/TextInput";
import Button from "../shared/Button";

type Props = {
  quantity: number;
  screen: "search" | "log";
  addFoodItem: Function;
  removeFoodItem: Function;
  view: "detail" | "minimal";
};

const ItemActions: React.FC<Props> = ({
  quantity,
  screen,
  addFoodItem,
  removeFoodItem,
  view = "minimal",
}) => {
  return (
    <View style={tw`flex flex-row justify-end`}>
      {view == "minimal" && screen == "search" && (
        <TouchableOpacity
          onPress={() => {
            addFoodItem();
          }}
          style={tw`p-3`}
        >
          <View
            style={tw`bg-background-300  w-8 h-8 font-semibold items-center p-1.75 rounded-full mr-2`}
          >
            <View style={tw`h-4.5 w-4.5`}>
              <PlusIcon color={tw.color("white")}></PlusIcon>
            </View>
          </View>
        </TouchableOpacity>
      )}
      {view == "minimal" && screen == "log" && (
        <TouchableOpacity
          onPress={() => {
            removeFoodItem();
          }}
          style={tw`p-3`}
        >
          <View
            style={tw`bg-background-red text-sm w-8 h-8 font-semibold p-1.5 items-center p-1 rounded-full mr-2`}
          >
            <View style={tw`h-6 w-6`}>
              <CancelIcon color={tw.color("white")}></CancelIcon>
            </View>
          </View>
        </TouchableOpacity>
      )}
      {view == "detail" && screen != "log" && (
        <Button
          label="Add"
          variant="secondary2"
          padding={true}
          size="small"
          onPress={addFoodItem}
        ></Button>
      )}
    </View>
  );
};

export default ItemActions;
