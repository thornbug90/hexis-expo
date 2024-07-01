import React from "react";
import { TouchableWithoutFeedback, View, Text } from "react-native";
import tw from "../../../lib/tw";
import DateTimePicker from "react-native-modal-datetime-picker";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  setTime: (time: string) => void;
  tempTime: string;
  mode?: "time" | "date" | "datetime";
  onConfirm: (time: Date) => void;
  date: Date;
  minuteInterval?: 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30;
  onChange: (event: Date) => void;
};
const TimePicker: React.FC<Props> = ({
  open,
  setOpen,
  setTime,
  tempTime,
  mode = "time",
  onConfirm,
  date,
  minuteInterval,
  onChange,
}) => {
  const TimePickerCustomHeader = () => {
    const setTimeAndClosePicker = () => {
      setOpen(false);
      setTime(tempTime);
    };
    return (
      <View style={tw`flex flex-row h-12`}>
        <TouchableWithoutFeedback onPress={setTimeAndClosePicker}>
          <Text
            style={tw`text-base tracking-tight px-[18px] pt-[16px] font-poppins-medium`}
          >
            Done
          </Text>
        </TouchableWithoutFeedback>
      </View>
    );
  };
  const hideDatePicker = () => {
    setOpen(false);
  };
  return (
    <DateTimePicker
      isVisible={open}
      mode={mode}
      onConfirm={onConfirm}
      onCancel={hideDatePicker}
      date={date}
      locale="en_GB"
      is24Hour={true}
      minuteInterval={minuteInterval}
      customCancelButtonIOS={() => <></>}
      customConfirmButtonIOS={() => <></>}
      confirmTextIOS="Done"
      customHeaderIOS={TimePickerCustomHeader}
      onChange={(event: Date) => {
        onChange(event);
      }}
    />
  );
};

export default TimePicker;
