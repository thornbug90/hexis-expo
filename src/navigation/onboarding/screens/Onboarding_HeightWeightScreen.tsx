import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import Button from "../../../components/shared/Button";
import HeightInput from "../../../components/shared/HeightInput";
import ProgressIndicator from "../../../components/shared/ProgressIndicator";
import WeightInput from "../../../components/shared/WeightInput";
import Wrapper from "../../../components/shared/Wrapper";
import { Height_Unit, Weight_Unit } from "../../../generated/graphql";
import useUser from "../../../hooks/useUser";
import tw from "../../../lib/tw";

import { OnboardingStackParamsList } from "../OnboardingStack";

type Props = NativeStackScreenProps<
  OnboardingStackParamsList,
  "Onboarding_HeightWeightScreen"
>;

const Onboarding_HeightWeightScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateUser } = useUser();

  const onNavigate = () => {
    updateUser({
      input: {
        height: Number(height),
        weight: Number(weight),
        weightUnit,
        heightUnit,
      },
    });
    navigation.navigate("Onboarding_SleepWakeScreen");
  };

  useEffect(() => {
    if (user?.weight) {
      setWeight(user?.weight?.toString());
    }
    if (user?.height) {
      setHeight(user?.height?.toString());
    }
  }, [user]);

  const [height, setHeight] = useState<string>("");
  const [heightUnit, setHeightUnit] = useState(
    user?.heightUnit ?? Height_Unit.M
  );
  const [weight, setWeight] = useState<string>("");
  const [weightUnit, setWeightUnit] = useState<Weight_Unit>(
    user?.weightUnit ?? Weight_Unit.Kg
  );
  const [hasError, setHasError] = useState<{
    status: boolean;
    errorMessage: string;
  }>({ status: false, errorMessage: "" });

  return (
    <Wrapper>
      <View style={tw`mx-4 flex-1`}>
        <ProgressIndicator currentScreen={2} />
        <Text style={tw`text-white font-poppins-regular text-lg mb-4 mt-8`}>
          Biometrics
        </Text>

        <HeightInput
          onboarding={true}
          onUnitChange={setHeightUnit}
          onChange={setHeight}
          height={height}
          heightUnit={heightUnit ?? Height_Unit.M}
          setHasError={setHasError}
        />
        <View style={tw`mt-2`}>
          <WeightInput
            onboarding={true}
            label="Weight"
            weight={weight}
            onChange={setWeight}
            onUnitChange={setWeightUnit}
            weightUnit={weightUnit ?? Weight_Unit.Kg}
            setHasError={setHasError}
          />
        </View>
      </View>
      <View style={tw`mx-4 mt-10`}>
        <Button
          size="medium"
          disabled={hasError.status || !Number(weight) || !Number(height)}
          label="Next"
          onPress={onNavigate}
        />
      </View>
    </Wrapper>
  );
};

export default Onboarding_HeightWeightScreen;
