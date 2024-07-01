import {
  DAY_NAMES,
  MEAL_SUB_TYPE,
  MEAL_TYPE,
  Mealplan,
  MealplanMeal,
  User,
  MealTemplate as PrismaMealTemplate,
  MealNutrition,
  DayNutrition,
  MEAL_NUTRITION_STATUS,
} from "@prisma/client";
import { MealTemplate } from "../schema/user";
import prisma from "../lib/prisma";

export const findMealTemplate = (mealTemplate: MealTemplate, tmaplates: MealTemplate[]): MealTemplate | undefined => {
  let foundedTemplate;

  tmaplates.map(template => {
    if (template.dayName !== mealTemplate.dayName) return;
    if (template.mealType !== mealTemplate.mealType) return;
    if (template.mealSubType !== mealTemplate.mealSubType) return;
    if (template.mealName !== mealTemplate.mealName) return;
    if (template.time !== mealTemplate.time) return;
    foundedTemplate = template;
  });

  if (foundedTemplate) return foundedTemplate;
  return undefined;
};

const dummyMealTemplateData = () => {
  const templates = [];
  // Breakfast
  const time = new Date();
  time.setUTCHours(8, 30);
  let mealName = "Breakfast";
  let mealType: MEAL_TYPE = MEAL_TYPE.MAIN;
  templates.push({
    ...{
      mealType,
      mealSubType: MEAL_SUB_TYPE.UNSPECIFIED,
      mealName,
      time: new Date(time),
    },
  });

  // Lunch
  time.setUTCHours(12, 30);
  mealName = "Lunch";
  templates.push({
    ...{
      mealType,
      mealSubType: MEAL_SUB_TYPE.UNSPECIFIED,
      mealName,
      time: new Date(time),
    },
  });

  // PM Snack
  time.setUTCHours(15, 30);
  mealType = MEAL_TYPE.SNACK;
  mealName = "PM Snack";
  templates.push({
    ...{
      mealType,
      mealSubType: MEAL_SUB_TYPE.UNSPECIFIED,
      mealName,
      time: new Date(time),
    },
  });

  // Dinner
  time.setUTCHours(18, 30);
  mealType = MEAL_TYPE.MAIN;
  mealName = "Dinner";
  templates.push({
    ...{
      mealType,
      mealSubType: MEAL_SUB_TYPE.UNSPECIFIED,
      mealName,
      time: new Date(time),
    },
  });

  return templates;
};

export const mainMeals = [MEAL_SUB_TYPE.BREAKFAST as string, MEAL_SUB_TYPE.DINNER as string, MEAL_SUB_TYPE.LUNCH as string];

export const initiateMealPlan = async (user: User) => {
  let currentMealPlan:
    | (Mealplan & {
        mealplanMeals?: MealplanMeal[];
        mealTemplates?: PrismaMealTemplate[];
      })
    | null = null;

  let templatesCount = 0;

  if (user.mealplanId) {
    currentMealPlan = await prisma.mealplan.findUnique({
      where: { id: user.mealplanId },
      include: { mealplanMeals: true, mealTemplates: true },
    });
    templatesCount = currentMealPlan?.mealTemplates?.length ?? 0;
  }
  const currentMealTemplatesDays: DAY_NAMES[] = [];
  if (templatesCount > 0) {
    currentMealPlan?.mealTemplates?.map((mealTemplate: PrismaMealTemplate) => {
      currentMealTemplatesDays.push(mealTemplate.dayName);
    });
  }
  const currentMealTemplatesDaysSet = new Set(currentMealTemplatesDays);

  // user has old plan (CC 1.0) or a partial plan
  // has meal templates for some of the week days and has old plan meals
  if (currentMealTemplatesDaysSet.size < 7) {
    const oldMealPlan = currentMealPlan?.mealplanMeals;
    const newMealPlan: MealTemplate[] = currentMealPlan?.mealTemplates ?? [];

    Object.values(DAY_NAMES).map(dayName => {
      if (!currentMealTemplatesDays.includes(dayName)) {
        let dummyMealTemplate = true;

        oldMealPlan?.map(planMeal => {
          dummyMealTemplate = false;
          const mealType = mainMeals.includes(planMeal.slot as string) ? MEAL_TYPE.MAIN : MEAL_TYPE.SNACK;
          const mealSubType = planMeal.slot as MEAL_SUB_TYPE;
          const mealName = planMeal.slot as string;
          const time = planMeal.time;

          newMealPlan.push({
            mealType,
            mealSubType,
            mealName,
            time,
            dayName,
          });
        });
        if (dummyMealTemplate) {
          const dummyMealTemplates = dummyMealTemplateData();
          dummyMealTemplates.map(template => newMealPlan.push({ ...template, dayName }));
        }
      }
    });

    currentMealPlan = await prisma.mealplan.create({
      data: { mealTemplates: { createMany: { data: newMealPlan } } },
      include: { mealTemplates: true },
    });
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { mealplanId: currentMealPlan.id },
    });
    return updatedUser;
  }
  return user;
};

export const createMealNutritionFromTemplate = async (
  mealTemps: PrismaMealTemplate[],
  dayNutrition: DayNutrition,
): Promise<MealNutrition[]> => {
  const mealNutritions = await prisma.$transaction(
    mealTemps.map(template =>
      prisma.mealNutrition.upsert({
        where: {
          mealTemplateId_dayId: {
            mealTemplateId: template.id,
            dayId: dayNutrition.id,
          },
        },
        update: {},
        create: {
          mealTemplateId: template.id,
          dayId: dayNutrition.id,
          mealName: template.mealName,
          mealType: template.mealType,
          mealSubType: template.mealSubType,
          time: template.time,
          status: MEAL_NUTRITION_STATUS.ACTIVE,
        },
        include: { mealVerification: true },
      }),
    ),
  );
  return mealNutritions;
};
