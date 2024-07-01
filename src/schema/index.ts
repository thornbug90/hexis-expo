import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";

import activities from "./activities";
import carbRanges from "./carbRanges";
import content from "./content";
import day from "./day";
import enums from "./enums";
import liveGraph from "./liveGraph";
import meals from "./meals";
import scalars from "./scalars";
import user from "./user";
import workouts from "./workouts";
import stripe from "./stripe";
import nutritics from "./nutritics";
import coachNotes from "./coachNotes";
import invitation from "./invitation";
import wearableSources from "./wearableSources";
import groups from "./groups";
import config from "./config";

const schema = makeExecutableSchema({
  typeDefs: mergeTypeDefs([
    enums.typeDefs,
    scalars.typeDefs,
    meals.typeDefs,
    day.typeDefs,
    workouts.typeDefs,
    user.typeDefs,
    liveGraph.typeDefs,
    carbRanges.typeDefs,
    content.typeDefs,
    activities.typeDefs,
    stripe.typeDefs,
    nutritics.typeDefs,
    coachNotes.typeDefs,
    invitation.typeDefs,
    wearableSources.typeDefs,
    groups.typeDefs,
    config.typeDefs,
  ]),
  resolvers: mergeResolvers([
    scalars.resolvers,
    meals.resolvers,
    day.resolvers,
    workouts.resolvers,
    user.resolvers,
    liveGraph.resolvers,
    carbRanges.resolvers,
    content.resolvers,
    activities.resolvers,
    stripe.resolvers,
    nutritics.resolvers,
    coachNotes.resolvers,
    invitation.resolvers,
    wearableSources.resolvers,
    groups.resolvers,
    config.resolvers,
  ]),
});

export default schema;
