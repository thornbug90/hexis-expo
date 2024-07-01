import { Workout_Source, useOnDemandSyncQuery } from "../generated/graphql";
import client from "../lib/graphql";
import { Wearable_Source } from "../lib/integrations";

const useOnDemandSync = (providers: string[], isEnabled = false) => {
  const {
    data: pullTPWorkoutsPerDay,
    refetch,
    isLoading,
    isRefetching,
  } = useOnDemandSyncQuery(
    client,
    {
      input: {
        providers: providers,
      },
    },
    {
      enabled: isEnabled,
    }
  );

  return {
    data: pullTPWorkoutsPerDay,
    refetch,
    isLoading: isLoading || isRefetching,
  };
};

export default useOnDemandSync;
