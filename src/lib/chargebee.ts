import { Customer, Invitation, INVITATION_STATUS, User } from "@prisma/client";
import { ApolloError, UserInputError } from "apollo-server";
import { ChargeBee, _subscription } from "chargebee-typescript";
import { _customer } from "chargebee-typescript";
import { Entitlement } from "../schema/user";
import prisma from "./prisma";

const chargebee = new ChargeBee();
chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEBEE_API_KEY,
  tlsOptions: {
    rejectUnauthorized: false,
  },
});

type priceItem = {
  item_price_id: string;
  quantity: number;
};

const createChargebeeCustomer = async (userObj: _customer.create_params) => {
  try {
    const result = await chargebee.customer.create(userObj).request();
    const chargebeeCustomerId = result.customer.id;

    return {
      success: true,
      chargebeeCustomerId,
      message: "Created customer in ChargeBee",
    };
  } catch (error) {
    throw new ApolloError("Error occurred during user signup.", String(error));
  }
};

const assignPlanToCustomer = async (customer: Customer, itemPriceId: string | undefined) => {
  try {
    if (!customer) throw new ApolloError("no customer id associated with the user");

    if (!itemPriceId) throw new ApolloError("no plan id");

    const chargebeeCustomerId = customer.customerId;

    const subscription: _subscription.create_with_items_params = {
      subscription_items: [{ item_price_id: itemPriceId }],
    };
    const subs = await chargebee.subscription.create_with_items(chargebeeCustomerId, subscription).request();

    return {
      code: 200,
      success: true,
      message: "Subscription plan assigned successfully",
      data: subs,
    };
  } catch (error) {
    console.error(error);
    throw new ApolloError("Error occurred while assigning subscription plan");
  }
};

const disassociateChildCustomer = async (childCustomer: Customer, parentCustomer: Customer) => {
  try {
    const childChargebeeCustomerId = childCustomer.customerId;

    if (!childChargebeeCustomerId) throw new UserInputError("Child customer ID not correct");

    await chargebee.customer.delete_relationship(childChargebeeCustomerId).request();

    await cancelSubscription(childCustomer, process.env.COACH_CORE_APP_ITEM_PRICE_ID as string);

    return await getCustomerChildren(parentCustomer);
  } catch (error) {
    console.error(error);
    throw new ApolloError("Something went wrong!");
  }
};

const cancelSubscription = async (customer: Customer, itemPriceId: string | undefined, endTerm = false) => {
  const listQuery = {
    customer_id: { is: customer.customerId },
    status: { in: ["active", "non_renewing", "in_trial"] },
    item_price_id: {},
  };
  if (itemPriceId) listQuery.item_price_id = { is: itemPriceId };

  //get list of active subscriptions
  const subscriptions = await chargebee.subscription.list(listQuery).request();

  for (let subscription of subscriptions.list) {
    await chargebee.subscription.cancel_for_items(subscription.subscription.id, { end_of_term: endTerm }).request();
  }
};
const associateParentCustomer = async (childCustomer: Customer, parentCustomer: Customer, payingCustomer: Customer) => {
  try {
    const childChargebeeCustomerId = childCustomer.customerId;
    const parentChargebeeCustomerId = parentCustomer.customerId;

    if (!childChargebeeCustomerId || !parentChargebeeCustomerId) throw new UserInputError("Parent or Child customer ID not correct");
    if (!payingCustomer) throw new UserInputError("No paying customer");

    await chargebee.customer
      .relationships(childChargebeeCustomerId, {
        parent_id: parentChargebeeCustomerId,
        payment_owner_id: payingCustomer.customerId,
        invoice_owner_id: payingCustomer.customerId,
      })
      .request();

    return await getCustomerChildren(parentCustomer);
  } catch (error) {
    throw new ApolloError(`Something went wrong! Error:${error}`);
  }
};

const getCustomerChildren = async (parentCustomer: Customer) => {
  try {
    const result = await chargebee.customer
      .hierarchy(parentCustomer.customerId, {
        hierarchy_operation_type: "complete_hierarchy",
      })
      .request();
    const hierarchies: Array<typeof chargebee.hierarchy> = result.hierarchies;
    let customerIds: string[] = [];
    const children = hierarchies.filter(
      //@ts-ignore
      hierarchy => hierarchy.parent_id == parentCustomer.customerId,
    );

    children.map(child => {
      //@ts-ignore
      customerIds.push(child.customer_id);
    });

    if (customerIds.length < 1) return [];

    const users = await prisma.user.findMany({
      where: {
        customer: { customerId: { in: customerIds } },
      },
      include: {
        userAudit: { select: { date: true, weight: true, goal: true } },
        customer: true,
        wearables: true,
      },
    });
    const emails = users.map(user => user.email);
    const invitations: Invitation[] = await prisma.invitation.findMany({
      where: {
        to: { in: emails },
        userId: parentCustomer.userId,
        status: INVITATION_STATUS.USED,
      },
      orderBy: { created: "desc" },
    });
    const newUsers: (User & { customer: Customer | null } & {
      invitedDate?: Date;
    })[] = [];
    users.map(user => {
      const invitation = invitations?.find((invite: Invitation) => invite?.to === user?.email);
      if (invitation)
        newUsers.push({
          ...user,
          customer: user.customer,
          invitedDate: invitation.created,
        });
      else newUsers.push(user);
    });

    console.dir(newUsers, { depth: null });

    return newUsers;
  } catch (error) {
    return [];
  }
};

const getCustomerParent = async (childCustomer: Customer) => {
  try {
    const result = await chargebee.customer
      .hierarchy(childCustomer.customerId, {
        hierarchy_operation_type: "complete_hierarchy",
      })
      .request();
    var hierarchies: Array<_customer.relationships_params & { customer_id: string }> = result.hierarchies;
    let parent_id = undefined;
    hierarchies.map(hierarchy => {
      if (hierarchy.customer_id == childCustomer.customerId) {
        parent_id = hierarchy.parent_id;
      }
    });

    if (!parent_id) return null;

    const customer = await prisma.user.findMany({
      where: { customer: { customerId: parent_id } },
      include: { customer: true },
    });

    if (customer.length > 0) return customer[0];
    else return null;
  } catch (error) {
    return null;
  }
};

const getCustomerEntitlement = async (customer: Customer) => {
  const listQuery = {
    customer_id: { is: customer.customerId },
    status: { in: ["active", "non_renewing", "in_trial"] },
  };

  //get list of active subscriptions
  const subscriptions = await chargebee.subscription.list(listQuery).request();
  const entitlements: Entitlement[] = [];

  if (subscriptions.list.length < 1) return entitlements;
  const result = await chargebee.subscription_entitlement
    .subscription_entitlements_for_subscription(subscriptions.list[0].subscription.id)
    .request();
  for (var i = 0; i < result.list.length; i++) {
    let featureId = result.list[i].subscription_entitlement.feature_id;
    let featureValue = result.list[i].subscription_entitlement.value;
    if (isNaN(featureValue) && featureValue !== "true" && featureValue !== "false") continue;
    if (!isNaN(featureValue)) featureValue = Number(featureValue);
    else {
      featureValue = featureValue === "true" ? 1 : 0;
    }
    entitlements.push({ id: featureId, value: featureValue });
  }

  return entitlements;
};

const createCheckoutHostedPage = async (user: User, priceItems: priceItem[]) => {
  const result = await chargebee.hosted_page
    .checkout_new_for_items({
      customer: {
        //@ts-ignore
        id: user.customer.customerId, // This is the chargebee identifier. https://github.com/abs-hexis/backend/pull/227/files/6964c96c4294e067b189fff975c883cff34ba4ee#r1571977212
        first_name: user.firstName,
        last_name: user.lastName,
      },
      billing_address: {
        first_name: user.firstName,
        last_name: user.lastName,
      },
      subscription_items: priceItems,
    })
    .request();

  return result.hosted_page;
};

const createPortalPage = async (customer: Customer) => {
  let result;
  try {
    result = await chargebee.portal_session
      .create({ redirect_url: process.env.WEBSITE_URL, customer: { id: customer.customerId } })
      .request();
  } catch (error) {
    console.log(error);
  }

  return result.portal_session;
};

export {
  priceItem,
  createChargebeeCustomer,
  assignPlanToCustomer,
  associateParentCustomer,
  disassociateChildCustomer,
  getCustomerChildren,
  getCustomerParent,
  getCustomerEntitlement,
  createCheckoutHostedPage,
  createPortalPage,
  cancelSubscription,
};
