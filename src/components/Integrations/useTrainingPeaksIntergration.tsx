import {
  Wearable_Status,
  useUpdateWearableStatusMutation,
} from "../../generated/graphql";
import useWearableSources from "../../hooks/useWearableSources";
import client from "../../lib/graphql";
import * as Linking from "expo-linking";

const useTrainingPeaksIntegration = () => {
  const { mutate: updateWearableStatus } =
    useUpdateWearableStatusMutation(client);
  const { data: wearableSources } = useWearableSources();

  const updateSource = (url: string) => {
    const { queryParams } = Linking.parse(url);
    const TPcode = queryParams?.code;
    updateWearableStatus({
      input: {
        id: wearableSources?.find((item) => item?.name === "TrainingPeaks")
          ?.id as string,
        status: Wearable_Status.Connected,
        code: TPcode as string,
      },
    });
  };

  return { updateSource };
};

export default useTrainingPeaksIntegration;
