import React from "react";
import { View, Text } from "react-native";
import Modal from "react-native-modal";
import tw from "../../lib/tw";
import Button from "../shared/Button";
import ModernIntensityIcon from "../icons/general/ModernIntensityIcon";
import VectorIcon from "../icons/general/VertorIcon";
import { Slider } from "@miblanchard/react-native-slider";
import { intensityMapping } from "../../lib/intensity";

type Props = {
  visible: boolean;
  onClose: () => void;
};
const IntensityInfoModal: React.FC<Props> = ({ visible, onClose }) => {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      style={tw`px-6 py-8 flex-col justify-center items-center`}
    >
      <View style={tw`relative bg-background-500 rounded-xl px-6 py-4`}>
        <View
          style={[
            tw`absolute left-1/2 flex-row w-24 h-24 justify-center items-start gap-2.5 rounded-full bg-activeblue-100 border-4`,
            { transform: [{ translateX: 15 }, { translateY: -50 }] },
          ]}
        >
          <View style={tw`absolute top-[15%]`}>
            <ModernIntensityIcon height={34.7} />
          </View>
          <View style={[tw`absolute top-6.5, left-[30%]`]}>
            <VectorIcon />
          </View>
        </View>
        <View
          style={tw`w-[340px] flex-col self-stretch pt-16 pb-6 px-6 justify-center items-center gap-6 rounded-2xl`}
        >
          <Text
            style={tw`text-center text-white font-poppins-semibold text-[24px] tracking-[0.25px]`}
          >
            Our Intensity Scale
          </Text>
          <Text
            style={tw`text-center text-white font-poppins-regular text-sm tracking-[0.25px]`}
          >
            Use the slider and its descripters to identify the intensity of your
            workout
          </Text>
          <View style={tw`w-full h-72 flex-row justify-between`}>
            <Slider
              containerStyle={tw`w-72 h-72 absolute -left-1/3 top-2`}
              vertical={true}
              minimumValue={0}
              maximumValue={100}
              value={33}
              minimumTrackTintColor={tw.color("bg-activeblue-100")}
              maximumTrackTintColor={tw.color("bg-background-600")}
              thumbTintColor={tw.color("bg-white")}
              trackStyle={tw`h-3 rounded-full`}
              thumbStyle={tw`w-8 h-8 rounded-full`}
              trackMarks={Object.keys(intensityMapping).map(
                (key) => 100 - Number(key)
              )}
            />
            <View style={tw`relative w-3/4`}>
              {Object.entries(intensityMapping).map(([key, value]) => (
                <Text
                  key={key}
                  style={tw`absolute left-1/2 top-[${
                    100 - Number(key)
                  }%] w-full text-white font-poppins-regular text-[12px] tracking-[0.25px]`}
                >
                  {value}
                </Text>
              ))}
            </View>
          </View>
        </View>

        <Button
          variant="primary"
          size="medium"
          label="OK"
          onPress={onClose}
          style={`mt-6`}
        />
      </View>
    </Modal>
  );
};

export default IntensityInfoModal;
