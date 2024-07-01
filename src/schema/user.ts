import {
  GOAL,
  HEIGHT_UNIT,
  INVITATION_STATUS,
  LIFESTYLE_ACTIVITY,
  Mealplan,
  SEX,
  TOTAL_ACTIVITY_DURATION,
  User as prismaUser,
  WEIGHT_UNIT,
  DAY_NAMES,
  MEAL_TYPE,
  MEAL_SUB_TYPE,
  WearableSource,
} from "@prisma/client";
import { AuthenticationError, gql, UserInputError } from "apollo-server";
import { ApolloError } from "apollo-server-errors";
import prisma from "../lib/prisma";

import {
  createChargebeeCustomer,
  assignPlanToCustomer,
  associateParentCustomer,
  getCustomerChildren,
  disassociateChildCustomer,
  getCustomerParent,
  getCustomerEntitlement,
} from "../lib/chargebee";

import authenticated from "../middleware/authenticated";
import { hexisDayjs } from "../utils/dates";
import { findMealTemplate, initiateMealPlan } from "../models/mealPlan";
import dayjs from "dayjs";
import { processUserData } from "../models/user";

type UpdateUserInput = {
  firstName?: string;
  lastName?: string;
  dob?: Date;
  genderIdentity?: string;
  sex?: SEX;
  height?: number;
  weight?: number;
  heightUnit?: HEIGHT_UNIT;
  weightUnit?: WEIGHT_UNIT;
  sleepTime?: Date;
  wakeTime?: Date;
  goal?: GOAL;
  targetWeight?: number;
  lifestyleActivity?: LIFESTYLE_ACTIVITY;
  totalActivityDuration?: TOTAL_ACTIVITY_DURATION;
  newsletterSubscriber?: boolean;
  onboardingComplete?: Date;
  timezone?: string;
  wearableId?: string;
};

type RegisterUserToPointInput = {
  id: string;
};
type Entitlement = {
  id: string;
  value: number;
};

export type MealTemplate = {
  id?: string;
  time: Date | null;
  mealName: string | null;
  dayName: DAY_NAMES;
  mealType: MEAL_TYPE;
  mealSubType: MEAL_SUB_TYPE;
  mealplanId?: string;
};

type UpdateMealplanInput = {
  meals: MealTemplate[];
};

const typeDefs = gql`
  input UpdateUserInput {
    firstName: String
    lastName: String
    dob: DateTime
    genderIdentity: String
    sex: SEX
    height: Float
    weight: Float
    heightUnit: HEIGHT_UNIT
    weightUnit: WEIGHT_UNIT
    sleepTime: Time
    wakeTime: Time
    goal: GOAL
    targetWeight: Float
    lifestyleActivity: LIFESTYLE_ACTIVITY
    totalActivityDuration: TOTAL_ACTIVITY_DURATION
    newsletterSubscriber: Boolean
    onboardingComplete: DateTime
    timezone: String
  }

  type Child {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    dob: Date
    genderIdentity: String
    sex: SEX
    height: Float
    weight: Float
    heightUnit: HEIGHT_UNIT!
    weightUnit: WEIGHT_UNIT!
    sleepTime: Time
    wakeTime: Time
    goal: GOAL
    targetWeight: Float
    lifestyleActivity: LIFESTYLE_ACTIVITY
    totalActivityDuration: TOTAL_ACTIVITY_DURATION
    newsletterSubscriber: Boolean!
    onboardingComplete: DateTime
    mealplan: Mealplan
    created: DateTime!
    invitedDate: DateTime
    updated: DateTime!
    pointId: String
    pointRefreshToken: String
    timezone: String
    associatedCustomerId: String
    userAudit: [UserAudit]
    Efficiency: Float
    RMR: Float
    proteinConstant: Float
    carbRanges: CarbRanges
    wearableSources: [wearableSource]!
    wearableId: String
  }

  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    dob: Date
    genderIdentity: String
    sex: SEX
    height: Float
    weight: Float
    heightUnit: HEIGHT_UNIT!
    weightUnit: WEIGHT_UNIT!
    sleepTime: Time
    wakeTime: Time
    goal: GOAL
    targetWeight: Float
    lifestyleActivity: LIFESTYLE_ACTIVITY
    totalActivityDuration: TOTAL_ACTIVITY_DURATION
    newsletterSubscriber: Boolean!
    onboardingComplete: DateTime
    mealplan: Mealplan
    created: DateTime!
    invitedDate: DateTime
    updated: DateTime!
    pointId: String
    pointRefreshToken: String
    timezone: String
    associatedCustomerId: String
    userAudit: [UserAudit]
    Efficiency: Float
    RMR: Float
    proteinConstant: Float
    carbRanges: CarbRanges
    wearableSources: [wearableSource]!
    wearableId: String
    entitlements: [Entitlement]! # User Only Fields
    notificationTokens: [NotificationToken] # User Only Fields
  }

  input CreateUserInput {
    firstName: String!
    lastName: String!
    email: String!
    newsletterSubscriber: Boolean!
    invitationCode: String
    timezone: String
  }

  input RegisterUserToPointInput {
    id: ID!
  }

  type NotificationToken {
    token: String
  }

  type Mealplan {
    meals: [MealTemplate]!
  }
  type Entitlement {
    id: String!
    value: Float
  }
  type UserAudit {
    date: Date!
    weight: Float
    goal: GOAL
  }

  input UpdateMealplanInput {
    meals: [MealTemplateInput!]!
  }

  type MealTemplate {
    id: ID!
    time: Time!
    mealName: String
    dayName: DAY_NAMES!
    mealType: MEAL_TYPE!
    mealSubType: MEAL_SUB_TYPE!
    mealplanId: ID!
  }

  input MealTemplateInput {
    time: Time!
    mealName: String
    dayName: DAY_NAMES!
    mealType: MEAL_TYPE!
    mealSubType: MEAL_SUB_TYPE!
  }

  type Query {
    user: User!
    userById(id: String): User!
    getMyChildren: [Child]!
    getMyParent: User
    getMyEntitlements: [Entitlement]!
    getAvailableSeats: Float
    getUsedSeats: Float
    users: [User!]
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(input: UpdateUserInput!): User!
    updateMealplan(input: UpdateMealplanInput!, clientId: String): Mealplan!
    registerUserToPoint(input: RegisterUserToPointInput!): User!
    addChild(childId: ID): [User]!
    removeChild(childId: ID): [User]!
    addNotificationToken(token: String!): [NotificationToken]!
    removeNotificationToken(token: String!): String!
  }
`;

const resolvers = {
  Query: {
    user: authenticated(async (_, _a, { req: { gotrueId } }) => {
      const user = await prisma.user.findUnique({
        where: { gotrueId },
        include: {
          userAudit: { select: { date: true, weight: true, goal: true } },
          notificationTokens: true,
          favouriteActivities: { include: { activity: true } },
          wearables: true,
        },
      });

      if (!user) throw new Error("User doesn't exist");

      return processUserData(user);
    }),
    users: authenticated(async () => {
      return await prisma.user.findMany({ take: 10 });
    }),
    userById: authenticated(async (_, { id }: { id: string }) => {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          favouriteActivities: { include: { activity: true } },
          wearables: true,
        },
      });

      if (!user) throw new Error("User doesn't exist");

      return processUserData(user);
    }),
    getMyChildren: authenticated(async (_, _a, { req: { gotrueId } }) => {
      const user = await prisma.user.findUnique({ where: { gotrueId }, include: { customer: true } });

      if (!user?.customer) return [];

      const children = await getCustomerChildren(user.customer);
      return children;
    }),
    getMyParent: authenticated(async (_, _a, { req: { gotrueId } }) => {
      const user = await prisma.user.findUnique({ where: { gotrueId }, include: { customer: true } });

      if (!user?.customer) return null;

      const parent = await getCustomerParent(user.customer);
      return parent;
    }),
    getMyEntitlements: authenticated(async (_, _a, { req: { gotrueId } }) => {
      const user = await prisma.user.findUnique({ where: { gotrueId }, include: { customer: true } });

      if (!user?.customer) return [];

      const entitlements = await getCustomerEntitlement(user.customer);
      return entitlements;
    }),
    getAvailableSeats: authenticated(async (_, _a, { req: { gotrueId } }) => {
      let availableSeats = 0;
      const user = await prisma.user.findUnique({ where: { gotrueId }, include: { customer: true } });
      if (!user?.customer) return availableSeats;

      const parent = await getCustomerParent(user.customer);
      let customer;
      if (!parent || !parent.customer) {
        customer = { customerId: user.customer.customerId, userId: user.customer.userId };
      } else {
        customer = { customerId: parent.customer.customerId, userId: parent.customer.userId };
      }

      const entitlements = await getCustomerEntitlement({
        customerId: customer.customerId,
        userId: customer.userId,
      });
      const clientSeats = entitlements.find(entitle => entitle.id === "access-core-app-for-trainee");
      if (clientSeats) availableSeats = clientSeats.value;

      return availableSeats;
    }),
    getUsedSeats: authenticated(async (_, _a, { req: { gotrueId } }) => {
      const user = await prisma.user.findUnique({ where: { gotrueId }, include: { customer: true } });
      let totalUsedSeats = 0;

      if (!user?.customer) return totalUsedSeats;
      const parent = await getCustomerParent(user.customer);
      const coachClientPremiumPlanId = process.env.COACH_CORE_APP_ITEM_PRICE_ID as string;

      if (!parent || !parent.customer) {
        const children = await getCustomerChildren(user.customer);
        const invitation = await prisma.invitation.findMany({
          where: { fromUser: user, status: INVITATION_STATUS.PENDING, planId: { in: [coachClientPremiumPlanId] } },
        });
        totalUsedSeats = children.length + invitation.length;
      } else {
        const coachChildren = await getCustomerChildren(parent.customer);

        await Promise.all(
          coachChildren.map(async coach => {
            if (coach && coach.customer) {
              const children = await getCustomerChildren(coach.customer);
              const invitation = await prisma.invitation.findMany({ where: { userId: coach.id, status: INVITATION_STATUS.PENDING } });
              totalUsedSeats += children.length + invitation.length;
            }
          }),
        );
      }
      return totalUsedSeats;
    }),
  },
  Mealplan: {
    meals: async ({ id }: Mealplan) => {
      return await prisma.mealTemplate.findMany({ where: { mealplanId: id } });
    },
  },
  User: {
    mealplan: async (user: prismaUser) => {
      if (!user.mealplanId) return null;
      const updatedUser = await initiateMealPlan(user);

      return await prisma.mealplan.findUnique({ where: { id: updatedUser?.mealplanId as string } });
    },
    wearableSources: (user: prismaUser & { wearables: WearableSource[] }) => user.wearables,
  },
  Child: {
    mealplan: async (user: prismaUser) => {
      if (!user.mealplanId) return null;
      const updatedUser = await initiateMealPlan(user);

      return await prisma.mealplan.findUnique({ where: { id: updatedUser?.mealplanId as string } });
    },
    wearableSources: (user: prismaUser & { wearables: WearableSource[] }) => user.wearables,
  },
  Mutation: {
    // TODO: Change this any to an expected type.
    createUser: authenticated(async (_, { input }: { input: any }, { req: { gotrueId } }) => {
      try {
        const CBCustomer = await createChargebeeCustomer({
          email: input.email,
          first_name: input.first_name,
          last_name: input.last_name,
        });
        if (!CBCustomer.chargebeeCustomerId)
          throw new ApolloError("Chargebee has failed to create a customer", "CHARGEBEE_CUSTOMER_CREATION_FAILED");
        const { invitationCode, ...restInput } = input;
        const created = new Date(`${hexisDayjs(new Date()).tz(restInput.timezone).format("YYYY-MM-DDTHH:mm:ss.SSS")}`);

        const user = {
          ...(await prisma.user.create({
            data: { gotrueId, customer: { create: { customerId: CBCustomer.chargebeeCustomerId } }, created, ...restInput },
            include: { customer: true },
          })),
          associatedCustomerId: "",
        };

        if (!user.customer) throw new ApolloError("Can't create a customer record");

        // check the invitation code. Assign Basic Plan or invite-based plan
        let planId = null;
        let payingCustomerId = CBCustomer.chargebeeCustomerId;
        let parentUserId = null;
        if (invitationCode) {
          const invitation = await prisma.invitation.findUnique({
            where: { code: invitationCode },
            include: { fromUser: { include: { customer: true } }, payingCustomer: true },
          });

          // check the invitation status and expire date
          if (invitation) {
            let expired = false;
            if (invitation.expire) {
              const invitationExpire = new Date(invitation.expire);
              console.log(`invitationExpire.getUTCMilliseconds(): ${invitationExpire.getUTCMilliseconds()}, Now:${Date.now()}`);
              if (invitationExpire.getTime() < Date.now()) expired = true;
            }

            if (!expired && invitation.status == INVITATION_STATUS.PENDING) {
              planId = invitation.planId;
              payingCustomerId = invitation.payingCustomer;
              parentUserId = invitation.fromUser.customer;
            }
          }
        }

        if (planId) void assignPlanToCustomer(user.customer, planId);

        try {
          if (parentUserId) {
            await associateParentCustomer(user.customer, parentUserId, payingCustomerId);
            user.associatedCustomerId = parentUserId.customerId;

            await prisma.invitation.update({ where: { code: invitationCode }, data: { status: INVITATION_STATUS.USED } });
          }
        } catch (error) {
          throw new ApolloError(String(error), "ASSOCIATE_PARENT_CUSTOMER_FAILED");
        }

        return user;
      } catch (error) {
        throw new ApolloError(String(error), "REGISTRATION_FAILED");
      }
    }),
    updateUser: authenticated(async (_, { input }: { input: UpdateUserInput }, { req: { gotrueId } }) => {
      const user = await prisma.user.update({
        where: { gotrueId },
        data: input,
      });

      return user;
    }),
    updateMealplan: authenticated(
      async (_, { input, clientId }: { input: UpdateMealplanInput; clientId?: string }, { req: { gotrueId } }) => {
        if (!input || input.meals.length < 0) {
          throw new Error("You must have at lease one meal for each day");
        }
        const mealTemplates = input.meals;
        const sevenDaysCheck = new Set(mealTemplates.map(mealTemplate => mealTemplate.dayName));
        if (sevenDaysCheck.size !== 7) throw new Error("You must have at lease one meal for each day");

        const user = await prisma.user.findUnique({
          where: { ...(!clientId && { gotrueId }), ...(clientId && { id: clientId }) },
          include: { mealplan: true },
        });
        if (!user) throw new AuthenticationError("You must be logged in to perform this action");

        // load current meal plan and meal templates and compare with existing one
        // create new meal template while comparing
        const currentMealPlan = await prisma.mealplan.findUnique({
          where: { id: user.mealplanId ?? undefined },
          include: { mealTemplates: { include: { mealsNutrition: { where: { dayNutrition: { day: { gte: new Date() } } } } } } },
        });
        const existTemplates: MealTemplate[] = [];
        const newTemplates: MealTemplate[] = [];
        if (currentMealPlan && currentMealPlan.mealTemplates) {
          mealTemplates.map(mealTemplate => {
            const foundedTemplate = findMealTemplate(mealTemplate, currentMealPlan?.mealTemplates ?? []);
            if (foundedTemplate) existTemplates.push(foundedTemplate);
            else newTemplates.push(mealTemplate);
          });
        }

        // check for deleted templates
        const deletedTemplates: MealTemplate[] = [];
        if (currentMealPlan?.mealTemplates?.length !== mealTemplates.length) {
          currentMealPlan?.mealTemplates.map(mealTemplate => {
            const foundedTemplate = findMealTemplate(mealTemplate, mealTemplates);
            if (!foundedTemplate) deletedTemplates.push(mealTemplate);
          });
        }

        // create new meal plan
        if (newTemplates.length < 1 && deletedTemplates.length < 1) return currentMealPlan;

        const newMealPlan = await prisma.mealplan.create({
          data: { mealTemplates: { createMany: { data: mealTemplates } } },
          include: { mealplanMeals: true },
        });

        await prisma.user.update({ where: { id: user.id }, data: { mealplanId: newMealPlan.id } });

        // delete todays and future mealNutritions and mealVerifications
        await prisma.mealVerification.deleteMany({
          where: {
            mealNutrition: {
              mealTemplateId: { in: deletedTemplates.map(template => template.id as string) },
              dayNutrition: { day: { gte: dayjs().startOf("day").toDate() } },
            },
          },
        });
        await prisma.mealNutrition.deleteMany({
          where: {
            mealTemplateId: { in: deletedTemplates.map(template => template.id as string) },
            dayNutrition: { day: { gte: dayjs().startOf("day").toDate() } },
          },
        });

        return newMealPlan;
      },
    ),
    registerUserToPoint: authenticated((_, { input }: { input: RegisterUserToPointInput }, { req: { gotrueId } }) => {
      //TODO: make sure no one uses this endpoint and delete it
      input;
      gotrueId;
    }),

    addChild: authenticated(async (_, { childId }: { childId: string }, { req: { gotrueId } }) => {
      try {
        const parent = await prisma.user.findUnique({ where: { gotrueId }, include: { customer: true } });
        const child = await prisma.user.findUnique({ where: { id: childId }, include: { customer: true } });

        if (!child || !child.customer || !parent || !parent.customer)
          throw new UserInputError(`Can't add child. Parent or Child has no Customer ID`);

        const children = await associateParentCustomer(child.customer, parent.customer, parent.customer);
        return children;
      } catch (error) {
        throw new ApolloError(error as string, "ASSOCIATION_FAILED");
      }
    }),
    removeChild: authenticated(async (_, { childId }: { childId: string }, { req: { gotrueId } }) => {
      try {
        const parent = await prisma.user.findUnique({ where: { gotrueId }, include: { customer: true } });
        const child = await prisma.user.findUnique({ where: { id: childId }, include: { customer: true } });

        if (!child || !child.customer || !parent || !parent.customer)
          throw new UserInputError(`Can't add child. Parent or Child has no Customer ID`);

        const children = await disassociateChildCustomer(child.customer, parent.customer);

        await prisma.user.update({
          where: { id: childId },
          data: { assignedGroups: { delete: {} } },
        });

        return children;
      } catch (error) {
        throw new ApolloError(String(error), "DISASSOCIATION_FAILED");
      }
    }),
    addNotificationToken: authenticated(async (_, { token }: { token: string }, { req: { gotrueId } }) => {
      const user = await prisma.user.findUnique({ where: { gotrueId }, include: { notificationTokens: true } });
      if (!user) throw new Error("user doesn't exist");

      // if token already exists return
      if (user.notificationTokens?.find(t => t.token === token)) return user.notificationTokens;

      await prisma.notificationToken.create({ data: { userId: user.id, token: token } });

      const tokens = await prisma.notificationToken.findMany({ where: { userId: user.id } });

      return tokens;
    }),
    removeNotificationToken: authenticated(async (_, { token }: { token: string }, { req: { gotrueId } }) => {
      const user = await prisma.user.findUnique({ where: { gotrueId } });
      if (!user) throw new Error("user doesn't exist");

      await prisma.notificationToken.deleteMany({ where: { userId: user.id, token: token } });

      return token;
    }),
  },
};

export default { typeDefs, resolvers };
export { Entitlement };
