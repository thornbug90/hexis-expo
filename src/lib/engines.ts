import axios from "axios";
import redis from "./redis";
import { AthleteInput, AthleteOutput, CarbRangesInput, CarbRangesOutput, DayInput, DayOutput, LiveGraphOutput } from "./types/engine";

const engines = axios.create({
  baseURL: process.env.ENGINES_API_ENDPOINT,
});

//TODO: exposed as an API not sure if this is being used check and clean
const carbRanges = async (data: CarbRangesInput): Promise<CarbRangesOutput> => {
  const response = await redis.get(JSON.stringify(data));
  if (response) return JSON.parse(response);
  const { data: carbRange } = await engines.post("/engines/v1/carb-ranges", data);
  await redis.setEx(JSON.stringify(data), 60 * 60, JSON.stringify(carbRange));
  return carbRange;
};

const athlete = async (data: AthleteInput): Promise<AthleteOutput> => {
  const cachedAthleteData = await redis.get(JSON.stringify(data));
  let athleteData: AthleteOutput | undefined = undefined;
  if (cachedAthleteData) athleteData = JSON.parse(cachedAthleteData) as AthleteOutput;
  else {
    const { data: freshAthleteData }: { data: AthleteOutput } = await engines.post("/engines/v2/athlete", data);
    if (freshAthleteData) await redis.setEx(JSON.stringify(data), 60 * 5, JSON.stringify(freshAthleteData));
    athleteData = freshAthleteData;
  }

  if (athleteData) return athleteData;
  else throw new Error("Can't get athlete data from the engine.");
};
const day = async (data: DayInput): Promise<DayOutput> => {
  const { data: day } = await engines.post("/engines/v2/day", [data]);

  await redis.setEx(JSON.stringify(data), 60 * 5, JSON.stringify(day));

  return day[0];
};

const liveGraph = async (data: DayInput): Promise<LiveGraphOutput> => {
  const cache = await redis.get(JSON.stringify(data));

  if (cache) return JSON.parse(cache);

  const livegraph = await engines.post("/engines/v2/livegraph", data);

  await redis.setEx(JSON.stringify(data), 60 * 5, JSON.stringify(livegraph.data));
  return livegraph.data as {
    graph: { [key: string]: number };
    predicted_end: number;
  };
};

export { carbRanges, day, liveGraph, athlete };
