import { useGetAthleteNotesQuery } from "../generated/graphql";
import client from "../lib/graphql";
import useAppDate from "./useAppDate";

const useAthleteNotes = ({ athleteId }: { athleteId: string }) => {
  const [appDate] = useAppDate();

  const { data: notes } = useGetAthleteNotesQuery(client, {
    athleteId,
    date: appDate,
  });
  return { notes };
};

export default useAthleteNotes;
