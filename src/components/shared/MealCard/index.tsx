import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import CookieIcon from "../../icons/general/CookieIcon";
import DarkBowlFood from "../../icons/general/DarkBowlFood";
import tw from "../../../lib/tw";
import DateTimePicker from "react-native-modal-datetime-picker";
import { dateToHHMM, getTimeArrayFromStartString } from "../../../utils/date";
import { sortArrayByTime } from "../../../utils/generateRandomString";
import SvgTrash from "../../icons/general/Trash";
import { MealTemplate, Meal_Type } from "../../../generated/graphql";

interface Props {
  meal: MealTemplate;
  setMeals: React.Dispatch<React.SetStateAction<MealTemplate[]>>;
  index: number;
}

const MealCard: React.FC<Props> = ({ meal, setMeals, index }) => {
  const [name, setName] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [tempTime, setTempTime] = useState<string>("");
  const [openTimePicker, setOpenTimePicker] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollX, setScrollX] = React.useState(0);
  const screenWidth = Dimensions.get("window").width - 40;
  const handleScroll = (event: any) => {
    const currentScrollX = event.nativeEvent.contentOffset.x;
    if (currentScrollX < scrollX) {
      scrollViewRef.current?.scrollTo({ x: 0 });
    }
    setScrollX(event.nativeEvent.contentOffset.x);
  };
  const isSnack = meal.mealType === Meal_Type.Snack;

  const confirmTime = (value: Date) => {
    const matchTime = dateToHHMM(value);
    setOpenTimePicker(false);
    setTime(matchTime);
    setMeals((prev) => {
      let newMeals = [...prev];
      const foundMeal = newMeals.find((item) => item.id === meal.id);
      if (foundMeal) {
        foundMeal.time = matchTime;
      }
      return sortArrayByTime(newMeals);
    });
  };

  const showTimePicker = () => {
    setOpenTimePicker(true);
  };

  const onChangeText = (mealName: string) => {
    setName(mealName);
    setMeals((prev) =>
      prev.map((item) => (item.id === meal.id ? { ...item, mealName } : item))
    );
  };

  const onPressDeleteMeal = () => {
    scrollViewRef.current?.scrollTo({ x: 0 });
    setMeals((prev) => prev.filter((item) => item.id !== meal.id));
  };
  useEffect(() => {
    if (meal?.time) {
      setTime(meal?.time);
      setTempTime(meal?.time);
    } else {
      setTime("");
      setTempTime("");
    }
    if (meal?.mealName) {
      setName(meal.mealName);
    } else {
      setName("");
    }
  }, [meal?.time, meal?.mealName]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      ref={scrollViewRef}
      onScroll={handleScroll}
    >
      <View style={tw`flex-row `}>
        <View
          style={tw`flex-row p-4 justify-center items-center gap-2.5 shrink-0 self-stretch rounded-lg border-l-[3px] border-solid w-${
            screenWidth / 4
          } border-[${isSnack ? "#AED5ED" : "#359CEF"}] bg-background-300`}
        >
          {isSnack ? (
            <CookieIcon color={tw.color("white")} style={tw`w-6 h-6`} />
          ) : (
            <DarkBowlFood color={tw.color("white")} style={tw`w-6 h-6`} />
          )}
          <TextInput
            style={tw`text-white text-base font-poppins-medium py-0.5 mt-0.5 flex-1`}
            placeholder={`Add ${isSnack ? "Snack" : "Main"} Name`}
            placeholderTextColor={"grey"}
            value={name}
            onChangeText={onChangeText}
          />
          <TextInput
            style={tw`text-white text-base font-poppins-medium py-0.5 mt-0.5 pr-0.5 w-12 text-right`}
            placeholder="00:00"
            placeholderTextColor={"grey"}
            value={time}
            onPressIn={showTimePicker}
            showSoftInputOnFocus={false}
          />
          <DateTimePicker
            isVisible={openTimePicker}
            onConfirm={confirmTime}
            onCancel={() => setOpenTimePicker(false)}
            mode="time"
            date={
              new Date(
                new Date().setHours(
                  getTimeArrayFromStartString(time)[0],
                  getTimeArrayFromStartString(time)[1],
                  0,
                  0
                )
              )
            }
          />
        </View>
        <View style={tw`flex-row items-stretch items-center`}>
          <Pressable onPress={onPressDeleteMeal}>
            <View
              style={tw`flex-row items-center justify-center py-[5px] px-3 bg-red rounded-lg shadow w-15 h-15 ml-2.5`}
            >
              <View style={tw`w-6 h-6`}>
                <SvgTrash color={tw.color("white")} />
              </View>
            </View>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

export default MealCard;
