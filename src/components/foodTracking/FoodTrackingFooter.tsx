import React from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  TouchableOpacity,
} from "react-native";
import tw from "../../lib/tw";
import DateTimeTextInput from "../shared/DateTimeTextInput";
import Button from "../shared/Button";
import { useState } from "react";
import {
  getLiteralDate,
  getLiteralDateString,
  getLiteralTime,
  serializeTime,
  setLiteralDateTime,
} from "../../utils/date";
import { set } from "date-fns";
import { mealVery } from "../../navigation/primary/screens/PrimaryStack_FoodTrackingScreen";
import useAppDate from "../../hooks/useAppDate";
import Modal from "react-native-modal";

type Props = {
  mealVerification: mealVery;
  setMealVerification: Function;
  setLocalMealTime: Function;
  onChange?: (date: Date) => void;
  onSkip: Function;
  onSave: Function;
};
const Footer: React.FC<Props> = ({
  mealVerification,
  setMealVerification,
  setLocalMealTime,
  onSkip,
  onSave,
}) => {
  const [showSkipConfirmation, setShowSkipConfirmation] = useState(false);
  const [appDate] = useAppDate();

  return (
    <View style={tw`pt-4 px-4 bg-background-300 flex flex-row`}>
      <View style={tw`flex-auto w-17`}>
        <Modal
          onDismiss={() => {
            setShowSkipConfirmation(false);
          }}
          isVisible={showSkipConfirmation}
          onBackdropPress={() => setShowSkipConfirmation(false)}
        >
          <KeyboardAvoidingView
            behavior={"padding"}
            style={tw`p-6 items-center`}
          >
            <View style={tw`bg-background-300 p-5 rounded w-80`}>
              <Text
                style={tw`text-white font-poppins-medium text-center text-lg mt-2 mb-4`}
              >
                Skip this meal?
              </Text>
              <Text
                style={tw`text-white text-center font-light text-base mt-2 mb-4`}
              >
                If you skip this meal you will lose the list of items you have
                currently logged.
              </Text>

              <Text
                style={tw`text-white text-center font-light text-base mt-2 mb-4`}
              >
                Skip anyway?
              </Text>
              <View style={tw`flex flex-row mt-4`}>
                <View style={tw`flex grow`}>
                  <Button
                    label="Skip"
                    variant="secondary"
                    onPress={() => {
                      onSkip();
                    }}
                    size="medium"
                  ></Button>
                </View>
                <View style={tw`flex grow ml-4`}>
                  <Button
                    label="Cancel"
                    variant="primary"
                    onPress={() => {
                      setShowSkipConfirmation(false);
                    }}
                    size="medium"
                  ></Button>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
        <Button
          variant="dark"
          label="Skip"
          size="medium"
          onPress={() => {
            setShowSkipConfirmation(true);
          }}
        ></Button>
      </View>
      <View style={tw`flex-auto w-30 ml-1.5`}>
        {!mealVerification.time ? (
          <View
            style={tw`rounded-lg shadow py-3 px-3 items-center justify-center border mb-4 bg-background-500 border-transparent`}
          >
            <Text style={tw`font-poppins-medium text-white`}>INTRA</Text>
          </View>
        ) : (
          <DateTimeTextInput
            label=""
            dark={true}
            size="xsmall"
            centred={true}
            mode="time-12"
            locale="en"
            header={true}
            value={set(getLiteralDate(mealVerification.time), {
              hours: +getLiteralTime(mealVerification.time).split(":")[0],
              minutes: +getLiteralTime(mealVerification.time).split(":")[1],
            })}
            onChange={(time) => {
              const timeToSave = setLiteralDateTime(
                serializeTime(time),
                getLiteralDateString(appDate)
              );
              setLocalMealTime(timeToSave);
              setMealVerification({
                ...mealVerification,
                time: timeToSave,
              });
            }}
            interval={5}
          />
        )}
      </View>
      <View style={tw`flex-auto w-50 ml-1.5`}>
        <Button
          variant="dark"
          label="Save"
          size="medium"
          onPress={() => onSave()}
        ></Button>
      </View>
    </View>
  );
};

export default Footer;
