import { AgeFromDate } from "age-calculator";
import { keys } from "rambda";
import * as engines from "../lib/engines";
import prepareWorkoutsAndMealpattern from "../utils/engines/prepareWorkoutsAndMealpattern";
import dayjs from "dayjs";
import { isPastFuture } from "./getDay";
import { DayInput } from "../lib/types/engine";
import prisma from "../lib/prisma";

const getTime = (date: Date) => {
  const [hours, minutes] = date.toISOString().split("T")[1].split(":");

  return `${hours}:${minutes}`;
};
//TODO merge this with getDay code duplication here
const getLiveGraph = async (date: Date, gotrueId: string) => {
  const result = await prepareWorkoutsAndMealpattern(date, gotrueId);
  if (!result) return null;

  const { user, workouts, mealpatterns, isVerified } = result;

  const isPastOrFuture = isPastFuture(date);

  //////////////////////// Prepare yesterday carb per kg ////////////////////////////
  let yesterdayCarbsPerKg = null;
  const yesterday = dayjs(date).subtract(1, "day").toDate();
  const yesterdayNutrition = await prisma.dayNutrition.findFirst({
    where: { day: yesterday, userId: user.id },
  });
  if (yesterdayNutrition) {
    yesterdayCarbsPerKg = yesterdayNutrition.carbsPerKg ?? null;
  }

  const liveGraphInput: DayInput = {
    is_verified: isVerified,
    total_activity_duration: user.totalActivityDuration!,
    goal: user.goal!,
    lifestyle_activity: user.lifestyleActivity!,
    weight_today: user.weight ?? 0,
    weight_yesterday: user.weight ?? 0, //TODO: figure out yesterday weight
    isPastOrFuture,
    gender: user.sex!,
    height: user.height! / 100,
    sleep: getTime(user.sleepTime!),
    wake: getTime(user.wakeTime!),
    age: new AgeFromDate(user.dob!).age,
    workouts,
    meal_patterns: {
      0: mealpatterns[0],
      1: mealpatterns[1],
      2: mealpatterns[2],
    },
    category: user.favouriteActivities[0].activity.category,
    carbs_g_per_kg_yesterday: yesterdayCarbsPerKg,
  };

  const liveGraph = await engines.liveGraph(liveGraphInput);
  const liveGraphPoints: { time: Date; data: number }[] = [];

  keys(liveGraph.graph).map(item => {
    const time = new Date(`${dayjs(date).utc().format("YYYY-MM-DD")}T${item}:00.000Z`);
    liveGraphPoints.push({ time: time, data: liveGraph.graph[item] });
  });

  return {
    graph: liveGraphPoints,
    predictedEnd: liveGraph.predicted_end,
  };
};

export default getLiveGraph;
