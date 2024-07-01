import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { Dimensions, SafeAreaView, View, Text } from "react-native";
import Button from "../../../components/shared/Button";
import tw from "../../../lib/tw";
import { PrimaryStackParamsList } from "../PrimaryStack";

const { width, height } = Dimensions.get("screen");
type Props = NativeStackScreenProps<
  PrimaryStackParamsList,
  "PrimaryStack_IwfWearablePrompt"
>;

const PrimaryStack_IwfWearablePrompt: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={tw`flex-1 items-center justify-center`}>
      <View
        style={{
          width: width - 64,
          ...tw`p-4 bg-background-500 rounded-lg border border-background-100 shadow`,
        }}
      >
        <View style={tw`mb-6`}>
          <Text style={tw`font-poppins-medium text-lg text-white text-center`}>
            Opportunity missed?
          </Text>
          <View style={tw`my-2`}>
            <Text
              style={tw`font-poppins-medium text-smtext-white text-center pb-3`}
            >
              Looks like the workout detected from your wearable may have
              benefited from fuelling during the session.
            </Text>
            <Text
              style={tw`font-poppins-medium text-sm text-white text-center`}
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
            style="w-1/2 font-poppins-medium text-sm text-white text-center"
            onPress={navigation.goBack}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PrimaryStack_IwfWearablePrompt;
