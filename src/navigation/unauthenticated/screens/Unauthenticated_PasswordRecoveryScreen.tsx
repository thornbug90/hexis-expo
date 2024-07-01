import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Linking from "expo-linking";

import Button from "../../../components/shared/Button";
import TextInput from "../../../components/shared/TextInput";
import Wrapper from "../../../components/shared/Wrapper";
import tw from "../../../lib/tw";
import { UnauthenticatedStackParamsList } from "../UnauthenticatedStack";
import useAuth from "../../../hooks/useAuth";

type Props = NativeStackScreenProps<
  UnauthenticatedStackParamsList,
  "Unauthenticated_PasswordRecoveryScreen"
>;

const Unauthenticated_PasswordRecoveryScreen: React.FC<Props> = ({
  navigation,
}) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const SendRecoveryEmail = async () => {
    setLoading(true);
    const response = await resetPassword(email);
    setLoading(false);

    if (response) setEmailSent(true);
  };

  return (
    <Wrapper>
      <View style={tw`mx-4 flex-1 mt-12`}>
        {!emailSent ? (
          <>
            <Text style={tw`text-white text-xl font-poppins-semibold mb-8`}>
              Reset your password
            </Text>
            <Text
              style={tw`text-white font-poppins-regular text-sm mr-24 mb-10`}
            >
              Enter your email below and we will send you a password reset link.
            </Text>
            <TextInput
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              label="Email"
              onChangeText={setEmail}
              value={email}
              moreRounded={true}
            />
          </>
        ) : (
          <>
            <Text style={tw`text-white text-xl font-poppins-semibold mb-8`}>
              Reset your password
            </Text>
            <Text
              style={tw`text-white font-poppins-regular text-sm mr-24 mb-10`}
            >
              We sent you a password reset link. Check your inbox!
            </Text>
            <View style={tw`flex flex-row border-t border-gray-200 pt-8`}>
              <Text style={tw`text-white font-poppins-regular text-sm`}>
                Didn’t receive an email? Contact
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Linking.openURL("http://hexis.live/support");
                }}
                style={tw`flex items-center justify-center`}
              >
                <Text
                  style={tw`text-activeblue-100 font-poppins-regular text-sm`}
                >
                  {" "}
                  support
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
      <View style={tw`mx-4`}>
        <Button
          size="medium"
          disabled={emailSent}
          onPress={SendRecoveryEmail}
          label="Reset password"
          loading={loading}
        />
      </View>
    </Wrapper>
  );
};

export default Unauthenticated_PasswordRecoveryScreen;
