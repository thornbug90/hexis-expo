import axios from "axios";

const getProviderInfo = (provider: string) => {
  switch (provider) {
    case "TrainingPeaks":
      return {
        baseURL: process.env.TRAINING_PEAKS_OAUTH_URL,
        clientId: process.env.TRAINING_PEAKS_CLIENT_ID,
        clientSecret: process.env.TRAINING_PEAKS_SECRET, // TODO: Change this to use secrets management
      };
    default:
      throw new Error(`Invalid Provider: ${provider}`);
  }
};

export const getRefreshOrAccessToken = async (accessCode: string, codeType: "refresh" | "access", provider: string): Promise<string> => {
  if (!accessCode) throw new Error("No access code provided");
  if (!codeType) throw new Error("No code type provided");
  if (!provider) throw new Error("No provider provided");

  const grantType = codeType === "refresh" ? "authorization_code" : "refresh_token";

  const { baseURL, clientId, clientSecret } = getProviderInfo(provider);

  try {
    const { data: accessInfo } = await axios.post(
      `${baseURL}/token`,
      {
        client_id: clientId,
        grant_type: grantType,
        client_secret: clientSecret,
        ...(codeType === "access" && { refresh_token: accessCode }),
        ...(codeType === "refresh" && {
          code: decodeURI(accessCode),
          redirect_uri: "hexis://trainingpeaks",
        }),
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    if (!accessInfo || Object.keys(accessInfo).length === 0) {
      throw new Error("No access info returned");
    }

    if (codeType === "refresh" && accessInfo.refresh_token) {
      return accessInfo.refresh_token;
    } else if (codeType === "access" && accessInfo.access_token) {
      return accessInfo.access_token;
    } else {
      console.warn("Invalid response from provider", accessInfo);
      throw new Error("Response did not contain a refresh token or access token");
    }
  } catch (error) {
    console.error("Could not get refresh token");
    throw error;
  }
};
