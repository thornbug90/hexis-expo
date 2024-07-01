import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView } from "react-native";
import ProfileHeader from "../../../components/profile/ProfileHeader";
import Button from "../../../components/shared/Button";
import Card from "../../../components/shared/Card";
import TextInput from "../../../components/shared/TextInput";
import { Sex } from "../../../generated/graphql";
import useUser from "../../../hooks/useUser";
import tw from "../../../lib/tw";
import { ProfileStackParamsList } from "../ProfileStack";

type Props = NativeStackScreenProps<ProfileStackParamsList, "Profile_SexModal">;

const Profile_SexModal: React.FC<Props> = ({ navigation }) => {
  const [sex, setSex] = useState<Sex>();
  const [genderIdentity, setGenderIdentity] = useState("");

  const { user } = useUser();

  useEffect(() => {
    if (user?.sex) {
      setSex(user.sex);
    }
  }, []);

  const onSave = () => {
    navigation.navigate("Profile_BiometricsScreen", {
      sex: sex!,
      genderIdentity: genderIdentity!,
    });
  };

  const onSexPress = (sex: Sex) => () => setSex(sex);

  return (
    <SafeAreaView style={tw`flex-1`}>
      <View style={tw`flex-1`}>
        <View style={tw`mx-4 flex-1`}>
          <ProfileHeader
            text="Your physiology impacts how your body uses energy. For the most
            accurate results please select the option which best describes your
            physiology."
          />
          <TextInput
            onChangeText={setGenderIdentity}
            placeholder={
              user?.genderIdentity ? `${user.genderIdentity} ` : "Your Gender"
            }
          />
          {genderIdentity.length > 0 ? (
            <View>
              <Text style={tw`text-white font-poppins-regular mb-4 text-xs`}>
                Gender identity does not always align with our biology but when
                it comes to nutrition, different sexes will burn energy at
                different rates.
              </Text>
              <Text style={tw`text-white font-poppins-regular mb-4 text-xs`}>
                To accurately build a nutrition plan it is important to know
                which physiology best fits your body.
              </Text>
            </View>
          ) : null}
          <Card
            text="Male"
            onPress={onSexPress(Sex.Male)}
            active={sex === Sex.Male}
          />
          <Card
            text="Female"
            onPress={onSexPress(Sex.Female)}
            active={sex === Sex.Female}
          />
        </View>
      </View>
      <View style={tw`flex-row items-center mx-4`}>
        <Button
          style="flex-1 ml-2"
          variant="primary"
          label="Done"
          onPress={onSave}
        />
      </View>
    </SafeAreaView>
  );
};

export default Profile_SexModal;
