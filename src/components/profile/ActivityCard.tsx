import { Text, TouchableWithoutFeedback, View } from "react-native";
import activities from "../../lib/activities";
import tw from "../../lib/tw";
import { CancelIcon } from "../icons/general";

type Props = {
  moreRounded?: boolean;
  id?: keyof typeof activities;
  onPress?: () => void;
  onRemove?: () => void;
  showRemove?: boolean;
};

const ActivityCard: React.FC<Props> = ({
  moreRounded,
  id,
  onPress,
  onRemove,
  showRemove,
}) => {
  if (!id) {
    return (
      <TouchableWithoutFeedback onPress={onPress}>
        <View
          style={tw`bg-background-300 rounded-larger shadow px-4 py-6.5 items-center mb-4`}
        ></View>
      </TouchableWithoutFeedback>
    );
  }

  const { name = null, icon: Icon } = activities[id];
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View
        style={tw`bg-background-300  ${
          moreRounded ? "rounded-xl" : "rounded-larger"
        } shadow py-3 px-4 items-center mb-4`}
      >
        <View style={tw`flex-row items-center`}>
          <View style={tw`w-8 h-8 mr-4`}>
            {Icon && <Icon color={tw.color("activeblue-100")} />}
          </View>
          <Text style={tw`font-poppins-medium text-white flex-1`}>{name}</Text>
          {showRemove && (
            <TouchableWithoutFeedback
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              onPress={(e) => {
                if (onRemove) {
                  onRemove();
                  e.stopPropagation();
                }
              }}
            >
              <View style={tw`w-5 h-5`}>
                <CancelIcon color={tw.color("white")} />
              </View>
            </TouchableWithoutFeedback>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ActivityCard;
