import { isBefore } from "date-fns";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  TouchableWithoutFeedback,
  Text,
  ActivityIndicator,
  Pressable,
  Image,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
  ScrollView,
} from "react-native";
import {
  CarbRanges,
  Carb_Code,
  IntraFuellingRecommendation,
  Meal,
  MealVerification,
  Meal_Name,
  Workout,
  Workout_Intensity,
  Workout_Source,
  Workout_Status,
} from "../../generated/graphql";
import activities from "../../lib/activities";
import tw from "../../lib/tw";
import {
  getLiteralDate,
  getLiteralTime,
  getOrdinalSuffix,
} from "../../utils/date";
import {
  HardIntensityIcon,
  KeyPerformanceIcon,
  LightIntensityIcon,
  ModerateIntensityIcon,
  RecurringIcon,
  TrophyIcon,
  TickIcon,
  WearableWithDottedCircleIcon,
  WearableWithCircleIcon,
  BatteryChargingIcon,
  PlusIcon,
  WearableIcon,
} from "../icons/general";
import currency from "currency.js";
import WearableBlueIcon from "../icons/general/WearableBlueIcon";
import {
  isActualWorkout,
  isCompletedWorkout,
  isIncompletedWorkout,
  isPlannedWorkout,
  isWearableWorkout,
} from "../../utils/plannedCompletedWorkout";
import integrationIcons, { IIntergrationIcon } from "../../lib/integrations";
import { getImage } from "../../utils/getImage";
import useWearableSources from "../../hooks/useWearableSources";
import WhiteIcon from "../icons/general/WhiteIcon";
//import { ScrollView } from "react-native-gesture-handler";
import SvgTrash from "../icons/general/Trash";
import WearableConfirmedIcon from "../icons/general/WearableConfirmedIcon";
import QuestionIcon from "../icons/general/QuestionIcon";
import useUser from "../../hooks/useUser";
import { intensityBarIcons } from "../../lib/intensity";

type Props = {
  onPress?: () => void;
  disabled?: boolean;
  workout: Workout;
  ranges?: CarbRanges | null;
  checkBox?: boolean;
  activeWorkout?: boolean;
  loading?: boolean;
  onCheckBoxPress?: () => void;
  intraFuellingRecommendations?: IntraFuellingRecommendation;
  setWaitingSubScreen: Function;
  setClickedIntraPromptWorkout: Function;
  clickedIntraPromptWorkout: string[];
};

const WorkoutCard: React.FC<Props> = ({
  onPress,
  workout,
  ranges,
  disabled = false,
  checkBox = false,
  onCheckBoxPress,
  activeWorkout = false,
  loading = false,
  intraFuellingRecommendations,
  setWaitingSubScreen,
  setClickedIntraPromptWorkout,
  clickedIntraPromptWorkout,
}) => {
  const { icon: Icon, name = null } =
    activities?.[workout?.activity?.id as keyof typeof activities];
  const navigation = useNavigation();
  const { data: wearableSources } = useWearableSources();
  const { user } = useUser();
  const [isShowWorkout, setIsShowWorkout] = useState(true);

  const getTimeDifference = (date1: string, date2: string) => {
    let [hours, minutes] = date1.split("T")[1].slice(0, 8).split(":");

    let [hours1, minutes1] = date2.split("T")[1].slice(0, 8).split(":");

    let minDiff = (Number(minutes) - Number(minutes1)) / 60;

    let hourDiff = Number(hours) - Number(hours1);

    return Math.abs(minDiff + hourDiff);
  };

  const timeDifference = getTimeDifference(workout?.start, workout?.end);
  const normalWidth = Dimensions.get("window").width / 4.4;
  const incompleteWidth = Dimensions.get("window").width / 5.2;
  const isCarbsPerHour = intraFuellingRecommendations?.unit === "g/hr";
  const wearableIcon = integrationIcons.find(
    (item: IIntergrationIcon) => item.source === workout?.source
  );
  const IntensityIcon = intensityBarIcons.find(
    (icon) => workout?.intensityRPE! < icon.max
  )?.Icon;
  const meal = {
    carbCode: Carb_Code.Unspecified,
    slot: Meal_Name.IntraFuelling,
    kcalSuggested: intraFuellingRecommendations?.energy,
    mealVerification: workout.intraFuellingMeal?.mealVerification,
  };

  const scrollViewRef = React.useRef<ScrollView>(null);
  const [maxScroll, setMaxScroll] = useState(0);

  let scrollX = 0;
  const screenWidth = Dimensions.get("window").width;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollX = e.nativeEvent.contentOffset.x;
  };

  const handleContentSizeChange = (contentWidth: number) => {
    // calculate the maximum scrollable limit
    const maxScroll = contentWidth - Dimensions.get("window").width;

    setMaxScroll(maxScroll);
  };

  const handleScrollRelease = () => {
    if (scrollX > 250) {
      scrollViewRef.current?.scrollTo({ x: 1.5 * screenWidth });
      onCheckBoxPress?.();
      setIsShowWorkout(false);
    } else if (scrollX > 100 && scrollX <= screenWidth) {
      scrollViewRef.current?.scrollTo({ x: 250 });
    } else if (scrollX > 20 && scrollX <= 100) {
      scrollViewRef.current?.scrollTo({ x: 45 });
    } else if (scrollX <= 20) {
      scrollViewRef.current?.scrollTo({ x: 0 });
    }
  };
  const correspondingBetweenTimes = (
    time1: Date | string,
    time2: Date | string
  ) => {
    return (
      new Date(time1)?.getHours() === new Date(time2)?.getHours() &&
      new Date(time1)?.getMinutes() === new Date(time2)?.getMinutes()
    );
  };

  useEffect(() => {
    if (checkBox) {
      setIsShowWorkout(true);
    }
  }, [checkBox, workout?.status]);
  const intraFuellingMeal = workout.intraFuellingMeal;
  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal={checkBox}
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={handleScrollRelease}
      onContentSizeChange={handleContentSizeChange}
      onScroll={handleScroll}
    >
      {isShowWorkout && (
        <View style={tw`flex flex-row gap-x-2`}>
          {!workout?.intraFuelling &&
            workout?.intraFuellingPrompt &&
            !checkBox &&
            workout?.status !== Workout_Status.Incomplete && (
              <Pressable
                onPress={() => {
                  if (
                    !clickedIntraPromptWorkout?.includes(workout?.id) &&
                    workout?.source === Workout_Source.User
                  )
                    setClickedIntraPromptWorkout([
                      ...clickedIntraPromptWorkout,
                      workout?.id,
                    ]);
                  navigation.navigate("PrimaryStack_FuelingStrategyModal", {
                    workout: workout,
                    intraFuellingRecommendations: intraFuellingRecommendations,
                  });
                }}
                style={{
                  ...tw`bg-background-300 border border-red rounded-lg shadow w-10 mb-3 items-center justify-center`,
                }}
              >
                <View style={tw`w-5 h-5 flex items-center justify-center`}>
                  <BatteryChargingIcon
                    color={true ? tw.color("red") : tw.color("gray-300")}
                  />
                </View>
              </Pressable>
            )}

          {!workout?.intraFuelling &&
            !workout?.intraFuellingPrompt &&
            !checkBox &&
            workout?.status !== Workout_Status.Incomplete && (
              <Pressable
                onPress={() =>
                  navigation.navigate("PrimaryStack_FuelingStrategyModal", {
                    workout: workout,
                    intraFuellingRecommendations: intraFuellingRecommendations,
                  })
                }
                style={{
                  ...tw`bg-background-300 rounded-lg shadow w-10 mb-3 items-center justify-center border border-gray-300`,
                }}
              >
                <View style={tw`w-3 h-6 flex items-center justify-center `}>
                  <BatteryChargingIcon color={tw.color("gray-300")} />
                </View>
              </Pressable>
            )}
          {workout?.status === Workout_Status.Incomplete && (
            <Pressable
              onPress={onPress}
              style={tw` flex-row w-[50px] justify-center items-center self-stretch mb-3 rounded-lg border border-[1.5px] border-red bg-[#F39EAD]`}
            >
              <QuestionIcon color={tw.color("white")} />
            </Pressable>
          )}
          <View
            style={tw`flex grow w-${
              checkBox
                ? workout?.status === Workout_Status.Incomplete
                  ? incompleteWidth
                  : normalWidth
                : 1
            }`}
          >
            <TouchableWithoutFeedback disabled={disabled} onPress={onPress}>
              <View style={tw`flex-row rounded-xl justify-between`}>
                <View
                  style={tw.style([
                    `flex-col grow mb-3 bg-background-300 py-3 px-3 rounded-l-xl gap-3 overflow-hidden`,
                  ])}
                >
                  {/* <View style={tw`flex py-1 flex-col gap-3 `}> */}
                  <View
                    style={tw`flex flex-row items-center gap-2 self-stretch`}
                  >
                    <View style={tw`w-6 h-6`}>
                      {Icon && (
                        <Icon
                          color={tw.color("activeblue-100")}
                          width={24}
                          height={24}
                        />
                      )}
                    </View>
                    <Text
                      style={tw`w-1 grow font-poppins-medium text-white text-base tracking-wide`}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {workout?.title}
                    </Text>
                    {wearableIcon && (
                      <View>
                        <Image
                          source={getImage(
                            wearableSources?.find(
                              (item) => item?.name === wearableIcon?.name
                            ),
                            wearableIcon?.icon ?? null
                          )}
                          style={tw`w-6 h-6 rounded`}
                        />
                      </View>
                    )}
                  </View>
                  {workout?.description && (
                    <View style={tw`overflow-hidden flex-row flex`}>
                      <Text
                        style={tw`text-xs tracking-wide grow w-1 font-poppins-regular self-stretch text-white`}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {workout?.description}
                      </Text>
                    </View>
                  )}
                  <View style={tw`w-full`}>
                    <View
                      style={tw`flex gap-2 flex-row mt-1 pr-1 items-center justify-between`}
                    >
                      <Text
                        style={tw`self-end font-poppins-medium text-white text-xxs pr-2 `}
                      >
                        {isIncompletedWorkout(workout) && (
                          <>
                            <Text>
                              {getOrdinalSuffix(
                                workout?.start,
                                user?.timezone ?? "UTC"
                              )}
                              {"   "}
                            </Text>
                            {workout?.startTime && (
                              <>
                                <WhiteIcon />
                                <Text>{"  "}</Text>
                              </>
                            )}
                          </>
                        )}
                        {((isWearableWorkout(workout) && workout?.startTime) ||
                          !isWearableWorkout(workout)) &&
                          !correspondingBetweenTimes(
                            workout?.start,
                            workout?.end
                          ) && (
                            <>
                              <Text>
                                {" "}
                                {isBefore(
                                  getLiteralDate(workout?.start),
                                  new Date("2022-07-04")
                                ) ||
                                  getLiteralTime(new Date(workout?.start))}{" "}
                              </Text>
                              -
                              <Text>
                                {" "}
                                {isBefore(
                                  getLiteralDate(workout?.end),
                                  new Date("2022-07-04")
                                ) ||
                                  getLiteralTime(new Date(workout?.end))}{" "}
                              </Text>
                            </>
                          )}
                      </Text>
                      <View style={tw`flex flex-row grow justify-end`}>
                        {workout?.key ? (
                          <View style={tw`w-3 h-3.5 ml-2`}>
                            <KeyPerformanceIcon color={tw.color("white")} />
                          </View>
                        ) : null}

                        {workout?.competition ? (
                          <View style={tw`w-3 h-3.5 ml-2`}>
                            <TrophyIcon color={tw.color("white")} />
                          </View>
                        ) : null}

                        {workout?.recurring ? (
                          <View style={tw`w-3 h-3.5 ml-2`}>
                            <RecurringIcon color={tw.color("white")} />
                          </View>
                        ) : null}
                      </View>
                    </View>
                  </View>

                  {/* </View> */}
                </View>
                <View
                  style={tw`p-3 flex flex-wrap bg-background-400 rounded-r-xl mb-3 justify-between items-center w-10`}
                >
                  <View style={tw`w-3.5 h-3 ml-1`}>
                    {IntensityIcon && (
                      <IntensityIcon
                        color={tw.color("white")}
                        width={14}
                        height={10}
                      />
                    )}
                  </View>
                  {/* Show wearable icon if workout came from POINT */}
                  {isActualWorkout(workout) && (
                    <View style={tw`w-3 h-6 justify-center items-center`}>
                      {workout?.confirmed && <WearableBlueIcon />}

                      {!workout?.confirmed && <WearableIcon />}
                    </View>
                  )}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>

          {workout?.intraFuelling && !checkBox && (
            <Pressable
              onPress={() =>
                navigation.navigate("PrimaryStack_FuelingStrategyModal", {
                  workout: workout,
                  intraFuellingRecommendations: intraFuellingRecommendations,
                })
              }
              style={{
                ...tw`bg-background-300 border-2 border-activeblue-100 rounded-lg shadow w-10 mb-3 items-center justify-center`,
              }}
            >
              <View style={tw`w-full h-8 flex items-center justify-center p-1`}>
                <Text style={tw`font-poppins-semibold text-white text-sm`}>
                  {isCarbsPerHour
                    ? currency(intraFuellingRecommendations?.carb || 0, {
                        precision: 0,
                      }).divide(timeDifference).value
                    : currency(intraFuellingRecommendations?.carb || 0, {
                        precision: 0,
                      }).value}
                </Text>
                <Text style={tw`font-poppins-medium text-white text-xxs`}>
                  {isCarbsPerHour ? "g/hr" : "g"}
                </Text>
              </View>
            </Pressable>
          )}

          {workout?.intraFuelling && !checkBox && (
            <Pressable
              onPress={() => {
                navigation.navigate("PrimaryStack_FoodTrackingModal", {
                  meal: workout.intraFuellingMeal,
                  mealVerification: workout.intraFuellingMeal.mealVerification,
                  setWaitingSubScreen: setWaitingSubScreen,
                  workoutId: workout?.id,
                  intraFuellingRecommendations: intraFuellingRecommendations,
                  ranges: ranges,
                });
              }}
              style={{
                ...tw`bg-background-300 border border-background-600 rounded-lg shadow h-14 w-10 mb-3 items-center justify-center`,
              }}
            >
              {meal?.mealVerification ? (
                <>
                  <Text style={tw`text-xs text-white font-poppins-medium`}>
                    {meal?.mealVerification?.skipped
                      ? 0
                      : Math.round(meal?.mealVerification?.energy)}
                  </Text>
                  <Text style={tw`text-xxs text-white font-poppins-regular`}>
                    kcal
                  </Text>
                </>
              ) : (
                <View style={tw`w-5 h-5`}>
                  <PlusIcon color={tw.color("white")} />
                </View>
              )}
            </Pressable>
          )}

          {checkBox && !loading && (
            <View style={tw`ml-0 flex-row mb-3`}>
              <TouchableWithoutFeedback onPress={onCheckBoxPress}>
                <View
                  style={tw`flex-row py-[5px] px-[12px] w-${
                    screenWidth / 4
                  } justify-start items-center gap-2.5 rounded-l-lg bg-${
                    !activeWorkout ? "background-green" : "red"
                  }`}
                >
                  {!activeWorkout ? (
                    <PlusIcon
                      width={24}
                      height={24}
                      color={tw.color("white")}
                    />
                  ) : (
                    <SvgTrash
                      width={24}
                      height={24}
                      color={tw.color("white")}
                    />
                  )}

                  <Text
                    style={tw`font-poppins-medium text-sm tracking-[0.25px] text-white`}
                  >
                    {!activeWorkout ? "Add back to plan" : "Remove from plan"}
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          )}

          {/* Show spinner icon if loading */}
          {checkBox && loading && (
            <View style={tw`ml-3`}>
              <View
                style={tw`h-4 w-5 px-5 py-5 justify-center items-center -mt-4`}
              >
                <ActivityIndicator color="white" size="small" />
              </View>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default WorkoutCard;
