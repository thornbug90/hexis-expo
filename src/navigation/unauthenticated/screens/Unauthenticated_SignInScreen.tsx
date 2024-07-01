import { NativeStackScreenProps } from "@react-navigation/native-stack/lib/typescript/src/types";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { InputEye, InputEyeSlash } from "../../../components/icons/general";
import Button from "../../../components/shared/Button";
import TextInput from "../../../components/shared/TextInput";
import Wrapper from "../../../components/shared/Wrapper";
import useAuth from "../../../hooks/useAuth";
// import useUser from "../../../hooks/useUser";
import tw from "../../../lib/tw";
import { UnauthenticatedStackParamsList } from "../UnauthenticatedStack";
// import { getTimezone } from "../../../utils/date";
import { getFCMToken } from "../../../lib/pushNotification";
import useAddNotificationToken from "../../../hooks/useAddNotificationToken";

type Props = NativeStackScreenProps<
  UnauthenticatedStackParamsList,
  "Unauthenticated_SignInScreen"
>;

const Unauthenticated_SignInScreen: React.FC<Props> = ({ navigation }) => {
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  // const { updateUser } = useUser();

  const { addNotificationToken } = useAddNotificationToken();

  const handleLogin = async () => {
    setLoading(true);

    const result = await login(email.trim(), password).catch((err) => {
      setLoading(false);
      setErrorMessage(err.message);
    });

    if (result?.error) {
      setLoading(false);
      setErrorMessage(result?.error?.message);
    }

    const token = await getFCMToken();

    if (token && result?.data?.user) {
      addNotificationToken({ token });
    }
  };

  return (
    <Wrapper>
      <View style={tw`mx-4 flex-1`}>
        <View style={tw`flex my-auto pb-20`}>
          <View style={tw`mb-4`}>
            <TextInput
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              label="Email"
              onChangeText={setEmail}
              value={email}
            />
          </View>

          <TextInput
            placeholder="Password"
            label="Password"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="default"
            onChangeText={setPassword}
            value={password}
            secureTextEntry={secureTextEntry}
            onRightPress={() => setSecureTextEntry(!secureTextEntry)}
            Icon={secureTextEntry ? InputEye : InputEyeSlash}
            error={errorMessage}
          />
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Unauthenticated_PasswordRecoveryScreen")
            }
          >
            <Text style={tw`text-white self-end font-poppins-regular text-xs`}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={tw`mx-4`}>
        <Button
          label="Sign In"
          size="medium"
          loading={loading}
          onPress={handleLogin}
        />
      </View>
    </Wrapper>
  );
};

export default Unauthenticated_SignInScreen;
