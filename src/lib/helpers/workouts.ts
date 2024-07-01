import axios from "axios";
import { WorkoutTP } from "../types/tp";
import dayjs from "dayjs";

const baseURL = process.env.TRAINING_PEAKS_API_URL;
const clientId = process.env.TRAINING_PEAKS_CLIENT_ID;

export const getTpWorkoutsDay = async (accessToken: string, date: string, userId: string) => {
  if (!baseURL || !clientId) {
    throw new Error("baseURL or clientId not set");
  }

  const startDate = dayjs(date).subtract(3, "day").format("YYYY-MM-DD");
  const endDate = dayjs(date).add(1, "week").format("YYYY-MM-DD");

  let tpRawWorkouts: WorkoutTP[] = [];
  try {
    const response = await axios.get(`${baseURL}/workouts/${startDate}/${endDate}`, {
      params: { includeDescription: true },
      headers: {
        Authorization: `bearer ${accessToken}`,
        "User-Agent": `${clientId}/2.2.20`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    if (response && response.data) tpRawWorkouts = response.data;
  } catch (error: unknown) {
    console.error("TrainingPeaksPull Error", error);
    console.debug("accessToken", accessToken, "userId", userId, "date", date);
    return;
  }

  return tpRawWorkouts;
};
