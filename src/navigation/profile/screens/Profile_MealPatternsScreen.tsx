import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import Loading from "../../../components/shared/LoadingScreen";
import Wrapper from "../../../components/shared/Wrapper";
import {
  Day_Names,
  MealTemplate,
  Meal_Sub_Type,
  Meal_Type,
  useUpdateMealplanMutation,
  useUserQuery,
} from "../../../generated/graphql";
import useUser from "../../../hooks/useUser";
import tw from "../../../lib/tw";
import { ProfileStackParamsList } from "../ProfileStack";
import MealCard from "../../../components/shared/MealCard";
import { sortArrayByTime } from "../../../utils/generateRandomString";
import CookieIcon from "../../../components/icons/general/CookieIcon";
import DarkBowlFood from "../../../components/icons/general/DarkBowlFood";
import IconButton from "../../../components/shared/IconButton";
import SvgChevronLeft from "../../../components/icons/general/ChevronLeft";
import client from "../../../lib/graphql";
import { formatTimeHourMinute } from "../../../utils/date";

type Props = NativeStackScreenProps<
  ProfileStackParamsList,
  "Profile_MealPatternsScreen"
>;

const Profile_MealPatternsScreen: React.FC<Props> = ({ navigation }) => {
  const [day, setDay] = useState(0);
  const { data: user, isLoading, refetch, isRefetching } = useUserQuery(client);
  const { mutate: updateMealPlan } = useUpdateMealplanMutation(client);
  const [mealPlan, setMealPlan] = useState([] as MealTemplate[]);
  const days = [
    Day_Names.Monday,
    Day_Names.Tuesday,
    Day_Names.Wednesday,
    Day_Names.Thursday,
    Day_Names.Friday,
    Day_Names.Saturday,
    Day_Names.Sunday,
  ];

  const dayMealPlan = mealPlan?.filter((meal) => meal.dayName === days[day]);

  const saveMealPlan = () => {
    setMealPlan((prev) => {
      const updateMealPlanInput = prev
        ?.filter((item) => item.time !== "00:00")
        ?.map((meal) => ({
          dayName: meal.dayName,
          mealName: meal.mealName,
          mealType: meal.mealType,
          time: `${meal.time}:00.000Z`,
          mealSubType: meal.mealSubType,
        }));

      updateMealPlan({
        input: {
          meals: updateMealPlanInput,
        },
        clientId: user?.user?.id,
      });

      return prev;
    });
    refetch?.();
  };
  useEffect(() => {
    if (user?.user?.id && !isLoading && !isRefetching) {
      setMealPlan((prev) => {
        return sortArrayByTime(
          user.user?.mealplan?.meals?.map((meal) => ({
            ...meal,
            time: formatTimeHourMinute(meal?.time),
          })) || []
        );
      });
    }
  }, [user?.user?.id, isLoading || isRefetching]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <View>
          <IconButton
            Icon={SvgChevronLeft}
            onPress={() => navigation.goBack()}
            variant="transparent"
            size="xsmall"
            style={`bg-background-500 flex mb-0 px-[10px]`}
          />
        </View>
      ),
    });
  }, []);
  useEffect(() => {
    return () => {
      saveMealPlan();
    };
  }, []);
  const addEmptyMeal = useCallback(
    (mealType: Meal_Type) => {
      setMealPlan((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          dayName: days[day],
          mealType,
          mealName: "",
          time: "00:00",
          mealplanId: "",
          mealSubType: Meal_Sub_Type.Unspecified,
        },
      ]);
    },
    [day, setMealPlan]
  );
  const DaysButton: React.FC = () => {
    const days = ["M", "T", "W", "T", "F", "S", "S"];
    return (
      <View style={tw`flex-row items-center gap-2`}>
        {days.map((d, index) => (
          <Pressable
            key={index}
            style={tw`p-2 flex-row justify-center items-center flex-1 border-[1px] rounded-md ${
              index === day
                ? "bg-pichart-carbs border-pichart-carbs"
                : "bg-background-500 opacity-30 border-almostWhite"
            }`}
            onPress={() => setDay(index)}
          >
            <Text
              style={[
                tw`text-base font-poppins-regular tracking-[0.25px] text-gray-100`,
              ]}
            >
              {d}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  };
  if (isLoading || isRefetching) return <Loading />;

  return (
    <Wrapper>
      <ScrollView>
        <View style={tw`mx-5 flex-1`}>
          <View style={tw`flex-row justify-between pt-6`}>
            <Text
              style={tw`text-xs font-poppins-regular tracking-[0.25px] text-gray-200`}
            >
              Days
            </Text>
            <Text
              style={tw`text-xs font-poppins-regular tracking-[0.25px] text-gray-200`}
            >
              Pick a day to edit the meal pattern
            </Text>
          </View>
          <View style={tw`flex-row items-center mt-2 mb-6`}>
            <DaysButton />
          </View>
          <View style={tw`pb-9`}>
            <View style={tw`gap-y-3`}>
              {dayMealPlan?.map((meal, index) => (
                <MealCard
                  key={index}
                  index={index}
                  meal={meal}
                  setMeals={setMealPlan}
                />
              ))}
            </View>
          </View>
          <View style={tw`flex-row gap-3`}>
            <Pressable
              style={tw`flex-row p-2 justify-center items-center gap-2.5 flex-1 border-[1px] rounded-lg border-pichart-carbs`}
              onPress={() => addEmptyMeal(Meal_Type.Main)}
            >
              <View style={tw`flex-row gap-3 items-center`}>
                <DarkBowlFood color={tw.color("white")} style={tw`w-6 h-6`} />
                <Text
                  style={tw`text-white text-base font-poppins-regular py-0.5 mt-0.5`}
                >
                  Add Main
                </Text>
              </View>
            </Pressable>
            <Pressable
              style={tw`flex-row p-2 justify-center items-center gap-2.5 flex-1 border-[1px] rounded-lg border-pichart-carbs`}
              onPress={() => addEmptyMeal(Meal_Type.Snack)}
            >
              <View style={tw`flex-row gap-3 items-center`}>
                <CookieIcon color={tw.color("white")} style={tw`w-6 h-6`} />
                <Text
                  style={tw`text-white text-base font-poppins-regular py-0.5 mt-0.5`}
                >
                  Add Snack
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>
      {/* <View
        style={tw`absolute bottom-6 left-0 right-0 flex-row justify-center`}
      >
        <Pressable
          style={tw`flex-row justify-center items-center py-[10px] px-[30px] gap-[10px] rounded-full bg-[#4E4B66]`}
        >
          <Text
            style={tw`font-poppins-medium font-xs tracking-[0.5px] text-almostWhite`}
          >
            Copy Meal Pattern
          </Text>
        </Pressable>
      </View> */}
    </Wrapper>
  );
};

export default Profile_MealPatternsScreen;
