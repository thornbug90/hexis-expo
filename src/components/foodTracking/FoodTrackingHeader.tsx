import React from "react";
import { View, Text, Pressable } from "react-native";
import tw from "../../lib/tw";
import { CancelIcon } from "../icons/general";
import IconButton from "../shared/IconButton";
import SvgThreeDots from "../icons/general/ThreeDots";
import SvgTrash from "../icons/general/Trash";
import { useState } from "react";
import { Menu, MenuItem, MenuDivider } from "react-native-material-menu";
import useVerifyMeal from "../../hooks/useVerifyMeal";

type Props = {
  mealName: string;
  goBack: Function;
  verificationId: string | undefined;
  setWaitingSubScreen: Function;
};
const Header: React.FC<Props> = ({
  mealName,
  goBack,
  verificationId = undefined,
  setWaitingSubScreen,
}) => {
  const [visible, setVisible] = useState(false);
  const hideMenu = () => setVisible(false);
  const showMenu = () => setVisible(true);

  const { deleteVerifyMeal } = useVerifyMeal();
  const deleteMealLog = async () => {
    setWaitingSubScreen(true);
    hideMenu();
    if (verificationId) deleteVerifyMeal({ id: verificationId });
    goBack();
  };
  return (
    <View style={tw` pt-6 border-b-2 border-background-500`}>
      <View style={tw`mx-4 flex flex-row `}>
        <View style={tw`justify-center`}>
          <Pressable
            onPress={() => {
              goBack();
            }}
            style={tw`p-0.5 border border-white rounded-full`}
          >
            <View style={tw`h-5 w-5`}>
              <CancelIcon color={tw.color("white")} />
            </View>
          </Pressable>
        </View>
        <View style={tw`grow pt-1 justify-center`}>
          <Text style={tw`self-center text-white text-base tracking-wide`}>
            {mealName}
          </Text>
        </View>
        <View style={tw`h-13 w-5`}>
          <Menu
            visible={visible}
            anchor={
              <IconButton
                Icon={SvgThreeDots}
                onPress={showMenu}
                variant="transparent"
                size="small"
              />
            }
            onRequestClose={hideMenu}
            style={tw`bg-background-500 h-16 w-60 mt-10  `}
          >
            <MenuItem
              onPress={deleteMealLog}
              pressColor={tw.color("background-500")}
            >
              <View style={tw`flex flex-row p-4 h-10`}>
                <View style={tw`w-6 h-6`}>
                  <SvgTrash color={tw.color("white")} />
                </View>

                <Text style={tw`text-white  h-8 ml-2 text-lg`}>
                  Delete meal log
                </Text>
              </View>
            </MenuItem>
          </Menu>
        </View>
      </View>
    </View>
  );
};

export default Header;
