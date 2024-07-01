import { FoodLog, useFoodLogQuery } from "../generated/graphql";
import client from "../lib/graphql";
import { MealVerification } from "../generated/graphql";
import { basket } from "../navigation/primary/screens/PrimaryStack_FoodTrackingScreen";

const useFoodLog = (mealVerification?: MealVerification | null) => {
  if (!mealVerification || !mealVerification.id || mealVerification.skipped) {
    return {
      data: { foodObjects: [], portions: [], quantities: [] },
      loading: false,
    };
  }

  const { data, isLoading, refetch } = useFoodLogQuery(client, {
    verificationId: mealVerification.id,
  });
  return { data: data?.foodLog, loading: isLoading, refetch };
};

export default useFoodLog;
