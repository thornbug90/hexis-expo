import { atom } from "jotai";

import { getLiteralDate } from "../utils/date";

export const appDateAtom = atom<Date>(getLiteralDate());
export const appLoadedAtom = atom<boolean>(false);
export const isLoggedInAtom = atom<boolean>(false);
export const userIdAtom = atom<string | undefined>(undefined);
export const resettingPasswordAtom = atom<boolean>(false);
export const addIWFAlert = atom<boolean>(false);
export const removeIWFAlert = atom<boolean>(false);
export const isLoadingRefechWorkouts = atom<boolean>(false);
export const syncingWearableWorkouts = atom([]);
export const dayIdAtom = atom<string | undefined>(undefined);
export const mainHeightAtom = atom<number>(0);
