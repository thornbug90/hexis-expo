import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import Button from "../../../components/shared/Button";
import Card from "../../../components/shared/Card";
import Label from "../../../components/shared/Label";
import Loading from "../../../components/shared/LoadingScreen";
import TextInput from "../../../components/shared/TextInput";
import WeightInput from "../../../components/shared/WeightInput";
import Wrapper from "../../../components/shared/Wrapper";
import { Goal, Weight_Unit } from "../../../generated/graphql";
import useUser from "../../../hooks/useUser";
import tw from "../../../lib/tw";
import { convertGoal } from "../../../utils/enumNames";
import { ProfileStackParamsList } from "../ProfileStack";
import ErrorModal from "../../../components/shared/ErrorModal";

type Props = NativeStackScreenProps<
  ProfileStackParamsList,
  "Profile_GoalScreen"
>;
const Profile_GoalScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user, updateUser } = useUser();
  const [currentWeight, setCurrentWeight] = useState<string>();
  const [currentTargetWeight, setCurrentTargetWeight] = useState<string>();
  const [currentGoal, setCurrentGoal] = useState<Goal>(Goal.Maintain);
  const [weightUnit, setWeightUnit] = useState<Weight_Unit>();
  const [currentWeightUnit, setCurrentWeightUnit] = useState<Weight_Unit>();
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [showWeightErrorModal, setShowWeightErrorModal] =
    useState<boolean>(false);
  const [weightErrorMessage, setWeightErrorMessage] = useState<string>();

  useEffect(() => {
    setCurrentGoal(user?.goal!);
    setCurrentWeight(String(user?.weight!));
    setCurrentTargetWeight(String(user?.targetWeight!));
    setWeightUnit(user?.weightUnit);
  }, []);

  useEffect(() => {
    if (route.params?.goal) {
      setCurrentGoal(route.params.goal);
    }
  }, [route]);

  const enableSaveForLose =
    currentGoal === Goal.Lose &&
    currentWeight &&
    currentTargetWeight &&
    Number(currentTargetWeight) < Number(currentWeight);

  const enableSaveForMaintain = currentWeight
    ? Goal.Maintain && currentWeight!.length > 0
    : false;

  const enableSaveForGain =
    currentGoal === Goal.Gain &&
    currentWeight &&
    currentTargetWeight &&
    Number(currentTargetWeight) > Number(currentWeight);

  const onSave = () => {
    if (currentGoal == Goal.Lose && user?.mealplan?.meals.length === 6) {
      setShowErrorModal(true);
    } else if (currentGoal === Goal.Lose && !enableSaveForLose) {
      setWeightErrorMessage("less");
      setShowWeightErrorModal(true);
    } else if (currentGoal === Goal.Gain && !enableSaveForGain) {
      setWeightErrorMessage("more");
      setShowWeightErrorModal(true);
    } else {
      updateUser({
        input: {
          targetWeight:
            currentGoal !== Goal.Maintain
              ? Number(currentTargetWeight)
              : Number(currentWeight),
          weight: Number(currentWeight),
          goal: currentGoal,
          weightUnit: weightUnit,
        },
      });
      navigation.navigate("Profile_BaseScreen");
    }
  };

  const onCancel = () => {
    navigation.goBack();
  };

  if (!user) return <Loading />;
  return (
    <Wrapper>
      <View style={tw`mx-4 mt-4 flex-1`}>
        <Label text="Weight goal" />
        <Card
          leftOriented={true}
          text={convertGoal(currentGoal)}
          onPress={() => {
            navigation.navigate("Profile_GoalScreenModal", {
              goal: currentGoal,
            });
          }}
        />

        {(currentGoal === Goal.Lose || currentGoal === Goal.Gain) && (
          <View style={tw`mt-4`}>
            <WeightInput
              label="Target Weight"
              weightUnit={weightUnit ?? user.weightUnit}
              weight={currentTargetWeight ?? String(user.targetWeight!)}
              onUnitChange={setWeightUnit}
              onChange={(weight) => setCurrentTargetWeight(weight)}
            />
          </View>
        )}
        <WeightInput
          label="Current Weight"
          weightUnit={weightUnit ?? user.weightUnit}
          weight={currentWeight ?? String(user?.weight!)}
          onUnitChange={setWeightUnit}
          onChange={(weight) => setCurrentWeight(weight)}
        />
      </View>
      <View style={tw`flex-row items-center mx-4`}>
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
          disabled={currentGoal === Goal.Maintain && !enableSaveForMaintain}
          label="Save"
          onPress={onSave}
        />
      </View>
      <ErrorModal
        textSmall={true}
        cancel={true}
        show={showErrorModal}
        errorMessage={
          "To continue you must update your meal pattern. The maximum meals for a weight loss target is 5."
        }
        buttonTitle="Open Meal Patterns"
        onDismiss={() => setShowErrorModal(false)}
        onRedirect={() => {
          navigation.navigate("Profile_MealPatternsScreen");
          setShowErrorModal(false);
        }}
      />
      <ErrorModal
        textSmall={true}
        cancel={false}
        show={showWeightErrorModal}
        errorMessage={`Your target weight must be ${weightErrorMessage} than your current weight to save your goal as ${currentGoal.toLowerCase()}.`}
        buttonTitle="OK"
        onDismiss={() => setShowWeightErrorModal(false)}
        onRedirect={() => {
          setShowWeightErrorModal(false);
        }}
      />
    </Wrapper>
  );
};

export default Profile_GoalScreen;
