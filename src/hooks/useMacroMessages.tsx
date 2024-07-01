import { useMacroMessagesQuery } from "../generated/graphql";
import client from "../lib/graphql";

const useMacroMessages = () => {
  const { data, isLoading } = useMacroMessagesQuery(client);
  return { data: data?.macroMessages, loading: isLoading };
};

export default useMacroMessages;
