import { SetStateAction, useAtom } from "jotai";
import { useEffect, useRef } from "react";
import { appDateAtom } from "../store";
import { useAnalytics } from "@segment/analytics-react-native";
import { getLiteralDateString } from "../utils/date";

const useAppDate = (): [Date, (update: SetStateAction<Date>) => void] => {
  const oldAppDate = useRef<Date>();
  const [appDate, setAppDate] = useAtom(appDateAtom);
  const { track } = useAnalytics();

  useEffect(() => {
    if (
      oldAppDate.current &&
      getLiteralDateString(appDate) !== getLiteralDateString(oldAppDate.current)
    ) {
      track("APP_DATE_CHANGED", {
        date: getLiteralDateString(appDate),
      });

      oldAppDate.current = appDate;
    }
  }, [appDate]);

  return [appDate, setAppDate];
};

export default useAppDate;
