import { gql, UserInputError } from "apollo-server";
import prisma from "../lib/prisma";
import authenticated from "../middleware/authenticated";
import { Invitation, INVITATION_STATUS } from "@prisma/client";
import { sendInvitationEmail } from "../lib/mailchimp";
import {
  assignPlanToCustomer,
  associateParentCustomer,
  cancelSubscription,
  getCustomerEntitlement,
  getCustomerParent,
} from "../lib/chargebee";
import { Entitlement } from "./user";
import dayjs from "dayjs";

type InvitationInput = {
  to: string;
  planId?: string;
  payingCustomerId?: string;
  customerType?: string;
};

const typeDefs = gql`
  type Invitation {
    id: ID!
    to: String!
    code: String!
    planId: String!
    status: INVITATION_STATUS!
    fromUser: User!
    payingCustomer: Customer
    created: DateTime!
    expire: DateTime
  }
  type InviteOutput {
    invites: [Invitation]!
    errors: [String]!
  }

  input InvitationInput {
    to: String!
    planId: String
    payingCustomerId: String
    customerType: String
  }

  type Query {
    listInvitations(invitationStatus: INVITATION_STATUS): [Invitation]!
    invitationByCode(invitationCode: String!): Invitation
  }

  type Mutation {
    invite(input: [InvitationInput!]!): InviteOutput
    cancelInvitation(invitationId: ID!): Invitation!
    resendInvitation(invitationId: ID!): Invitation!
    acceptInvitation(invitationCode: String!): Boolean!
  }

  enum INVITATION_STATUS {
    PENDING
    USED
    CANCELED
    EXPIRED
  }
`;

const resolvers = {
  Mutation: {
    invite: authenticated(async (_, { input }: { input: [InvitationInput] }, { req: { gotrueId } }) => {
      const user = await prisma.user.findUnique({
        where: {
          gotrueId,
        },
        include: {
          customer: true,
        },
      });

      // Since most of the code in the rest of this block relies on the user object we check to make sure it's not null.
      if (!user) {
        throw new UserInputError("User not found");
      }

      const invitations: any[] = [];
      let userEntitlements: any[] = [];
      let isEnterprise = false;
      if (user && user.customer) {
        userEntitlements = await getCustomerEntitlement(user.customer);
        const coach = userEntitlements.filter((entitlement: Entitlement) => entitlement.id == "coach-access-desktop")[0];
        if (!coach) isEnterprise = true;
      }

      const toEmails = input.map(invitiation => invitiation.to);
      const existInvitations = await prisma.invitation.findMany({
        where: { to: { in: toEmails }, status: { in: [INVITATION_STATUS.PENDING] } },
      });
      const existToEmails = existInvitations.map(existInvitation => existInvitation.to);
      const invitesError: string[] = [];
      await Promise.all(
        input.map(async invitation => {
          if (existToEmails.includes(invitation.to)) {
            invitesError.push(`An invitation already been sent to: ${invitation.to} `);
            return;
          }
          if (invitation.to === user.email) {
            invitesError.push(`This is your email: ${invitation.to}. You can't invite yourself.`);
            return;
          }
          const existUser = await prisma.user.findUnique({
            where: { email: invitation.to },
            include: { customer: true },
          });

          if (existUser && existUser.customer && (await getCustomerParent(existUser.customer))) {
            invitesError.push(`This email: ${invitation.to} is associated with an account that is assigned to another coach.`);
            return;
          }

          if (existUser && existUser.customer) {
            const entitlements = await getCustomerEntitlement(existUser.customer);
            const coach = entitlements.filter((entitlement: Entitlement) => entitlement.id == "coach-access-desktop")[0];
            if (coach) {
              invitesError.push(
                `This email: ${invitation.to} is associated with a coach account. You can't invite that user as an athlete.`,
              );
              return;
            }
          }

          const currentDate = new Date();
          const timeToLive = Number(process.env.INVITATION_TTL_DAYS) * 24 * 60 * 60 * 1000;
          const coreAppItemPriceForCoaches = process.env.COACH_CORE_APP_ITEM_PRICE_ID;
          const ccoachItemPriceForEnterprise = process.env.ENTERPRISE_COACH_ITEM_PRICE_ID;

          const invitationRecord = {
            to: invitation.to,
            code: `${Math.floor(100000 + Math.random() * 900000)}`,
            planId: isEnterprise ? ccoachItemPriceForEnterprise : coreAppItemPriceForCoaches,
            status: INVITATION_STATUS.PENDING,
            expire: new Date(currentDate.getTime() + timeToLive),
            created: user.timezone ? dayjs(currentDate).tz(user.timezone).toDate() : currentDate,
            userId: user.id,
            customerId: user.customer?.customerId,
          };

          invitations.push(invitationRecord);

          //TODO: extract payingCustomer ID and link it for none parent paying users
        }),
      );

      await prisma.invitation.createMany({
        data: invitations,
      });

      invitations.map(async invite => {
        sendInvitationEmail(invite, user);
      });

      const invitationRecords = await prisma.invitation.findMany({
        where: { status: INVITATION_STATUS.PENDING, userId: user.id },
        include: { payingCustomer: true, fromUser: true },
        orderBy: { created: "desc" },
      });

      let returnedInvites: Invitation[] = [];
      if (invitationRecords.length > 0) returnedInvites = invitationRecords;
      return { invites: returnedInvites, errors: invitesError };
    }),
    cancelInvitation: authenticated(async (_, { invitationId }: { invitationId: string }, { req: { gotrueId } }) => {
      const user = await prisma.user.findUnique({
        where: {
          gotrueId,
        },
        include: { invitations: { where: { id: invitationId } } },
      });

      if (user?.invitations.length != 1) throw new UserInputError("Wrong invitation ID");

      let updatedInvitation = user?.invitations[0];

      updatedInvitation = await prisma.invitation.update({
        where: {
          id: updatedInvitation.id,
        },
        data: {
          status: INVITATION_STATUS.CANCELED,
        },
      });
      return updatedInvitation;
    }),
    acceptInvitation: authenticated(async (_, { invitationCode }: { invitationCode: string }, { req: { gotrueId } }) => {
      const user = await prisma.user.findUnique({
        where: {
          gotrueId,
        },
        include: { customer: true },
      });

      if (!user || !user.customer) throw new UserInputError("Can't find user records.");

      const invitation = await prisma.invitation.findUnique({
        include: {
          fromUser: { include: { customer: true } },
          payingCustomer: true,
        },
        where: { code: invitationCode },
      });

      if (
        !invitation ||
        user?.email !== invitation.to ||
        !invitation.fromUser ||
        !invitation.fromUser.customer ||
        !invitation.payingCustomer
      )
        throw new UserInputError("Wrong invitation ID");

      let expired = false;
      if (invitation.expire) {
        const invitationExpire = new Date(invitation.expire);
        if (invitationExpire.getTime() < Date.now()) expired = true;
      }

      if (expired || invitation.status != INVITATION_STATUS.PENDING) throw new UserInputError("Invitation's expired");

      try {
        await cancelSubscription(user.customer, undefined, true);
        await assignPlanToCustomer(user.customer, invitation.planId);
        await associateParentCustomer(user.customer, invitation.fromUser.customer, invitation.payingCustomer);
        await prisma.invitation.update({
          where: { code: invitationCode },
          data: { status: INVITATION_STATUS.USED },
        });
      } catch (error) {
        throw new UserInputError("Can't associate the athlete account with a couch");
      }
      return true;
    }),
    resendInvitation: authenticated(async (_, { invitationId }: { invitationId: string }, { req: { gotrueId } }) => {
      const user = await prisma.user.findUnique({
        where: {
          gotrueId,
        },
        include: { invitations: { where: { id: invitationId } } },
      });

      if (user?.invitations.length != 1) throw new UserInputError("Wrong invitation ID");

      const invitation = user?.invitations[0];

      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: INVITATION_STATUS.CANCELED },
      });
      const { id, ...newInvitation } = invitation;
      newInvitation.code = `${Math.floor(100000 + Math.random() * 900000)}`;
      const currentDate = new Date();
      const timeToLive = Number(process.env.INVITATION_TTL_DAYS) * 24 * 60 * 60 * 1000;
      newInvitation.expire = new Date(currentDate.getTime() + timeToLive);
      newInvitation.created = new Date(currentDate.getTime());
      newInvitation.status = INVITATION_STATUS.PENDING;

      const newInsertedInvitation = await prisma.invitation.create({
        data: { ...newInvitation },
      });

      //TODO: Send MailChimp email
      sendInvitationEmail(newInsertedInvitation, user);

      return newInsertedInvitation;
    }),
  },
  Query: {
    listInvitations: authenticated(async (_, { invitationStatus }: { invitationStatus?: INVITATION_STATUS }, { req: { gotrueId } }) => {
      //update expired invitations to be EXPIRED
      //lte: subtractHour(new Date(), 1)
      await prisma.invitation.updateMany({
        where: {
          expire: { lte: new Date() },
          status: INVITATION_STATUS.PENDING,
        },
        data: { status: INVITATION_STATUS.EXPIRED },
      });
      const user = await prisma.user.findUnique({
        where: {
          gotrueId,
        },
        include: { invitations: { orderBy: { created: "desc" } } },
      });

      if (!user?.invitations || user?.invitations.length < 1) return [];

      if (!invitationStatus) return user?.invitations;

      const invitations = user?.invitations.filter(invitation => invitation.status == invitationStatus);

      return invitations;
    }),
    invitationByCode: authenticated(async (_, { invitationCode }: { invitationCode?: string }, __) => {
      const invitation = await prisma.invitation.findUnique({
        include: { fromUser: true },
        where: { code: invitationCode },
      });

      return invitation;
    }),
  },
  Invitation: {
    fromUser: async ({ userId }: Invitation) => {
      if (!userId) return null;

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      return user;
    },
    payingCustomer: async ({ customerId }: Invitation) => {
      if (!customerId) return null;

      const customer = await prisma.customer.findUnique({
        where: { customerId: customerId },
        include: {
          user: true,
        },
      });

      return customer;
    },
  },
};

export default { typeDefs, resolvers };
