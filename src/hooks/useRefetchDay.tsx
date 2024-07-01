import { atom, SetStateAction, useAtom } from "jotai";

export const refetchDayAtom = atom(false);

const useRefetchDay = () => {
  const [refetchDay, setRefetchDay] = useAtom(refetchDayAtom);

  return [refetchDay, setRefetchDay] as [
    boolean,
    (update: SetStateAction<boolean>) => void
  ];
};

export default useRefetchDay;
