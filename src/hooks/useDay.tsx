import { useDayByDateQuery } from "../generated/graphql";
import client from "../lib/graphql";
import { moreThanAWeekAhead } from "../utils/date";
import useAppDate from "./useAppDate";

const useDay = () => {
  const [appDate] = useAppDate();

  const { data, isLoading, isRefetching, refetch } = useDayByDateQuery(
    client,
    {
      date: appDate,
    },
    {
      enabled: !moreThanAWeekAhead(appDate),
    },
    {
      retry: false,
    }
  );
  return {
    data: data?.day,
    refetch,
    loading: isLoading || isRefetching,
  };
};

export default useDay;
