import { getTpWorkoutsDay } from "./workouts";
import axios from "axios";

jest.mock("../../models/workout");

const accessToken = "fake-access-token";
const date = "2023-03-08";
const userId = "fake-user-id";

describe("tpWorkoutsDay", () => {
  it("should make a request to the TrainingPeaks API to get workouts for the specified date", async () => {
    const spy = jest.spyOn(axios, "get").mockResolvedValueOnce({
      data: [
        { Id: 1, Description: "Workout 1" },
        { Id: 2, Description: "Workout 2" },
      ],
    });

    await getTpWorkoutsDay(accessToken, date, userId);

    expect(spy).toHaveBeenCalledWith(`tp-api-base/workouts/2023-03-05/2023-03-15`, {
      headers: {
        Authorization: `bearer ${accessToken}`,
        "User-Agent": `tp-client-id/2.2.20`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      params: { includeDescription: true },
    });
  });
});
