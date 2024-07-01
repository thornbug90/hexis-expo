import React, { useState } from "react";
import {
  TextInput as RNTextInput,
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import tw from "../../../lib/tw";
import { format } from "date-fns";
import { getLiteralDateString } from "../../../utils/date";
import { Appearance } from "react-native";

type Props = {
  placeholder?: string;
  dark?: boolean;
  is24Hour?: boolean;
  size?: "small" | "xsmall";
  label?: string;
  error?: string;
  header?: boolean;
  value: Date;
  rightText?: string;
  onRightPress?: () => void;
  onChange?: (date: Date) => void;
  maximumDate?: Date;
  minimumDate?: Date;
  mode?: "date" | "time" | "time-12";
  disabled?: boolean;
  moreRounded?: boolean;
  centred?: boolean;
  locale?: string;
  interval?: number;
};

const modeFormats: Record<"date" | "time" | "time-12", string> = {
  date: "DD MMMM YYYY",
  time: "HH:mm",
  "time-12": "hh:mm aa",
};

const DateTimeTextInput: React.FC<Props> = ({
  placeholder,
  dark,
  is24Hour = true,
  size,
  label,
  error,
  header = false,
  onChange,
  value,
  disabled = false,
  mode = "date",
  maximumDate,
  minimumDate,
  moreRounded,
  centred = false,
  locale = "en_GB",
  interval = 15,
}) => {
  let textCentred = "";
  let sizeStyle = "py-4";
  if (size === "small") sizeStyle = "py-3";
  if (size === "xsmall") sizeStyle = "py-2.75";
  if (centred) textCentred = "text-center";
  const inputStyle = tw`font-poppins-regular text-base text-white flex-1 px-4 ${sizeStyle} ${textCentred}`;
  const [showDatePicker, setShowDatePicker] = useState(false);
  const onPressHandler = () => {
    if (!disabled) {
      setShowDatePicker(true);
    }
  };

  const timePickerHeader = () => (
    <View style={tw`flex flex-row pt-4 px-5`}>
      <View style={tw`flex-auto w-15 justify-center`}>
        <Text
          style={tw`font-bold text-lg ${
            Appearance.getColorScheme() == "light" ? "text-black" : "text-white"
          } text-left`}
        >
          Set Time
        </Text>
      </View>
      <View style={tw`flex-auto grow`}></View>
      <View style={tw`flex-auto w-5 `}>
        <TouchableOpacity
          onPress={() => {
            console.log(`current date/time: ${new Date()}`);
            onChange?.(new Date());
            setShowDatePicker(!showDatePicker);
          }}
        >
          <Text
            style={tw`text-center pt-1 h-8 text-lg text-blue-500 border rounded-lg border-blue-500`}
          >
            Now
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  return (
    <View style={tw`mb-4`}>
      {label ? (
        <View>
          <Text
            style={tw`font-poppins-regular text-white text-xs mb-2 tracking-wider`}
          >
            {label}
          </Text>
        </View>
      ) : null}

      <TouchableWithoutFeedback onPress={onPressHandler}>
        <View
          style={tw.style([
            `${dark ? "bg-background-500" : "bg-background-300"} ${
              moreRounded ? "rounded-xl" : "rounded-larger"
            } flex-row shadow items-center`,
            error ? "border-red" : "",
            disabled ? "opacity-75" : "",
          ])}
        >
          <RNTextInput
            placeholder={"DATE MONTH YEAR"}
            onPressIn={onPressHandler}
            value={
              mode === "date"
                ? getLiteralDateString(value, modeFormats[mode])
                : format(value, modeFormats[mode])
            }
            editable={false}
            style={inputStyle}
          />
        </View>
      </TouchableWithoutFeedback>

      {error ? (
        <Text style={tw`text-xs text-red-500 font-poppins-medium py-2`}>
          {error}
        </Text>
      ) : null}
      <DateTimePickerModal
        mode={mode == "time-12" ? "time" : mode}
        onCancel={() => {
          setShowDatePicker(false);
        }}
        onConfirm={(date) => {
          setShowDatePicker(false);
          if (onChange) {
            onChange(date);
          }
        }}
        locale={locale}
        is24Hour={is24Hour}
        date={value}
        // @ts-ignore
        minuteInterval={interval}
        maximumDate={maximumDate}
        minimumDate={minimumDate}
        isVisible={showDatePicker}
        customHeaderIOS={header ? timePickerHeader : undefined}
      ></DateTimePickerModal>
    </View>
  );
};

export default DateTimeTextInput;
