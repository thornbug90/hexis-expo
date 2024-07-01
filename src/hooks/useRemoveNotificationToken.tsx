import { useRemoveNotificationTokenMutation } from "../generated/graphql";
import client from "../lib/graphql";

const useRemoveNotificationToken = () => {
  const { mutate: removeNotificationToken } =
    useRemoveNotificationTokenMutation(client);
  return { removeNotificationToken };
};

export default useRemoveNotificationToken;
