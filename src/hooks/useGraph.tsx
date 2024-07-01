import { isAfter } from "date-fns/esm";
import { useLiveGraphByDateQuery } from "../generated/graphql";
import client from "../lib/graphql";
import { getEndOfDay, getLiteralDate } from "../utils/date";
import useAppDate from "./useAppDate";

const useGraph = () => {
  const [appDate] = useAppDate();
  const isFuture = isAfter(appDate, getEndOfDay(getLiteralDate()));

  const { data, isLoading, refetch } = useLiveGraphByDateQuery(
    client,
    {
      date: appDate,
    },
    {
      enabled: !isFuture,
    }
  );

  return { data: data?.liveGraph, refetch, loading: isLoading };
};

export default useGraph;
