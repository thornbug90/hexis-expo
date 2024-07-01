import React, { useEffect, useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  View,
  Text,
  Image,
  Platform,
} from "react-native";
import tw from "../../../lib/tw";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Button from "../../../components/shared/Button";
import {
  ArrowBackAndForth,
  LogoIconWithBackground,
} from "../../../components/icons/general";
import { PrimaryStackParamsList } from "../../primary/PrimaryStack";
import {
  Wearable_Status,
  useUpdateWearableStatusMutation,
  CreateWorkoutWearableInput,
  useCreateWorkoutWearableMutation,
} from "../../../generated/graphql";
import client from "../../../lib/graphql";
import useUser from "../../../hooks/useUser";
import { useAtom } from "jotai";
import { refreshSourcesAtom } from "./Profile_Integrations";
import { getIntegrationImage } from "../../../utils/getImage";
import useTrainingPeaksIntegration from "../../../components/Integrations/useTrainingPeaksIntergration";
import * as Linking from "expo-linking";
import {
  appleHealthPermission,
  healthConnectPermission,
  pushWorkoutsAppleHealth,
  pushWorkoutsHealthConnect,
} from "../../../lib/integrations";
import dayjs from "dayjs";

const { width, height } = Dimensions.get("screen");

type Props = NativeStackScreenProps<
  PrimaryStackParamsList,
  "Profile_ManageIntegration"
>;

const Profile_ManageIntegration: React.FC<Props> = ({ route, navigation }) => {
  const data = route.params?.item;
  const [_, setRefreshSources] = useAtom(refreshSourcesAtom);
  const [isConnecting, setIsConnecting] = useState(false);
  const { user } = useUser();
  const {
    data: updatedStatus,
    mutate: updateWearableStatus,
    isLoading: isUpdatingWearableStatus,
  } = useUpdateWearableStatusMutation(client, {
    onSuccess: () => {
      setRefreshSources(true);
      navigation.navigate("Profile_Integration");
    },
  });
  const { mutate: createWorkoutWearable, isLoading } =
    useCreateWorkoutWearableMutation(client, {
      onSuccess: async (data) => {},
    });
  const { updateSource } = useTrainingPeaksIntegration();

  useEffect(() => {
    const onReceiveURL = ({ url }: { url: string }) => {
      if (url?.indexOf("hexis://trainingpeaks/") > -1) {
        updateSource(url);
        return;
      }
    };
    Linking.addEventListener("url", (url) => {
      onReceiveURL(url);
    });
  }, []);
  const handleAppleHealthConnection = async (
    operation: string = "connect",
    name: string | null | undefined
  ): Promise<boolean> => {
    if (Platform.OS !== "ios" || name !== "Apple Health") return true;
    const wearableId = user?.wearableSources.filter(
      (source) => source?.name === "Apple Health"
    )?.[0]?.id;

    if (
      operation === "disconnect" &&
      data.status === Wearable_Status.Connected
    ) {
      // disconnect apple health and remove the permission
      updateWearableStatus({
        input: { id: data.id, status: Wearable_Status.Disconnected },
      });
      return true;
    } else if (
      operation === "connect" &&
      data.status === Wearable_Status.Disconnected
    ) {
      const permissionGiven = await appleHealthPermission();
      if (permissionGiven) {
        updateWearableStatus({
          input: { id: data.id, status: Wearable_Status.Connected },
        });
        await pushWorkoutsAppleHealth({
          from: dayjs().subtract(5, "day").startOf("day").toDate(),
          updateHook: createWorkoutWearable,
          wearableId: wearableId,
        });
      }
      return true;
    } else return false;
  };
  const handleHealthConnect = async (
    operation: string = "connect",
    name: string | null | undefined
  ): Promise<boolean> => {
    if (Platform.OS !== "android" || name !== "Health Connect") return true;

    if (
      operation === "disconnect" &&
      data.status === Wearable_Status.Connected
    ) {
      // disconnect Health Connect and remove the permission
      updateWearableStatus({
        input: { id: data.id, status: Wearable_Status.Disconnected },
      });
      return true;
    } else if (
      operation === "connect" &&
      data.status === Wearable_Status.Disconnected
    ) {
      const permissionGiven = await healthConnectPermission();
      if (permissionGiven) {
        updateWearableStatus({
          input: { id: data.id, status: Wearable_Status.Connected },
        });
        await pushWorkoutsHealthConnect({
          from: dayjs().subtract(5, "day").startOf("day").toDate(),
          updateHook: createWorkoutWearable,
        });
      }
      return true;
    } else return false;
  };

  const onDisconnectHandler =
    ({ id, status }: { id: string; status: Wearable_Status }) =>
    async () => {
      setIsConnecting(true);
      await handleHealthConnect("disconnect", null);
      if (await handleAppleHealthConnection("disconnect", null)) {
        updateWearableStatus({
          input: { id, status },
        });
      }
      setIsConnecting(false);
    };

  const onLinkPress =
    ({
      id,
      url,
      name,
    }: {
      id: string;
      url?: string | null;
      name?: string | null;
    }) =>
    async () => {
      setIsConnecting(true);
      if (!(await handleAppleHealthConnection("connect", name))) return;
      if (!(await handleHealthConnect("connect", name))) return;
      if (url) {
        setIsConnecting(false);
        navigation.goBack();
        Linking.canOpenURL(url).then(() => {
          Linking.openURL(url);
        });
        return;
      }
      setIsConnecting(false);
    };

  return (
    <SafeAreaView
      style={{
        width: width,
        height,
        ...tw`flex-1 px-4 bg-background-400`,
      }}
    >
      {data.status === Wearable_Status.Connected ? (
        <>
          <View
            style={{
              ...tw`flex flex-row pt-20 justify-center items-center gap-5 h-1/3`,
            }}
          >
            <Image
              source={getIntegrationImage(data)}
              style={tw`w-18 h-18 rounded-xl`}
            />
          </View>
          <View style={{ ...tw`flex justify-between h-2/3 pt-3` }}>
            <View>
              <Text
                style={tw`font-poppins-semibold text-20 text-white text-center mb-3`}
              >
                Manage your {data.name} connection
              </Text>
              <Text
                style={tw`font-poppins-regular tracking-wide text-base text-white text-center mb-3`}
              >
                Your Hexis and {data.name} are connected. {"\n"}
                {"\n"} Hexis incorporates your {data.name} data {"\n"}
                to generate personalised nutrition {"\n"}
                recommendations.
              </Text>
            </View>
            <Button
              label="Disconnect"
              size="medium"
              variant="danger"
              style="w-full font-poppins-medium text-sm text-white text-center mb-10"
              loading={isUpdatingWearableStatus || isConnecting}
              onPress={onDisconnectHandler({
                id: data.id,
                status: Wearable_Status.Disconnected,
              })}
            />
          </View>
        </>
      ) : (
        <>
          <View
            style={{
              ...tw`flex flex-row pt-20 justify-center items-center gap-5 h-1/3`,
            }}
          >
            <Image
              source={getIntegrationImage(data)}
              style={tw`w-18 h-18 rounded-xl`}
            />
            <ArrowBackAndForth />
            <LogoIconWithBackground />
          </View>
          <View style={{ ...tw`flex justify-between h-2/3 pt-3` }}>
            <View>
              <Text
                style={tw`font-poppins-semibold text-20 text-white text-center mb-3`}
              >
                Connect to {data.name}
              </Text>
              <Text
                style={tw`font-poppins-regular tracking-wide text-base text-white text-center mb-3`}
              >
                Hexis connects to {data.name} to sync your {"\n"} workout,
                lifestyle and health data to {"\n"} provide a more personalised
                and {"\n"}
                enhanced experience.
              </Text>
            </View>
            <Button
              label="Continue"
              size="medium"
              variant="primary"
              style="w-full font-poppins-medium text-sm text-white text-center mb-10"
              loading={isUpdatingWearableStatus || isConnecting}
              onPress={onLinkPress({
                id: data.id,
                url: data.authorizationUrl,
                name: data.name,
              })}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default Profile_ManageIntegration;
