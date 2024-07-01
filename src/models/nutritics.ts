import { Log, NutriticsObject as RawNutriticsObject } from "@prisma/client";
import crypto from "crypto";
import prisma from "../lib/prisma";
import { NutriticsObject, Portion, Nutrient, Tag, NutriticsObjectInput } from "../schema/nutritics";

type NutrientCat = {
  name: string;
  children?: NutrientCat[];
};
type FoodLogInput = {
  foodObjects: string[];
  quantities: number[];
  portions: string[];
};
const nutrientsMap: NutrientCat[] = [
  { name: "Energy", children: [{ name: "energyKcal" }, { name: "energyKj" }] },
  {
    name: "Macronutrients",
    children: [
      { name: "carbohydrate" },
      { name: "protein" },
      { name: "fat" },
      { name: "water", children: [{ name: "waterDr" }] },
      { name: "alcohol" },
    ],
  },
  {
    name: "Carbohydrate",
    children: [
      { name: "starch" },
      { name: "oligosaccharide" },
      { name: "fibre" },
      { name: "nsp" },
      {
        name: "sugars",
        children: [
          { name: "glucose" },
          { name: "galactose" },
          { name: "fructose" },
          { name: "sucrose" },
          { name: "maltose" },
          { name: "lactose" },
        ],
      },
    ],
  },
  {
    name: "Fat",
    children: [
      { name: "satfat", children: [{ name: "monos" }] },
      { name: "poly", children: [{ name: "n3poly" }, { name: "n6poly" }] },
      { name: "trans" },
      { name: "cholesterol" },
    ],
  },
  {
    name: "Minerals & Trace Elements",
    children: [
      { name: "sodium" },
      { name: "potassium" },
      { name: "chloride" },
      { name: "calcium" },
      { name: "phosphorus" },
      { name: "magnesium" },
      { name: "iron" },
      { name: "zinc" },
      { name: "copper" },
      { name: "manganese" },
      { name: "selenium" },
      { name: "iodine" },
    ],
  },
  {
    name: "Vitamins",
    children: [
      { name: "vita", children: [{ name: "retinol" }, { name: "carotene" }] },
      { name: "vitd" },
      { name: "vite" },
      { name: "vitk" },
      { name: "thiamin" },
      { name: "riboflavin" },
      {
        name: "niacin",
        children: [{ name: "niacineqv" }, { name: "tryptophan" }],
      },
      { name: "pantothenate" },
      { name: "vitb6" },
      { name: "folate" },
      { name: "vitb12" },
      { name: "vitb12" },
      { name: "biotin" },
      { name: "vitc" },
    ],
  },
  {
    name: "Other",
    children: [{ name: "gi" }, { name: "gl" }, { name: "caffeine" }, { name: "salt" }],
  },
];
const properties = [
  { name: "Liquid", slug: "liquid" },
  { name: "Vegetarian", slug: "vegetarian" },
  { name: "Vegan", slug: "vegan" },
  { name: "Halal", slug: "halal" },
  { name: "Gluten Free", slug: "glutenfree" },
  { name: "Kosher", slug: "kosher" },
];

const updateFoodLog = async (log: FoodLogInput, verificationId: string) => {
  const newLogs: Omit<Log, "id">[] = [];
  log.foodObjects.forEach((_, i) => {
    newLogs.push({
      verificationId: verificationId,
      quantity: log.quantities[i],
      nutriticsObjectId: log.foodObjects[i],
      portion: log.portions[i],
    });
  });

  if (verificationId) await prisma.log.deleteMany({ where: { verificationId: verificationId } });
  if (newLogs.length > 0) await prisma.log.createMany({ data: newLogs });
};
const deleteFoodLog = async (verificationId: string) => {
  await prisma.log.deleteMany({ where: { verificationId: verificationId } });
};

type ncatbuilderObject = {
  [key: string]: {
    name: string;
    val?: string;
    percentRI?: number;
    unit: string;
    nutrients: Nutrient[];
  };
};
const nutrientCatBuilder = (nutrientCat: NutrientCat[], jsonObj: ncatbuilderObject): Nutrient[] => {
  const nutrientsArray: Nutrient[] = [];

  for (const nc of nutrientCat) {
    const nutrientCode = nc.name;
    const children = nc.children;
    const nutrient: Nutrient = { name: nutrientCode, slug: nutrientCode };

    if (Object.prototype.hasOwnProperty.call(jsonObj, nutrientCode)) {
      const key = nutrientCode as keyof typeof jsonObj;

      nutrient.name = jsonObj[key].name;
      nutrient.slug = String(key);
      nutrient.value = Number(jsonObj[key].val ? jsonObj[key].val : 0);

      nutrient.percentRI = Number(jsonObj[key].percentRI ? jsonObj[key].percentRI : 0);
      nutrient.unit = jsonObj[key].unit;
      nutrient.nutrients = [];
    }
    if (children && children.length > 0) nutrient.nutrients = [...nutrientCatBuilder(children, jsonObj)];
    nutrientsArray.push(nutrient);
  }
  return nutrientsArray;
};

const convertRawNutriticsObject = (rawObject: RawNutriticsObject) => {
  type jsonObject = {
    portions: { [x: string]: { name: string; val?: number; unit: string } };
    allergens: { contains: unknown[]; maycontain: unknown[] };
    quantity: {
      val: number;
      unit: string;
      qName: string;
    };
    liquid: boolean;
    [x: string]: unknown;
  };
  const isPortion = (object: object): object is jsonObject => {
    return "portions" in object;
  };

  const jsonObj: unknown = JSON.parse(`${rawObject.JSONObj}`);
  if (jsonObj === null || typeof jsonObj !== "object" || !isPortion(jsonObj)) return;

  const portions: Portion[] = [];
  const tags: Tag[] = [];

  for (const i in jsonObj.portions) {
    let PortionName = jsonObj.portions[i].name;
    if (PortionName === "g") {
      PortionName = `Gram(${jsonObj.portions[i].val}g)`;
    }
    const portion: Portion = {
      name: PortionName,
      value: Number(jsonObj.portions[i].val ?? 0),
      unit: jsonObj.portions[i].unit,
    };
    portions.push(portion);
  }

  if (jsonObj.liquid) {
    portions.push({ name: "ml", value: 1, unit: "ml" });
  } else {
    portions.push({ name: "g", value: 1, unit: "g" });
  }

  for (const p of properties) {
    const property = p;
    tags.push({ name: property.name, checked: Boolean(jsonObj[property.slug]) });
  }

  for (const ac of jsonObj.allergens.contains) {
    tags.push({ name: `Contains ${String(ac).toLowerCase()}`, checked: true });
  }

  for (const amc of jsonObj.allergens.maycontain) {
    tags.push({ name: `May contain ${String(amc).toLowerCase()}`, checked: true });
  }

  const record: NutriticsObject = {
    id: rawObject.id,
    name: `${rawObject.name}`,
    type: rawObject.type,
    description: rawObject.description,
    quantity: {
      unit: jsonObj.quantity.unit,
      value: jsonObj.quantity.val,
      name: jsonObj.quantity.qName,
    },
    portions: portions,
    // Because of the missing type definition for this function, we have to cast here to ncatbuilderObject.
    // Ideally the receiver of this function should declare a suitable type for use in this function.
    // Unfortunately, the type RawNutriticsObject has a key called JSONObj which is either a string or null, so no type information
    // is available. So based on the implementation, one has been created.
    nutrients: nutrientCatBuilder(nutrientsMap, jsonObj as ncatbuilderObject),
    tags: tags,
    liquid: jsonObj.liquid,
  };
  return record;
};
const convertHexisFoodObject = (foodObject: NutriticsObjectInput) => {
  const kcals = foodObject.nutrients.filter(n => n.slug == "Energy")[0].nutrients?.filter(n => n.slug == "kcals")[0];
  const carbs = foodObject.nutrients.filter(n => n.slug == "Macronutrients")[0].nutrients?.filter(n => n.slug == "carbohydrate")[0];
  const protein = foodObject.nutrients.filter(n => n.slug == "Macronutrients")[0].nutrients?.filter(n => n.slug == "protein")[0];
  const fat = foodObject.nutrients.filter(n => n.slug == "Macronutrients")[0].nutrients?.filter(n => n.slug == "fat")[0];
  const jsonObj = {
    quantity: {
      val: foodObject.quantity.value,
      unit: foodObject.quantity.unit,
    },
    energyKcal: { name: kcals?.name, val: kcals?.value, unit: kcals?.unit },
    carbohydrate: { name: carbs?.name, val: carbs?.value, unit: carbs?.unit },
    protein: {
      name: protein?.name,
      val: protein?.value,
      unit: protein?.unit,
    },
    fat: { name: fat?.name, val: fat?.value, unit: fat?.unit },
    portions: {
      p1: {
        name: foodObject.portions[0]["name"],
        val: foodObject.portions[0]["value"],
        unit: foodObject.portions[0]["unit"],
      },
    },
    allergens: {
      contains: [],
      maycontain: [],
      freefrom: [],
      suitablefor: [],
    },
    liquid: foodObject.liquid,
  };
  const rawFoodObject = {
    nutriticsID: Math.floor(Math.random() * 999999999) * -1,
    created_at: new Date(),
    type: foodObject.type,
    name: foodObject.name,
    description: foodObject.description,
    JSONObj: JSON.stringify(jsonObj),
    hash: crypto.createHash("md5").update(JSON.stringify(jsonObj)).digest("hex"),
    nutriticsDBId: "3254d511-44e7-46a7-9561-723b4404c791", //Hexis User's Food DB
    page: null,
    version: 1,
    userId: null,
  };
  return rawFoodObject;
};

const loggedMacros = async (verificationId: string, macroType: "fat" | "carbohydrate" | "protein") => {
  type foodObject = { [macroType: string]: { val: number; unit: string } };
  const logs = await prisma.log.findMany({ where: { verificationId: verificationId }, include: { nutriticsObject: true } });

  let macro = 0;
  for (const log of logs) {
    const foodObj = JSON.parse(`${log.nutriticsObject.JSONObj}`) as foodObject;
    macro += (foodObj[macroType].val / foodObj.quantity.val) * (JSON.parse(log.portion) as Portion).value * log.quantity;
  }
  return macro;
};

export { updateFoodLog, FoodLogInput, convertRawNutriticsObject, convertHexisFoodObject, loggedMacros, deleteFoodLog };
