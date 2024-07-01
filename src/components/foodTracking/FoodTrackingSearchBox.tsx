import React from "react";
import { View, Text, Pressable } from "react-native";
import tw from "../../lib/tw";
import { CancelIcon } from "../icons/general";
import { PlusLinesIcon } from "../icons/general";
import TextInput from "../shared/TextInput";
import IconButton from "../shared/IconButton";
import SvgMagnifierIcon from "../icons/general/MagnifierIcon";
import { useState } from "react";
import useNutriticsSearch from "../../hooks/useNutriticsSearch";
import { Meal_Name, Nutritics_Obj_Type } from "../../generated/graphql";

type Props = {
  mealName?: string;
  goBack?: Function;
  search: Function;
  nav;
  goTo: Function;
  mealSlot: Meal_Name;
};

const SearchBox: React.FC<Props> = ({ mealSlot, nav, goTo }) => {
  const [keywords, setKeywords] = useState<string>();
  const onSearchSubmitted = (searchTextObj: Object) => {
    setKeywords(searchTextObj.nativeEvent.text);
    nav.jumpTo("SearchScreen", { keywords: searchTextObj.nativeEvent.text });
  };
  const { refetch } = useNutriticsSearch(
    "",
    Nutritics_Obj_Type.Food,
    true,
    mealSlot
  );

  const resetSearchResults = () => {
    setKeywords("");
    //search("");
    nav.jumpTo("SearchScreen", { keywords: "" });
  };

  const openQuickAdd = () => {
    goTo("FoodTrackingStack_QuickAddScreen", {
      goToMyFood: () => {
        refetch();
        nav.jumpTo("MyFoodScreen", {
          keywords: " ",
        });
      },
    });
  };

  return (
    <View
      style={tw`pr-3 pl-3 pt-3 border-b-2 border-background-500 bg-background-300 flex flex-row`}
    >
      <View style={tw`flex-initial w-14 mr-2`}>
        <IconButton
          Icon={PlusLinesIcon}
          onPress={openQuickAdd}
          variant="dark"
        />
      </View>
      <View style={tw` flex-none w-60 grow mr-2`}>
        <TextInput
          value={keywords}
          onChangeText={setKeywords}
          Icon={SvgMagnifierIcon}
          iconPosition="left"
          bgColor="bg-background-500"
          returnKeyType="search"
          onSubmitEditing={onSearchSubmitted}
        />
      </View>
      <View style={tw`flex-initial w-14`}>
        <IconButton
          Icon={CancelIcon}
          onPress={resetSearchResults}
          variant="dark"
        />
      </View>
    </View>
  );
};

export default SearchBox;
