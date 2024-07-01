import React, { useRef, useState } from "react";
import { Dimensions, Text, View } from "react-native";
import { VictoryPie } from "victory-native";
import tw from "../../../lib/tw";

export type ProgressCircleProps = {
  currentValue: number;
  totalValue: number;
};

const width = Dimensions.get("screen").width - 32;

const ProgressCircle: React.FC<ProgressCircleProps> = ({
  currentValue = 1,
  totalValue = 1,
}) => {
  const currentValuePercentage = currentValue / totalValue;
  const totalPercentage = 1 - currentValuePercentage;
  const [viewMeasurements, setViewMeasurements] = useState({
    height: 0,
    width: 0,
  });
  return (
    <View>
      <View
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setViewMeasurements({ height, width });
        }}
        style={{
          ...tw`absolute top-1/2 left-1/2 items-center justify-center`,
          ...{
            transform: [
              { translateY: -viewMeasurements.height / 2 },
              { translateX: -(viewMeasurements.width / 2) },
            ],
          },
        }}
      >
        <View style={tw`px-3 pb-1 border-b border-b-white`}>
          <Text style={tw`text-white text-base font-poppins-light`}>
            {currentValue}
          </Text>
        </View>
        <Text style={tw`text-white text-2xl font-poppins-light tracking-wide`}>
          {totalValue}
        </Text>
        <Text style={tw`text-white text-base font-poppins-light`}>Kcals</Text>
      </View>

      <VictoryPie
        height={240}
        width={width}
        standalone={true}
        data={[
          { x: 1, y: Math.round(currentValuePercentage * 100) },
          { x: 0, y: Math.round(totalPercentage * 100) },
        ]}
        innerRadius={86}
        cornerRadius={2}
        labels={() => null}
        style={{
          data: {
            fill: ({ datum }) => {
              const color = tw.color("activeblue-100") as string;
              return datum.x === 1
                ? color
                : (tw.color("background-300") as string);
            },
          },
        }}
      />
    </View>
  );
};

export default ProgressCircle;
