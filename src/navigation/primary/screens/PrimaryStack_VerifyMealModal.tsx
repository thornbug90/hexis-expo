import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableWithoutFeedback,
} from "react-native";
import { useAnalytics } from "@segment/analytics-react-native";
import { set } from "date-fns";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import Button from "../../../components/shared/Button";
import CarbCodeButtonGroup from "../../../components/shared/CarbCodeButtonGroup";
import DateTimeTextInput from "../../../components/shared/DateTimeTextInput";
import TextInput from "../../../components/shared/TextInput";
import { Carb_Code } from "../../../generated/graphql";
import useAppDate from "../../../hooks/useAppDate";
import useVerifyMeal from "../../../hooks/useVerifyMeal";
import tw from "../../../lib/tw";
import {
  getLiteralDate,
  getLiteralDateString,
  getLiteralTime,
  serializeTime,
  setLiteralDateTime,
} from "../../../utils/date";
import { convertMealName } from "../../../utils/enumNames";
import { PrimaryStackParamsList } from "../PrimaryStack";

type Props = NativeStackScreenProps<
  PrimaryStackParamsList,
  "PrimaryStack_VerifyMealModal"
>;

const PrimaryStack_VerifyMealModal: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { track } = useAnalytics();
  const { verifyMeal, updateVerifyMeal } = useVerifyMeal();
  const [appDate] = useAppDate();

  useEffect(() => {
    if (!route.params.mealVerification) {
      const { energy, carbCode, time } = route.params.meal;

      setMealVerification({
        time: setLiteralDateTime(time, appDate),
        kcal: energy ? energy.toFixed(0) : "0",
        carbCode,
      });
      time;
    }

    if (
      route.params.mealVerification &&
      route.params.mealVerification.skipped
    ) {
      const { time } = route.params.meal;
      const { id } = route.params.mealVerification;

      setMealVerification({
        id,
        time: setLiteralDateTime(time, appDate),
        carbCode: Carb_Code.Low,
        kcal: "0",
      });
    }

    if (
      route.params.mealVerification &&
      !route.params.mealVerification.skipped
    ) {
      const { time, id, carbCode, energy } = route.params.mealVerification;

      setMealVerification({
        id,
        time: new Date(time),
        kcal: energy!.toString(),
        carbCode: carbCode!,
      });
    }
  }, [route]);

  const onSkipMeal = async () => {
    if (mealVerification.id) {
      updateVerifyMeal({
        id: mealVerification.id,
        input: {
          kcal: null,
          skipped: true,
          time: mealVerification.time,
          carbCode: null,
        },
      });
    } else {
      verifyMeal({
        input: {
          kcal: null,
          skipped: true,
          time: mealVerification.time,
          carbCode: null,
        },
      });
    }

    track("MEAL_VERIFIED", {
      kcal: undefined,
      skipped: true,
      actualCarbCode: undefined,
      expectedCarbCode: route.params.meal.carbCode,
    });

    navigation.goBack();
  };

  const onVerifyMeal = () => {
    if (mealVerification.id) {
      updateVerifyMeal({
        id: mealVerification.id,
        input: {
          kcal: Number(mealVerification.kcal),
          skipped: false,
          time: mealVerification.time,
          carbCode: mealVerification.carbCode,
        },
      });
    } else {
      verifyMeal({
        input: {
          kcal: Number(mealVerification.kcal),
          skipped: false,
          time: mealVerification.time,
          carbCode: mealVerification.carbCode,
          mealNutritionId: route.params.meal.id,
        },
      });
    }

    track("MEAL_VERIFIED", {
      time: mealVerification.time as any,
      kcal: mealVerification.kcal,
      skipped: false,
      actualCarbCode: mealVerification.carbCode,
      expectedCarbCode: route.params.meal.carbCode,
    });

    navigation.goBack();
  };

  const [mealVerification, setMealVerification] = useState<{
    id?: string;
    time: Date;
    carbCode?: Carb_Code;
    kcal?: string;
  }>({
    time: new Date(),
    carbCode: Carb_Code.Low,
    kcal: "0",
  });

  return (
    <SafeAreaView style={tw`flex-1`}>
      <TouchableWithoutFeedback style={{ flex: 1 }} onPress={navigation.goBack}>
        <View
          style={{
            ...tw`flex-1 justify-end`,
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <TouchableWithoutFeedback
            onPress={(e) => {
              e.stopPropagation();
            }}
          >
            <KeyboardAwareScrollView
              contentContainerStyle={{ flex: 1, justifyContent: "flex-end" }}
            >
              <View
                style={tw`mx-4 mb-4 p-4 bg-background-300 rounded-lg shadow`}
              >
                <View
                  style={tw`mb-4 border-b border-background-100 flex-row items-center justify-between`}
                >
                  <Text style={tw`text-white font-poppins-semibold text-lg`}>
                    Verify {route.params.meal.mealName!}
                  </Text>
                  <Button
                    onPress={onSkipMeal}
                    style="mb-0"
                    label="Skip meal"
                    variant="ghost"
                  />
                </View>
                <View style={tw`flex-row`}>
                  <View style={tw`flex-1 mr-2`}>
                    <TextInput
                      rightText="kcal"
                      keyboardType="numeric"
                      returnKeyType="done"
                      onChangeText={(text) =>
                        setMealVerification({ ...mealVerification, kcal: text })
                      }
                      value={mealVerification.kcal}
                      label="Calories"
                    />
                  </View>
                  <View style={tw`flex-1 ml-2`}>
                    <DateTimeTextInput
                      label="Time"
                      mode="time"
                      value={set(getLiteralDate(mealVerification.time), {
                        hours: +getLiteralTime(mealVerification.time).split(
                          ":"
                        )[0],
                        minutes: +getLiteralTime(mealVerification.time).split(
                          ":"
                        )[1],
                      })}
                      onChange={(time) => {
                        setMealVerification({
                          ...mealVerification,
                          time: setLiteralDateTime(
                            serializeTime(time),
                            appDate
                          ),
                        });
                      }}
                    />
                  </View>
                </View>
                <View>
                  <CarbCodeButtonGroup
                    size="small"
                    value={mealVerification.carbCode}
                    onPress={(carbCode) =>
                      setMealVerification({ ...mealVerification, carbCode })
                    }
                  />
                </View>
                <View style={tw`flex-row items-center`}>
                  <View style={tw`flex-1 mr-2`}>
                    <Button
                      size="small"
                      label="Cancel"
                      variant="secondary"
                      onPress={navigation.goBack}
                    />
                  </View>
                  <View style={tw`flex-1 ml-2`}>
                    <Button
                      size="small"
                      label="Save"
                      variant="primary"
                      onPress={onVerifyMeal}
                    />
                  </View>
                </View>
              </View>
            </KeyboardAwareScrollView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default PrimaryStack_VerifyMealModal;
