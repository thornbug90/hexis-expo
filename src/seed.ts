import { UserAudit } from "@prisma/client";
import prisma from "./lib/prisma";

const create = async () => {
  const data = await prisma.userAudit.findMany({
    where: { userId: "ckzds2mzn0023h0s73ulk444h", date: { lte: new Date("2022-02-10") } },
    orderBy: { date: "asc" },
  });

  const userState: Partial<UserAudit> = {};

  data.map(i => {
    userState.dob = i.dob ? i.dob : userState.dob;
    userState.goal = i.goal ? i.goal : userState.goal;
    userState.mealplanId = i.mealplanId ? i.mealplanId : userState.mealplanId;
    userState.sleepTime = i.sleepTime ? i.sleepTime : userState.sleepTime;
    userState.wakeTime = i.wakeTime ? i.wakeTime : userState.wakeTime;
    userState.height = i.height ? i.height : userState.height;
    userState.weight = i.weight ? i.weight : userState.weight;
    userState.sex = i.sex ? i.sex : userState.sex;
    userState.totalActivityDuration = i.totalActivityDuration ? i.totalActivityDuration : userState.totalActivityDuration;
    userState.primaryActivityId = i.primaryActivityId ? i.primaryActivityId : userState.totalActivityDuration;
  });
};

void create();
