import { useWorkoutsByDayQuery } from "../generated/graphql";
import client from "../lib/graphql";

const useWorkoutsByDay = (date: Date) => {
  const { data, isLoading, refetch } = useWorkoutsByDayQuery(client, { date });

  return { data: data?.workoutsByDay, loading: isLoading, refetch };
};

export default useWorkoutsByDay;
