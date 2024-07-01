import React from "react";
import { TouchableWithoutFeedback, View, Text } from "react-native";
import { Carb_Code } from "../../generated/graphql";
import tw from "../../lib/tw";
import { ArrowRightIcon } from "../icons/general";
import Label from "../shared/Label";

const ProfileContainer: React.FC<{ onPress?: () => void; label?: string }> = ({
  children,
  onPress,
  label,
}) => {
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View>
        <View style={tw`mb-8`}>
          {label ? <Label text={label} /> : null}

          <View style={tw`rounded-lg bg-background-300`}>{children}</View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const ProfileItem: React.FC<{
  Icon?: React.FC;
  title: string;
  value?: string;
  showArrow?: boolean;
  onPress?: () => void;
}> = ({ Icon, title, value, showArrow, onPress }) => {
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={tw`px-4 py-4 flex-row items-center`}>
        {Icon ? (
          <View style={tw`w-5 h-5 mr-4`}>
            {/* @ts-ignore */}
            <Icon color={tw.color("white")} />
          </View>
        ) : null}
        <Text style={tw`flex-1 text-white font-poppins-medium`}>{title}</Text>
        {value ? (
          <Text style={tw`text-white font-poppins-regular`}>{value}</Text>
        ) : null}
        {showArrow ? (
          <View style={tw`w-5 h-5`}>
            <ArrowRightIcon color={tw.color("white")} />
          </View>
        ) : null}
      </View>
    </TouchableWithoutFeedback>
  );
};

const ProfileCarbCodeRangeItem: React.FC<{
  min?: string;
  max?: string;
  carbCode: Carb_Code;
}> = ({ min, max, carbCode }) => {
  return (
    <View style={tw`px-4 py-4 flex-row items-center`}>
      <View style={tw`w-5 h-5 mr-4`}>
        {/* @ts-ignore */}
        <View
          style={tw.style([
            `w-5 h-5 rounded-full`,
            carbCode === Carb_Code.Low ? "bg-carbcodelow-100" : "",
            carbCode === Carb_Code.Medium ? "bg-carbcodemedium-100" : "",
            carbCode === Carb_Code.High ? "bg-carbcodehigh-100" : "",
          ])}
        />
      </View>
      <Text
        style={{
          ...tw`flex-1 text-white font-poppins-medium`,
          textTransform: "capitalize",
        }}
      >
        {carbCode}
      </Text>
      <Text style={tw`text-white font-poppins-regular`}>{min}</Text>
      <Text style={tw`text-white font-poppins-regular`}>-</Text>
      <Text
        style={tw`text-white font-poppins-regular ${
          max === "Infinity" ? "text-[20px]" : ""
        }`}
      >
        {max === "Infinity" ? "\u221E" : max}
      </Text>
      <Text style={tw`text-white font-poppins-regular`}>{` grams`}</Text>
    </View>
  );
};

const Divider = () => {
  return <View style={tw`border-b border-background-100 mx-4`} />;
};

const ProfileCard = {
  Container: ProfileContainer,
  Item: ProfileItem,
  Divider: Divider,
  CarbRange: ProfileCarbCodeRangeItem,
};

export default ProfileCard;
