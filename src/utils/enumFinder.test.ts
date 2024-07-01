import { DAY_NAMES } from "@prisma/client";
import { findEnumItem } from "./enumFinder";
describe("findEnumItem", () => {
  it("should find an item inside an Enum and return it", () => {
    expect(findEnumItem(DAY_NAMES, "SUNDAY")).toBe(DAY_NAMES.SUNDAY);
  });
});
