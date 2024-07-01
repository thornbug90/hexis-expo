import React from "react";
import { StyleSheet, SafeAreaView, View, Text } from "react-native";

import tw from "../../../lib/tw";
import { LogoIcon } from "../../icons/general";
import Button from "../Button";
import { gotoAppUpdate } from "../../../utils/appUpdate";

const AppUpdateScreen = ({
  backgroundColor = "",
  appVersion = "",
  updateLink = undefined,
}: {
  backgroundColor?: string;
  appVersion?: string;
  updateLink?: string | undefined;
}) => {
  return (
    <View style={[tw`flex-1 items-center justify-center`, { backgroundColor }]}>
      <SafeAreaView
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: tw.color("background-300") },
        ]}
      >
        <View style={tw`flex-1 justify-center items-center`}>
          <View style={tw`h-12 w-12 mb-8`}>
            <LogoIcon />
          </View>
          <Text
            style={tw`text-white font-poppins-semibold text-xl text-center`}
          >
            Update Hexis App
          </Text>
          <Text
            style={tw`text-white font-poppins-regular text-sm mt-4 text-center p-5`}
          >
            An update is required. Please update your app now to continue using
            Hexis. Your Hexis app version ({appVersion}) is no longer supported.
          </Text>
          <View style={tw`mt-5`}>
            <Button
              label="Update"
              size="medium"
              onPress={() => {
                gotoAppUpdate(updateLink);
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default AppUpdateScreen;
