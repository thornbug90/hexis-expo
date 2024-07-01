import React from "react";
import Modal from "react-native-modal";
import tw from "../../../lib/tw";
import { ModalProps, View, Text, Image } from "react-native";
import Button from "../../../components/shared/Button";
import { NavigationProp } from "@react-navigation/native";
import TrainingPeaksIcon from "../../../../assets/images/integration/TrainingPeakIcon.jpg";
import AsyncStorage from "@react-native-async-storage/async-storage";
interface Props {
  show: boolean;
  onDismiss: () => void;
  navigation?: any;
}
const IntegrationReleaseModal: React.FC<Props> = ({
  show,
  onDismiss,
  navigation,
}) => {
  return (
    <Modal
      isVisible={show}
      onDismiss={onDismiss}
      onBackdropPress={onDismiss}
      hasBackdrop={true}
    >
      <View
        style={tw`flex w-[335px] pt-6 px-6 pb-6 justify-center items-center gap-6 rounded-xl bg-background-500 mx-auto`}
      >
        <View
          style={tw` border-background-500 mt-[-100px] mx-auto w-34 h-34 overflow-hidden grow-0`}
        >
          <View
            style={tw`w-30 h-40 flex items-center justify-center content-center`}
          >
            <Image
              source={TrainingPeaksIcon}
              style={tw`h-24 w-24 rounded-[18px]`}
            />
          </View>
        </View>
        <Text
          style={tw`self-stretch text-almostWhite font-poppins-medium text-xl tracking-[0.25px] text-center`}
        >
          TrainingPeaks Integration is now live!
        </Text>
        <Text
          style={tw`self-stretch text-almostWhite font-poppins-light text-sm tracking-[0.25px] text-center`}
        >
          You can now connect Hexis to TrainingPeaks to automatically import all
          your workouts.
        </Text>
        <Button
          label="Let's Go!"
          size="small"
          style={"mx-4 self-stretch"}
          variant="primary"
          onPress={() => {
            navigation?.navigate("ProfileStack", {
              screen: "Profile_Integration",
            });
            AsyncStorage.setItem("integrationRelease", "true");
            onDismiss();
          }}
        ></Button>
      </View>
    </Modal>
  );
};

export default IntegrationReleaseModal;
