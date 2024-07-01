import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { set } from "date-fns";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableWithoutFeedback } from "react-native";
import Button from "../../../components/shared/Button";
import Card from "../../../components/shared/Card";
import DateTimeTextInput from "../../../components/shared/DateTimeTextInput";
import Label from "../../../components/shared/Label";
import Loading from "../../../components/shared/LoadingScreen";
import Wrapper from "../../../components/shared/Wrapper";
import { Lifestyle_Activity } from "../../../generated/graphql";
import useUser from "../../../hooks/useUser";
import tw from "../../../lib/tw";
import { parseTime, serializeTime } from "../../../utils/date";
import { convertLifestyleActivities } from "../../../utils/enumNames";
import { ProfileStackParamsList } from "../ProfileStack";

type Props = NativeStackScreenProps<
  ProfileStackParamsList,
  "Profile_LifestyleScreen"
>;

const Profile_LifestyleScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user, updateUser } = useUser();

  const [sleep, setSleep] = useState<Date>();
  const [wake, setWake] = useState<Date>();

  useEffect(() => {
    if (user) {
      setSleep(parseTime(user?.sleepTime));
      setWake(parseTime(user?.wakeTime));
      setLifestyleActivity(user.lifestyleActivity!);
    }
  }, [user]);

  useEffect(() => {
    if (route.params?.lifestyleActivity) {
      setLifestyleActivity(route.params.lifestyleActivity);
    }
  }, [route]);

  const [lifestyleActivity, setLifestyleActivity] =
    useState<Lifestyle_Activity>();

  const onCancel = () => {
    navigation.goBack();
  };

  const onSave = () => {
    updateUser({
      input: {
        sleepTime: serializeTime(sleep!),
        wakeTime: serializeTime(wake!),
        lifestyleActivity,
      },
    });

    navigation.goBack();
  };

  if (!user) return <Loading />;

  return (
    <Wrapper>
      <View style={tw`mx-4 flex-1`}>
        <TouchableWithoutFeedback
          onPress={() =>
            navigation.navigate("Profile_ActivityLevelsModal", {
              lifestyleActivity,
            })
          }
        >
          <View style={tw`my-4`}>
            <Label text="Activity levels" />
            <Card
              leftOriented={true}
              onPress={() =>
                navigation.navigate("Profile_ActivityLevelsModal", {
                  lifestyleActivity,
                })
              }
              text={convertLifestyleActivities(lifestyleActivity!)}
            />
          </View>
        </TouchableWithoutFeedback>
        <View style={tw`mb-4`}>
          <DateTimeTextInput
            mode="time"
            label="Wake up time"
            onChange={setWake}
            value={wake ?? set(new Date(), { hours: 8, minutes: 0 })}
          />
        </View>
        <DateTimeTextInput
          mode="time"
          label="Sleep time"
          onChange={setSleep}
          value={sleep ?? set(new Date(), { hours: 22, minutes: 30 })}
        />
      </View>
      <View style={tw`flex-row items-center mx-4`}>
        <Button
          style="flex-1 mr-2"
          variant="secondary"
          label="Cancel"
          size="small"
          onPress={onCancel}
        />
        <Button
          style="flex-1 ml-2"
          variant="primary"
          label="Save"
          size="small"
          onPress={onSave}
        />
      </View>
    </Wrapper>
  );
};

export default Profile_LifestyleScreen;
