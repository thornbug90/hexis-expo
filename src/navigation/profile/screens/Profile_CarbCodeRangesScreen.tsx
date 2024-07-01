import React from "react";
import ProfileCard from "../../../components/profile/ProfileCard";
import Wrapper from "../../../components/shared/Wrapper";
import { Carb_Code, useCarbRangeQuery } from "../../../generated/graphql";
import { Text, View } from "react-native";
import { LogoIcon } from "../../../components/icons/general";
import tw from "../../../lib/tw";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ProfileStackParamsList } from "../ProfileStack";
import Loading from "../../../components/shared/LoadingScreen";
import client from "../../../lib/graphql";
import useUser from "../../../hooks/useUser";

type Props = NativeStackScreenProps<
  ProfileStackParamsList,
  "Profile_CarbCodeRangesInfoScreen"
>;

const Profile_CarbCodeRangesScreen: React.FC<Props> = ({ navigation }) => {
  const { user, loading: isLoading } = useUser();
  if (isLoading) return <Loading />;

  const carbRanges = user?.carbRanges;

  return (
    <Wrapper>
      <View style={tw`mx-4`}>
        <Text style={tw`font-poppins-regular text-white my-4`}>
          Personalised Carb Codes are expertly tailored to the unique demands of
          your primary sport, training status and bodyweight.
        </Text>
        <ProfileCard.Container>
          <ProfileCard.Item
            Icon={LogoIcon}
            title="Understanding Carb Code Ranges"
            showArrow
            onPress={() =>
              navigation.navigate("Profile_CarbCodeRangesInfoScreen")
            }
          />
        </ProfileCard.Container>
        <ProfileCard.Container label="Your Meal Ranges">
          <ProfileCard.CarbRange
            carbCode={Carb_Code.High}
            min={carbRanges?.mainRange.highMin?.toFixed().toString()}
            max={"Infinity"}
          />
          <ProfileCard.CarbRange
            carbCode={Carb_Code.Medium}
            min={carbRanges?.mainRange.medMin?.toFixed().toString()}
            max={carbRanges?.mainRange.medMax?.toFixed().toString()}
          />
          <ProfileCard.CarbRange
            carbCode={Carb_Code.Low}
            min={carbRanges?.mainRange.lowMin?.toFixed().toString()}
            max={carbRanges?.mainRange.lowMax?.toFixed().toString()}
          />
        </ProfileCard.Container>
        <ProfileCard.Container label="Your Snack Ranges">
          <ProfileCard.CarbRange
            carbCode={Carb_Code.High}
            min={carbRanges?.snackRange.highMin?.toFixed().toString()}
            max={"Infinity"}
          />
          <ProfileCard.CarbRange
            carbCode={Carb_Code.Medium}
            min={carbRanges?.snackRange.medMin?.toFixed().toString()}
            max={carbRanges?.snackRange.medMax?.toFixed().toString()}
          />
          <ProfileCard.CarbRange
            carbCode={Carb_Code.Low}
            min={carbRanges?.snackRange.lowMin?.toFixed().toString()}
            max={carbRanges?.snackRange.lowMax?.toFixed().toString()}
          />
        </ProfileCard.Container>
      </View>
    </Wrapper>
  );
};

export default Profile_CarbCodeRangesScreen;
