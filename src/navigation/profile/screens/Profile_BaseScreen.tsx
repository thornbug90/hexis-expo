import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { format } from "date-fns";
import React, { useEffect } from "react";
import { Text, TouchableWithoutFeedback, View } from "react-native";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import {
  CalendarIcon,
  ClockIcon,
  CurrentWeightIcon,
  CutleryIcon,
  HeartRateIcon,
  HeightIcon,
  LogoIcon,
  PrimarySportIcon,
  ProfileIcon,
  SettingsIcon,
  StarIcon,
  TargetWeightIcon,
  TrophyIcon,
  WakeTimeIcon,
  LinkIcon,
  TimezoneIcon,
  Fire,
} from "../../../components/icons/general";
import ProfileCard from "../../../components/profile/ProfileCard";
import Loading from "../../../components/shared/LoadingScreen";
import Wrapper from "../../../components/shared/Wrapper";
import {
  Goal,
  Height_Unit,
  Weight_Unit,
  useUserQuery,
} from "../../../generated/graphql";
import useUser from "../../../hooks/useUser";
import activities from "../../../lib/activities";
import tw from "../../../lib/tw";
import { convertToFt, convertToLbs } from "../../../utils/conversions";
import {
  convertGoal,
  convertLifestyleActivities,
  convertSex,
  convertTotalActivityDuration,
  convertWeightUnit,
} from "../../../utils/enumNames";
import { ProfileStackParamsList } from "../ProfileStack";
import Profile_Integration from "./Profile_Integrations";
import { getTimezone } from "../../../utils/date";
import Fire2 from "../../../components/icons/general/Fire2";
import client from "../../../lib/graphql";
import { useFocusEffect } from "@react-navigation/native";

type Props = NativeStackScreenProps<
  ProfileStackParamsList,
  "Profile_BaseScreen"
>;

dayjs.extend(utc);
dayjs.extend(timezone);

const Profile_BaseScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateUser } = useUser();
  const { refetch, isRefetching } = useUserQuery(client);
  if (!user) return <Loading />;

  const favouriteActivity = user.favouriteActivities.filter(
    (i) => i!.primary
  )[0];
  const convertedWeight = (weight: number) => {
    if (user.weightUnit === Weight_Unit.Kg) {
      return Number(weight).toFixed(1);
    } else {
      return Math.round(convertToLbs(String(weight)));
    }
  };
  const convertedHeight = (height: number) => {
    return convertToFt(String(height));
  };

  useFocusEffect(() => {
    refetch();
  });

  useEffect(() => {
    updateUser({
      input: {
        timezone: getTimezone(),
      },
    });
  }, []);

  const [, , data] = new Date().toTimeString().split(":");
  const currentTimezone = data.slice(3);

  return (
    <Wrapper>
      <View
        style={tw`flex-row mx-4 items-center py-4 border-b border-background-100 mb-4`}
      >
        <Text style={tw`flex-1 text-white font-poppins-semibold text-lg`}>
          {user?.firstName} {user?.lastName}
        </Text>
        <TouchableWithoutFeedback
          onPress={() => {
            navigation.navigate("Profile_AccountSettings");
          }}
        >
          <View style={tw`w-6 h-6`}>
            <SettingsIcon color={tw.color("white")} />
          </View>
        </TouchableWithoutFeedback>
      </View>
      <View style={tw`mx-4`}>
        <ProfileCard.Container label="Personalised Nutrition">
          <ProfileCard.Item
            onPress={() => navigation.navigate("Profile_CarbCodeRangesScreen")}
            title="Carb Code Ranges"
            Icon={LogoIcon}
            showArrow
          />
          <ProfileCard.Item
            title="RMR"
            Icon={Fire}
            value={`${Math.round(user?.RMR || 1480)} kcal`}
          />
        </ProfileCard.Container>
        <ProfileCard.Container label="Fitness">
          <ProfileCard.Item
            title="Efficiency - Cycling"
            Icon={Fire2}
            value={`${user?.Efficiency || 21.7}%`}
          />
        </ProfileCard.Container>
        <ProfileCard.Container label="Devices">
          <ProfileCard.Item
            onPress={() => navigation.navigate("Profile_Integration")}
            title="Integrations"
            Icon={LinkIcon}
            showArrow
          />
        </ProfileCard.Container>

        <ProfileCard.Container
          label="Goals"
          onPress={() => navigation.navigate("Profile_GoalScreen")}
        >
          <ProfileCard.Item
            Icon={TrophyIcon}
            title="Goal"
            onPress={() => navigation.navigate("Profile_GoalScreen")}
            value={convertGoal(user?.goal!)}
          />

          {user?.goal !== Goal.Maintain ? (
            <ProfileCard.Item
              Icon={TargetWeightIcon}
              title="Target Weight"
              onPress={() => navigation.navigate("Profile_GoalScreen")}
              value={`${convertedWeight(
                user.targetWeight!
              )} ${convertWeightUnit(user.weightUnit)}`}
            />
          ) : null}
          <ProfileCard.Item
            Icon={CurrentWeightIcon}
            title="Current Weight"
            value={`${convertedWeight(user?.weight!)} ${convertWeightUnit(
              user.weightUnit
            )}`}
            onPress={() => navigation.navigate("Profile_GoalScreen")}
          />
        </ProfileCard.Container>
        <ProfileCard.Container
          label="Workouts"
          onPress={() => navigation.navigate("Profile_FavouriteActivities")}
        >
          <ProfileCard.Item
            onPress={() => navigation.navigate("Profile_FavouriteActivities")}
            Icon={PrimarySportIcon}
            title="Primary Sport"
            value={
              favouriteActivity
                ? activities[
                    favouriteActivity.activityId as keyof typeof activities
                  ].name
                : "none"
            }
          />
          <ProfileCard.Item
            onPress={() => navigation.navigate("Profile_FavouriteActivities")}
            Icon={StarIcon}
            title="Favourite Workouts"
            showArrow
          />
          <ProfileCard.Divider />
          <ProfileCard.Item
            onPress={() => navigation.navigate("Profile_FavouriteActivities")}
            Icon={ClockIcon}
            title="Hours per week"
            value={convertTotalActivityDuration(user?.totalActivityDuration!)}
          />
        </ProfileCard.Container>
        <ProfileCard.Container label="Meal Patterns & Timings">
          <ProfileCard.Item
            Icon={CutleryIcon}
            title="Meal pattern"
            showArrow
            onPress={() => navigation.navigate("Profile_MealPatternsScreen")}
          />
        </ProfileCard.Container>
        <ProfileCard.Container label="Timezone">
          <ProfileCard.Item Icon={TimezoneIcon} title={user.timezone || ""} />
        </ProfileCard.Container>
        <ProfileCard.Container label="Lifestyle">
          <ProfileCard.Item
            Icon={HeartRateIcon}
            title="Activity Levels"
            value={convertLifestyleActivities(user?.lifestyleActivity!)}
            onPress={() => navigation.navigate("Profile_LifestyleScreen")}
          />
          <ProfileCard.Item
            Icon={WakeTimeIcon}
            title="Sleep Patterns"
            showArrow
            onPress={() => navigation.navigate("Profile_LifestyleScreen")}
          />
        </ProfileCard.Container>
        <ProfileCard.Container
          label="Biometrics"
          onPress={() => {
            navigation.navigate("Profile_BiometricsScreen");
          }}
        >
          <ProfileCard.Item
            Icon={CalendarIcon}
            title="Date of Birth"
            value={format(new Date(user.dob), "dd/MM/yyyy")}
            onPress={() => {
              navigation.navigate("Profile_BiometricsScreen");
            }}
          />
          <ProfileCard.Item
            Icon={ProfileIcon}
            title="Sex"
            value={
              user.genderIdentity ? user.genderIdentity : convertSex(user?.sex!)
            }
            onPress={() => {
              navigation.navigate("Profile_BiometricsScreen");
            }}
          />
          <ProfileCard.Item
            Icon={HeightIcon}
            title="Height"
            value={
              user.heightUnit === Height_Unit.M
                ? `${Math.round(user?.height!)} cm`
                : `${convertedHeight(user.height!).feet} Ft ${Math.round(
                    convertedHeight(user.height!).inches
                  )} In`
            }
            onPress={() => {
              navigation.navigate("Profile_BiometricsScreen");
            }}
          />
          <ProfileCard.Item
            Icon={CurrentWeightIcon}
            title="Weight"
            value={`${convertedWeight(user?.weight!)} ${convertWeightUnit(
              user.weightUnit
            )}`}
            onPress={() => {
              navigation.navigate("Profile_BiometricsScreen");
            }}
          />
        </ProfileCard.Container>
      </View>
    </Wrapper>
  );
};

export default Profile_BaseScreen;
