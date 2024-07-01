import { View, Text } from "react-native";
import Wrapper from "../../../components/shared/Wrapper";
import tw from "../../../lib/tw";
import TextInput from "../../../components/shared/TextInput";
import { useState } from "react";
import { InputEye } from "../../../components/icons/general";
import Button from "../../../components/shared/Button";
import supabaseClient from "../../../lib/gotrue";
import { resettingPasswordAtom } from "../../../store";
import { useAtom } from "jotai";
import { useNavigation } from "@react-navigation/native";

const Unauthenticated_PasswordResetScreen = () => {
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [_, setResettingPassword] = useAtom(resettingPasswordAtom);
  const nav = useNavigation();

  const UpdateUserPassword = async () => {
    const supabase = await supabaseClient();
    const { error } = await supabase.auth.updateUser({
      password: verifyPassword,
    });
    if (!error) setResettingPassword(false);
    else {
      return setPasswordError(error.message);
    }
    //@ts-ignore
    return nav.navigate("Unauthenticated_SignInScreen");
  };

  return (
    <Wrapper>
      <View style={tw`flex-1 mx-6 mt-4`}>
        <Text style={tw`text-white font-poppins-semibold text-xl mb-12`}>
          Reset your password
        </Text>

        <Text style={tw`text-white font-poppins-regular text-sm mb-12`}>
          Please choose a new password
        </Text>
        {passwordError && (
          <Text style={tw`text-red font-poppins-regular text-sm mb-12`}>
            {passwordError}
          </Text>
        )}
        <TextInput
          label="New password"
          placeholder="Enter your new Password"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          onChangeText={setPassword}
          value={password}
          secureTextEntry={secureTextEntry}
          onRightPress={() => setSecureTextEntry(!secureTextEntry)}
          moreRounded={true}
        />
        <View style={tw`mt-2`}>
          <TextInput
            label="Confirm password"
            placeholder="Confirm your new Password"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="default"
            onChangeText={setVerifyPassword}
            value={verifyPassword}
            secureTextEntry={secureTextEntry}
            onRightPress={() => setSecureTextEntry(!secureTextEntry)}
            moreRounded={true}
          />
        </View>
      </View>
      <View style={tw`mx-4`}>
        <Button
          disabled={password.length === 0 || password !== verifyPassword}
          onPress={UpdateUserPassword}
          label="Reset password"
          size="small"
        />
      </View>
    </Wrapper>
  );
};

export default Unauthenticated_PasswordResetScreen;
