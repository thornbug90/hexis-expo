import {
  Carb_Code,
  Meal_Name,
  Meal_Type,
  useMealInspirationQuery,
} from "../generated/graphql";
import client from "../lib/graphql";

const useMealInspiration = (mealType: Meal_Type, carbCode: Carb_Code) => {
  const { data, isLoading } = useMealInspirationQuery(client, {
    mealType,
    carbCode,
  });
  return { data: data?.mealInspiration, loading: isLoading };
};

export default useMealInspiration;
