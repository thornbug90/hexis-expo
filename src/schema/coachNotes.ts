import { gql } from "apollo-server";
import authenticated from "../middleware/authenticated";
import prisma from "../lib/prisma";

import currency from "currency.js";
import { CoachNotes, COACH_NOTE_TYPES } from "@prisma/client";
import { endOfDay, startOfDay } from "date-fns";
import { hexisDayjs } from "../utils/dates";

const typeDefs = gql`
  type Note {
    id: ID!
    title: String!
    body: String!
    type: COACH_NOTE_TYPES
    createdAt: Date!
    updatedAt: Date
    dayNoteDay: DateTime
    utcOffset: Int
    clientId: ID!
    coachId: ID!
    alertNotification: Boolean
  }

  type Query {
    getCoachNotes(coachId: ID!, clientId: ID!): [Note!]!
    getAthleteNotes(athleteId: ID!, date: DateTime!): [Note]!
  }

  input NoteInput {
    title: String!
    body: String!
    type: COACH_NOTE_TYPES
    dayNoteDay: DateTime
    clientId: ID!
    coachId: ID!
    alertNotification: Boolean
  }

  input NoteUpdateInput {
    id: ID!
    title: String
    body: String
    createdAt: Date
    clientId: ID
    coachId: ID
  }

  type Mutation {
    addClientNote(input: NoteInput!): Note!
    updateClientNote(input: NoteUpdateInput!): Note!
    deleteNote(id: ID!): Note
  }

  scalar Date
`;

const resolvers = {
  Query: {
    getCoachNotes: authenticated(async (_, { coachId, clientId }: { coachId: string; clientId: string }): Promise<CoachNotes[]> => {
      const notes = await prisma.coachNotes.findMany({ where: { coachId, clientId } });
      return notes;
    }),
    getAthleteNotes: authenticated(async (_, { athleteId, date }: { athleteId: string; date: Date }): Promise<CoachNotes[]> => {
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      const notes = await prisma.coachNotes.findMany({
        where: { clientId: athleteId, dayNoteDay: { gte: dayStart, lte: dayEnd }, type: COACH_NOTE_TYPES.DAY },
      });
      return notes;
    }),
  },
  Mutation: {
    addClientNote: authenticated(
      async (
        _,
        {
          input,
        }: {
          input: {
            title: string;
            body: string;
            type: COACH_NOTE_TYPES;
            dayNoteDay: Date;
            clientId: string;
            coachId: string;
            alertNotification: boolean;
          };
        },
      ): Promise<CoachNotes> => {
        const utcOffset = currency(new Date(input.dayNoteDay).getTimezoneOffset()).divide(60).value;

        const note = await prisma.coachNotes.create({
          data: {
            title: input.title,
            body: input.body,
            type: input.type,
            dayNoteDay: input.dayNoteDay ? hexisDayjs(input.dayNoteDay).utc().toDate() : null,
            utcOffset,
            clientId: input.clientId,
            coachId: input.coachId,
            createdAt: new Date(),
            alertNotification: input.alertNotification,
          },
        });

        return note;
      },
    ),

    updateClientNote: authenticated(async (_, { input }: { input: { id: string; title: string; body: string } }): Promise<CoachNotes> => {
      const updatedNote = await prisma.coachNotes.update({
        where: { id: input.id },
        data: { title: input.title, body: input.body, updatedAt: new Date() },
        include: { client: true },
      });

      return updatedNote;
    }),

    deleteNote: authenticated(async (_, { id }: { id: string }): Promise<CoachNotes> => {
      return prisma.coachNotes.delete({ where: { id } });
    }),
  },
};

export default { typeDefs, resolvers };
