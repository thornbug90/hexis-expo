import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import Button from "../../../components/shared/Button";
import Card from "../../../components/shared/Card";
import ProgressIndicator from "../../../components/shared/ProgressIndicator";
import TextInput from "../../../components/shared/TextInput";
import Wrapper from "../../../components/shared/Wrapper";
import { Sex } from "../../../generated/graphql";
import useUser from "../../../hooks/useUser";
import tw from "../../../lib/tw";
import { OnboardingStackParamsList } from "../OnboardingStack";

type Props = NativeStackScreenProps<
  OnboardingStackParamsList,
  "Onboarding_SexScreen"
>;

const Onboarding_SexScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateUser } = useUser();

  useEffect(() => {
    if (user) {
      if (user?.sex) {
        setSex(user.sex);
      }
      if (user?.genderIdentity) {
        setGenderIdentity(user?.genderIdentity);
      }
    }
  }, [user]);

  const [genderIdentity, setGenderIdentity] = useState<string>("");
  const [sex, setSex] = useState<Sex>();

  const onSexPress = (sex: Sex) => () => setSex(sex);

  const onNavigate = async () => {
    updateUser({
      input: {
        genderIdentity,
        sex,
      },
    });
    navigation.navigate("Onboarding_HeightWeightScreen");
  };
  return (
    <Wrapper>
      <View style={tw`mx-4 flex-1`}>
        <ProgressIndicator currentScreen={1} />
        <Text style={tw`text-white font-poppins-regular text-lg mb-4 mt-8`}>
          Build your profile
        </Text>
        <Text style={tw`text-white font-poppins-regular text-lg mb-4 mt-4`}>
          Sex
        </Text>
        <TextInput
          typed={genderIdentity.length >= 1}
          underlined={true}
          moreRounded={true}
          onChangeText={setGenderIdentity}
          placeholder="Your gender"
        />
        {genderIdentity.length > 0 ? (
          <View>
            <Text
              style={tw`text-white font-poppins-regular tracking-wider mb-4 text-xs`}
            >
              Gender identity does not always align with our biology but when it
              comes to nutrition, different sexes will burn energy at different
              rates.
            </Text>
            <Text
              style={tw`text-white font-poppins-regular mb-8 tracking-wider text-xs`}
            >
              To accurately build a nutrition plan it is important to know which
              physiology best fits your body.
            </Text>
          </View>
        ) : null}
        <Card
          onboarding={true}
          leftOriented={true}
          moreRounded={true}
          text="Male"
          active={sex === Sex.Male}
          onPress={onSexPress(Sex.Male)}
        />
        <Card
          onboarding={true}
          leftOriented={true}
          text="Female"
          active={sex === Sex.Female}
          onPress={onSexPress(Sex.Female)}
        />
        <Text
          style={tw`text-white font-poppins-regular mt-2 text-xs tracking-wider`}
        >
          Your physiology impacts how your body uses energy. For the most
          accurate results please select the option which best describes your
          physiology.
        </Text>
      </View>
      <View style={tw`mt-12 mx-4`}>
        <Button
          size="medium"
          disabled={sex === undefined}
          label="Next"
          onPress={onNavigate}
        />
      </View>
    </Wrapper>
  );
};

export default Onboarding_SexScreen;
