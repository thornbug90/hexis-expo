import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { Text, View, Platform } from "react-native";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import { useNavigation } from "@react-navigation/native";

import ProfileCard from "../../../components/profile/ProfileCard";
import Button from "../../../components/shared/Button";
import Wrapper from "../../../components/shared/Wrapper";
import useAuth from "../../../hooks/useAuth";
import tw from "../../../lib/tw";
import { ProfileStackParamsList } from "../ProfileStack";
import useRemoveNotificationToken from "../../../hooks/useRemoveNotificationToken";
import useUser from "../../../hooks/useUser";
import { deleteFCMToken } from "../../../lib/pushNotification";

type Props = NativeStackScreenProps<
  ProfileStackParamsList,
  "Profile_AccountSettings"
>;
const Profile_AccountSettings: React.FC<Props> = () => {
  const { logout } = useAuth();
  const navigation = useNavigation();

  const { user } = useUser();

  const { removeNotificationToken } = useRemoveNotificationToken();

  return (
    <Wrapper>
      <View style={tw`mx-4 mt-4`}>
        <ProfileCard.Container label="Account details">
          <Text style={tw`text-white font-poppins-regular p-4`}>
            Control your account settings through your web dashboard.
          </Text>
        </ProfileCard.Container>
        <ProfileCard.Container label="Support">
          <ProfileCard.Item
            onPress={() => {
              Linking.openURL("http://hexis.live/support");
            }}
            title="FAQs"
            showArrow
          />
          <ProfileCard.Item
            onPress={() => {
              Linking.openURL("http://hexis.live/support");
            }}
            title="Contact support"
            showArrow
          />
          <ProfileCard.Item
            onPress={() => {
              Linking.openURL("http://hexis.live/support");
            }}
            title="Tutorials"
            showArrow
          />
        </ProfileCard.Container>
        <ProfileCard.Container label="Legal">
          <ProfileCard.Item
            onPress={() => {
              Linking.openURL("https://hexis.live/terms-conditions");
            }}
            title="Terms & Conditions"
            showArrow
          />
          <ProfileCard.Item
            onPress={() => {
              Linking.openURL("https://hexis.live/privacy-policy");
            }}
            title="Privacy Policy"
            showArrow
          />
        </ProfileCard.Container>
        <ProfileCard.Container label="App">
          <ProfileCard.Item
            title="Version"
            value={Constants?.releaseChannel?.version || ""}
          />
          <ProfileCard.Item
            title="Build"
            value={Platform.select({
              ios: Constants.expoConfig?.ios?.buildNumber,
              android: `${Constants.expoConfig?.android?.versionCode}`,
            })}
          />
          <ProfileCard.Item
            title="Identifier"
            value={Platform.select({
              ios: Constants.expoConfig?.ios?.bundleIdentifier,
              android: Constants.expoConfig?.android?.package,
            })}
          />

          {Constants?.releaseChannel && (
            <ProfileCard.Item title={Constants.releaseChannel} />
          )}
        </ProfileCard.Container>
        <Button
          variant="secondary"
          onPress={async () => {
            await deleteFCMToken();
            //FIXME: the tokens returned are in this form [{token:''}] an array of object containing token property with a string value, required to find a way to identify what token to delete
            if (user?.notificationTokens?.[0]?.token)
              removeNotificationToken({
                token: user?.notificationTokens?.[0]?.token,
              });
            await logout();

            navigation.reset({
              index: 0,
              // @ts-ignore
              routes: [{ name: "Unauthenticated_WelcomeScreen" }],
            });
          }}
          label="Sign out"
        />
      </View>
    </Wrapper>
  );
};

export default Profile_AccountSettings;
