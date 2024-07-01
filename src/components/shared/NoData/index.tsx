import { useNavigation } from "@react-navigation/native";
import { Text, View, SafeAreaView } from "react-native";
//import { SafeAreaView } from "react-navigation";
import tw from "../../../lib/tw";
import { LogoIcon } from "../../icons/general";
import Button from "../Button";

const NoData: React.FC<{ liveGraph?: boolean; title?: string }> = ({
  liveGraph,
  title,
}) => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={tw`flex-1`}>
      <View style={tw`flex-1 items-center justify-center mx-auto max-w-80`}>
        <View style={tw`h-8 w-8 mb-4`}>
          <LogoIcon />
        </View>
        {title && (
          <Text style={tw`text-lg text-gray-200 font-poppins-medium mb-6`}>
            {title} unavailable{" "}
          </Text>
        )}
        <Text
          style={tw`text-almostWhite text-sm text-center mb-12 font-poppins-medium`}
        >
          {liveGraph
            ? "You can only see your live graph for today and past days."
            : `Hexis plans your ${title} up to 7 days in advance. Please check back closer to the date to view your ${title}.`}
        </Text>
        <Button
          label="Change day"
          onPress={() => {
            // @ts-ignore
            navigation.navigate("PrimaryStack_CalendarModal");
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default NoData;
