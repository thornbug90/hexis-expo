import React from "react";
import { Dimensions, SafeAreaView, View, Text } from "react-native";
import Button from "../../components/shared/Button";
import tw from "../../lib/tw";

const { width, height } = Dimensions.get("window");

const WearablePrompt = ({ goBack }: { goBack: () => void }) => {
  return (
    <SafeAreaView
      style={{
        width: width,
        height,
        ...tw`flex-1 items-center justify-start absolute z-10`,
      }}
    >
      <View
        style={{
          width: width / 1.2,
          ...tw`p-4 m-12 bg-background-500 rounded-lg shadow border border-background-100`,
        }}
      >
        <View style={tw`mb-6`}>
          <Text style={tw`font-poppins-medium text-lg text-white text-center`}>
            Opportunity missed?
          </Text>
          <View style={tw`my-2`}>
            <Text
              style={tw`font-poppins-medium font-sm text-white text-center pb-3`}
            >
              Looks like the workout detected from your wearable may have
              benefited from fuelling during the session.
            </Text>
            <Text
              style={tw`font-poppins-medium font-sm text-white text-center`}
            >
              Click the fuel icon to see what would have been recommended.
            </Text>
          </View>
        </View>
        <View style={tw`flex-row justify-center gap-x-2 w-full`}>
          <Button
            label="OK"
            size="medium"
            variant="primary"
            style="w-1/2 font-poppins-medium font-sm text-white text-center mb-0"
            onPress={goBack}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default WearablePrompt;
