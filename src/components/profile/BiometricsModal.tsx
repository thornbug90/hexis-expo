import { Height_Unit, Weight_Unit } from "../../generated/graphql";
import Modal from "react-native-modal";
import tw from "../../lib/tw";
import { KeyboardAvoidingView, Text, View } from "react-native";
import WeightInput from "../shared/WeightInput";
import HeightInput from "../shared/HeightInput";
type Props = {
  show: boolean;
  onDismiss: () => void;
  mode: "height" | "weight";
  title: string;
  onWeightUnitChange?: (weightUnit: Weight_Unit) => void;
  onHeightUnitChange?: (heightUnit: Height_Unit) => void;
  onChange: (string: string) => void;
  biometricValue: string;
  weightUnit?: Weight_Unit;
  heightUnit?: Height_Unit;
};
const BiometricsModal: React.FC<Props> = ({
  weightUnit,
  heightUnit,
  show,
  onDismiss,
  mode,
  title,
  onWeightUnitChange,
  onHeightUnitChange,
  onChange,
  biometricValue,
}) => {
  return (
    <Modal
      isVisible={show}
      onDismiss={onDismiss}
      onBackdropPress={onDismiss}
      hasBackdrop={true}
      style={tw`border border-background-300 bg-background-500 flex flex-1 mb-60 mt-48 mx-8 rounded-lg `}
    >
      <KeyboardAvoidingView behavior={"padding"} style={tw`p-6 items-center`}>
        <Text style={tw`text-white font-poppins-medium text-lg mt-2 mb-4`}>
          {title}
        </Text>
        {mode === "weight" ? (
          <WeightInput
            weight={biometricValue}
            weightUnit={weightUnit!}
            onChange={onChange}
            onUnitChange={onWeightUnitChange!}
          />
        ) : (
          <HeightInput
            height={biometricValue}
            heightUnit={heightUnit!}
            onChange={onChange}
            onUnitChange={onHeightUnitChange!}
          />
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default BiometricsModal;
