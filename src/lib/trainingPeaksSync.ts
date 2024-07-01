import {
  OnDemandSyncDocument,
  OnDemandSyncQuery,
  WearableSource,
  Workout_Source,
} from "../generated/graphql";
import client from "./graphql";

export const syncTP = async (TPWearable: WearableSource) => {
  const result: OnDemandSyncQuery = await client.request(OnDemandSyncDocument, {
    input: { providers: [TPWearable.id] },
  });
  const TPSyncResult = result.onDemandSync?.filter(
    (provider) => provider?.provider === TPWearable.id
  )?.[0];

  const returnedResult = {
    connected: TPSyncResult?.status === "SUCCESS" ? true : false,
    syncedNumbers:
      TPSyncResult?.status === "SUCCESS"
        ? Number(TPSyncResult?.message)
        : TPSyncResult?.message,
    isSynced: TPSyncResult?.status === "SUCCESS" ? true : false,
    wearableSource: Workout_Source.TrainingPeaks,
  };

  return returnedResult;
};
