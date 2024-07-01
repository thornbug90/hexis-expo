import dayjs from "dayjs";
import { getLiteralDate, originalDateTimeTZ } from "../utils/dates";
import { differenceInDays } from "date-fns";

export const getDate = (date: string | number | undefined, user: { created: Date; timezone: string | null }) => {
  const currentDate = getLiteralDate(date);
  const userDateCreation = originalDateTimeTZ(user.created, user.timezone ?? undefined).format("YYYY-MM-DD");

  // Prevent getting data from before the user was created (because it DOESN'T exist)
  if (dayjs(currentDate).utc().isBefore(userDateCreation, "date")) {
    throw new Error("Cannot go before creating your account.");
  }

  if (!date) date = Date.now();
  if (differenceInDays(new Date(date), Date.now()) > 7) throw new Error("Can only get up to 7 days ahead");

  return currentDate;
};
