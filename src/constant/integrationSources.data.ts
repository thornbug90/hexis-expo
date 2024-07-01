import { WEARABLE_PLATFORM, WEARABLE_SOURCE_TYPE } from "@prisma/client";
import { urlEncode } from "@sentry/utils";

let TPUrl = process.env.TRAINING_PEAKS_OAUTH_URL;
const TPClientId = process.env.TRAINING_PEAKS_CLIENT_ID;
const TPScopes = process.env.TRAINING_PEAKS_OAUTH_SCOPES;
TPUrl = `${TPUrl}/Authorize?${urlEncode({
  response_type: "code",
  client_id: TPClientId,
  scope: TPScopes,
  redirect_uri: "hexis://trainingpeaks",
})}`;

export const IntegrationSource = {
  TrainingPeaks: {
    name: "TrainingPeaks",
    description: "TrainingPeaks source description here",
    image: "",
    authorizationUrl: TPUrl,
    platform: WEARABLE_PLATFORM.AD_HOC,
    type: WEARABLE_SOURCE_TYPE.REMOTE,
  },
  AppleHealth: {
    name: "Apple Health",
    description: "Apple Health source description here",
    image: "",
    authorizationUrl: undefined,
    platform: WEARABLE_PLATFORM.AD_HOC,
    type: WEARABLE_SOURCE_TYPE.LOCAL,
  },
  HealthConnect: {
    name: "Health Connect",
    description: "Health Connect source description here",
    image: "",
    authorizationUrl: undefined,
    platform: WEARABLE_PLATFORM.AD_HOC,
    type: WEARABLE_SOURCE_TYPE.LOCAL,
  },
};
