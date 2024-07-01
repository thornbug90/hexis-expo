import { WORKOUT_INTENSITY } from "@prisma/client";
import { intensityConverter, intensityRPEConverter, tpIfMapping } from "./workoutHelper";

describe("intensity and inensityRPE converters", () => {
  describe("intensityRPEConverter function", () => {
    it("returns LIGHT if the RPE <= 20", () => {
      expect(intensityRPEConverter(20)).toBe(WORKOUT_INTENSITY.LIGHT);
    });
    it("returns MODERATE if the RPE > 20  and < 60", () => {
      expect(intensityRPEConverter(44)).toBe(WORKOUT_INTENSITY.MODERATE);
    });
    it("returns HARD if the RPE >= 60", () => {
      expect(intensityRPEConverter(60)).toBe(WORKOUT_INTENSITY.HARD);
    });
  });

  describe("intensityConverter function", () => {
    it("returns 20 if the intensity is LIGHT", () => {
      expect(intensityConverter(WORKOUT_INTENSITY.LIGHT)).toBe(20);
    });
    it("returns 33 if the intensity is MODERATE", () => {
      expect(intensityConverter(WORKOUT_INTENSITY.MODERATE)).toBe(33);
    });
    it("returns 60 if the intensity is HARD", () => {
      expect(intensityConverter(WORKOUT_INTENSITY.HARD)).toBe(60);
    });
    it("returns 0 if the intensity is UNSPECIFIED", () => {
      expect(intensityConverter(WORKOUT_INTENSITY.UNSPECIFIED)).toBe(0);
    });
  });
});

describe("tpIfMapping", () => {
  it("should calculate correctly for x < 0.6", () => {
    expect(tpIfMapping(0.5)).toBe(13);
    expect(tpIfMapping(0.599999)).toBe(20);
  });

  it("should calculate correctly for 0.6 <= x < 0.75", () => {
    expect(tpIfMapping(0.6)).toBe(20);
    expect(tpIfMapping(0.749999)).toBe(33);
  });

  it("should calculate correctly for 0.75 <= x < 0.80", () => {
    expect(tpIfMapping(0.75)).toBe(33);
    expect(tpIfMapping(0.799999)).toBe(46);
  });

  it("should calculate correctly for 0.80 <= x < 0.85", () => {
    expect(tpIfMapping(0.8)).toBe(46);
    expect(tpIfMapping(0.849999)).toBe(60);
  });

  it("should calculate correctly for x >= 0.85", () => {
    expect(tpIfMapping(0.85)).toBe(60);
    expect(tpIfMapping(0.9)).toBe(68);
    expect(tpIfMapping(0.999999)).toBe(86);
  });

  it("should clamp the result to 0 and 100", () => {
    expect(tpIfMapping(-1)).toBe(0);
    expect(tpIfMapping(2)).toBe(100);
  });
});
