import { useCarbCodeSystemQuery } from "../generated/graphql";
import client from "../lib/graphql";

const useCarbCodeSystem = () => {
  const { data, isLoading } = useCarbCodeSystemQuery(client);
  return { data: data?.carbCodeSystem, loading: isLoading };
};

export default useCarbCodeSystem;
