import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { roundToNearestMinutes } from "date-fns";
import { set } from "date-fns/esm";
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import Button from "../../../components/shared/Button";
import DateTimeTextInput from "../../../components/shared/DateTimeTextInput";
import Label from "../../../components/shared/Label";
import ProgressIndicator from "../../../components/shared/ProgressIndicator";
import Wrapper from "../../../components/shared/Wrapper";
import useUser from "../../../hooks/useUser";
import tw from "../../../lib/tw";
import { parseTime, serializeTime } from "../../../utils/date";
import { OnboardingStackParamsList } from "../OnboardingStack";

type Props = NativeStackScreenProps<
  OnboardingStackParamsList,
  "Onboarding_SleepWakeScreen"
>;

const Onboarding_SleepWakeScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateUser } = useUser();

  useEffect(() => {
    if (user && user.sleepTime && user.wakeTime) {
      setSleep(parseTime(user.sleepTime));
      setWake(parseTime(user.wakeTime));
    }
  }, [user]);

  const onNavigate = () => {
    updateUser({
      input: {
        sleepTime: serializeTime(sleep!),
        wakeTime: serializeTime(wake!),
      },
    });
    navigation.navigate("Onboarding_LifestyleActivityScreen");
  };

  const [sleep, setSleep] = useState<Date>(
    set(new Date(), { hours: 22, minutes: 30 })
  );
  const [wake, setWake] = useState<Date>(
    set(new Date(), { hours: 7, minutes: 30 })
  );

  return (
    <Wrapper>
      <View style={tw`mx-4 flex-1`}>
        <ProgressIndicator currentScreen={3} />
        <Text style={tw`text-white font-poppins-regular text-lg mb-4 mt-8`}>
          Lifestyle Patterns
        </Text>
        <Text
          style={tw`text-white font-poppins-regular text-sm tracking-wider max-w-70 mb-12`}
        >
          What time do you typically wake up and go to bed at?
        </Text>
        <View style={tw`mb-2`}>
          <Label onboarding={true} text="Wake Up Time" />
        </View>
        <DateTimeTextInput
          moreRounded={true}
          mode="time"
          onChange={setWake}
          value={wake}
        />
        <View style={tw`mb-2 mt-6`}>
          <Label onboarding={true} text="Sleep Time" />
        </View>
        <DateTimeTextInput
          moreRounded={true}
          mode="time"
          onChange={setSleep}
          value={sleep}
        />
      </View>
      <View style={tw`mx-4`}>
        <Button
          size="medium"
          disabled={!sleep || !wake}
          label="Next"
          onPress={onNavigate}
        />
      </View>
    </Wrapper>
  );
};

export default Onboarding_SleepWakeScreen;
