import React, { FC, useEffect, useRef, useState } from "react";
import {
  AppState,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  SectionList,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Wrapper from "../../../components/shared/Wrapper";
import tw from "../../../lib/tw";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ProfileStackParamsList } from "../ProfileStack";

import { atom, useAtom } from "jotai";
import Loading from "../../../components/shared/LoadingScreen";
import { ArrowRightIcon } from "../../../components/icons/general";
import useWearableSources from "../../../hooks/useWearableSources";
import { WearableSource, Wearable_Status } from "../../../generated/graphql";
import useRefetchDay from "../../../hooks/useRefetchDay";
import { getIntegrationImage } from "../../../utils/getImage";

type Props = NativeStackScreenProps<
  ProfileStackParamsList,
  "Profile_CarbCodeRangesInfoScreen"
>;

type WearableSections = {
  title: string;
  data: Partial<WearableSource>[];
};

const { width, height } = Dimensions.get("screen");
export const refreshSourcesAtom = atom(false);

const Profile_Integration: FC<Props> = ({ navigation }) => {
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const platformSpecificIntegration = ["Apple Health", "Health Connect"];

  const _handleAppStateChange = (nextAppState: any) => {
    if (
      appState.current.match(/active/) &&
      nextAppState.match(/inactive|background/)
    ) {
      //console.log(`WORNING GO INTO SLEEP`);
    } else if (
      appState.current.match(/inactive|background/) &&
      nextAppState.match(/active/)
    ) {
      refetch();
    }
    appState.current = nextAppState;
    setAppStateVisible(appState.current);
  };

  const [refreshSources, setRefreshSources] = useAtom(refreshSourcesAtom);
  useEffect(() => {
    AppState.addEventListener("change", _handleAppStateChange);

    return () => {
      AppState.removeEventListener("change", _handleAppStateChange);
    };
  }, []);

  let {
    data: wearableSources,
    loading: isLoading,
    refetch,
    isFetching,
  } = useWearableSources();

  useEffect(() => {
    if (refreshSources) {
      refetch();
      setRefreshSources(false);
    }
  }, [refreshSources]);

  const connectedDataSources: WearableSections = {
    title: "Connected",
    data: [],
  };

  const availableDataSources: WearableSections = {
    title: "Available",
    data: [],
  };

  const dataSources = wearableSources;
  if (dataSources?.length) {
    dataSources.map(
      (dataSource) =>
        dataSource &&
        !platformSpecificIntegration.includes(dataSource.name) &&
        (dataSource.status === Wearable_Status.Connected
          ? connectedDataSources.data.push(dataSource)
          : availableDataSources.data.push(dataSource))
    );
  }

  // addPlatformSpecificSource as integration source
  const addPlatformSpecificSource = () => {
    if (Platform.OS === "ios" && dataSources?.length) {
      dataSources.map(
        (dataSource) =>
          dataSource &&
          dataSource.name === "Apple Health" &&
          (dataSource.status === Wearable_Status.Connected
            ? connectedDataSources.data.push(dataSource)
            : availableDataSources.data.push(dataSource))
      );
    }
    if (Platform.OS === "android" && dataSources?.length) {
      dataSources.map(
        (dataSource) =>
          dataSource &&
          dataSource.name === "Health Connect" &&
          (dataSource.status === Wearable_Status.Connected
            ? connectedDataSources.data.push(dataSource)
            : availableDataSources.data.push(dataSource))
      );
    }
  };
  addPlatformSpecificSource();
  const keyExtractor = (item: WearableSource) => item.name;

  return isLoading || isFetching ? (
    <Loading backgroundColor="#18152D" />
  ) : (
    <Wrapper
      style={{
        width: width,
        height,
        ...tw`flex-1`,
      }}
    >
      <View style={tw`mx-4 py-4`}>
        <SectionList
          keyExtractor={keyExtractor}
          sections={[connectedDataSources]}
          renderItem={({ item }) => (
            <TouchableWithoutFeedback
              onPress={() => {
                navigation.navigate("Profile_ManageIntegration", { item });
              }}
            >
              <View
                style={tw`px-4 py-4 flex-row items-center rounded-lg bg-background-300 mb-3`}
              >
                <View style={tw`mr-4`}>
                  {/* @ts-ignore */}
                  <Image
                    source={getIntegrationImage(item)}
                    style={tw`w-8 h-8 rounded-md`}
                  />
                </View>
                <Text style={tw`flex-1 text-white font-poppins-medium`}>
                  {item.name}
                </Text>
                <View style={tw`w-5 h-5`}>
                  <ArrowRightIcon color={tw.color("white")} />
                </View>
              </View>
            </TouchableWithoutFeedback>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text
              style={tw`text-xs tracking-wider font-poppins-regular text-white mb-4`}
            >
              {title}
            </Text>
          )}
        />
      </View>

      <View style={tw`p-4 py-6 bg-background-400 h-full`}>
        <SectionList
          keyExtractor={keyExtractor}
          sections={[availableDataSources]}
          renderItem={({ item }) => (
            <TouchableWithoutFeedback
              onPress={() => {
                navigation.navigate("Profile_ManageIntegration", { item });
              }}
            >
              <View
                style={tw`px-4 py-4 flex-row items-center rounded-lg bg-background-300 mb-3`}
              >
                <View style={tw`mr-4`}>
                  {/* @ts-ignore */}
                  <Image
                    source={getIntegrationImage(item)}
                    style={tw`w-8 h-8 rounded-md`}
                  />
                </View>
                <Text style={tw`flex-1 text-white font-poppins-medium`}>
                  {item.name}
                </Text>
                <View style={tw`w-5 h-5`}>
                  <ArrowRightIcon color={tw.color("white")} />
                </View>
              </View>
            </TouchableWithoutFeedback>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text
              style={tw`text-xs tracking-wider font-poppins-regular text-white mb-4`}
            >
              {title}
            </Text>
          )}
        />
      </View>
    </Wrapper>
  );
};

export default Profile_Integration;
