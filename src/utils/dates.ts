import { roundToNearestMinutes, differenceInDays } from "date-fns";
import set from "date-fns/set";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import numeral from "numeral";

type DateArg = string | number | Date;

dayjs.extend(utc);
dayjs.extend(timezone);

export const hexisDayjs = dayjs;

export const formatTimes = (time: Date) =>
  dayjs(roundToNearestMinutes(time, { nearestTo: 1 }))
    .utc()
    .format("HH:mm");

export const getTime = (date?: Date) => {
  if (!date) return "";

  const [hours = "00", minutes = "00"] = date.toISOString().split("T")[1].split(":");

  return `${hours}:${minutes}`;
};

export const parseTime = (time: string, date = new Date()) => {
  const [hours, minutes, seconds] = time.slice(0, 8).split(":");
  date.setUTCHours(Number(hours));
  date.setUTCMinutes(Number(minutes));
  date.setUTCSeconds(Number(seconds) || 0);

  return date;
};

export const serializeTime = (date: Date) => {
  const newDate = set(date, { milliseconds: 0, seconds: 0 });
  return dayjs(newDate).utc().format("HH:mm:ss.SSS[Z]");
};

export const moreThanAWeekAhead = (appDate: Date) => differenceInDays(appDate, new Date()) >= 6;

export const setLiteralDateTime = (time: string = "", date: DateArg = new Date()) =>
  new Date(`${dayjs(date).utc().format("YYYY-MM-DD")}T${time}Z`);

export const getLiteralTime = (date: Date) => {
  if (!date) return new Date().toISOString();

  const [hours, minutes] = date.toISOString().split("T")[1].slice(0, 8).split(":");

  return `${hours}:${minutes}`;
};

export const getRelativeTime = (date: Date) => dayjs(date).utc().format("HH:mm");

export const getTimezoneTime = (date: Date, timezone?: string) => dayjs.utc(date).tz(timezone).format("HH:mm");

export const getTimezoneTimeWithOffset = (date: Date, offset: number) => dayjs(date).utcOffset(offset).format("HH:mm");

export const getTimezoneDateWithOffset = (date: Date, offset: number) => dayjs(date).utcOffset(offset).format("YYYY-MM-DD");

export const getTimezoneDate = (date: Date, timezone?: string) => dayjs.utc(date).tz(timezone).format("YYYY-MM-DD");

export const getLiteralDateString = (date: DateArg = new Date(), format = "YYYY-MM-DD") => dayjs(date).utc().format(format);

export const getLiteralDate = (date: DateArg = new Date()) => new Date(dayjs(date).utc().format("YYYY-MM-DD"));

export const getStartOfDay = (date = new Date()) => dayjs(date).utc().startOf("day").toDate();

export const getEndOfDay = (date = new Date()) => dayjs(date).utc().endOf("day").toDate();

export function convertUTCOffsetToMinutes(offset: string = ""): number {
  const formattedTime = offset.replace(/UTC/gi, "");
  const positiveOrMinus = formattedTime.slice(0, 1) || "+";
  const [hoursWithPlusOrMinutes = "0", minutes = "00"] = formattedTime.split(":");
  const hoursConvertedToMinutes = numeral(hoursWithPlusOrMinutes.slice(1) || 0)
    .multiply(60)
    .add(minutes)
    .value();

  const result = numeral(`${positiveOrMinus}${hoursConvertedToMinutes}`).value();

  return result || 0;
}

export function originalDateTimeTZ(date: Date, timezone?: string) {
  return dayjs(date).tz(timezone);
}
