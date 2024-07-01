import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, TouchableWithoutFeedback, View } from "react-native";
import { Carb_Code } from "../../../generated/graphql";
import tw, { carbCodeGradients } from "../../../lib/tw";
import { convertCarbCode } from "../../../utils/enumNames";

type Props = {
  onPress: (carbCode: Carb_Code) => void;
  value?: Carb_Code;
  size?: "small";
};

const CarbCodeButton = ({
  size,
  carbCode,
  onPress,
  active,
}: {
  size?: "small";
  carbCode: Carb_Code;
  onPress: (carbCode: Carb_Code) => void;
  active?: boolean;
}) => {
  let color;
  carbCode === Carb_Code.Low
    ? (color = "carbcodelow-100")
    : carbCode === Carb_Code.Medium
    ? (color = "carbcodemedium-100")
    : (color = "carbcodehigh-100");
  return (
    <TouchableWithoutFeedback onPress={() => onPress(carbCode)}>
      {active ? (
        <LinearGradient
          colors={carbCodeGradients[carbCode]}
          style={{
            ...tw.style([
              `flex-1 items-center justify-center py-4 mx-1 border border-transparent`,
              size === "small" ? "py-2" : "",
            ]),
            borderRadius: 8,
          }}
        >
          <Text style={tw`text-white font-poppins-medium text-sm`}>
            {convertCarbCode(carbCode)}
          </Text>
        </LinearGradient>
      ) : (
        <View
          style={{
            ...tw.style([
              `bg-background-300 border border-${color} flex-1 items-center justify-center py-4 mx-1`,
              size === "small" ? "py-2" : "",
            ]),
            borderRadius: 8,
          }}
        >
          <Text style={tw`text-white font-poppins-medium text-sm`}>
            {convertCarbCode(carbCode)}
          </Text>
        </View>
      )}
    </TouchableWithoutFeedback>
  );
};

const CarbCodeButtonGroup: React.FC<Props> = ({ size, onPress, value }) => {
  return (
    <View style={tw`flex-row mb-4`}>
      <CarbCodeButton
        carbCode={Carb_Code.Low}
        size={size}
        onPress={onPress}
        active={value === Carb_Code.Low}
      />
      <CarbCodeButton
        carbCode={Carb_Code.Medium}
        size={size}
        onPress={onPress}
        active={value === Carb_Code.Medium}
      />
      <CarbCodeButton
        carbCode={Carb_Code.High}
        size={size}
        onPress={onPress}
        active={value === Carb_Code.High}
      />
    </View>
  );
};

export default CarbCodeButtonGroup;
