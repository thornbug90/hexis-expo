import React, { memo, useEffect, useState } from "react";
import { View, Text, Pressable, Dimensions } from "react-native";
import tw from "../../lib/tw";
import ArrowsClockwiseIcon from "../../components/icons/general/ArrowsClockwiseIcon";
import { ISyncedWearables } from "../../navigation/primary/PrimaryStack";
import integrationIcons from "../../lib/integrations";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";
type Props = {
  isFetchingWearableWorkouts: boolean;
  setSyncedUpdatedWorkouts: (value: any) => void;
  syncedUpdatedWorkouts: Partial<ISyncedWearables>[];
  setIsFetchingWearableWorkouts: (value: boolean) => void;
  refetch: () => void;
};

const SyncUpdatedStatusToast: React.FC<Props> = ({
  isFetchingWearableWorkouts,
  setSyncedUpdatedWorkouts,
  syncedUpdatedWorkouts,
  setIsFetchingWearableWorkouts,
  refetch,
}) => {
  const [toastWidth, setToastWidth] = useState(0);
  const { width: screenWidth } = Dimensions.get("window");
  const position = useSharedValue(-150);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: position.value },
        { translateX: screenWidth / 2 - toastWidth / 2 - 24 },
      ],
      position: "absolute",
      zIndex: 1000,
      elevation: 1000,
      display: "flex",
    };
  });
  useEffect(() => {
    if (!isFetchingWearableWorkouts && syncedUpdatedWorkouts.length > 0) {
      position.value = withTiming(30, { duration: 100 });
      const stayingTime = setTimeout(() => {
        position.value = withTiming(-150, { duration: 100 });
      }, 4000);
      return () => {
        clearTimeout(stayingTime);
        setSyncedUpdatedWorkouts([]);
      };
    }
  }, [isFetchingWearableWorkouts]);

  const refetchWearable = () => {
    position.value = withTiming(-150, { duration: 100 });
    setIsFetchingWearableWorkouts(true);
    refetch();
  };
  const renderWorkout = (
    syncedUpdatedWorkout: Partial<ISyncedWearables>,
    index: number
  ) => {
    const { connected, syncedNumbers, wearableSource } = syncedUpdatedWorkout;
    const sourceName = integrationIcons.find(
      (source) => source.source === wearableSource
    )?.name;

    if (connected) {
      return (
        <View key={index} style={tw`flex-row items-center gap-1 self-stretch`}>
          <Text
            style={tw`text-background-500 font-poppins-${
              syncedNumbers === 0 ? "regular" : "medium"
            } text-xs tracking-[0.25px] w-[17px]`}
          >
            {syncedNumbers === 0 ? "No" : syncedNumbers}
          </Text>
          <Text
            style={tw`text-background-500 font-poppins-regular text-xs tracking-[0.25px]`}
          >
            {`workout(s) added from ${sourceName}`}
          </Text>
        </View>
      );
    } else {
      return (
        <Text
          style={tw`text-background-red font-poppins-regular text-xs tracking-[0.25px]`}
          key={index}
        >
          {`${sourceName}: ${syncedNumbers}`}
        </Text>
      );
    }
  };

  return (
    <Animated.View style={animatedStyle}>
      <View
        style={tw`flex-row w-full m-6 p-3 gap-3 rounded-lg border-t-4 border-pichart-carbs bg-almostWhite`}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          setToastWidth(width);
        }}
      >
        <Pressable onPress={refetchWearable}>
          <ArrowsClockwiseIcon width={24} height={24} />
        </Pressable>
        <View style={tw`flex`}>{syncedUpdatedWorkouts.map(renderWorkout)}</View>
      </View>
    </Animated.View>
  );
};

export default memo(SyncUpdatedStatusToast);
