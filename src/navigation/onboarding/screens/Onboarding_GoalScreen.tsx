import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import GoalList from "../../../components/profile/GoalList";
import Button from "../../../components/shared/Button";
import ButtonGroup from "../../../components/shared/ButtonGroup";
import ErrorModal from "../../../components/shared/ErrorModal";
import ProgressIndicator from "../../../components/shared/ProgressIndicator";
import TextInput from "../../../components/shared/TextInput";
import WeightInput from "../../../components/shared/WeightInput";
import Wrapper from "../../../components/shared/Wrapper";
import { Goal, Weight_Unit } from "../../../generated/graphql";
import useUser from "../../../hooks/useUser";
import tw from "../../../lib/tw";

import { OnboardingStackParamsList } from "../OnboardingStack";

type Props = NativeStackScreenProps<
  OnboardingStackParamsList,
  "Onboarding_GoalScreen"
>;

const Onboarding_GoalScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateUser } = useUser();

  useEffect(() => {
    if (user) {
      if (user.goal) {
        setGoal(user.goal);
      }
      if (user.targetWeight) {
        setTargetWeight(user.targetWeight.toString());
      }
      if (user.weightUnit) {
        setWeightUnit(user.weightUnit);
      }
      if (user.weight) {
        setWeight(user.weight.toString());
      }
    }
  }, [user]);

  const [goal, setGoal] = useState<Goal>();
  const [targetWeight, setTargetWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState<Weight_Unit>(Weight_Unit.Kg);
  const [weight, setWeight] = useState("");
  const [showWeightErrorModal, setShowWeightErrorModal] =
    useState<boolean>(false);
  const [weightErrorMessage, setWeightErrorMessage] = useState<string>();
  console.log({ goal });
  const onNavigate = () => {
    if (goal === Goal.Lose && !enableSaveForLose) {
      setWeightErrorMessage("less");
      setShowWeightErrorModal(true);
    } else if (goal === Goal.Gain && !enableSaveForGain) {
      setWeightErrorMessage("more");
      setShowWeightErrorModal(true);
    } else {
      updateUser({
        input: {
          goal,
          targetWeight:
            goal !== Goal.Maintain
              ? Number(targetWeight)
              : Number(user?.weight),
        },
      });
      navigation.navigate("Onboarding_MealplanScreen");
    }
  };
  const enableSaveForLose =
    goal === Goal.Lose &&
    weight &&
    targetWeight &&
    Number(targetWeight) < Number(weight);

  const enableSaveForMaintain = weight
    ? Goal.Maintain && weight!.length > 0
    : false;

  const enableSaveForGain =
    goal === Goal.Gain &&
    weight &&
    targetWeight &&
    Number(targetWeight) > Number(weight);
  return (
    <Wrapper>
      <View style={tw`mx-4 flex-1`}>
        <ProgressIndicator currentScreen={5} />
        <Text style={tw`text-white font-poppins-regular text-lg mb-6 mt-8`}>
          Weight Goal
        </Text>
        <Text
          style={tw`text-white font-poppins-regular tracking-wide text-sm mb-12 max-w-74`}
        >
          Tell us what you want to achieve. Your Carb Codes will be tailored to
          your goals to ensure you are fuelled to perform when it matters while
          progressing you towards your body composition targets.
        </Text>

        <GoalList onboarding={true} active={goal} onPress={setGoal} />
        {(goal === Goal.Gain || goal === Goal.Lose) && (
          <View style={tw`mt-4`}>
            <WeightInput
              onboarding={true}
              label="Target Weight"
              weight={weight}
              onChange={setTargetWeight}
              onUnitChange={setWeightUnit}
              weightUnit={weightUnit ?? Weight_Unit.Kg}
            />
          </View>
        )}
      </View>
      <View style={tw`flex-row mt-8 mx-4`}>
        <View style={tw`flex-1 mr-2`}>
          <Button
            size="medium"
            variant="secondary"
            label="Change goal"
            onPress={() => setGoal(undefined)}
          />
        </View>
        <View style={tw`flex-1 ml-2`}>
          <Button
            size="medium"
            disabled={
              (goal === Goal.Lose && !targetWeight) ||
              (goal === Goal.Gain && !targetWeight) ||
              !goal
            }
            label="Next"
            onPress={onNavigate}
          />
        </View>
      </View>
      <ErrorModal
        textSmall={true}
        cancel={false}
        show={showWeightErrorModal}
        errorMessage={`Your target weight must be ${weightErrorMessage} than your current weight to save your goal as ${goal?.toLowerCase()}.`}
        buttonTitle="OK"
        onDismiss={() => setShowWeightErrorModal(false)}
        onRedirect={() => {
          setShowWeightErrorModal(false);
        }}
      />
    </Wrapper>
  );
};

export default Onboarding_GoalScreen;
