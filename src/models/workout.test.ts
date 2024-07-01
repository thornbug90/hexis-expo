import { MealNutrition, WORKOUT_SOURCE, WORKOUT_STATUS, Workout } from "@prisma/client";
import { /* importedWorkoutDataProcessor ,*/ handleClashingWorkouts } from "./workout";
//import * as workoutsImport from "./workout";
import { workout } from "../__test__/common.fixture";
import { WorkoutInput } from "../schema/workouts";
import prisma from "../lib/prisma";

/* describe("importedWorkoutDataProcessor function", () => {
  const userId = "ABC123";
  describe("trainingPeak workout types", () => {
    it("calls the create workout tp function with the provided args when valid tp workouts are provided", () => {
      const importedWorkouts = [{ WorkoutDay: "12345", Completed: false }];
      const sourceToProcess = "TRAINING_PEAKS";

      jest.spyOn(workoutsImport, "createWorkoutTP").mockResolvedValueOnce([]);
      const logSpy = jest.spyOn(console, "log");

      importedWorkoutDataProcessor(importedWorkouts, userId, sourceToProcess);

      expect(logSpy).toHaveBeenCalledWith("perform training peaks related processing", importedWorkouts, userId);
    });

    it("doesn't call the create workout tp function when invalid tp workouts are provided", () => {
      const importedWorkouts = [{}];
      const sourceToProcess = "TRAINING_PEAKS";
      const errorSpy = jest.spyOn(console, "error");

      expect(() => importedWorkoutDataProcessor(importedWorkouts, userId, sourceToProcess)).toThrow(
        "workouts provided do not match expected TP shape",
      );
      expect(errorSpy).toHaveBeenCalledWith("importedWorkouts", importedWorkouts);
    });
  });

  describe("unknown provider type", () => {
    it("logs a message saying the provider type is unknown", () => {
      const logSpy = jest.spyOn(console, "log");

      importedWorkoutDataProcessor([{}], userId, "COACH");

      expect(logSpy).toHaveBeenCalledWith("perform any processing not related to an provider");
    });
  });
}); */
describe("handleClashingWorkouts function", () => {
  describe("discard new workout and activate existing one ", () => {
    it("planned new workout vs actual existing workout => discard new workout", async () => {
      const existWorkouts: (Workout & { intraFuellingMeal: MealNutrition | null })[] = [{ ...workout, intraFuellingMeal: null }];
      existWorkouts[0] = { ...existWorkouts[0], source: WORKOUT_SOURCE.TRAINING_PEAKS, confirmed: true, status: WORKOUT_STATUS.ACTIVE };
      let incomingWorkout: WorkoutInput = workout;
      incomingWorkout = { ...incomingWorkout, source: WORKOUT_SOURCE.TRAINING_PEAKS, confirmed: false, status: WORKOUT_STATUS.ACTIVE };

      incomingWorkout = await handleClashingWorkouts(incomingWorkout, existWorkouts);

      expect(incomingWorkout.status).toBe(WORKOUT_STATUS.DISCARDED);
    });
    it("planned new workout vs planned exist workout that starts after new workout => discard new workout", async () => {
      const existWorkouts: (Workout & { intraFuellingMeal: MealNutrition | null })[] = [{ ...workout, intraFuellingMeal: null }];
      existWorkouts[0] = {
        ...existWorkouts[0],
        start: new Date("2024-03-16T10:15:00Z"),
        source: WORKOUT_SOURCE.COACH,
        confirmed: false,
        status: WORKOUT_STATUS.ACTIVE,
        intraFuellingMeal: null,
      };
      let incomingWorkout: WorkoutInput = workout;
      incomingWorkout = { ...incomingWorkout, source: WORKOUT_SOURCE.COACH, confirmed: false, status: WORKOUT_STATUS.ACTIVE };

      incomingWorkout = await handleClashingWorkouts(incomingWorkout, existWorkouts);

      expect(incomingWorkout.status).toBe(WORKOUT_STATUS.DISCARDED);
    });
    it("planned new workout not TrainingPeaks vs planned exist workout that is TrainingPeaks => discard new workout", async () => {
      const existWorkouts: (Workout & { intraFuellingMeal: MealNutrition | null })[] = [{ ...workout, intraFuellingMeal: null }];
      existWorkouts[0] = {
        ...existWorkouts[0],
        source: WORKOUT_SOURCE.TRAINING_PEAKS,
        confirmed: false,
        status: WORKOUT_STATUS.ACTIVE,
      };
      let incomingWorkout: WorkoutInput = workout;
      incomingWorkout = { ...incomingWorkout, source: WORKOUT_SOURCE.COACH, confirmed: false, status: WORKOUT_STATUS.ACTIVE };

      incomingWorkout = await handleClashingWorkouts(incomingWorkout, existWorkouts);

      expect(incomingWorkout.status).toBe(WORKOUT_STATUS.DISCARDED);
    });
    it("actual new workout vs actual exist workout that starts after new workout => discard new workout", async () => {
      const existWorkouts: (Workout & { intraFuellingMeal: MealNutrition | null })[] = [{ ...workout, intraFuellingMeal: null }];
      existWorkouts[0] = {
        ...existWorkouts[0],
        start: new Date("2024-03-16T10:15:00Z"),
        source: WORKOUT_SOURCE.TRAINING_PEAKS,
        confirmed: true,
        status: WORKOUT_STATUS.ACTIVE,
      };
      let incomingWorkout: WorkoutInput = workout;
      incomingWorkout = { ...incomingWorkout, source: WORKOUT_SOURCE.APPLE_HEALTH, confirmed: true, status: WORKOUT_STATUS.ACTIVE };

      incomingWorkout = await handleClashingWorkouts(incomingWorkout, existWorkouts);

      expect(incomingWorkout.status).toBe(WORKOUT_STATUS.DISCARDED);
    });

    it(" not discard actual new workout vs planned exist workout", async () => {
      const existWorkouts: (Workout & { intraFuellingMeal: MealNutrition | null })[] = [{ ...workout, intraFuellingMeal: null }];
      existWorkouts[0] = {
        ...existWorkouts[0],
        start: new Date("2024-03-16T10:15:00Z"),
        source: WORKOUT_SOURCE.USER,
        confirmed: false,
        status: WORKOUT_STATUS.ACTIVE,
      };
      let incomingWorkout: WorkoutInput = workout;
      incomingWorkout = { ...incomingWorkout, source: WORKOUT_SOURCE.APPLE_HEALTH, confirmed: true, status: WORKOUT_STATUS.ACTIVE };

      const prismaSpy = jest.spyOn(prisma.workout, "update").mockResolvedValueOnce(existWorkouts[0]);

      incomingWorkout = await handleClashingWorkouts(incomingWorkout, existWorkouts);

      expect(prismaSpy).toHaveBeenCalledWith({
        where: {
          id: existWorkouts[0].id,
        },
        data: { status: WORKOUT_STATUS.DISCARDED },
      });

      expect(incomingWorkout.status).toBe(WORKOUT_STATUS.ACTIVE);
    });
  });
});
