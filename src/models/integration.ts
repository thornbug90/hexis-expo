import { WEARABLE_STATUS, WearableSource } from "@prisma/client";
import prisma from "../lib/prisma";
import { IntegrationSource } from "../constant/integrationSources.data";
import { CreateWearableInput } from "../schema/wearableSources";

export const createIntegration = async (sourceNames: string[], userId: string, dataSources: WearableSource[]) => {
  const toCreate: CreateWearableInput[] = [];
  sourceNames.map(sourceName => {
    // create apple health source
    const appleHealth = IntegrationSource.AppleHealth;
    if (sourceName === appleHealth.name && dataSources.filter(item => item.name === appleHealth.name).length === 0)
      toCreate.push({
        userId: userId,
        ...appleHealth,
        status: WEARABLE_STATUS.DISCONNECTED,
      });
    const healthConnect = IntegrationSource.HealthConnect;
    if (sourceName === healthConnect.name && dataSources.filter(item => item.name === healthConnect.name).length === 0)
      toCreate.push({
        userId: userId,
        ...healthConnect,
        status: WEARABLE_STATUS.DISCONNECTED,
      });
    // create Training Peaks source
    const trainingPeaks = IntegrationSource.TrainingPeaks;
    if (sourceName === trainingPeaks.name && dataSources.filter(item => item.name === trainingPeaks.name).length === 0) {
      toCreate.push({
        userId: userId,
        ...trainingPeaks,
        status: WEARABLE_STATUS.DISCONNECTED,
      });
    }
  });

  const wearableSourceCreationPromises = toCreate.map(dataSource => {
    return prisma.wearableSource.create({
      data: dataSource,
    });
  });

  return await Promise.all(wearableSourceCreationPromises);
};
