import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import tw from "../../lib/tw";
import { ThickerPlusIcon } from "../icons/general";
import FadeInModal from "./AnimationModal";
import DeviceInfo from "react-native-device-info";

const OpenCloseCircleButton = ({ navigation }: { navigation: any }) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const isIos = Platform.OS === "ios" ? true : false;
  const isSmallScreen = DeviceInfo.getModel().includes("SE");
  return (
    <>
      <TouchableWithoutFeedback
        onPress={() => setModalVisible((prev) => !prev)}
      >
        <View
          style={tw`border-5 rounded-full border-background-500 absolute bottom-${
            isIos ? (isSmallScreen ? 10 : 2.5) : 10
          } `}
        >
          <View style={tw`p-3.5 rounded-full bg-activeblue-100`}>
            <View style={tw`w-6.5 h-6.5`}>
              {!modalVisible && <ThickerPlusIcon color={tw.color("white")} />}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
      <FadeInModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        navigation={navigation}
      />
    </>
  );
};

export default OpenCloseCircleButton;
