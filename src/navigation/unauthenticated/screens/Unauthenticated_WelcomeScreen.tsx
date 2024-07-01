import AnimatedLottieView from "lottie-react-native";
import React, { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, StyleSheet, SafeAreaView, Text, Dimensions } from "react-native";

import welcome_screen from "../../../../assets/lottie/welcome_screen.json";
import Button from "../../../components/shared/Button";
import tw from "../../../lib/tw";

const { width, height } = Dimensions.get("screen");

// @ts-ignore
const Unauthenticated_WelcomeScreen = ({ navigation }) => {
  return (
    <>
      <AnimatedLottieView
        style={{
          width: width,
          height: height,
          transform: [{ scale: 1.2 }],
        }}
        speed={1}
        source={welcome_screen}
        autoPlay
      />
      <SafeAreaView style={StyleSheet.absoluteFill}>
        <View style={tw`mx-4 flex-1 mb-4 mt-16`}>
          <View style={tw`flex-1`}>
            <Text
              style={tw`font-poppins-semibold text-2xl max-w-60 mb-10 text-white`}
            >
              Welcome to hexis.
            </Text>
            <Text
              style={tw`font-poppins-regular text-base max-w-74 text-white`}
            >
              You can't create a Hexis account in the app, but once you sign up
              you can come back to the app and get started right away.
            </Text>
          </View>
          <Button
            label="Sign In"
            size="medium"
            onPress={() => navigation.navigate("Unauthenticated_SignInScreen")}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

export default Unauthenticated_WelcomeScreen;
