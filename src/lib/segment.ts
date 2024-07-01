import { createClient } from "@segment/analytics-react-native";
import Constants from "expo-constants";

const segmentClient = createClient({
  writeKey: Constants.expoConfig!.extra!.SEGMENT_WRITE_KEY,
});

export default segmentClient;
