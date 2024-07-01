import { Workout, WORKOUT_SOURCE, WORKOUT_STATUS, WORKOUT_INTENSITY, WORKOUT_SLOT, MEAL_NUTRITION_STATUS } from "@prisma/client";
import { AuthenticationError, gql, UserInputError } from "apollo-server";
import { ApolloError } from "apollo-server-errors";
import { addDays, endOfMonth, isBefore, isAfter, isSameDay, startOfMonth, set } from "date-fns";
import prisma from "../lib/prisma";
import authenticated from "../middleware/authenticated";
import {
  createWorkout,
  activateWaitingWorkout,
  determineClashesOnActiveWorkouts,
  resolveWorkouts,
  workoutIntraFuellingPrompt,
  determineSlot,
  addIntraFuellingMeal,
  deleteIntraFuellingMeal,
} from "../models/workout";
import { getEndOfDay, getStartOfDay } from "../utils/dates";

export type CreateWorkoutInput = {
  start: Date;
  end: Date;
  utcOffset: number;
  key: boolean;
  intensity?: WORKOUT_INTENSITY;
  intensityRPE: number;
  competition: boolean;
  slot?: WORKOUT_SLOT;
  activityId: string;
  source: WORKOUT_SOURCE;
  description?: string;
  title?: string;
  calories?: number;
  powerAverage?: number;
};
type CreateWorkoutWearableInput = {
  id: string;
  start: Date;
  end: Date;
  activity: string;
  source: WORKOUT_SOURCE;
  calories: number;
  activityMappingField: string;
  calsLog?: string;
};

export type WorkoutInput = {
  start: Date;
  end: Date;
  utcOffset: number;
  key: boolean;
  competition: boolean;
  intensity?: WORKOUT_INTENSITY; // not exist in POINT entry
  intensityRPE: number;
  slot: WORKOUT_SLOT; // not exist in POINT entry
  activityId: string;
  source: WORKOUT_SOURCE;
  calories?: number; // not exist in Hexis user entry
  duration?: number; // not exist in Hexis user entry
  externalReference?: string; // not exist in Hexis user entry
  status?: WORKOUT_STATUS;
  confirmed?: boolean;
  description?: string;
  title?: string;
  startTime?: Date;
  powerAverage?: number;
  intraFuelling?: boolean;
};

export type UpdateWorkoutInput = {
  start?: Date;
  end?: Date;
  utcOffset?: number;
  key?: boolean;
  intensity?: WORKOUT_INTENSITY;
  intensityRPE: number;
  competition?: boolean;
  slot?: WORKOUT_SLOT;
  activityId?: string;
  status?: WORKOUT_STATUS;
  intraFuelling?: boolean;
  description?: string;
  title?: string;
  calories?: number;
  powerAverage?: number;
};

type ResolveWorkoutsInput = {
  from: Date;
  to: Date;
};

type DiscardAllWorkoutsOnGivenDateInput = {
  date: Date;
};

const typeDefs = gql`
  type Workout {
    id: ID!
    intensity: WORKOUT_INTENSITY
    intensityRPE: Int
    activity: Activity!
    start: DateTime!
    end: DateTime!
    utcOffset: Int
    slot: WORKOUT_SLOT!
    key: Boolean!
    competition: Boolean!
    recurring: Boolean!
    source: WORKOUT_SOURCE
    status: WORKOUT_STATUS
    confirmed: Boolean
    externalReference: ID
    calories: Float
    intraFuelling: Boolean
    description: String
    title: String
    startTime: Time
    powerAverage: Float
  }

  type Activity {
    id: ID!
    name: String!
    slug: String!
  }

  type Query {
    workoutsByDay(date: DateTime!): [Workout]!
    workout(id: ID!): Workout
    workoutsByMonth(date: DateTime!): [Workout]!
  }

  input CreateWorkoutInput {
    intensity: WORKOUT_INTENSITY
    intensityRPE: Int!
    key: Boolean!
    competition: Boolean!
    start: DateTime!
    end: DateTime!
    utcOffset: Int!
    slot: WORKOUT_SLOT
    activityId: ID!
    source: WORKOUT_SOURCE
    description: String
    title: String
    calories: Float
    powerAverage: Float
  }
  input CreateWorkoutWearableInput {
    id: ID!
    start: DateTime!
    end: DateTime!
    activity: String!
    source: WORKOUT_SOURCE!
    calories: Float
    activityMappingField: String!
    calsLog: String
  }

  input UpdateWorkoutInput {
    intensity: WORKOUT_INTENSITY
    intensityRPE: Int
    key: Boolean
    competition: Boolean
    start: DateTime
    end: DateTime
    utcOffset: Int
    slot: WORKOUT_SLOT
    activityId: ID
    status: WORKOUT_STATUS
    confirmed: Boolean
    intraFuelling: Boolean
    description: String
    title: String
    calories: Float
    powerAverage: Float
  }

  input ResolveWorkoutsInput {
    from: DateTime!
    to: DateTime
  }

  input DiscardAllWorkoutsOnGivenDateInput {
    date: Date!
  }

  type Mutation {
    createWorkout(input: CreateWorkoutInput!, userId: String): Workout!
    createWorkoutWearable(input: [CreateWorkoutWearableInput]!): [Workout]!
    createRecurringWorkout(input: CreateWorkoutInput!): Workout!
    updateWorkout(id: ID!, input: UpdateWorkoutInput, userId: ID): Workout!
    deleteWorkout(id: ID!): Workout!
    resolveWorkouts(input: ResolveWorkoutsInput): [Workout]!
    discardAllWorkoutsOnGivenDate(input: DiscardAllWorkoutsOnGivenDateInput): [Workout]!
  }
`;

const resolvers = {
  Query: {
    workout: authenticated(async (_, { id }: { id: string }, { req: { gotrueId } }) => {
      const user = await prisma.user.findUnique({
        where: { gotrueId },
        include: { workouts: { where: { id } } },
      });

      return user?.workouts[0];
    }),

    workoutsByDay: authenticated(async (_, { date }: { date: Date }, { req: { gotrueId } }) => {
      const user = await prisma.user.findUnique({
        where: { gotrueId },
        include: {
          workouts: {
            where: {
              OR: [
                { start: { gte: getStartOfDay(date), lte: getEndOfDay(date) }, recurring: false },
                { recurring: true, recurringDeleted: { gte: getEndOfDay(date) } }, // Was deleted this month,
                { recurring: true, recurringDeleted: null },
              ],
            },
          },
        },
      });

      if (!user) throw new AuthenticationError("Must be logged in.");
      const nonRecurringWorkouts = user.workouts.filter(workout => !workout.recurring);
      const recurringWorkouts = user.workouts.filter(workout => workout.recurring);

      // Return if there's no logic around recurring workouts.
      if (recurringWorkouts.length === 0) return nonRecurringWorkouts;
      const workouts = [...nonRecurringWorkouts];

      recurringWorkouts.map(workout => {
        if (workout.recurringDeleted) {
          if (date.getDay() === workout.recurringDay) {
            workouts.push({
              ...workout,
              start: set(workout.start, { date: date.getDate(), month: date.getMonth(), year: date.getFullYear() }),
              end: set(workout.end, { date: date.getDate(), month: date.getMonth(), year: date.getFullYear() }),
            });
          }
          return workout;
        } else {
          if (date < workout.start) {
            return;
          }
          if (date.getDay() === workout.recurringDay) {
            workouts.push({
              ...workout,
              start: set(workout.start, { date: date.getDate(), month: date.getMonth(), year: date.getFullYear() }),
              end: set(workout.end, { date: date.getDate(), month: date.getMonth(), year: date.getFullYear() }),
            });
          }
        }
        return workout;
      });

      return workouts;
    }),

    workoutsByMonth: authenticated(async (_, { date }: { date: Date }, { req: { gotrueId } }) => {
      const user = await prisma.user.findUnique({
        where: { gotrueId },
        include: {
          workouts: {
            where: {
              OR: [{ start: { gte: startOfMonth(date), lte: endOfMonth(date) }, recurring: false }, { recurring: true }],
            },
          },
        },
      });

      if (!user) throw new AuthenticationError("Must be logged in.");
      const nonRecurringWorkouts = user.workouts.filter(workout => !workout.recurring);
      const recurringWorkouts = user.workouts.filter(workout => workout.recurring);

      // Return if there's no logic around recurring workouts.
      if (recurringWorkouts.length === 0) return nonRecurringWorkouts;
      const workouts = [...nonRecurringWorkouts];
      recurringWorkouts.map(workout => {
        if (workout.recurringDeleted) {
          for (let i = startOfMonth(date); isBefore(i, workout.recurringDeleted); i = addDays(i, 1)) {
            if (i.getDay() === workout.recurringDay && i >= workout.start) {
              workouts.push({
                ...workout,
                start: set(workout.start, { date: i.getDate(), month: i.getMonth(), year: i.getFullYear() }),
                end: set(workout.end, { date: i.getDate(), month: i.getMonth(), year: i.getFullYear() }),
              });
            }
          }
          return workout;
        } else {
          for (let i = startOfMonth(date); isBefore(i, endOfMonth(date)); i = addDays(i, 1)) {
            if (
              (i.getDay() === workout.recurringDay && isSameDay(i, workout.start)) ||
              (i.getDay() === workout.recurringDay && isAfter(i, workout.start))
            ) {
              workouts.push({
                ...workout,
                start: set(workout.start, { date: i.getDate(), month: i.getMonth(), year: i.getFullYear() }),
                end: set(workout.end, { date: i.getDate(), month: i.getMonth(), year: i.getFullYear() }),
              });
            }
          }
          return workout;
        }
      });
      return workouts;
    }),
  },
  Mutation: {
    deleteWorkout: authenticated(async (_, { id }: { id: string }) => {
      let workout = await prisma.workout.findUnique({ where: { id } });
      if (!workout) throw new UserInputError("No workout found.");

      if (workout?.recurring) {
        workout = await prisma.workout.update({
          where: { id },
          data: { recurringDeleted: new Date() },
        });
      } else {
        const mealVerification = await prisma.mealVerification.findUnique({
          where: { workoutId: id },
        });
        if (mealVerification)
          await prisma.mealVerification.delete({
            where: { id: mealVerification.id },
          });

        workout = await prisma.workout.delete({
          where: { id },
        });
      }

      // check if there is WAITING workouts, activate it based on Highest Integrity First (HIF) then FCFS
      void activateWaitingWorkout(workout);

      return workout;
    }),
    updateWorkout: authenticated(
      async (_, { id, input, userId = "" }: { id: string; input: UpdateWorkoutInput; userId?: string }, { req: { gotrueId } }) => {
        let user;
        if (userId) {
          user = await prisma.user.findUnique({
            where: { id: userId },
            include: { workouts: { where: { id }, include: { intraFuellingMeal: true } } },
          });
        } else
          user = await prisma.user.findUnique({
            where: { gotrueId },
            include: { workouts: { where: { id }, include: { intraFuellingMeal: true } } },
          });

        if (!user || user.workouts.length === 0) throw new UserInputError("No workout found.");

        const inputWorkout = user.workouts[0];

        let { slot, status } = input;
        inputWorkout.slot = slot ?? inputWorkout.slot;
        inputWorkout.status = status ?? inputWorkout.status;
        inputWorkout.start = input.start ?? inputWorkout.start;
        inputWorkout.end = input.end ?? inputWorkout.end;
        inputWorkout.startTime = inputWorkout.startTime ?? input.start ?? inputWorkout.start;

        let startTimeField = input.start;

        if (
          status === WORKOUT_STATUS.DISCARDED &&
          (inputWorkout.source === WORKOUT_SOURCE.COACH || inputWorkout.source === WORKOUT_SOURCE.USER)
        ) {
          await deleteIntraFuellingMeal(inputWorkout.id);
          await prisma.workout.delete({ where: { id: inputWorkout.id } });
          return inputWorkout;
        }

        if (status === WORKOUT_STATUS.DISCARDED && inputWorkout.intraFuellingMeal?.id) {
          await prisma.mealNutrition.update({
            where: { id: inputWorkout.intraFuellingMeal.id },
            data: { status: MEAL_NUTRITION_STATUS.DELETED },
          });
        }

        if (status === WORKOUT_STATUS.ACTIVE) {
          // INCOMPLETE workout
          if (input.intensity === WORKOUT_INTENSITY.UNSPECIFIED || input.start === input.end) {
            throw new ApolloError(
              "You must specify the intensity, slot, start time and duration before activating the workout",
              "INCOMPLETE_WORKOUT",
            );
          }

          slot = await determineSlot(user.mealplanId as string, inputWorkout);

          // CONFLICTING workout check there is not time clashing
          const clashingWorkout = await determineClashesOnActiveWorkouts(inputWorkout, user, id);
          if (clashingWorkout.length > 0) {
            throw new ApolloError("Time clash", "TIME_CLASH", {
              clashingWorkout,
            });
          }
        }

        // determine the intra fuelling prompt
        const endTime = input.end ? input.end.getTime() : inputWorkout.end.getTime();
        const startTime = input.start ? input.start.getTime() : inputWorkout.start.getTime();
        const intraFuellingPrompt = await workoutIntraFuellingPrompt(
          input.activityId ? input.activityId : inputWorkout.activityId,
          input.competition ? input.competition : inputWorkout.competition,
          input.key ? input.key : inputWorkout.key,
          input.intensityRPE ? input.intensityRPE : inputWorkout.intensityRPE ?? 0,
          Math.abs(endTime - startTime) / 36e5, // convert to from millisecond hours
          input.intensity,
        );
        if (inputWorkout.startTime) startTimeField = inputWorkout.startTime;

        // handle powerAverage
        let powerAverage: undefined | number = inputWorkout.powerAverage;
        if (inputWorkout.powerAverage && inputWorkout.powerAverage > 0 && (!("powerAverage" in input) || !input.powerAverage)) {
          powerAverage = 0;
        }
        if (input.powerAverage && input.powerAverage > 0) {
          powerAverage = input.powerAverage;
        }
        const workout = await prisma.workout.update({
          where: {
            id,
          },
          data: {
            ...input,
            slot,
            status,
            intraFuellingPrompt: intraFuellingPrompt,
            startTime: startTimeField,
            powerAverage,
          },
          include: { intraFuellingMeal: true },
        });

        // add meal nutrition
        if (workout.intraFuelling === true && !workout.intraFuellingMeal) {
          await addIntraFuellingMeal(user.id, input.start ?? inputWorkout.start, inputWorkout.id);
        }
        // remove meal nutrition and its log verification
        if (workout.intraFuelling === false && workout.intraFuellingMeal) {
          await deleteIntraFuellingMeal(inputWorkout.id);
        }

        return workout;
      },
    ),
    createRecurringWorkout: authenticated(async (_, { input }: { input: CreateWorkoutInput }, { req: { gotrueId } }) => {
      const user = await prisma.user.findUnique({ where: { gotrueId }, select: { id: true } });
      if (!user) throw new AuthenticationError("Must be logged in to do this action.");

      const workout = await prisma.workout.create({
        data: {
          ...input,
          userId: user.id,
          recurringInterval: "WEEKLY",
          recurringDay: input.start.getDay(),
          recurring: true,
          slot: input.slot ? input.slot : WORKOUT_SLOT.UNSPECIFIED,
        },
      });

      return workout;
    }),
    createWorkout: authenticated(async (_, { input, userId }: { input: CreateWorkoutInput; userId?: string }, { req: { gotrueId } }) => {
      const workoutInput: WorkoutInput = {
        start: input.start,
        end: input.end,
        utcOffset: input.utcOffset,
        key: input.key,
        intensity: input.intensity,
        intensityRPE: input.intensityRPE,
        competition: input.competition,
        slot: input.slot ? input.slot : WORKOUT_SLOT.UNSPECIFIED,
        activityId: input.activityId,
        source: input.source,
        status: WORKOUT_STATUS.ACTIVE,
        confirmed: false,
        description: input.description,
        title: input.title,
        calories: input.calories,
        powerAverage: input.powerAverage,
      };
      let userGoTrueId = gotrueId;
      let athlete;

      if (userId) {
        athlete = await prisma.user.findUnique({
          where: { id: userId },
          select: { gotrueId: true, id: true },
        });
        if (athlete) userGoTrueId = athlete?.gotrueId;
      }
      let coachFullName = "";
      if (workoutInput.source === WORKOUT_SOURCE.COACH) {
        const coach = await prisma.user.findUnique({
          where: { gotrueId: gotrueId },
          select: { firstName: true, lastName: true },
        });
        coachFullName = `${coach?.firstName} ${coach?.lastName}`;
      }

      const workout = await createWorkout(workoutInput, userGoTrueId, coachFullName);
      return workout;
    }),

    createWorkoutWearable: authenticated(async (_, { input }: { input: CreateWorkoutWearableInput[] }, { req: { gotrueId } }) => {
      // Check if workout already exists
      const existingWorkouts = await prisma.workout.findMany({
        where: { externalReference: { in: input.map(rawWorkout => `${rawWorkout.id}`) } },
        select: { id: true, externalReference: true },
      });

      const existingWorkoutsIds = existingWorkouts.map(existWorkout => existWorkout.externalReference);
      if (existingWorkouts.length === input.length) return [];

      // filter out new Workouts
      const newRawWorkouts = input.filter(rawWorkout => !existingWorkoutsIds.includes(rawWorkout.id));

      const athlete = await prisma.user.findUnique({ where: { gotrueId }, select: { gotrueId: true, id: true } });
      if (!athlete) new UserInputError("No user been found.");

      const rawActivities = newRawWorkouts.map(rawWorkout => rawWorkout.activity);
      const mappedActivitiesValues = await prisma.mapping.findMany({
        where: {
          field2: newRawWorkouts?.[0]?.activityMappingField ?? "",
          value2: { in: rawActivities },
          name: newRawWorkouts?.[0]?.source ?? "",
        },
        select: { value2: true, value1: true },
      });

      const workoutsInput: WorkoutInput[] = newRawWorkouts.map(rawWorkout => {
        const duration = (rawWorkout.end.getTime() - rawWorkout.start.getTime()) / 60000; // from milliseconds to minutes
        return {
          start: rawWorkout.start,
          end: rawWorkout.end,
          activityId:
            mappedActivitiesValues.filter(activityMap => activityMap.value2 === rawWorkout.activity)[0]?.value1 ??
            "clhry7xug0000x9b1f04e0kwm", // id for Other activity
          calories: rawWorkout.calories,
          duration: duration,
          externalReference: `${rawWorkout.id}`,
          source: rawWorkout.source,
          // predetermined values (Default)
          utcOffset: 0,
          key: false,
          competition: false,
          slot: WORKOUT_SLOT.UNSPECIFIED,
          status: WORKOUT_STATUS.ACTIVE,
          intensity: WORKOUT_INTENSITY.UNSPECIFIED,
          intensityRPE: 0,
          startTime: rawWorkout.start,
          confirmed: true,
        };
      });

      const insertedWorkouts = await Promise.all(
        workoutsInput.map(async workoutInput => {
          return await createWorkout(workoutInput, gotrueId);
        }),
      );

      return insertedWorkouts;
    }),
    resolveWorkouts: authenticated(async (_, { input }: { input: ResolveWorkoutsInput }, { req: { gotrueId } }) => {
      let from = new Date();
      let to = new Date();
      if (input?.from) from = new Date(input.from);
      if (input?.to) to = new Date(input.to);

      return await resolveWorkouts(from, to, gotrueId);
    }),
    discardAllWorkoutsOnGivenDate: authenticated(
      async (_, { input }: { input: DiscardAllWorkoutsOnGivenDateInput }, { req: { gotrueId } }) => {
        const user = await prisma.user.findUnique({
          where: { gotrueId },
          select: {
            id: true,
          },
        });

        if (!user) throw new UserInputError("No user found.");

        await prisma.workout.updateMany({
          where: {
            userId: user.id,
            start: { gte: new Date(input.date), lte: getEndOfDay(new Date(input.date)) },
            // filter out status that are active
            status: { not: WORKOUT_STATUS.ACTIVE },
          },
          data: {
            status: WORKOUT_STATUS.DISCARDED,
          },
        });

        const workouts = await prisma.workout.findMany({
          where: {
            userId: user.id,
            start: { gte: new Date(input.date), lte: getEndOfDay(new Date(input.date)) },
          },
          include: { intraFuellingMeal: true },
        });

        // descard intrafuelling meal
        const intraFuellingMealIds: string[] = workouts.filter(workout => workout.intraFuellingMeal).map(workout => workout.id);
        if (intraFuellingMealIds && intraFuellingMealIds.length > 0)
          await prisma.mealNutrition.updateMany({
            where: { id: { in: intraFuellingMealIds } },
            data: { status: MEAL_NUTRITION_STATUS.DELETED },
          });
        return workouts;
      },
    ),
  },
  Workout: {
    activity: async (workout: Workout) => {
      return await prisma.activity.findUnique({
        where: { id: workout.activityId },
        select: { slug: true, name: true, id: true },
      });
    },
  },
};

export default { typeDefs, resolvers };
