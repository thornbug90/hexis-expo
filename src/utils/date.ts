import { differenceInDays, format } from "date-fns";
import dayjs from "dayjs";
import set from "date-fns/set";
import utc from "dayjs/plugin/utc";
import isToday from "dayjs/plugin/isToday";
import timezone from "dayjs/plugin/timezone";
import moment from "moment-timezone";

dayjs.extend(utc);
dayjs.extend(isToday);
dayjs.extend(timezone);

export const getTime = (date: string | Date) => {
  const d = dayjs(date);
  return `${d.get("hours")}:${d.get("minutes")}`;
};

export const parseTime = (time: string, date = new Date()) => {
  const [hours, minutes, seconds = "00"] = `${time ?? "00:00:00"}`
    .slice(0, 8)
    .split(":");

  return set(date, {
    hours: Number(hours),
    minutes: Number(minutes),
    seconds: Number(seconds),
  });
};

export const serializeTime = (date: Date) => {
  const newDate = set(date, { milliseconds: 0, seconds: 0 });
  return format(newDate, "HH:mm:ss.SSS'Z'");
};

export const moreThanAWeekAhead = (appDate: Date) =>
  differenceInDays(appDate, new Date()) >= 6;

export const setLocalDateTime = (time: string, date = new Date()) =>
  new Date(`${format(date, "Y-MM-dd")}T${time}`);

export const createDateTime = (date = new Date()) => {
  const time = getLiteralTime(date);
  const [hour = "00", minutes = "00"] = time.split(":");

  return dayjs
    .utc(dayjs(date).format("YYYY-MM-DD"))
    .hour(+hour)
    .minute(+minutes)
    .toDate();
};

export const createRelativeDateTime = (date = new Date()) => {
  const time = getRelativeTime(date);
  const [hour = "00", minutes = "00"] = time.split(":");

  return dayjs
    .utc(dayjs(date).format("YYYY-MM-DD"))
    .hour(+hour)
    .minute(+minutes)
    .toDate();
};

export const setLiteralDateTime = (
  time: string = "",
  date: string | number | Date = new Date()
) => {
  return new Date(`${dayjs(date).format("YYYY-MM-DD")}T${time}`);
};

export const setRelativeDateTime = (
  time: string = "",
  date: string | number | Date = new Date()
) => {
  const [hour = "00", minutes = "00"] = time?.split?.(":");

  return dayjs
    .utc(dayjs(date).format("YYYY-MM-DD"))
    .hour(+hour)
    .minute(+minutes)
    .toDate();
};

export const getLiteralTime = (date: Date) => {
  if (!date) return new Date().toISOString();

  const [hours, minutes] = date
    .toISOString()
    .split("T")[1]
    .slice(0, 8)
    .split(":");

  return `${hours}:${minutes}`;
};

export const getLiteralTimeInMS = (date: Date) => {
  if (!date) return new Date().toISOString();

  const [hours, minutes] = date
    .toISOString()
    .split("T")[1]
    .slice(0, 8)
    .split(":");

  return `${hours}:${minutes}`;
};

export const getRelativeTime = (date: Date) => {
  const d = dayjs(date);
  return `${d.get("hours")}:${d.get("minutes")}`;
};

export const getLiteralDate = (date: string | number | Date = new Date()) =>
  new Date(dayjs(date).format("YYYY-MM-DD"));

export const getLiteralUTCDate = (date: string | number | Date = new Date()) =>
  new Date(dayjs(date).utc().format("YYYY-MM-DD"));

export const getLiteralDateString = (
  date: string | number | Date = new Date(),
  format = "YYYY-MM-DD"
) => dayjs(date).utc().format(format);

export const getStartOfDay = (date = new Date(), keepLocalTime?: boolean) =>
  dayjs(date).utc(keepLocalTime).startOf("day").toDate();

export const getEndOfDay = (date = new Date(), keepLocalTime?: boolean) =>
  dayjs(date).utc(keepLocalTime).endOf("day").toDate();

export const isDateToday = (date = new Date()) => dayjs(date).isToday();
export const isUTCDateToday = (date = new Date()) =>
  dayjs(date).utc().isToday();

export const convertToUTC = (
  date: string | number | Date = new Date(),
  keepLocalTime?: boolean
) => dayjs(date).utc(keepLocalTime).toDate();

export const getTimezone = () => dayjs.tz.guess();

export const isSameDay = (date1: Date, date2: Date) =>
  dayjs(date1).utc().isSame(date2, "day");

export function originalDateTime(date: Date, offset: number = 0) {
  return dayjs(date).utcOffset(offset);
}

export function originalDateTimeTZ(
  dated: string,
  timezoneStr: string = "",
  format: string = "YYYY-MM-DD"
) {
  const dateTz = moment(dated).tz(timezoneStr).format(format);
  return dateTz;
}

export function getOrdinalSuffix(date: string, timeZone: string): string {
  const newDate = date.replace("Z", "");
  let suffix = "";
  let i = new Date(newDate).getDate();
  const options = {
    day: "numeric" as const,
    month: "short" as const,
  };
  suffix += new Date(newDate).toLocaleString("en-GB", options);
  return suffix;
}
export const dateToHHMM = (date: Date | string) => {
  return `${new Date(date).getHours().toString().padStart(2, "0")}:${new Date(
    date
  )
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};
export const getTimeArrayFromDurationString = (time: string) => {
  const resultArray: number[] = time
    ? time.split(" ").map((t) => parseInt(t.replace(/\D/g, "")))
    : [0, 0];
  return resultArray;
};

export const getTimeArrayFromStartString = (time: string) => {
  const resultArray: number[] = time
    ? time.split(":").map((t) => parseInt(t))
    : [new Date().getHours(), new Date().getMinutes()];
  return resultArray;
};
export const formatTimeHourMinute = (time: string) => {
  if (!time) return "--:--";
  const [hour, minute] = time.split(":");
  return `${hour}:${minute}`;
};
