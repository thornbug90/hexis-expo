import { format } from "date-fns";
import React, { useState } from "react";
import { View, Text, TouchableWithoutFeedback } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import tw from "../../../lib/tw";

type Props = {
  text: string;
  rightText?: string;
  date?: Date;
  onPress?: () => void;
  active?: boolean;
  onChange?: (date: Date) => void;
};

const TimeCard: React.FC<Props> = ({
  text,
  active,
  date,
  onPress,
  onChange,
}) => {
  const [show, setShow] = useState(false);
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View>
        <View
          style={tw.style([
            `mb-4 bg-background-400 py-4 px-4 rounded-larger shadow`,
            active ? "bg-background-300 border border-activeblue-100" : "",
          ])}
        >
          {date ? (
            <View style={tw`flex-row items-stretch`}>
              <View style={tw`flex-1 items-start justify-center px-2`}>
                <Text style={tw`text-white font-poppins-regular text-base`}>
                  {text}
                </Text>
              </View>

              <TouchableWithoutFeedback
                hitSlop={{
                  top: 12,
                  bottom: 12,
                  left: 12,
                  right: 12,
                }}
                onPress={(e) => {
                  e.stopPropagation();
                  setShow(true);
                }}
              >
                <View style={tw`justify-center items-center px-2`}>
                  <Text style={tw`text-white text-base font-poppins-regular`}>
                    {date ? format(date, "HH:mm") : "hummus"}
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          ) : (
            <View style={tw`items-center justify-center`}>
              <Text style={tw`text-white text-base font-poppins-regular`}>
                {text}
              </Text>
            </View>
          )}
        </View>

        {date && (
          <DateTimePickerModal
            mode="time"
            locale="en_GB"
            is24Hour={true}
            isVisible={show}
            minuteInterval={15}
            onConfirm={(date) => {
              if (onChange) {
                onChange(date);
              }
              setShow(false);
            }}
            onCancel={() => setShow(false)}
            date={date}
          />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default TimeCard;
