import { useAddNutriticsObjectMutation } from "../generated/graphql";
import client from "../lib/graphql";

const useAddNutriticsObject = () => {
  const { mutate: addNutriticsObject } = useAddNutriticsObjectMutation(client);
  return { addNutriticsObject };
};

export default useAddNutriticsObject;
