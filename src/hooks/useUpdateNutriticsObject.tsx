import { useUpdateNutriticsObjectMutation } from "../generated/graphql";
import client from "../lib/graphql";

const useUpdateNutriticsObject = () => {
  const { mutate: updateNutriticsObject } =
    useUpdateNutriticsObjectMutation(client);
  return { updateNutriticsObject };
};

export default useUpdateNutriticsObject;
