import { useWearableSourcesQuery } from "../generated/graphql";
import client from "../lib/graphql";

const useWearableSources = () => {
  const { data, isLoading, refetch, isFetching } =
    useWearableSourcesQuery(client);

  return {
    data: data?.wearableSources,
    loading: isLoading || isFetching,
    refetch,
    isFetching,
  };
};

export default useWearableSources;
