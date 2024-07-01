import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { Alert, Modal, View } from "react-native";
import BiometricsModal from "../../../components/profile/BiometricsModal";
import ErrorModal from "../../../components/shared/ErrorModal";
import Button from "../../../components/shared/Button";
import Card from "../../../components/shared/Card";
import DateTimeTextInput from "../../../components/shared/DateTimeTextInput";
import HeightInput from "../../../components/shared/HeightInput";
import Label from "../../../components/shared/Label";
import TextInput from "../../../components/shared/TextInput";
import WeightInput from "../../../components/shared/WeightInput";
import Wrapper from "../../../components/shared/Wrapper";
import {
  Goal,
  Height_Unit,
  Sex,
  Weight_Unit,
} from "../../../generated/graphql";
import useUser from "../../../hooks/useUser";
import tw from "../../../lib/tw";
import { convertSex } from "../../../utils/enumNames";
import { ProfileStackParamsList } from "../ProfileStack";
import { differenceInYears } from "date-fns";

type Props = NativeStackScreenProps<
  ProfileStackParamsList,
  "Profile_BiometricsScreen"
>;

const Profile_BiometricsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user, updateUser } = useUser();

  const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date(user?.dob));
  const [sex, setSex] = useState<Sex>();
  const [genderIdentity, setGenderIdentity] = useState<string>();
  const [weight, setWeight] = useState<string>();
  const [weightUnit, setWeightUnit] = useState<Weight_Unit>();
  const [height, setHeight] = useState<string>();
  const [heightUnit, setHeightUnit] = useState<Height_Unit>();
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [showGainErrorModal, setShowGainErrorModal] = useState<boolean>(false);
  const [hasError, setHasError] = useState<{
    status: boolean;
    errorMessage: string;
  }>({ status: false, errorMessage: "" });

  useEffect(() => {
    if (user?.dob) {
      setDateOfBirth(new Date(user.dob));
    }
    if (user?.sex) {
      setSex(user.sex);
    }
    if (user?.genderIdentity) {
      setGenderIdentity(user.genderIdentity);
    }
    if (user?.weight) {
      setWeight(String(user.weight));
    }
    if (user?.weightUnit) {
      setWeightUnit(user?.weightUnit);
    }
    if (user?.height) {
      setWeight(String(user.weight));
    }
    if (user?.heightUnit) {
      setWeightUnit(user?.weightUnit);
    }
  }, []);

  useEffect(() => {
    if (route.params?.sex) {
      setSex(route.params.sex);
    }
    if (route.params?.genderIdentity === "" || route.params?.genderIdentity) {
      setGenderIdentity(route.params.genderIdentity);
    }
  }, [route]);

  const isUnder16 =
    dateOfBirth && differenceInYears(new Date(), dateOfBirth) < 16;

  const onSave = () => {
    if (isUnder16)
      Alert.alert("You must be at least 16 years old to use this app.");

    if (
      (user?.goal === Goal.Gain && Number(weight) >= user.targetWeight!) ||
      (user?.goal === Goal.Lose && Number(weight) <= user.targetWeight!)
    ) {
      setShowErrorModal(true);
    } else {
      updateUser({
        input: {
          dob: dateOfBirth,
          sex: sex,
          genderIdentity:
            genderIdentity && genderIdentity.length > 0 ? genderIdentity : null,
          height: Number(height),
          heightUnit: heightUnit,
          weight: Number(weight),
          weightUnit: weightUnit,
        },
      });
      navigation.goBack();
    }
  };

  const onCancel = () => {
    navigation.goBack();
  };

  return (
    <Wrapper>
      <View style={tw`mx-4`}>
        <View style={tw`my-2`}>
          <DateTimeTextInput
            value={dateOfBirth ?? new Date()}
            label="Date of Birth"
            onChange={setDateOfBirth}
            mode="date"
            error={
              isUnder16
                ? "You must be at least 16 years old to use this app."
                : undefined
            }
          />
        </View>

        <Label text="Sex" />
        <Card
          leftOriented={true}
          text={
            genderIdentity && genderIdentity.length > 0
              ? genderIdentity
              : convertSex(sex!)
          }
          onPress={() => navigation.navigate("Profile_SexModal")}
        />

        <HeightInput
          onboarding={false}
          heightUnit={heightUnit ?? user?.heightUnit!}
          height={height ?? String(user?.height)}
          onUnitChange={(unit) => setHeightUnit(unit)}
          onChange={(text) => setHeight(text)}
          setHasError={setHasError}
        />

        <WeightInput
          label="Weight"
          weightUnit={weightUnit ?? user?.weightUnit!}
          weight={weight ?? String(user?.weight!)}
          onUnitChange={(unit) => setWeightUnit(unit)}
          onChange={(weight) => setWeight(weight)}
          setHasError={setHasError}
        />
      </View>
      <View style={tw`flex-row items-center mt-4 mx-4`}>
        <Button
          size="small"
          style="flex-1 mr-2"
          variant="secondary"
          label="Cancel"
          onPress={onCancel}
        />
        <Button
          size="small"
          style="flex-1 ml-2"
          variant="primary"
          label="Save"
          onPress={onSave}
          disabled={hasError.status || dateOfBirth === undefined || isUnder16}
        />
      </View>
      <ErrorModal
        textSmall={true}
        show={showErrorModal}
        errorMessage={
          "You have passed your target weight. Update your goal or your target weight to continue."
        }
        buttonTitle="Open Goals"
        onDismiss={() => setShowErrorModal(false)}
        onRedirect={() => {
          setShowErrorModal(false);
          navigation.navigate("Profile_GoalScreen");
        }}
      />
    </Wrapper>
  );
};

export default Profile_BiometricsScreen;
