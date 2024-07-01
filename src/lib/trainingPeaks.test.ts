import { set } from "node-global-storage";
import * as workouts from "../models/workout";
import { createWorkouts } from "./trainingPeaks";
import * as storage from "node-global-storage";

const sampleData = [
  { Id: 1, Description: "Workout 1" },
  { Id: 2, Description: "Workout 2" },
];

describe("createWorkouts", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should process the workouts returned from the TrainingPeaks API", () => {
    const createWorkoutSpy = jest.spyOn(workouts, "createWorkoutTP").mockResolvedValueOnce({} as any);

    createWorkouts(sampleData, "User1");
    expect(createWorkoutSpy).toHaveBeenCalledWith(sampleData, "User1");
  });

  it("doesn't call the createWorkoutTP function if there are no workouts returned from the TrainingPeaks API", () => {
    const createWorkoutSpy = jest.spyOn(workouts, "createWorkoutTP").mockResolvedValueOnce({} as any);

    createWorkouts([], "User1");
    expect(createWorkoutSpy).not.toHaveBeenCalled();
  });

  it("calls the createWorkoutTP function for any unique workouts not in progress", () => {
    set("processingTPWorkouts", [
      { Id: 3, Description: "Workout 3" },
      { Id: 2, Description: "Workout 2" },
    ]);

    const createWorkoutSpy = jest.spyOn(workouts, "createWorkoutTP").mockResolvedValueOnce({} as any);

    createWorkouts(sampleData, "User1");
    expect(createWorkoutSpy).toHaveBeenCalledWith([{ Id: 1, Description: "Workout 1" }], "User1");
  });

  it("removes the processed workouts from the processingTPWorkouts array", () => {
    set("processingTPWorkouts", [
      { Id: 3, Description: "Workout 3" },
      { Id: 2, Description: "Workout 2" },
    ]);

    jest.spyOn(workouts, "createWorkoutTP").mockResolvedValueOnce({} as any);
    const setSpy = jest.spyOn(storage, "set");

    createWorkouts(sampleData, "User1");
    expect(setSpy).toHaveBeenNthCalledWith(2, "processingTPWorkouts", [
      { Id: 3, Description: "Workout 3" },
      { Id: 2, Description: "Workout 2" },
    ]);
    expect(setSpy).toHaveBeenCalledTimes(2);
  });
});
