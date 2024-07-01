import { useAddNotificationTokenMutation } from "../generated/graphql";
import client from "../lib/graphql";

const useAddNotificationToken = () => {
  const { mutate: addNotificationToken } =
    useAddNotificationTokenMutation(client);
  return { addNotificationToken };
};

export default useAddNotificationToken;
