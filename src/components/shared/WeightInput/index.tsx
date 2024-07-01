import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Weight_Unit } from "../../../generated/graphql";
import tw from "../../../lib/tw";
import { convertToKg, convertToLbs } from "../../../utils/conversions";
import ButtonGroup from "../ButtonGroup";
import Label from "../Label";
import TextInput from "../TextInput";

type Props = {
  onboarding?: boolean;
  weightUnit: Weight_Unit;
  weight: string;
  onUnitChange: (weightUnit: Weight_Unit) => void;
  onChange: (string: string) => void;
  label?: string;
  setHasError?: ({
    status,
    errorMessage,
  }: {
    status: boolean;
    errorMessage: string;
  }) => void;
};

const WeightInput: React.FC<Props> = ({
  onboarding = false,
  onChange,
  onUnitChange,
  setHasError,
  weight,
  weightUnit,
  label,
}) => {
  const [weightMetric, setWeightMetric] = useState<string>("0");
  const [unit, setUnit] = useState<Weight_Unit>(weightUnit);
  const [weightImperial, setWeightImperial] = useState<string>("0");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (weight !== weightMetric) {
      setWeightMetric(weight);
      setWeightImperial(String(convertToLbs(weight)));
    }
  }, [weight]);

  useEffect(() => {
    if (weightUnit && weightUnit !== unit) {
      setUnit(weightUnit);
    }
  }, [weightUnit]);

  useEffect(() => {
    if (weightImperial) {
      setWeightMetric(String(convertToKg(weightImperial!).toFixed(1)));
    }
    handleValidateWeight();
  }, [weightImperial]);

  useEffect(() => {
    onChange(weightMetric);
    handleValidateWeight();
  }, [weightMetric]);

  useEffect(() => {
    if (unit === Weight_Unit.Kg) {
      onChange(String(convertToKg(weightImperial!).toFixed(1)));
    } else {
      setWeightImperial(String(convertToLbs(weightMetric).toFixed(1)));
    }
    onUnitChange(unit);
  }, [unit]);

  useEffect(() => {
    if (setHasError) {
      const numericWeight = !Number.isNaN(Number(weight)) ? Number(weight) : 0;

      setHasError({
        status: !!errorMessage.trim() || !numericWeight,
        errorMessage,
      });
    }
  }, [errorMessage]);

  const onPressMetric = () => {
    setUnit(Weight_Unit.Kg);
    const metricVal = convertToKg(weightImperial!);
    setWeightMetric(String(convertToKg(weightImperial!).toFixed(1)));
  };

  const onPressImperial = () => {
    setUnit(Weight_Unit.Lbs);
    const imperialVal = convertToLbs(weightMetric!);
    setWeightImperial(String(convertToLbs(weight).toFixed(1)));
  };

  const handleTextChange = (text: string) => {
    const leadingZero = text.indexOf("0") === 0;
    const decimalPosition = text.indexOf(".");
    const lastIndexOfDecimal = text.lastIndexOf(".");

    // remove commas if any
    let value = text.trim().replace(",", "");

    // prevent leading zeros
    if (leadingZero || decimalPosition === 0) {
      value = "";
    }

    // prevent multiple decimals
    if (decimalPosition > -1 && lastIndexOfDecimal > decimalPosition) return;

    if (decimalPosition > -1) value = value.substring(0, decimalPosition + 2);

    if (unit === Weight_Unit.Kg) {
      setWeightMetric(value);

      return;
    }

    setWeightImperial(value);
  };

  const handleValidateWeight = () => {
    if (unit === Weight_Unit.Kg) {
      const metricNumber = !Number.isNaN(Number(weightMetric))
        ? Number(weightMetric)
        : 0;

      if (metricNumber < 35) setErrorMessage("Weight should be at least 35kgs");
      if (metricNumber > 200)
        setErrorMessage("Weight should be 200kgs or less");

      if ((metricNumber >= 35 && metricNumber <= 200) || metricNumber === 0)
        setErrorMessage("");
      return;
    }

    if (unit === Weight_Unit.Lbs) {
      const imperialNumber = !Number.isNaN(Number(weightImperial))
        ? Number(weightImperial)
        : 0;
      if (imperialNumber < 77)
        setErrorMessage("Weight should be at least 77lbs");
      if (imperialNumber > 441)
        setErrorMessage("Weight should be 441lbs or less");

      if (
        (imperialNumber >= 77 && imperialNumber <= 441) ||
        imperialNumber === 0
      )
        setErrorMessage("");

      return;
    }
  };

  return (
    <View style={tw`mb-4`}>
      {unit && unit === Weight_Unit.Kg ? (
        <View>
          <View style={tw`mb-2`}>
            <Label onboarding={onboarding} text={label ?? ""} />
          </View>
          <TextInput
            value={weightMetric}
            onChangeText={handleTextChange}
            keyboardType="numeric"
            returnKeyType="done"
            rightText={"kg"}
            error={errorMessage}
          />
        </View>
      ) : (
        <View>
          <View style={tw`flex-1`}>
            <View style={tw`mb-2`}>
              <Label onboarding={onboarding} text={label ?? ""} />
            </View>
            <TextInput
              onChangeText={handleTextChange}
              value={weightImperial}
              keyboardType="numeric"
              returnKeyType="done"
              rightText={"lbs"}
              error={errorMessage}
            />
          </View>
        </View>
      )}
      <ButtonGroup
        size="small"
        buttons={[
          {
            label: "Metric",
            active: unit === Weight_Unit.Kg,
            onPress: onPressMetric,
          },
          {
            label: "Imperial",
            active: unit === Weight_Unit.Lbs,
            onPress: onPressImperial,
          },
        ]}
      />
    </View>
  );
};

export default WeightInput;

// import React, { useEffect, useState } from "react";
// import { View } from "react-native";
// import { Weight_Unit } from "../../../generated/graphql";
// import tw from "../../../lib/tw";
// import { convertToKg, convertToLbs } from "../../../utils/conversions";
// import ButtonGroup from "../ButtonGroup";
// import TextInput from "../TextInput";

// type Props = {
//   weightUnit: Weight_Unit;
//   weight: string;
//   onUnitChange: (weightUnit: Weight_Unit) => void;
//   onChange: (string: string) => void;
//   label?: string;
// };

// const WeightInput: React.FC<Props> = ({
//   onChange,
//   onUnitChange,
//   weight,
//   weightUnit,
//   label,
// }) => {
//   const [weightMetric, setWeightMetric] = useState<string>("0");
//   const [unit, setUnit] = useState<Weight_Unit>(Weight_Unit.Kg);
//   const [weightImperial, setWeightImperial] = useState<string>("0");

//   useEffect(() => {
//     if (weightUnit && weightUnit !== unit) {
//       setUnit(weightUnit);
//     }
//   }, [weightUnit]);

//   useEffect(() => {
//     setWeightMetric(weight);
//     setWeightImperial(String(convertToLbs(weight)));
//     setUnit(weightUnit ?? Weight_Unit.Kg);
//   }, []);

//   useEffect(() => {
//     onChange(weightMetric!);
//   }, [weightMetric]);
//   useEffect(() => {
//     onChange(String(convertToKg(weightImperial!)));
//   }, [weightImperial]);

//   useEffect(() => {
//     if (unit === Weight_Unit.Kg) {
//       onChange(weightMetric!);

//       // setWeightMetric(`${Math.round(Number(weightMetric) * 10) / 10}`);
//       onUnitChange(Weight_Unit.Kg);
//     } else {
//       onChange(String(convertToKg(weightImperial!)));
//       onUnitChange(Weight_Unit.Lbs);
//     }
//   }, [unit]);

//   const onPressMetric = () => {
//     setUnit(Weight_Unit.Kg);
//     const metricVal = convertToKg(weightImperial!);
//     setWeightMetric(metricVal.toString());
//   };

//   const onPressImperial = () => {
//     setUnit(Weight_Unit.Lbs);
//     const imperialVal = convertToLbs(weightMetric!);
//     setWeightImperial(imperialVal.toString());
//   };

//   return (
//     <View style={tw`mb-4`}>
//       {unit === Weight_Unit.Kg ? (
//         <View>
//           <TextInput
//             value={weightMetric}
//             onChangeText={(text) => setWeightMetric(text)}
//             //@ts-ignore
//             onSubmitEditing={(e) => {
//               setWeightMetric(`${Math.round(Number(weightMetric) * 10) / 10}`);
//             }}
//             keyboardType="decimal-pad"
//             returnKeyType="done"
//             label={label}
//             rightText={"kg"}
//           />
//         </View>
//       ) : (
//         <View>
//           <View style={tw`flex-1 mr-2`}>
//             <TextInput
//               label={label}
//               onChangeText={(text) => setWeightImperial(text)}
//               value={`${Math.round(Number(weightImperial))}`}
//               keyboardType="numeric"
//               returnKeyType="done"
//               rightText={"lbs"}
//             />
//           </View>
//         </View>
//       )}
//       <ButtonGroup
//         size="small"
//         buttons={[
//           {
//             label: "Metric",
//             active: unit === Weight_Unit.Kg,
//             onPress: onPressMetric,
//           },
//           {
//             label: "Imperial",
//             active: unit === Weight_Unit.Lbs,
//             onPress: onPressImperial,
//           },
//         ]}
//       />
//     </View>
//   );
// };

// export default WeightInput;
