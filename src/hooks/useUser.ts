import { useQueryClient } from "@tanstack/react-query";
import { useUpdateUserMutation, useUserQuery } from "../generated/graphql";
import client from "../lib/graphql";
import { updatedDiff } from "deep-object-diff";
import { useAnalytics } from "@segment/analytics-react-native";
import { useAtom } from "jotai";
import { userIdAtom } from "../store";
import { useEffect } from "react";

const useUser = () => {
  const [_, setUserIdAtom] = useAtom(userIdAtom);
  const queryClient = useQueryClient();
  const { data: user, isLoading: loading, refetch } = useUserQuery(client);
  const { track } = useAnalytics();
  const { mutate: updateUser } = useUpdateUserMutation(client, {
    onMutate: (variables) => {
      if (user?.user && variables.input) {
        const diff = updatedDiff(user?.user, variables.input);
        // @ts-ignore
        if (diff.goal) {
          track("GOAL_UPDATED", {
            oldGoal: user!.user!.goal,
            // @ts-ignore
            newGoal: diff.goal,
          });
        }
        // @ts-ignore
        if (diff.targetWeight) {
          track("TARGET_WEIGHT_UPDATED", {
            oldGoal: user!.user!.targetWeight,
            // @ts-ignore
            newGoal: diff.targetWeight,
          });
        }
        // @ts-ignore
        if (diff.weight) {
          track("WEIGHT_UPDATED", {
            oldGoal: user!.user!.weight,
            // @ts-ignore
            newGoal: diff.weight,
          });
        }
      }
    },
    onSuccess: (data) => {
      refetch();
    },
  });

  useEffect(() => {
    if (user && user.user && user.user.id) setUserIdAtom(user.user.id);
  }, [user]);

  return { user: user?.user, updateUser, loading };
};

export default useUser;
