import renameKeys from "./renameKeys";

describe("renameKeys", () => {
  it("should rename the keys of an object according to a map (code data sample)", () => {
    const sampleData = {
      low_min: "lowMin",
      low_max: "lowMax",
      med_min: "medMin",
      med_max: "medMax",
      high_min: "highMin",
      high_max: "highMax",
    };

    const mapper = {
      low_min: "lowMinResult1",
      low_max: "lowMaxResult2",
      med_min: "medMinResult3",
      med_max: "medMaxResult4",
      high_min: "highMinResult5",
      high_max: "highMaxResult6",
    };

    const expectedData = {
      lowMin: "lowMinResult1",
      lowMax: "lowMaxResult2",
      medMin: "medMinResult3",
      medMax: "medMaxResult4",
      highMin: "highMinResult5",
      highMax: "highMaxResult6",
    };

    expect(renameKeys(sampleData, mapper)).toEqual(expectedData);
  });

  it("should rename the keys of an object according to a map", () => {
    const keysMap = { oldKey1: "newKey1", oldKey2: "newKey2" };
    const obj = { oldKey1: "value1", oldKey2: "value2" };
    const expected = { newKey1: "value1", newKey2: "value2" };

    expect(renameKeys(keysMap, obj)).toEqual(expected);
  });

  it("should handle keys that are not in the map", () => {
    const keysMap = { oldKey1: "newKey1" };
    const obj = { oldKey1: "value1", oldKey2: "value2" };
    const expected = { newKey1: "value1", oldKey2: "value2" };

    expect(renameKeys(keysMap, obj)).toEqual(expected);
  });

  it("should handle empty objects", () => {
    const keysMap = {};
    const obj = {};
    const expected = {};

    expect(renameKeys(keysMap, obj)).toEqual(expected);
  });
});
