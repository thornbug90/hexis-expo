import React from "react";
import Wrapper from "../../../components/shared/Wrapper";
import { Text, View } from "react-native";
import tw from "../../../lib/tw";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ProfileStackParamsList } from "../ProfileStack";
import useCarbCodeSystem from "../../../hooks/useCarbCodeSystem";
import CarbCodeMealGuide from "../../../components/carbCodes/CarbCodeMealGuide";
import useDay from "../../../hooks/useDay";
import useUser from "../../../hooks/useUser";
import { useCarbRangeQuery } from "../../../generated/graphql";
import client from "../../../lib/graphql";

type Props = NativeStackScreenProps<
  ProfileStackParamsList,
  "Profile_CarbCodeRangesInfoScreen"
>;

const Profile_CarbCodeRangesInfoScreen: React.FC<Props> = () => {
  const { data: carbSystem, loading: carbSystemLoading } = useCarbCodeSystem();
  const { user: data } = useUser();
  const mainRanges = data?.carbRanges?.mainRange;
  const snackRanges = data?.carbRanges?.snackRange;
  const carbColor = [
    "carbcodelow-100",
    "carbcodemedium-100",
    "carbcodehigh-100",
    "carbcodelow-100",
    "carbcodemedium-100",
    "carbcodehigh-100",
  ];
  const cranges = [
    `${Math.round(mainRanges?.lowMin!)} - ${Math.round(mainRanges?.lowMax!)}`,
    `${Math.round(mainRanges?.medMin!)} - ${Math.round(mainRanges?.medMax!)}`,
    `${Math.round(mainRanges?.highMin!)} - ${"\u221E"}`,
    `${Math.round(snackRanges?.lowMin!)} - ${Math.round(snackRanges?.lowMax!)}`,
    `${Math.round(snackRanges?.medMin!)} - ${Math.round(snackRanges?.medMax!)}`,
    `${Math.round(snackRanges?.highMin!)} - ${"\u221E"}`,
  ];

  return (
    <Wrapper>
      <View style={tw`mx-6`}>
        <Text style={tw`font-poppins-regular text-sm text-white my-6`}>
          The Carb Coding system is designed to optimise your energy to the
          demands of your day. Carb Codes personalise your daily nutrition plan
          by identifying, using colour codes, when you need high, medium or low
          carbohydrate and energy meals/snacks.
        </Text>

        {carbSystem?.map((info, index) => {
          return (
            <View
              key={index}
              style={tw` mb-8 p-5 rounded-lg  bg-background-300 border-t-16 border-${carbColor[index]}`}
            >
              <CarbCodeMealGuide
                instaLink={false}
                color={carbColor[index]}
                carbRange={cranges[index]}
                images={info.images ?? null}
                carbCode={info.carbCode}
                mealType={info.type}
                messages={info.messages}
              />
            </View>
          );
        })}
      </View>
    </Wrapper>
  );
};

export default Profile_CarbCodeRangesInfoScreen;
