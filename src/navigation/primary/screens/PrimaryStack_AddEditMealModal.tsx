import {
  View,
  TouchableWithoutFeedback,
  Text,
  TextInput,
  Pressable,
  StatusBar,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import tw from "../../../lib/tw";
import Button from "../../../components/shared/Button";
import { CancelIcon } from "../../../components/icons/general";
import { PrimaryStackParamsList } from "../PrimaryStack";
import CookieIcon from "../../../components/icons/general/CookieIcon";
import DarkBowlFood from "../../../components/icons/general/DarkBowlFood";
import {
  dateToHHMM,
  formatTimeHourMinute,
  getTimeArrayFromStartString,
} from "../../../utils/date";
import DateTimePicker from "react-native-modal-datetime-picker";
import {
  Meal_Type,
  useAddMealMutation,
  useUpdateMealMutation,
} from "../../../generated/graphql";
import client from "../../../lib/graphql";
import { useAtomValue } from "jotai";
import { dayIdAtom } from "../../../store";
import { dayRefetch } from "./PrimaryStack_CarbCodesScreen";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type Props = NativeStackScreenProps<
  PrimaryStackParamsList,
  "PrimaryStack_AddEditMealModal"
>;

const PrimaryStack_AddEditMealModal: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { mutate: addMeal, isLoading } = useAddMealMutation(client, {
    onSuccess: () => {
      dayRefetch();
      navigation.goBack();
    },
  });
  const { mutate: updateMeal, isLoading: isUpdateLoading } =
    useUpdateMealMutation(client, {
      onSuccess: () => {
        dayRefetch();
        navigation.goBack();
      },
    });
  const dayId = useAtomValue(dayIdAtom);
  const [isSnack, setIsSnack] = useState<boolean>(false);
  const [time, setTime] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [openTimePicker, setOpenTimePicker] = useState<boolean>(false);
  const isDisabled = time === "";
  const onCancel = () => {
    navigation.goBack();
  };
  const setMealName = (text: string) => {
    setName(text);
  };
  const showTimePicker = () => {
    setOpenTimePicker(true);
  };
  const confirmTime = (value: Date) => {
    setOpenTimePicker(false);
    setTime(dateToHHMM(value));
  };

  const saveMeal = () => {
    const input = {
      mealName: name ?? "",
      time: `${time}:00.000Z`,
      mealType: isSnack ? Meal_Type.Snack : Meal_Type.Main,
      dayId: dayId ?? "",
    };

    if (route.params?.id) {
      console.log({
        updateMealId: route.params.id,
        input,
      });
      updateMeal({
        updateMealId: route.params.id,
        input,
      });
    } else {
      addMeal({ input });
    }
  };

  useEffect(() => {
    if (route.params?.id) {
      const HHMMTime = formatTimeHourMinute(route.params.time || "");
      const title = `${route.params?.id ? "Edit" : "Add"} ${
        route.params.mealType === Meal_Type.Snack ? "Snack" : "Main"
      }`;
      setIsSnack(route.params.mealType === Meal_Type.Snack);
      setTitle(title);
      setTime(HHMMTime);
    } else {
      setTitle("Add Main or Snack");
      setTime(dateToHHMM(new Date()));
    }
    if (route.params?.name) {
      setName(route.params.name);
    }
  }, [route.params?.time, route.params?.name, route.params?.id]);
  return (
    <KeyboardAwareScrollView
      contentContainerStyle={tw`flex-grow`}
      resetScrollToCoords={{ x: 0, y: 20 }}
      scrollEnabled={true}
    >
      <SafeAreaView style={tw`bg-black/70 flex-1 flex-row items-end`}>
        <View style={[tw`w-full`]}>
          <TouchableWithoutFeedback onPress={onCancel}>
            <View
              style={tw`absolute top--8 self-center mt-1 rounded-full z-10`}
            >
              <View style={tw`p-3 self-center bg-activeblue-100 rounded-full`}>
                <View style={tw`h-8 w-8`}>
                  <CancelIcon color={tw.color("white")} />
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
          <View
            style={[
              tw`rounded-xl bg-background-500 px-4 relative justify-center items-center gap-y-5`,
              { height: route.params?.id ? 260 : 340 },
            ]}
          >
            <View style={tw`w-full py-8 absolute top-0 gap-y-6`}>
              <View style={tw`w-full py-1 items-center mt-3`}>
                <Text
                  style={tw`text-white p-0.5 text-20 font-poppins-semibold leading-[26px]`}
                >
                  {title}
                </Text>
              </View>
              {!route.params?.id && (
                <View style={tw`flex-row`}>
                  <Pressable
                    onPress={() => setIsSnack(false)}
                    style={tw`flex-row p-2 justify-center items-center gap-2.5 flex-1 border-[1.5px] rounded-l-lg border-pichart-carbs ${
                      isSnack ? "" : "bg-pichart-carbs"
                    }`}
                  >
                    <View style={tw`flex-row gap-2 items-center`}>
                      <DarkBowlFood
                        color={tw.color("white")}
                        style={tw`w-6 h-6`}
                      />
                      <Text
                        style={tw`text-white text-base font-poppins-medium py-0.5 mt-0.5`}
                      >
                        Add Main
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={() => setIsSnack(true)}
                    style={tw`flex-row p-2 justify-center items-center gap-2.5 flex-1 border-[1.5px] rounded-r-lg border-pichart-carbs ${
                      isSnack ? "bg-pichart-carbs" : ""
                    }`}
                  >
                    <View style={tw`flex-row gap-2 items-center`}>
                      <CookieIcon
                        color={tw.color("white")}
                        style={tw`w-6 h-6`}
                      />
                      <Text
                        style={tw`text-white text-base font-poppins-medium py-0.5 mt-0.5`}
                      >
                        Add Snack
                      </Text>
                    </View>
                  </Pressable>
                </View>
              )}
              <View
                style={tw`flex-row p-4 justify-center items-center gap-2.5 shrink-0 self-stretch rounded-lg border-l-[3px] border-solid ${
                  isSnack ? "border-[#AED5ED]" : "border-activeblue-100"
                }  bg-background-300`}
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
                  onChangeText={setMealName}
                  keyboardType="default"
                  returnKeyType="next"
                  onSubmitEditing={showTimePicker}
                />
                <TextInput
                  style={tw`text-white text-base font-poppins-medium py-0.5 mt-0.5 pr-0.5 w-12`}
                  placeholder="00:00"
                  placeholderTextColor={"grey"}
                  value={time}
                  onPressIn={showTimePicker}
                  showSoftInputOnFocus={false}
                />
              </View>
              <Button
                size="small"
                label={`${route.params?.id ? "Update" : "Add"} ${
                  isSnack ? "Snack" : "Main"
                }`}
                onPress={saveMeal}
                loading={isLoading || isUpdateLoading}
                disabled={isDisabled}
              />
            </View>
          </View>
          <DateTimePicker
            isVisible={openTimePicker}
            onConfirm={confirmTime}
            onCancel={() => setOpenTimePicker(false)}
            mode="time"
            is24Hour
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
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
};

export default PrimaryStack_AddEditMealModal;
