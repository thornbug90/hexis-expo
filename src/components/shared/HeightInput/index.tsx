import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { Height_Unit } from "../../../generated/graphql";
import tw from "../../../lib/tw";
import { convertToCm, convertToFt } from "../../../utils/conversions";
import ButtonGroup from "../ButtonGroup";
import Label from "../Label";
import TextInput from "../TextInput";

type Props = {
  heightUnit: Height_Unit;
  height: string;
  onboarding?: boolean;
  onUnitChange: (heightUnit: Height_Unit) => void;
  onChange: (string: string) => void;
  setHasError?: ({
    status,
    errorMessage,
  }: {
    status: boolean;
    errorMessage: string;
  }) => void;
};

type ImperialField = "Feet" | "Inches";

const HeightInput: React.FC<Props> = ({
  onboarding = false,
  onChange,
  onUnitChange,
  setHasError,
  heightUnit,
  height,
}) => {
  const [heightMetric, setHeightMetric] = useState<string>();
  const [heightImperial, setHeightImperial] = useState({
    feet: "",
    inches: "",
  });
  const [unit, setUnit] = useState<Height_Unit>();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setHeightMetric(height);
    const imperial = convertToFt(height);
    setHeightImperial({
      feet: String(imperial.feet),
      inches: String(imperial.inches),
    });
    setUnit(heightUnit);
  }, []);

  useEffect(() => {
    onChange(heightMetric!);
    handleValidateMetricHeight();
  }, [heightMetric]);
  useEffect(() => {
    onChange(String(convertToCm(heightImperial!)));
    handleValidateImperialHeight();
  }, [heightImperial]);

  useEffect(() => {
    if (unit === Height_Unit.M) {
      onChange(heightMetric!);
      onUnitChange(Height_Unit.M);
    } else {
      onChange(convertToCm(heightImperial!).toString());
      onUnitChange(Height_Unit.Ft);
    }
  }, [unit]);

  useEffect(() => {
    if (setHasError) {
      const numericHeight = !Number.isNaN(Number(height)) ? Number(height) : 0;

      setHasError({
        status: !!errorMessage.trim() || !numericHeight,
        errorMessage,
      });
    }
  }, [errorMessage]);

  const onPressMetric = () => {
    setUnit(Height_Unit.M);
    const metricVal = convertToCm(heightImperial!);
    setHeightMetric(Math.round(Number(metricVal)).toString());
  };

  const onPressImperial = () => {
    setUnit(Height_Unit.Ft);
    const imperialVal = convertToFt(heightMetric!);

    setHeightImperial({
      feet: imperialVal.feet.toString(),
      inches: imperialVal.inches.toString(),
    });
  };

  const handleMetricChange = (text: string) => {
    // remove commas and decimal points if any
    let value = text.trim().replace(",", "").replace(".", "");

    setHeightMetric(value);
  };

  const createImperialChangeHandler =
    (field: ImperialField) => (text: string) => {
      // remove commas and decimal points if any
      let value = text.trim().replace(",", "").replace(".", "");

      if (field === "Feet")
        setHeightImperial((heightImperial) => ({
          ...heightImperial,
          feet: value,
        }));

      if (field === "Inches")
        setHeightImperial((heightImperial) => ({
          ...heightImperial,
          inches: value,
        }));
    };

  const handleValidateMetricHeight = () => {
    const height = Number(heightMetric);

    if (height < 100) setErrorMessage("Height should be at least 100cm");
    if (height > 300) setErrorMessage("Height should be 300cm or less");
    if ((height >= 100 && height <= 300) || height === 0) setErrorMessage("");
  };

  const handleValidateImperialHeight = () => {
    const height = convertToCm(heightImperial!);

    if (height < 100)
      setErrorMessage("Height should be at least 3 feet and 3 inches");
    if (height > 300)
      setErrorMessage("Height should be 9 feet and 10 inches or less");
    if ((height >= 100 && height <= 300) || height === 0) setErrorMessage("");
  };

  return (
    <View style={tw`mb-4`}>
      {unit === Height_Unit.M ? (
        <View style={tw`${onboarding ? "mt-8" : "mt-2"}`}>
          <Label onboarding={onboarding} text="Height" />
          <View style={tw`mt-2`}>
            <TextInput
              value={heightMetric}
              // value={`${Math.round(Number(heightMetric))}`}
              onChangeText={handleMetricChange}
              keyboardType="numeric"
              returnKeyType="done"
              rightText={"cm"}
              error={errorMessage}
            />
          </View>
        </View>
      ) : (
        <View style={tw`${onboarding ? "mt-8" : "mt-2"}`}>
          <Label onboarding={onboarding} text="Height" />
          <View style={tw`flex-row items-center mt-2`}>
            <View style={tw`flex-1 mr-2`}>
              <TextInput
                value={heightImperial.feet}
                onChangeText={createImperialChangeHandler("Feet")}
                keyboardType="numeric"
                returnKeyType="done"
                rightText={"ft"}
                error={errorMessage}
              />
            </View>
            <View style={tw`flex-1 ml--6`}>
              <TextInput
                value={heightImperial.inches}
                onChangeText={createImperialChangeHandler("Inches")}
                keyboardType="numeric"
                returnKeyType="done"
                rightText={"in"}
                error={errorMessage}
                hideError={true}
              />
            </View>
          </View>
        </View>
      )}
      <ButtonGroup
        size="small"
        buttons={[
          {
            label: "Metric",
            active: unit === Height_Unit.M,
            onPress: onPressMetric,
          },
          {
            label: "Imperial",
            active: unit === Height_Unit.Ft,
            onPress: onPressImperial,
          },
        ]}
      />
    </View>
  );
};

export default HeightInput;
