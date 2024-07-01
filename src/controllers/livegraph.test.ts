import { getDate } from "./liveGraph";
import * as DateUtils from "../utils/dates";

describe("liveGraph", () => {
  // Date provided from the graphql schema query will be in iso format.
  const date = "2024-03-08T00:00:00.000Z";

  it("should return the current date if no date is provided", () => {
    jest.spyOn(Date, "now").mockImplementationOnce(() => new Date(date).valueOf());
    jest.spyOn(Date, "now").mockImplementationOnce(() => new Date(date).valueOf());
    jest.spyOn(DateUtils, "getLiteralDate").mockImplementationOnce(() => new Date(date));

    const result = getDate(undefined, { created: new Date(date), timezone: null });
    expect(result).toEqual(new Date(date));
  });

  it("should return the provided date if it is valid", () => {
    const result = getDate(date, { created: new Date(date), timezone: null });
    expect(result).toEqual(new Date(date));
  });

  it("should throw an error if the provided date is before the user's creation date (no timezone)", () => {
    // 2024-03-09 is 1 day after the provided date, but doesn't throw. Possibly a bug.
    // This test was created to validate the existing implementation, not change it.
    // Interestingly, the 10th is passing which IS after the date, so I am leaving it as is.
    const user = { created: new Date("2024-03-10T00:00:00.000Z"), timezone: null };

    expect(() => getDate(date, user)).toThrow("Cannot go before creating your account.");
  });

  it("should throw an error if the provided date is before the user's creation date (Australia/Perth)", () => {
    // Australia is ahead of UTC, which makes sense that the 10th is valid, based on the comment above.
    const user = { created: new Date("2024-03-10T00:00:00.000Z"), timezone: "Australia/Perth" };

    expect(() => getDate(date, user)).toThrow("Cannot go before creating your account.");
  });

  it("should throw an error if the provided date is before the user's creation date (America/Los_Angeles)", () => {
    // For this one, given that America is behind, it has to be the 11th, which is 3 days before
    // the provided date (8th).
    const user = { created: new Date("2024-03-11T00:00:00.000Z"), timezone: "America/Los_Angeles" };

    expect(() => getDate(date, user)).toThrow("Cannot go before creating your account.");
  });

  it("should throw an error if the provided date is more than 7 days in the future", () => {
    // This is to mock the call in the `differenceInDays` which is evaluated at runtime.
    jest.spyOn(Date, "now").mockImplementationOnce(() => new Date("2024-02-29").valueOf());

    const user = { created: new Date("2024-02-29"), timezone: null };
    expect(() => getDate(date, user)).toThrow("Can only get up to 7 days ahead");
  });
});
