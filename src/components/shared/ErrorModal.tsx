import React from "react";
import { KeyboardAvoidingView, Text, View } from "react-native";
import Modal from "react-native-modal";

import tw from "../../lib/tw";
import Button from "./Button";

type Props = {
  errorMessage: string;
  screen?: string;
  buttonTitle: string;
  onDismiss?: () => void;
  onRedirect: () => void;
  show: boolean;
  cancel?: boolean;
  textSmall?: boolean;
  errorMessageDescription?: string;
  buttonCancelTitle?: string;
  titleThick?: boolean;
};

const ErrorModal: React.FC<Props> = ({
  onRedirect,
  errorMessage,
  screen,
  buttonTitle,
  onDismiss,
  show,
  titleThick = false,
  cancel = true,
  textSmall = false,
  errorMessageDescription,
  buttonCancelTitle = "Cancel",
}) => {
  return (
    <Modal
      isVisible={show}
      onDismiss={onDismiss}
      onBackdropPress={onDismiss}
      hasBackdrop={true}
      style={tw`px-6 py-8 flex-col justify-center items-center`}
    >
      <KeyboardAvoidingView
        style={tw` bg-background-500 rounded-xl px-6 py-4 `}
      >
        <Text
          style={tw`text-white font-poppins-${
            titleThick ? "semibold" : "regular"
          } ${textSmall ? "text-sm" : "text-lg"} mt-2 text-center`}
        >
          {errorMessage}
        </Text>

        {errorMessageDescription && (
          <Text
            style={tw`text-white font-poppins-regular text-sm mt-2 text-center`}
          >
            {errorMessageDescription}
          </Text>
        )}

        <View style={tw`flex-row items-center mt-6`}>
          {cancel && (
            <Button
              size="small"
              style="flex-1 mr-2"
              variant="secondary"
              label={buttonCancelTitle}
              onPress={onDismiss}
            />
          )}
          <Button
            size="small"
            style="flex-1 ml-2"
            variant="primary"
            label={buttonTitle}
            onPress={onRedirect}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ErrorModal;
