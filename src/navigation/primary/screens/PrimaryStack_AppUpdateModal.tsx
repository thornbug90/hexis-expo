import React from "react";
import Modal from "react-native-modal";
import tw from "../../../lib/tw";
import { View, Text } from "react-native";
import Button from "../../../components/shared/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LogoIcon } from "../../../components/icons/general";
import useConfig from "../../../hooks/useConfig";
import { gotoAppUpdate } from "../../../utils/appUpdate";
import LoadingLine from "../../../components/icons/general/LineLoading";

const AppUpdateModal: React.FC = () => {
  const {
    setUpdateNotification,
    updateNotification,
    config,
    appVersion,
    isConfigLoading,
  } = useConfig();
  return (
    <Modal isVisible={updateNotification} hasBackdrop={true}>
      <View
        style={tw`flex w-[335px] pt-6 px-6 pb-6 justify-center items-center gap-6 rounded-xl bg-background-500 mx-auto`}
      >
        {isConfigLoading ? (
          <LoadingLine />
        ) : (
          <>
            <View
              style={tw` border-background-500 mt-[-100px] mx-auto w-34 h-34 overflow-hidden grow-0`}
            >
              <View
                style={tw`w-30 h-30 flex items-center justify-center content-center`}
              >
                <LogoIcon />
              </View>
            </View>
            <Text
              style={tw`self-stretch text-almostWhite font-poppins-medium text-xl tracking-[0.25px] text-center`}
            >
              Update Hexis App
            </Text>
            <Text
              style={tw`self-stretch text-almostWhite font-poppins-light text-sm tracking-[0.25px] text-center`}
            >
              A new update is available. Tap now to update to the latest version
              of Hexis. Your Hexis app version ({appVersion}) is not the latest.
            </Text>
            <View style={tw`flex flex-row`}>
              <Button
                label="Later"
                size="small"
                variant="secondary"
                style={"mr-5"}
                onPress={() => {
                  if (config?.latestVersion)
                    AsyncStorage.setItem(
                      "skippedUpdateNotification",
                      config?.latestVersion
                    );
                  setUpdateNotification(false);
                }}
              />
              <Button
                label="Update"
                size="small"
                variant="primary"
                onPress={async () => {
                  if (config?.latestVersion)
                    await AsyncStorage.setItem(
                      "skippedUpdateNotification",
                      config?.latestVersion
                    );
                  await gotoAppUpdate(config?.updateLink ?? undefined);
                  setUpdateNotification(false);
                }}
              />
            </View>
          </>
        )}
      </View>
    </Modal>
  );
};

export default AppUpdateModal;
