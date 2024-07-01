import * as React from "react";
import { useEffect, useState } from "react";
import { Animated, TouchableOpacity, View } from "react-native";
import tw from "../../../lib/tw";
import { useAtom } from "jotai";
import { mainHeightAtom } from "../../../store";
type TabProps = {
  focusAnim: any;
  title: string;
  onPress: () => void;
  selectedTab: string;
};
const Tab: React.FC<TabProps> = ({
  selectedTab,
  focusAnim,
  title,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={tw`flex justify-center w-20 flex-row`}>
        <Animated.View
          style={tw`${
            title === selectedTab ? " py-0.5 border-b-2 border-white" : ""
          }`}
        >
          <Animated.Text
            style={tw`${
              title === selectedTab ? "text-white" : "text-gray-200"
            } font-poppins-semibold tracking-wide text-xxs capitalize leading-4`}
          >
            {title}
          </Animated.Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const TabBar = (props: any) => {
  const { navigationState, navigation, position } = props;
  const [tabSelected, setTabSelected] = useState<string>("Carb Codes");
  const [_, setMainHeight] = useAtom(mainHeightAtom);

  useEffect(() => {
    setMainHeight(props.layout.height);
  }, [props.layout.height]);

  return (
    <View
      style={tw`mx-5 mt-4 mb-2 px-3 flex flex-row justify-between items-center`}
    >
      {navigationState.routes.map((route: any, index: number) => {
        return (
          <Tab
            selectedTab={tabSelected}
            key={route.key}
            focusAnim={"focusAnim"}
            title={route.params.title}
            onPress={() => {
              setTabSelected(route.params.title);
              navigation.navigate(route.name);
            }}
          />
        );
      })}
    </View>
  );
};

export default TabBar;
