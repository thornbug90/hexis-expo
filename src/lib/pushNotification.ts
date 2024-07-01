import { COACH_NOTE_TYPES } from "@prisma/client";
import dayjs from "dayjs";
import admin from "firebase-admin";
import serviceAccount from "../../push-notifications.json";
import prisma from "./prisma";
import { hexisDayjs } from "../utils/dates";
import { sendPushNotification } from "../utils/notification";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: process.env.FIREBASE_REALTIME_DB_URL,
});

export const multicastPushNotification = async (title: string, body: string, deviceTokens: string[], data?: { [key: string]: string }) => {
  const message = { notification: { title, body }, tokens: deviceTokens, data };

  try {
    await admin.messaging().sendMulticast(message);
  } catch (error) {
    console.error("Error sending push notification", error);
  }
};

export const pushNotificationCronjob = async () => {
  console.log("PushNotification Cronjob started");
  const currentDate = dayjs().utcOffset(0).format();
  const fromDate = dayjs().startOf("day").subtract(1, "day").utc().toDate();
  const toDate = dayjs(fromDate).add(2, "day").endOf("day").toDate();

  const coachNotes = await prisma.coachNotes.findMany({
    where: { dayNoteDay: { gte: fromDate, lte: toDate }, type: COACH_NOTE_TYPES.DAY, alertNotification: true },
    include: { coach: true, client: true },
  });

  if (coachNotes.length === 0) return `scheduler ran successfully at DateTime ${currentDate}, no notes found.`;

  await Promise.all(
    coachNotes.map(async singleNote => {
      const noteNotificationDate = hexisDayjs.tz(`${singleNote.dayNoteDay}`.replace("Z", ""), singleNote.client.timezone ?? "");
      if (noteNotificationDate.utc().isSame(currentDate))
        await sendPushNotification(singleNote.clientId, `${singleNote.coach.firstName} ${singleNote.coach.lastName}`, singleNote.body);
    }),
  );

  return `scheduler ran successfully at DateTime ${currentDate}, push notification sent.`;
};
