import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View, Text, TouchableOpacity } from "react-native";
import * as Linking from "expo-linking";
import { QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAtom } from "jotai";
import tw from "../../../lib/tw";
import Button from "../../../components/shared/Button";
import { UnauthenticatedStackParamsList } from "../UnauthenticatedStack";
import useUser from "../../../hooks/useUser";
import useAuth from "../../../hooks/useAuth";
import Wrapper from "../../../components/shared/Wrapper";
import { isLoggedInAtom } from "../../../store";
import { getLiteralDate } from "../../../utils/date";
import useRemoveNotificationToken from "../../../hooks/useRemoveNotificationToken";
import { deleteFCMToken } from "../../../lib/pushNotification";

type Props = NativeStackScreenProps<
  UnauthenticatedStackParamsList,
  "Unauthenticated_MembershipInactiveScreen"
>;

const queryClient = new QueryClient();

const Unauthenticated_MembershipInactiveScreen: React.FC<Props> = ({
  navigation,
}) => {
  queryClient.invalidateQueries({ queryKey: ["user"] });
  const { user } = useUser();
  const { logout } = useAuth();
  const [loggedIn] = useAtom(isLoggedInAtom);

  const { removeNotificationToken } = useRemoveNotificationToken();

  useEffect(() => {
    if (user) {
      if (!user?.hasActiveSubscription) {
        console.log({
          message: "user has no subscription -- INACTIVE",
          user,
        });
        queryClient.invalidateQueries({ queryKey: ["user"] });
        return;
      }

      if (user?.onboardingComplete) {
        console.log({
          message: "onboarding complete -- INACTIVE",
          user,
        });
        return navigation.navigate("PrimaryStack", {
          screen: "PrimaryStack_CarbCodesScreen",
          selectedDate: getLiteralDate(),
        });
      }

      if (!user?.onboardingComplete) {
        console.log({
          message: "onboarding not complete -- INACTIVE",
          user,
        });
        return navigation.reset({
          index: 0,
          // @ts-ignore
          routes: [{ name: "OnboardingStack" }],
        });
      }
    }
  }, [user]);

  return (
    <Wrapper>
      <View style={tw`flex-1 mx-6 mt-4`}>
        <Text style={tw`text-white font-poppins-semibold text-xl mr-24 mb-6`}>
          Your membership is inactive.
        </Text>
        <Text style={tw`text-white font-poppins-regular text-sm mr-28 mb-8`}>
          Renew your membership to continue with hexis.
        </Text>
        <Text style={tw`text-white font-poppins-regular text-sm mr-20`}>
          Not sure why you are seeing this message?
          <TouchableOpacity
            onPress={() => {
              Linking.openURL("http://hexis.live/support");
            }}
          >
            <Text style={tw`text-activeblue-100`}> Contact support.</Text>
          </TouchableOpacity>
        </Text>
      </View>
      <View style={tw`mx-4`}>
        <Button
          label="Ok"
          onPress={async () => {
            await logout();
            await deleteFCMToken();
            //FIXME: the tokens returned are in this form [{token:''}] an array of object containing token property with a string value, required to find a way to identify what token to delete
            if (user?.notificationTokens?.[0]?.token)
              removeNotificationToken({
                token: user?.notificationTokens?.[0]?.token,
              });
            navigation.reset({
              index: 0,
              // @ts-ignore
              routes: [{ name: "Unauthenticated_WelcomeScreen" }],
            });
          }}
        />
      </View>
    </Wrapper>
  );
};

export default Unauthenticated_MembershipInactiveScreen;
