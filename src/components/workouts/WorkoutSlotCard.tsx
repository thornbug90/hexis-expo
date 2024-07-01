import { View, Text, TouchableOpacity } from "react-native";
import { Meal_Name, Workout } from "../../generated/graphql";
import activities from "../../lib/activities";
import tw from "../../lib/tw";
import { convertMealName } from "../../utils/enumNames";
import Label from "../shared/Label";
type Props = {
  onPress?: any;
  activityId: string;
  disabled?: boolean;
  active?: boolean;
  meal?: Meal_Name;
};

const WorkoutSlotCard: React.FC<Props> = ({
  meal,
  disabled,
  active,
  activityId,
  onPress,
}) => {
  const { icon: Icon, name = null } =
    activities[activityId as keyof typeof activities];
  return disabled ? (
    <>
      <View
        style={tw`opacity-40 p-2 flex-row bg-background-500 border border-background-300 rounded-lg `}
      >
        <View style={tw`h-7 w-0.8 bg-activeblue-100 mr-4`} />
        <Text
          style={tw`ml-2 text-white self-center font-poppins-medium text-xs tracking-wide`}
        >
          Workout Slot Unavailable
        </Text>
      </View>
      <Text style={tw`opacity-40 text-white text-xs my-4`}>
        {convertMealName(meal!)}
      </Text>
    </>
  ) : active ? (
    <>
      <View
        style={tw`py-3 px-2 flex-row bg-background-500 border border-activeblue-100 rounded-lg `}
      >
        <View style={tw`mr-4 w-5 h-5`}>
          {Icon && <Icon color={tw.color("activeblue-100")} />}
        </View>
        <Text
          style={tw`self-center text-activeblue-100 font-poppins-medium text-xs tracking-wide`}
        >
          {name}
        </Text>
      </View>
      <Text style={tw`text-white text-xs my-4`}>{convertMealName(meal!)}</Text>
    </>
  ) : (
    <>
      <TouchableOpacity
        onPress={onPress}
        style={tw`p-2 flex-row bg-background-500 border border-background-300 rounded-lg `}
      >
        <View style={tw`h-7 w-0.8 bg-activeblue-100 mr-4`} />
        <Text
          style={tw`ml-2 text-white self-center font-poppins-medium text-xs tracking-wide`}
        >
          + Add Workout
        </Text>
      </TouchableOpacity>
      <Text style={tw`text-white text-xs my-4`}>{convertMealName(meal!)}</Text>
    </>
  );
};

export default WorkoutSlotCard;
