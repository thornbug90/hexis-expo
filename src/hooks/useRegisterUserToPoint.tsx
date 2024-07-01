import { useQueryClient } from "@tanstack/react-query";
import { useRegisterUserToPointMutation } from "../generated/graphql";
import client from "../lib/graphql";

const useRegisterUserToPoint = () => {
  const queryClient = useQueryClient();
  const { mutate: registerUserToPoint } = useRegisterUserToPointMutation(
    client,
    {
      onSuccess: (data) => {
        queryClient.setQueryData(["user"], () => ({
          user: data.registerUserToPoint,
        }));
      },
    }
  );

  return { registerUserToPoint };
};

export default useRegisterUserToPoint;
