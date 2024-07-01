import prisma from "../lib/prisma";
import { multicastPushNotification } from "../lib/pushNotification";

export const sendPushNotification = async (userId: string, title: string, body: string) => {
  const tokensRaw = await prisma.notificationToken.findMany({
    where: { userId },
    select: { token: true },
  });
  const tokens = tokensRaw.map(token => token.token);

  if (tokens && tokens.length > 0) {
    const tokensFiltered = tokens.filter(token => token.length > 0);
    await multicastPushNotification(title, body, tokensFiltered);
  }
};
