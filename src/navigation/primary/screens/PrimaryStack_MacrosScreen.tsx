import React from "react";
import { Text, View } from "react-native";
import MacroCard from "../../../components/macros/MacroCard";
import Loading from "../../../components/shared/LoadingScreen";
import NoData from "../../../components/shared/NoData";
import ProgressCircle from "../../../components/shared/ProgressCircle";
import Wrapper from "../../../components/shared/Wrapper";
import useAppDate from "../../../hooks/useAppDate";
import useDay from "../../../hooks/useDay";
import useMacroMessages from "../../../hooks/useMacroMessages";
import tw from "../../../lib/tw";
import { moreThanAWeekAhead } from "../../../utils/date";

const PrimaryStack_MacrosScreen = () => {
  const [appDate] = useAppDate();
  const { data: messages } = useMacroMessages();
  const { data: day, refetch, loading } = useDay();

  if (moreThanAWeekAhead(appDate)) return <NoData title="Macros" />;

  if (day === undefined || messages === undefined) {
    return <Loading />;
  }

  if (day === null) {
    return <NoData title="Macros" />;
  }

  return (
    <Wrapper onRefresh={refetch} refreshing={loading}>
      <View style={tw`mx-4 border-b border-background-200`}>
        <Text
          style={tw`self-center text-white font-poppins-semibold mt-4 text-lg`}
        >
          Calorie Target
        </Text>
        <ProgressCircle
          totalValue={Number(day.macros?.energy.toFixed(0))}
          currentValue={Number(day.macros?.energyCurrent.toFixed(0))}
        />
      </View>
      <View style={tw`mx-4`}>
        <Text
          style={tw`my-4 self-center text-white font-poppins-semibold text-lg`}
        >
          Macro Targets
        </Text>
        <MacroCard
          title="Carbohydrates"
          value={day.macros?.carb ?? 0}
          loggedValue={day.macros?.carbsCurrent ?? 0}
          short={messages?.carbs.short}
          long={messages?.carbs.long}
        />
        <MacroCard
          title="Protein"
          loggedValue={day.macros?.proteinCurrent ?? 0}
          value={day.macros?.protein ?? 0}
          short={messages?.protein.short}
          long={messages?.protein.long}
        />
        <MacroCard
          title="Fats"
          loggedValue={day.macros?.fatCurrent ?? 0}
          value={day.macros?.fat ?? 0}
          short={messages?.fat.short}
          long={messages?.fat.long}
        />
      </View>
    </Wrapper>
  );
};

export default PrimaryStack_MacrosScreen;
