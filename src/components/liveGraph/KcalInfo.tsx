import { View, Text } from "react-native";
import tw from "../../lib/tw";

type Props = {
  blue?: boolean;
  kcal: number;
  text: string;
  subtitle?: string;
};
const KcalInfo: React.FC<Props> = ({ kcal, text, blue, subtitle }) => {
  return (
    <View>
      <View
        style={tw`border-b ${
          blue ? `border-activeblue-100` : "border-white"
        } mb-2`}
      >
        <Text
          style={tw`${
            blue ? `text-activeblue-100` : "text-white"
          } text-xl font-poppins-medium self-center`}
        >
          {kcal > 0 ? `+${kcal}` : kcal}{" "}
          <Text style={tw`text-xs font-poppins-light`}>kcal</Text>
        </Text>
      </View>
      <Text
        style={tw`self-center ${
          blue ? `text-activeblue-100` : "text-white"
        } text-base`}
      >
        {text}
        {subtitle ? (
          <Text style={tw`text-xxs font-poppins-semibold tracking-tight`}>
            {subtitle}
          </Text>
        ) : null}
      </Text>
    </View>
  );
};

export default KcalInfo;
