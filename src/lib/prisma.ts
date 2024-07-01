import { PrismaClient } from "@prisma/client";
import { keys, pick } from "rambda";
import { updatedDiff } from "deep-object-diff";
import dayjs from "dayjs";

const prisma = new PrismaClient();

const keysToTrack = [
  "weight",
  "height",
  "totalActivityDuration",
  "lifestyleActivity",
  "goal",
  "dob",
  "sleepTime",
  "wakeTime",
  "mealplanId",
  "sex",
];

prisma.$use(async (params, next) => {
  if (params.model == "User" && params.action == "update") {
    if (keys(params.args.data).filter(item => keysToTrack.includes(item.toString())).length > 0) {
      const user = await prisma.user.findUnique({
        where: params.args.where.gotrueId ? { gotrueId: params.args.where.gotrueId } : { id: params.args.where.id },
      });

      if (user) {
        const updated = updatedDiff(user!, params.args.data);
        const updatedPicked = pick(keysToTrack, updated);
        if (Object.keys(updatedPicked).length !== 0) {
          const today = user.timezone ? new Date(`${dayjs().tz(user?.timezone).format("YYYY-MM-DD")}Z`) : new Date();

          await prisma.userAudit.upsert({
            where: { date_userId: { date: today, userId: user.id } },
            create: { userId: user.id, ...updatedPicked, date: today },
            update: { userId: user.id, ...updatedPicked },
          });
        }
      }
    }
  }

  if (params.model == "UserActivity" && params.action == "createMany") {
    const filteredPrimaryEvent: {
      activityId: string;
      userId: string;
      primary: boolean;
    }[] = params.args.data.filter((item: any) => item.primary);
    if (filteredPrimaryEvent.length > 0) {
      const filteredEvent = filteredPrimaryEvent[0];
      const user = await prisma.user.findUnique({
        where: { id: filteredEvent.userId },
      });
      const today = user?.timezone ? new Date(`${dayjs().tz(user?.timezone).format("YYYY-MM-DD")}Z`) : new Date();

      await prisma.userAudit.upsert({
        where: { date_userId: { date: today, userId: filteredEvent.userId } },
        update: { primaryActivityId: filteredEvent.activityId, userId: filteredEvent.userId },
        create: { primaryActivityId: filteredEvent.activityId, userId: filteredEvent.userId, date: today },
      });
    }
  }

  return next(params);
});

export default prisma;
