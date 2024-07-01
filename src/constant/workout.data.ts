import { ACTIVITY_LEVEL_TYPE, SEX } from "@prisma/client";

export const maximumWorkouts = 2;
export const intensityBoundaries = [
  {
    category: ACTIVITY_LEVEL_TYPE.ENDURANCE,
    low: 0.105,
    high: 0.1576,
    gender: SEX.MALE,
  },
  {
    category: ACTIVITY_LEVEL_TYPE.HIIT_HV,
    low: 0.0788,
    high: 0.1251,
    gender: SEX.MALE,
  },
  {
    category: ACTIVITY_LEVEL_TYPE.HIIT_MV,
    low: 0.0874,
    high: 0.1137,
    gender: SEX.MALE,
  },
  {
    category: ACTIVITY_LEVEL_TYPE.HIIT_LV,
    low: 0.07,
    high: 0.0964,
    gender: SEX.MALE,
  },
  {
    category: ACTIVITY_LEVEL_TYPE.COMBAT,
    low: 0.0963,
    high: 0.1139,
    gender: SEX.MALE,
  },
  {
    category: ACTIVITY_LEVEL_TYPE.ARTISTIC,
    low: 0.0709,
    high: 0.0876,
    gender: SEX.MALE,
  },
  {
    category: ACTIVITY_LEVEL_TYPE.STRENGTH,
    low: 0.07,
    high: 0.0962,
    gender: SEX.MALE,
  },
  {
    category: ACTIVITY_LEVEL_TYPE.LIGHT,
    low: 0.0569,
    high: 0.0656,
    gender: SEX.MALE,
  },
  {
    category: ACTIVITY_LEVEL_TYPE.ENDURANCE,
    low: 0.105,
    high: 0.135,
    gender: SEX.FEMALE,
  },
  {
    category: ACTIVITY_LEVEL_TYPE.HIIT_HV,
    low: 0.0788,
    high: 0.1181,
    gender: SEX.FEMALE,
  },
  {
    category: ACTIVITY_LEVEL_TYPE.HIIT_MV,
    low: 0.078,
    high: 0.105,
    gender: SEX.FEMALE,
  },
  {
    category: ACTIVITY_LEVEL_TYPE.HIIT_LV,
    low: 0.069,
    high: 0.0786,
    gender: SEX.FEMALE,
  },
  {
    category: ACTIVITY_LEVEL_TYPE.COMBAT,
    low: 0.08,
    high: 0.0964,
    gender: SEX.FEMALE,
  },
  {
    category: ACTIVITY_LEVEL_TYPE.ARTISTIC,
    low: 0.0621,
    high: 0.0831,
    gender: SEX.FEMALE,
  },
  {
    category: ACTIVITY_LEVEL_TYPE.STRENGTH,
    low: 0.063,
    high: 0.0788,
    gender: SEX.FEMALE,
  },
  {
    category: ACTIVITY_LEVEL_TYPE.LIGHT,
    low: 0.0512,
    high: 0.059,
    gender: SEX.FEMALE,
  },
];
