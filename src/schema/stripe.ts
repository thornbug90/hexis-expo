import { AuthenticationError, gql } from "apollo-server";
import { User } from "@prisma/client";

import prisma from "../lib/prisma";
import authenticated from "../middleware/authenticated";
import { createCheckoutHostedPage, createPortalPage, getCustomerEntitlement, priceItem } from "../lib/chargebee";
import { Entitlement } from "./user";

const typeDefs = gql`
  type Customer {
    hasActiveSubscription: Boolean!
    customerId: ID!
  }
  type Entitlement {
    id: String!
    value: Float
  }

  type Query {
    customer: Customer!
  }

  extend type User {
    customerId: ID!
    hasActiveSubscription: Boolean!
    entitlements: [Entitlement]!
  }
  extend type Child {
    customerId: ID!
  }
  input PriceItem {
    item_price_id: String
    quantity: Float
  }

  type Mutation {
    createCheckoutLink(priceItems: [PriceItem]!): String!
    createBillingPortalLink: String!
    createSubscription(stripe_session_id: String!): Boolean!
  }
`;

const resolvers = {
  User: {
    customerId: async ({ id }: User) => {
      const user = await prisma.user.findUnique({
        where: { id },
        select: { customer: { select: { customerId: true } } },
      });

      return user?.customer?.customerId;
    },
    hasActiveSubscription: async ({ id }: User) => {
      const user = await prisma.user.findUnique({ where: { id }, include: { customer: true } });
      if (!user) throw new AuthenticationError("Invalid credentials. Please login again.");

      // TODO: remove this after stabilising Chargebee authorisation system (Entitlement)
      const stripeSubscription = await prisma.subscription.findFirst({
        where: { customerId: user.customer!.customerId, status: "active" },
      });

      if (!user.customer || !user.customer.customerId)
        throw new AuthenticationError("User has no records as a customer. Please raise a support issue.");

      // check entitlement
      const coreAppRequiredEntitlements = JSON.parse(process.env.CORE_APP_REQUIRED_ENTITLEMENTS ?? '[""]') as string[];
      const userEntitlements = await getCustomerEntitlement(user.customer);
      const userEntitlementsIds = userEntitlements.map((userEntitlement: Entitlement) => userEntitlement.id);

      let isUserAuthorised = true;

      coreAppRequiredEntitlements.map(requiredEntitlement => {
        if (!userEntitlementsIds.includes(requiredEntitlement)) isUserAuthorised = false;
      });

      return !!stripeSubscription || isUserAuthorised;
    },
    entitlements: async ({ id }: User) => {
      const user = await prisma.user.findUnique({ where: { id }, include: { customer: true } });

      let entitlements: Entitlement[] = [];
      if (user && user.customer) entitlements = await getCustomerEntitlement(user.customer);
      return entitlements;
    },
  },
  Child: {
    customerId: async ({ id }: User) => {
      const user = await prisma.user.findUnique({ where: { id }, select: { customer: { select: { customerId: true } } } });

      return user?.customer?.customerId;
    },
  },
  Query: {
    customer: authenticated(async (_, _a, { req: { gotrueId } }) => {
      const user = await prisma.user.findUnique({ where: { gotrueId }, select: { customer: { select: { customerId: true } } } });
      if (!user) throw new AuthenticationError("Invalid credentials. Please login again.");

      const subscription = await prisma.subscription.findFirst({ where: { customerId: user.customer!.customerId, status: "active" } });

      return { customerId: user.customer!.customerId, hasActiveSubscription: !!subscription };
    }),
  },
  Mutation: {
    createCheckoutLink: authenticated(async (_, { priceItems }: { priceItems: priceItem[] }, { req: { gotrueId } }) => {
      const user = await prisma.user.findUnique({ where: { gotrueId }, include: { customer: true } });

      if (user?.customer) {
        return await createCheckoutHostedPage(user, priceItems).then((page: { url: string }) => page.url);
      } else return "";
    }),

    createBillingPortalLink: authenticated(async (_, _a, { req: { gotrueId } }) => {
      const user = await prisma.user.findUnique({ where: { gotrueId }, include: { customer: true } });
      if (!user) return {};

      try {
        if (user.customer) {
          return await createPortalPage(user.customer).then((response: { access_url: string }) => response.access_url);
        } else return {};
      } catch (error) {
        console.error("Creating portal session page from charge bee failed.", error);
        throw new Error("unable to create portal page." + String(error));
      }
    }),
    createSubscription: authenticated((_, { stripe_session_id }: { stripe_session_id: string }, { req: { gotrueId } }) => {
      // TODO: ensure no one using this endpoint since it is deprecated. then remove it
      stripe_session_id;
      gotrueId;
    }),
  },
};

export default { typeDefs, resolvers };
