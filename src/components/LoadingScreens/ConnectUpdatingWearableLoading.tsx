import React, { memo, useEffect, useState } from "react";
import { View, Image, Text, Dimensions, Animated } from "react-native";
import primarySceen from "../../../assets/icon.png";
import tw from "../../lib/tw";
import CheckCircleIcon from "../icons/general/CheckCircle";
import XCircleIcon from "../icons/general/XCircleIcon";
import integrationIcons from "../../lib/integrations";

type Props = {
  syncingStatus: any;
};
const ConnectUpdatingWearableLoading: React.FC<Props> = ({ syncingStatus }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const wearableIcon = integrationIcons.find(
    (source) => source.source === syncingStatus?.wearableSource
  )?.icon;
  const screenWidth =
    (Dimensions.get("screen").height + Dimensions.get("screen").width) / 2;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500, // Duration of the animation in milliseconds
      useNativeDriver: true, // Use native driver for better performance
    }).start();
  }, []);
  return (
    <Animated.View
      style={[
        tw`relative flex-col flex-1 pt-6 pb-13.5 px-20 justify-center items-center gap-3 shrink-0`,
        { opacity: fadeAnim },
      ]}
    >
      <Image
        source={primarySceen}
        style={{
          position: "absolute",
          width: screenWidth,
          height: screenWidth,
          top: -screenWidth / 2,
          right: -screenWidth / 2,
          opacity: 0.6,
        }}
      />
      <Image
        source={primarySceen}
        style={{
          position: "absolute",
          width: screenWidth,
          height: screenWidth,
          bottom: -screenWidth / 2,
          left: -screenWidth / 2,
          opacity: 0.6,
        }}
      />
      <Image source={wearableIcon} style={tw`w-10 h-10 rounded-lg`} />
      <View style={tw`flex-row justify-center items-center gap-2`}>
        <Text
          style={tw`text-white text-lg font-poppins-medium tracking-[0.5px]`}
        >
          Connecting
        </Text>
        {syncingStatus?.connected && <CheckCircleIcon />}
        {!syncingStatus?.connected && <XCircleIcon />}
      </View>
      <View style={tw`flex-row justify-center items-center gap-2`}>
        <Text
          style={tw`text-white text-lg font-poppins-medium tracking-[0.5px]`}
        >
          Syncing Workouts
        </Text>
        {syncingStatus?.isSynced && <CheckCircleIcon />}
        {!syncingStatus?.isSynced && <XCircleIcon />}
      </View>
      <Text
        style={tw`text-white text-center text-lg font-poppins-medium tracking-[0.5px] items-center justify-center`}
      >
        Updating Fuel Plans...
      </Text>
    </Animated.View>
  );
};

export default memo(ConnectUpdatingWearableLoading);
