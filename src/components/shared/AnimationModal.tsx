import React, { useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import IntegrationReleaseModal from "../../navigation/primary/screens/PrimaryStack_IntegrationRelease";
import Modal from "react-native-modal";
import { CyclingIcon } from "../icons/sports";
import tw from "../../lib/tw";
import SvgPorkKnifeIcon from "../icons/sports/PorkKnifeIcon";
import { CancelIcon } from "../icons/general";
type Props = {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  navigation: any;
};
const FadeInModal = ({ modalVisible, setModalVisible, navigation }: Props) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const transparentHeight = Dimensions.get("window").height - 70;
  const windowHeight = Dimensions.get("window").height;
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);
  const onDismiss = () => {
    setModalVisible(false);
  };
  const navigateToAddMeal = () => {
    setModalVisible(false);
    navigation.navigate("PrimaryStack_AddEditMealModal");
  };
  const navigateToAddWorkout = () => {
    setModalVisible(false);
    navigation.navigate("PrimaryStack_ChooseActivityScreen");
  };
  let largeScreen = Platform.OS === "ios" ? true : false;
  return (
    <Modal
      animationIn={"fadeInUp"}
      animationOut={"fadeOutDown"}
      isVisible={modalVisible}
      onDismiss={onDismiss}
      onBackdropPress={onDismiss}
      hasBackdrop={true}
      style={tw`justify-end items-center flex`}
      coverScreen={true}
      deviceHeight={transparentHeight}
      backdropOpacity={0.8}
    >
      <View
        style={{
          ...tw`flex-row justify-center gap-[19px] items-end mb-25`,
        }}
      >
        <TouchableWithoutFeedback onPress={navigateToAddMeal}>
          <View
            style={tw`bg-white p-4 flex-row justify-center items-center rounded-full w-13 h-13`}
          >
            <SvgPorkKnifeIcon
              color={tw.color("activeblue-100")}
              width={24}
              height={24}
            />
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={navigateToAddWorkout}>
          <View
            style={tw`bg-white p-4 flex-row justify-center items-center rounded-full w-13 h-13`}
          >
            <CyclingIcon
              color={tw.color("activeblue-100")}
              width={24}
              height={24}
            />
          </View>
        </TouchableWithoutFeedback>
      </View>
      <TouchableWithoutFeedback
        onPress={() => setModalVisible((prev) => !prev)}
      >
        <View
          style={tw`border-5 rounded-full border-background-500 absolute bottom-${
            largeScreen ? 5 : 5
          } `}
        >
          <View style={tw`p-3.5 rounded-full bg-activeblue-100`}>
            <View style={tw`w-6.5 h-6.5`}>
              {modalVisible && <CancelIcon color={tw.color("white")} />}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default FadeInModal;
