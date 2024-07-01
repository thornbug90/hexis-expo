import { Invitation, User } from "@prisma/client";
import prisma from "./prisma";

type Message = {
  from_email: string;
  subject: string;
  text: string;
  to: {
    email: string;
    type: string;
  }[];
  merge_vars: {
    rcpt: string;
    vars: {
      name: string;
      content: string;
    }[];
  }[];
};

const mailchimpTx = require("@mailchimp/mailchimp_transactional")(process.env.MAILCHIMP_TRANSACTIONAL_API_KEY);

const sendTemplateEmail = async (message: Message, templateSlug: string) => {
  return await mailchimpTx.messages.sendTemplate({
    template_name: templateSlug,
    template_content: [{}],
    message: message,
  });
};

export const sendInvitationEmail = async (invite: Invitation, user: User) => {
  const toUser = await prisma.user.findUnique({
    where: {
      email: invite.to,
    },
  });
  let webURL = process.env.WEBSITE_URL;
  if (toUser) webURL = `${webURL}/invitation?code=${invite.code}`;
  else webURL = `${webURL}/account/onboarding?customer=core&code=${invite.code}`;
  const message = {
    from_email: "noreply@hexis.live",
    subject: "You’ve been invited to join Hexis",
    text: `You’ve been invited to join Hexis. Please click this link to accept the invitation:
    \n${webURL}`,
    to: [{ email: invite.to, type: "to" }],
    merge_vars: [
      {
        rcpt: invite.to,
        vars: [
          { name: "CFNAME", content: user.firstName },
          { name: "CLNAME", content: user.lastName },
          { name: "ILINK", content: webURL },
        ],
      },
    ],
  };
  const coreAppItemPriceForCoaches = process.env.COACH_CORE_APP_ITEM_PRICE_ID;
  if (invite.planId === coreAppItemPriceForCoaches) await sendTemplateEmail(message, "coach-invitation-email");
  else await sendTemplateEmail(message, "enterprise-invite-email");
};
