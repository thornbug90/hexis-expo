import { useAtom } from "jotai";
import {
  useUpdateVerifyMealMutation,
  useVerifyMealMutation,
  useDeleteVerifyMealMutation,
  MealVerification,
} from "../generated/graphql";
import client from "../lib/graphql";
import { refetchDayAtom } from "./useRefetchDay";
import useFoodLog from "./useFoodLog";
const useVerifyMeal = (
  mealVerification: MealVerification | undefined | null = undefined
) => {
  const {
    data: foodLog,
    loading: remoteLoading,
    refetch: refetchLog,
  } = useFoodLog(mealVerification);
  const [_, setRefetchDay] = useAtom(refetchDayAtom);
  const { mutate: verifyMeal } = useVerifyMealMutation(client, {
    onSuccess: () => {
      setRefetchDay(true);
    },
  });
  const { mutate: updateVerifyMeal } = useUpdateVerifyMealMutation(client, {
    onSuccess: async () => {
      setRefetchDay(true);
      if (refetchLog) {
        await refetchLog();
      }
    },
  });
  const { mutate: deleteVerifyMeal } = useDeleteVerifyMealMutation(client, {
    onSuccess: () => {
      setRefetchDay(true);
    },
  });

  return { verifyMeal, updateVerifyMeal, deleteVerifyMeal };
};

export default useVerifyMeal;
