import { athlete } from "../lib/engines";
import { AthleteInput, AthleteOutput } from "../lib/types/engine";
import { AgeFromDate } from "age-calculator";
import { CarbRanges } from "../schema/carbRanges";
import { Activity, User, UserActivity } from "@prisma/client";

interface UserActivits extends UserActivity {
  activity: Activity;
}

export const processUserData = async (user: User & { favouriteActivities: UserActivits[] }) => {
  const primaryActivity = user.favouriteActivities.filter(userActivity => userActivity.primary)?.[0]?.activity;

  const athleteEngInput: AthleteInput = {
    age: user.dob ? new AgeFromDate(user.dob).age : undefined,
    category: primaryActivity?.category ?? undefined,
    gender: user.sex ?? undefined,
    height: user.height ? Number((user.height / 100).toFixed(2)) : undefined,
    weight_today: user.weight ?? undefined,
    total_activity_duration: user.totalActivityDuration ?? undefined,
  };
  let readyToCallEng = true;
  Object.values(athleteEngInput).map(atterVal => {
    if (!atterVal) readyToCallEng = false;
  });

  let carbRanges: CarbRanges = {
    mainRange: { highMax: 0, highMin: 0, lowMax: 0, lowMin: 0, medMax: 0, medMin: 0 },
    snackRange: { highMax: 0, highMin: 0, lowMax: 0, lowMin: 0, medMax: 0, medMin: 0 },
  };
  let RMR = null;
  let proteinConstant = null;
  let engineResult: AthleteOutput;
  if (readyToCallEng) {
    engineResult = await athlete(athleteEngInput);
    carbRanges = {
      mainRange: {
        highMax: engineResult.ranges.main_ranges.high_max,
        highMin: engineResult.ranges.main_ranges.high_min,
        lowMax: engineResult.ranges.main_ranges.low_max,
        lowMin: engineResult.ranges.main_ranges.low_min,
        medMax: engineResult.ranges.main_ranges.med_max,
        medMin: engineResult.ranges.main_ranges.med_min,
      },
      snackRange: {
        highMax: engineResult.ranges.snack_ranges.high_max,
        highMin: engineResult.ranges.snack_ranges.high_min,
        lowMax: engineResult.ranges.snack_ranges.low_max,
        lowMin: engineResult.ranges.snack_ranges.low_min,
        medMax: engineResult.ranges.snack_ranges.med_max,
        medMin: engineResult.ranges.snack_ranges.med_min,
      },
    };
    proteinConstant = engineResult.protein_constant;
    RMR = engineResult.RMR;
  }

  return { ...user, carbRanges, RMR, proteinConstant };
};
