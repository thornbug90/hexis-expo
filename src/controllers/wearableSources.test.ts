describe("ignore", () => {
  it("ignore", () => {});
});
/* import { onDemandSync } from "./wearableSources";
import { getRefreshOrAccessToken } from "../lib/helpers/auth";
import { getTpWorkoutsDay } from "../lib/helpers/workouts";
import { importedWorkoutDataProcessor } from "../models/workout";
import { WorkoutTP } from "../lib/types/tp";
import { OnDemandSyncInput } from "../schema/wearableSources";

jest.mock("../lib/helpers/auth");
jest.mock("../lib/helpers/workouts");
jest.mock("../models/workout");

const mockGetRefreshOrAccessToken = getRefreshOrAccessToken as jest.Mock;
const mockGetTpWorkoutsDay = getTpWorkoutsDay as jest.Mock;
const mockImportedWorkoutDataProcessor = importedWorkoutDataProcessor as jest.Mock;
const userId = "user-id";
const authHeader = "auth-header";
const input: OnDemandSyncInput[] = [{ provider: "TRAINING_PEAKS" }];

describe("onDemandSync", () => {
  it("should call the correct functions for each provider", async () => {
    mockGetRefreshOrAccessToken.mockResolvedValue("access-token");
    mockGetTpWorkoutsDay.mockResolvedValue([{} as WorkoutTP]);

    await onDemandSync(input, userId, authHeader);

    expect(mockGetRefreshOrAccessToken).toHaveBeenCalledTimes(1);
    expect(mockGetTpWorkoutsDay).toHaveBeenCalledTimes(1);
    expect(mockImportedWorkoutDataProcessor).toHaveBeenCalledTimes(1);
  });

  it("should call all the functions for each provider when no provider is specified", async () => {
    mockGetRefreshOrAccessToken.mockResolvedValue("access-token");
    mockGetTpWorkoutsDay.mockResolvedValue([{} as WorkoutTP]);

    await onDemandSync([], userId, authHeader);

    expect(mockGetRefreshOrAccessToken).toHaveBeenCalledTimes(1);
    expect(mockGetTpWorkoutsDay).toHaveBeenCalledTimes(1);
    expect(mockImportedWorkoutDataProcessor).toHaveBeenCalledTimes(1); // this one 1 at the moment because we only have one provider set
  });

  it("doesn't call the importedWorkoutDataProcessor if there are no workouts", async () => {
    mockGetRefreshOrAccessToken.mockResolvedValue("access-token");
    mockGetTpWorkoutsDay.mockResolvedValue([]);

    await onDemandSync(input, userId, authHeader);

    expect(mockGetRefreshOrAccessToken).toHaveBeenCalledTimes(1);
    expect(mockGetTpWorkoutsDay).toHaveBeenCalledTimes(1);
    expect(mockImportedWorkoutDataProcessor).not.toHaveBeenCalled();
  });

  it("should handle errors when getting the access token fails", async () => {
    mockGetRefreshOrAccessToken.mockRejectedValue(new Error("failed to get token"));
    const logSpy = jest.spyOn(console, "error");

    const result = await onDemandSync(input, userId, authHeader);

    expect(mockGetRefreshOrAccessToken).toHaveBeenCalledTimes(1);
    expect(mockGetTpWorkoutsDay).not.toHaveBeenCalled();
    expect(mockImportedWorkoutDataProcessor).not.toHaveBeenCalled();

    expect(result).toEqual([
      {
        provider: "TRAINING_PEAKS",
        status: "FAILURE",
        message: "Failed to import workouts from TRAINING_PEAKS for user user-id. Error: failed to get token",
      },
    ]);
    expect(logSpy).toHaveBeenCalledWith("could not process workouts from TRAINING_PEAKS for user user-id.", "Error: failed to get token");
  });

  it("should handle errors when getting the raw workouts fails", async () => {
    mockGetRefreshOrAccessToken.mockResolvedValue("access-token");
    mockGetTpWorkoutsDay.mockRejectedValue(new Error("failed to get raw"));
    const logSpy = jest.spyOn(console, "error");

    const result = await onDemandSync(input, userId, authHeader);

    expect(mockGetRefreshOrAccessToken).toHaveBeenCalledTimes(1);
    expect(mockGetTpWorkoutsDay).toHaveBeenCalledTimes(1);
    expect(mockImportedWorkoutDataProcessor).not.toHaveBeenCalled();

    expect(result).toEqual([
      {
        provider: "TRAINING_PEAKS",
        status: "FAILURE",
        message: "Failed to import workouts from TRAINING_PEAKS for user user-id. Error: failed to get raw",
      },
    ]);
    expect(logSpy).toHaveBeenCalledWith("could not process workouts from TRAINING_PEAKS for user user-id.", "Error: failed to get raw");
  });

  it("should return the correct status for each provider", async () => {
    const multiInput: OnDemandSyncInput[] = [
      { provider: "TRAINING_PEAKS" },
      { provider: "GARMIN" },
      { provider: "HEALTH_CONNECT" },
      { provider: "APPLE_HEALTH" },
      { provider: "COACH" },
    ];
    mockGetRefreshOrAccessToken.mockResolvedValue("access-token");
    mockGetTpWorkoutsDay.mockResolvedValue([{} as WorkoutTP, {} as WorkoutTP]);

    const result = await onDemandSync(multiInput, userId, authHeader);

    expect(result).toEqual([
      { provider: "TRAINING_PEAKS", status: "SUCCESS", message: "2" },
      {
        provider: "GARMIN",
        status: "FAILURE",
        message: "Failed to import workouts from GARMIN for user user-id. Error: Garmin is not yet implemented",
      },
      {
        provider: "HEALTH_CONNECT",
        status: "FAILURE",
        message: "Failed to import workouts from HEALTH_CONNECT for user user-id. Error: Health Connect is not yet implemented",
      },
      {
        provider: "APPLE_HEALTH",
        status: "FAILURE",
        message: "Failed to import workouts from APPLE_HEALTH for user user-id. Error: Apple Health is not yet implemented",
      },
      {
        provider: "COACH",
        status: "FAILURE",
        message: "Failed to import workouts from COACH for user user-id. Error: Unknown provider: COACH",
      },
    ]);
  });

  it("should say that zero workouts were processed when nothing was done", async () => {
    const multiInput: OnDemandSyncInput[] = [{ provider: "TRAINING_PEAKS" }];
    mockGetRefreshOrAccessToken.mockResolvedValue("access-token");
    mockGetTpWorkoutsDay.mockResolvedValue([]);

    const result = await onDemandSync(multiInput, userId, authHeader);

    expect(result).toEqual([{ provider: "TRAINING_PEAKS", status: "SUCCESS", message: "0" }]);
  });

  it("logs an error when the provider is not supported", async () => {
    const logSpy = jest.spyOn(console, "error");
    mockGetRefreshOrAccessToken.mockResolvedValue("access-token");
    mockGetTpWorkoutsDay.mockResolvedValue([{} as WorkoutTP]);

    const result = await onDemandSync([{ provider: "POINT" }], userId, authHeader);

    expect(mockGetRefreshOrAccessToken).toHaveBeenCalledTimes(1);

    expect(result).toEqual([
      {
        provider: "POINT",
        status: "FAILURE",
        message: "Failed to import workouts from POINT for user user-id. Error: Unknown provider: POINT",
      },
    ]);
    expect(logSpy).toHaveBeenCalledWith("could not process workouts from POINT for user user-id.", "Error: Unknown provider: POINT");
  });
});
 */
