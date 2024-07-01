import messaging from "@react-native-firebase/messaging";
import notifee from "@notifee/react-native";
import * as Linking from "expo-linking";
import integrationIcons from "./integrations";

export const requestUserPermission = async () => {
  const authStatus = await messaging().requestPermission();

  /**
   * NOT_DETERMINED = -1
   * DENIED = 0
   * AUTHORIZED = 1
   * PROVISIONAL = 2
   */
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  // TODO: remove this console.log instead on the profile screen show that the user has not enabled notifications and show a button to enable them
  if (enabled) console.log("Authorization status:", authStatus);
};

export const getFCMToken = async () => {
  try {
    const fcmToken = await messaging().getToken();

    if (fcmToken) {
      console.log("deviceToken", fcmToken);
      return fcmToken;
    }

    return;
  } catch (error) {
    console.error(error);
    return;
  }
};

export const deleteFCMToken = async () => {
  try {
    await messaging().deleteToken();
    //mutation to delete user notification token
  } catch (error) {
    console.error(error);
  }
};

export const notificationListener = async () => {
  messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log("Notification caused app to open from background state:", {
      remoteMessage: remoteMessage ? remoteMessage : "dddd",
    });
    if (
      integrationIcons.some(
        (item) =>
          (remoteMessage?.notification?.body?.indexOf(item.name) as number) > -1
      )
    ) {
      Linking.openURL(Linking.createURL("InformationRequiredScreen"));
    }
  });

  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage)
        console.log(
          "Notification caused app to open from quit state:",
          remoteMessage?.data
        );
    });

  messaging().onMessage(async (remoteMessage) => {
    if (remoteMessage.notification) {
      // Request permissions (required for iOS)
      await notifee.requestPermission();

      // Create a channel (required for Android)
      const channelId = await notifee.createChannel({
        id: "default",
        name: "Default Channel",
      });
      // @ts-ignore
      notifee.displayNotification({
        title: remoteMessage.notification.title,
        body: remoteMessage.notification.body,
        android: {
          channelId,
          smallIcon: "ic_notification_icon",
        },
      });
    }
    console.log("notification on the foreground state", remoteMessage);
  });
};

export const subscribeToTopic = async (topic: string) => {
  await messaging().subscribeToTopic(topic);
};

export const unsubscribeFromTopic = async (topic: string) => {
  await messaging().unsubscribeFromTopic(topic);
};
