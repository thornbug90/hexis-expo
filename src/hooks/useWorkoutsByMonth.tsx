import { useWorkoutsByMonthQuery } from "../generated/graphql";
import client from "../lib/graphql";

const useWorkoutsByMonth = (date: Date) => {
  const { data, isLoading, refetch } = useWorkoutsByMonthQuery(client, {
    date,
  });

  return { data: data?.workoutsByMonth, loading: isLoading, refetch };
};

export default useWorkoutsByMonth;
