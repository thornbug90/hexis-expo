import {
  useSearchQuery,
  Nutritics_Obj_Type,
  Meal_Name,
  Meal_Type,
} from "../generated/graphql";
import client from "../lib/graphql";

const useNutriticsSearch = (
  keywords: string,
  type: Nutritics_Obj_Type,
  userFoodOnly: boolean,
  mealType?: Meal_Type
) => {
  const { data, isLoading, refetch } = useSearchQuery(client, {
    nutriticsObjType: type,
    keywords: keywords,
    userFoodOnly: userFoodOnly,
    mealType,
  });
  return { data: data?.search, loading: isLoading, refetch };
};

export default useNutriticsSearch;
