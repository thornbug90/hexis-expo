import { disableExpoCliLogging } from "expo/build/logs/Logs";
import React from "react";
import { View, Text, Switch } from "react-native";
import tw from "../../lib/tw";

const WorkoutDetailItem = (props: {
  disabled?: boolean;
  leftIcon: React.FC<{ color?: string }>;
  label: string;
  value: boolean;
  onChange: (bool: boolean) => void;
}) => {
  return (
    <View style={tw`flex-row items-center mb-2`}>
      <View style={tw`w-4 h-4 mr-4`}>
        {props.leftIcon({ color: tw.color("white") })}
      </View>
      <View style={tw`flex-1`}>
        <Text style={tw`text-sm text-white font-poppins-regular`}>
          {props.label}
        </Text>
      </View>
      <Switch
        trackColor={{
          true: tw.color("activeblue-100"),
          false: tw.color("background-200"),
        }}
        disabled={props.disabled}
        onValueChange={props.onChange}
        value={props.value}
        style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
      />
    </View>
  );
};

export default WorkoutDetailItem;
