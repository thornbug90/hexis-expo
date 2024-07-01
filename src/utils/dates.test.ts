import {
  formatTimes,
  getTime,
  parseTime,
  serializeTime,
  moreThanAWeekAhead,
  setLiteralDateTime,
  getLiteralTime,
  getRelativeTime,
  getTimezoneTime,
  getTimezoneTimeWithOffset,
  getTimezoneDateWithOffset,
  getTimezoneDate,
  getLiteralDateString,
  getLiteralDate,
  getStartOfDay,
  getEndOfDay,
  convertUTCOffsetToMinutes,
} from "./dates";

describe("dates", () => {
  describe("formatTimes", () => {
    it("should format a date to HH:mm", () => {
      const date = new Date("2024-03-20T10:30:00.000Z");
      expect(formatTimes(date)).toBe("10:30");
    });
  });

  describe("getTime", () => {
    it("should return an empty string if the date is null", () => {
      expect(getTime(undefined)).toBe("");
    });

    it("should return the time in HH:mm format", () => {
      const date = new Date("2024-03-20T10:30:00.000Z");
      expect(getTime(date)).toBe("10:30");
    });
  });

  describe("parseTime", () => {
    it("should parse a time string into a Date object", () => {
      const time = "10:30";
      const date = new Date("2024-03-20T00:00:00.000Z");
      const parsedTime = parseTime(time, date);
      expect(parsedTime).toEqual(new Date("2024-03-20T10:30:00.000Z"));
    });
  });

  describe("serializeTime", () => {
    it("should serialize a Date object to a string in HH:mm:ss.SSS'Z' format", () => {
      const date = new Date("2024-03-20T10:30:00.000Z");
      const serializedTime = serializeTime(date);
      expect(serializedTime).toBe("10:30:00.000Z");
    });
  });

  describe("moreThanAWeekAhead", () => {
    it("should return true if the date is more than a week ahead of the current date", () => {
      jest.useFakeTimers().setSystemTime(1710921362317); // Wed Mar 20 2024 15:56:02 GMT+0800

      const appDate = new Date("2024-03-27T10:30:00.000Z");
      expect(moreThanAWeekAhead(appDate)).toBe(true);
    });

    it("should return false if the date is not more than a week ahead of the current date", () => {
      jest.useFakeTimers().setSystemTime(1710921362317); // Wed Mar 20 2024 15:56:02 GMT+0800

      const appDate = new Date("2024-03-25T10:30:00.000Z");
      expect(moreThanAWeekAhead(appDate)).toBe(false);
    });
  });

  describe("setLiteralDateTime", () => {
    it("should set the time of a date to a literal time string", () => {
      const time = "10:30";
      const date = new Date("2024-03-20T00:00:00.000Z");
      const newDate = setLiteralDateTime(time, date);
      expect(newDate).toEqual(new Date("2024-03-20T10:30:00.000Z"));
    });
  });

  describe("getLiteralTime", () => {
    it("should return the time of a date as a literal time string", () => {
      const date = new Date("2024-03-20T10:30:00.000Z");
      const literalTime = getLiteralTime(date);
      expect(literalTime).toBe("10:30");
    });
  });

  describe("getRelativeTime", () => {
    it("should return the time of a date in HH:mm format relative to UTC", () => {
      const date = new Date("2024-03-20T10:30:00.000Z");
      const relativeTime = getRelativeTime(date);
      expect(relativeTime).toBe("10:30");
    });
  });

  describe("getTimezoneTime", () => {
    it("should return the time of a date in HH:mm format relative to a specific timezone", () => {
      const date = new Date("2024-03-08T10:30:00.000Z");
      const timezone = "Australia/Perth";
      const timezoneTime = getTimezoneTime(date, timezone);
      expect(timezoneTime).toBe("18:30");
    });
  });

  describe("getTimezoneTimeWithOffset", () => {
    it("should return the time of a date in HH:mm format relative to a specific UTC offset", () => {
      const date = new Date("2024-03-20T10:30:00.000Z");
      const offset = -5;
      const timezoneTimeWithOffset = getTimezoneTimeWithOffset(date, offset);
      expect(timezoneTimeWithOffset).toBe("05:30");
    });
  });

  describe("getTimezoneDateWithOffset", () => {
    it("should return the date of a date in YYYY-MM-DD format relative to a specific UTC offset", () => {
      const date = new Date("2024-03-20T10:30:00.000Z");
      const offset = -5;
      const timezoneDateWithOffset = getTimezoneDateWithOffset(date, offset);
      expect(timezoneDateWithOffset).toBe("2024-03-20");
    });
  });

  describe("getTimezoneDate", () => {
    it("should return the date of a date in YYYY-MM-DD format relative to a specific timezone", () => {
      const date = new Date("2024-03-20T10:30:00.000Z");
      const timezone = "America/Los_Angeles";
      const timezoneDate = getTimezoneDate(date, timezone);
      expect(timezoneDate).toBe("2024-03-20");
    });
  });

  describe("getLiteralDateString", () => {
    it("should return the date of a date in YYYY-MM-DD format", () => {
      const date = new Date("2024-03-20T10:30:00.000Z");
      const literalDateString = getLiteralDateString(date);
      expect(literalDateString).toBe("2024-03-20");
    });
  });

  describe("getLiteralDate", () => {
    it("should return the date of a date as a Date object", () => {
      const date = new Date("2024-03-20T10:30:00.000Z");
      const literalDate = getLiteralDate(date);
      expect(literalDate).toEqual(new Date("2024-03-20T00:00:00.000Z"));
    });
  });

  describe("getStartOfDay", () => {
    it("should return the start of the day of a date as a Date object", () => {
      const date = new Date("2024-03-20T10:30:00.000Z");
      const startOfDay = getStartOfDay(date);
      expect(startOfDay).toEqual(new Date("2024-03-20T00:00:00.000Z"));
    });
  });

  describe("getEndOfDay", () => {
    it("should return the end of the day of a date as a Date object", () => {
      const date = new Date("2024-03-20T10:30:00.000Z");
      const endOfDay = getEndOfDay(date);
      expect(endOfDay).toEqual(new Date("2024-03-20T23:59:59.999Z"));
    });
  });

  describe("convertUTCOffsetToMinutes", () => {
    it("should convert a UTC offset string to minutes", () => {
      const offset = "+05:30";
      const minutes = convertUTCOffsetToMinutes(offset);
      expect(minutes).toBe(330);
    });
  });
});
